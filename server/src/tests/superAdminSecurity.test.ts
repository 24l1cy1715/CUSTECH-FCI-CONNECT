import assert from 'assert';
import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from '../routes';
import { errorHandler } from '../middleware/errorHandler';
import { prisma } from '../config/prisma';
import { AuthService } from '../services/auth.service';

async function runSuperAdminSecurityTests() {
  console.log('================================================================');
  console.log('STARTING SUPER ADMIN RBAC & AUTHORIZATION SECURITY TESTS');
  console.log('================================================================\n');

  // Setup test Express instance
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/v1', apiRouter);
  app.use(errorHandler);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}/api/v1`;

  const timestamp = Date.now();
  const studentEmail = `student.sec.${timestamp}@custech.edu.ng`;
  const studentPassword = 'SecureStudent@2024!';
  const superAdminEmail = 'admin@custech.edu.ng';
  const superAdminPassword = 'Admin@FCI2024!';

  console.log(`[TEST SETUP] Initialized test server on port ${port}`);

  // Create test student account
  const { user: studentUser } = await AuthService.register({
    email: studentEmail,
    password: studentPassword,
    fullName: 'Security Test Student',
    department: 'CYBER_SECURITY',
    level: 'LEVEL_300',
  });

  try {
    // ----------------------------------------------------------------
    // Test A: Student normal login -> SUCCESS
    // ----------------------------------------------------------------
    console.log('\n--- Test A: Student Normal Login ---');
    const studentLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: studentEmail,
        password: studentPassword,
      }),
    });
    const studentLoginData = (await studentLoginRes.json()) as any;
    assert.strictEqual(studentLoginRes.status, 200);
    assert.strictEqual(studentLoginData.success, true);
    assert.deepStrictEqual(studentLoginData.data.user.roles, ['STUDENT']);
    assert(!studentLoginData.data.user.roles.includes('SUPER_ADMIN'));

    const studentRawCookies = studentLoginRes.headers.get('set-cookie') || '';
    const studentCookies = studentRawCookies
      .split(',')
      .map((c) => c.split(';')[0].trim())
      .join('; ');
    console.log('✔ Test A Passed: Student logs into student portal with role [STUDENT]');

    // ----------------------------------------------------------------
    // Test B: Student attempts Super Admin login -> MUST FAIL (403)
    // ----------------------------------------------------------------
    console.log('\n--- Test B: Student Attempts Super Admin Login ---');
    const studentAdminLoginRes = await fetch(`${baseUrl}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: studentEmail,
        password: studentPassword,
      }),
    });
    const studentAdminLoginData = (await studentAdminLoginRes.json()) as any;
    assert.strictEqual(studentAdminLoginRes.status, 403);
    assert.strictEqual(studentAdminLoginData.success, false);
    assert(
      studentAdminLoginData.error?.message?.includes('Super Admin privileges') ||
      studentAdminLoginData.message?.includes('Super Admin privileges')
    );
    console.log('✔ Test B Passed: Student credentials rejected with 403 on Super Admin login endpoint');

    // ----------------------------------------------------------------
    // Test C: Unauthenticated admin API request -> MUST FAIL (401)
    // ----------------------------------------------------------------
    console.log('\n--- Test C: Unauthenticated Admin API Requests ---');
    const unauthStatsRes = await fetch(`${baseUrl}/admin/stats`);
    assert.strictEqual(unauthStatsRes.status, 401);

    const unauthUsersRes = await fetch(`${baseUrl}/admin/users`);
    assert.strictEqual(unauthUsersRes.status, 401);

    const unauthSuperAdminRes = await fetch(`${baseUrl}/super-admin/stats`);
    assert.strictEqual(unauthSuperAdminRes.status, 401);
    console.log('✔ Test C Passed: Unauthenticated requests to /admin and /super-admin return 401');

    // ----------------------------------------------------------------
    // Test D: Student directly calls Super Admin APIs with student session -> MUST FAIL (403)
    // ----------------------------------------------------------------
    console.log('\n--- Test D: Student Directly Calls Super Admin API Endpoints ---');
    const studentStatsRes = await fetch(`${baseUrl}/admin/stats`, {
      headers: { Cookie: studentCookies },
    });
    assert.strictEqual(studentStatsRes.status, 403);

    const studentUsersRes = await fetch(`${baseUrl}/admin/users`, {
      headers: { Cookie: studentCookies },
    });
    assert.strictEqual(studentUsersRes.status, 403);

    const studentAuditRes = await fetch(`${baseUrl}/admin/audit-logs`, {
      headers: { Cookie: studentCookies },
    });
    assert.strictEqual(studentAuditRes.status, 403);

    const studentDigitalIdAdminRes = await fetch(`${baseUrl}/digital-id/admin`, {
      headers: { Cookie: studentCookies },
    });
    assert.strictEqual(studentDigitalIdAdminRes.status, 403);

    const studentSuperAdminAliasRes = await fetch(`${baseUrl}/super-admin/stats`, {
      headers: { Cookie: studentCookies },
    });
    assert.strictEqual(studentSuperAdminAliasRes.status, 403);
    console.log('✔ Test D Passed: Student session calling Super Admin APIs blocked with 403 Forbidden');

    // ----------------------------------------------------------------
    // Test E: Student attempts role spoofing in registration payload
    // ----------------------------------------------------------------
    console.log('\n--- Test E: Client-Side Role Spoofing in Request Payload ---');
    const spoofRegisterRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `spoof.${timestamp}@custech.edu.ng`,
        password: 'Password@1234',
        fullName: 'Attacker Attempting Super Admin',
        department: 'CYBER_SECURITY',
        level: 'LEVEL_300',
        role: 'SUPER_ADMIN',
        roles: ['SUPER_ADMIN'],
      }),
    });
    // Validator rejects client-submitted role fields with validation error (400 or 422)
    assert(spoofRegisterRes.status === 400 || spoofRegisterRes.status === 422);
    console.log(`✔ Test E Passed: Server rejects client-supplied role payloads in registration (HTTP ${spoofRegisterRes.status})`);


    // ----------------------------------------------------------------
    // Test F: Student attempts privilege escalation to grant themselves SUPER_ADMIN
    // ----------------------------------------------------------------
    console.log('\n--- Test F: Student Attempts Privilege Escalation ---');
    const escalationRes = await fetch(`${baseUrl}/admin/users/${studentUser.id}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: studentCookies,
      },
      body: JSON.stringify({
        roleName: 'SUPER_ADMIN',
        action: 'ADD',
      }),
    });
    assert.strictEqual(escalationRes.status, 403);

    // Verify student database role did NOT change
    const checkUserRoles = await prisma.userRole.findMany({
      where: { userId: studentUser.id },
      include: { role: true },
    });
    const roleNames = checkUserRoles.map((ur) => ur.role.name);
    assert(!roleNames.includes('SUPER_ADMIN'));
    assert(roleNames.includes('STUDENT'));
    console.log('✔ Test F Passed: Privilege escalation attempt blocked with 403; database roles untouched');

    // ----------------------------------------------------------------
    // Test G: Invalid / Expired Token
    // ----------------------------------------------------------------
    console.log('\n--- Test G: Invalid Authentication Token ---');
    const invalidTokenRes = await fetch(`${baseUrl}/admin/stats`, {
      headers: { Authorization: 'Bearer forged.token.signature' },
    });
    assert.strictEqual(invalidTokenRes.status, 401);
    console.log('✔ Test G Passed: Forged/invalid token rejected with 401');

    // ----------------------------------------------------------------
    // Test H: Legitimate Super Admin Login & Operations -> SUCCESS (200)
    // ----------------------------------------------------------------
    console.log('\n--- Test H: Legitimate Super Admin Access ---');
    const adminLoginRes = await fetch(`${baseUrl}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: superAdminEmail,
        password: superAdminPassword,
      }),
    });
    const adminLoginData = (await adminLoginRes.json()) as any;
    assert.strictEqual(adminLoginRes.status, 200);
    assert.strictEqual(adminLoginData.success, true);
    assert(adminLoginData.data.user.roles.includes('SUPER_ADMIN'));

    const adminRawCookies = adminLoginRes.headers.get('set-cookie') || '';
    const adminCookies = adminRawCookies
      .split(',')
      .map((c) => c.split(';')[0].trim())
      .join('; ');

    // Legitimate access to /admin/stats
    const adminStatsRes = await fetch(`${baseUrl}/admin/stats`, {
      headers: { Cookie: adminCookies },
    });
    assert.strictEqual(adminStatsRes.status, 200);
    const adminStatsData = (await adminStatsRes.json()) as any;
    assert.strictEqual(adminStatsData.success, true);
    assert(adminStatsData.data.metrics.totalUsers >= 1);

    // Legitimate access to /admin/users
    const adminUsersRes = await fetch(`${baseUrl}/admin/users`, {
      headers: { Cookie: adminCookies },
    });
    assert.strictEqual(adminUsersRes.status, 200);

    // Legitimate access to /admin/audit-logs
    const adminAuditRes = await fetch(`${baseUrl}/admin/audit-logs`, {
      headers: { Cookie: adminCookies },
    });
    assert.strictEqual(adminAuditRes.status, 200);
    console.log('✔ Test H Passed: Verified SUPER_ADMIN successfully accesses administrative APIs');

    // ----------------------------------------------------------------
    // Test I: Audit Log Verification
    // ----------------------------------------------------------------
    console.log('\n--- Test I: Security Audit Trail Verification ---');
    const recentAuditLogs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { actorId: studentUser.id },
          { action: { in: ['UNAUTHORIZED_SUPER_ADMIN_API_ACCESS', 'STUDENT_ATTEMPTED_SUPER_ADMIN_LOGIN', 'SUCCESSFUL_SUPER_ADMIN_LOGIN'] } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    assert(recentAuditLogs.length > 0, 'Expected security audit log records to be generated');
    const actionsLogged = recentAuditLogs.map((l) => l.action);
    console.log('   Recent security audit actions found:', actionsLogged);
    assert(
      actionsLogged.includes('UNAUTHORIZED_SUPER_ADMIN_API_ACCESS') ||
      actionsLogged.includes('STUDENT_ATTEMPTED_SUPER_ADMIN_LOGIN')
    );
    console.log('✔ Test I Passed: Security violations and login events correctly recorded in audit_logs table');

    console.log('\n================================================================');
    console.log('ALL SUPER ADMIN RBAC SECURITY TESTS PASSED SUCCESSFULLY! (9/9)');
    console.log('================================================================');
  } finally {
    // Clean up created student user
    await prisma.userRole.deleteMany({ where: { userId: studentUser.id } }).catch(() => {});
    await prisma.profile.deleteMany({ where: { userId: studentUser.id } }).catch(() => {});
    await prisma.auditLog.deleteMany({ where: { actorId: studentUser.id } }).catch(() => {});
    await prisma.user.deleteMany({ where: { id: studentUser.id } }).catch(() => {});
    server.close();
  }
}

runSuperAdminSecurityTests().catch((err) => {
  console.error('❌ SECURITY REGRESSION TEST FAILED:', err);
  process.exit(1);
});
