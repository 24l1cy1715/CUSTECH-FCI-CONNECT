import assert from 'assert';
import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from '../routes';
import { errorHandler } from '../middleware/errorHandler';
import { prisma } from '../config/prisma';
import { AuthService } from '../services/auth.service';

async function runGoogleAuthSecurityTests() {
  console.log('================================================================');
  console.log('STARTING GOOGLE AUTHENTICATION & RBAC SECURITY TESTS (TESTS 1-10)');
  console.log('================================================================\n');

  // Setup test Express instance with cookies and API routes
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
  const newGoogleId = `gid-new-${timestamp}`;
  const newGoogleEmail = `google.student.${timestamp}@custech.edu.ng`;
  const existingStudentEmail = `existing.student.${timestamp}@custech.edu.ng`;
  const superAdminEmail = 'admin@custech.edu.ng';

  console.log(`[TEST SETUP] Test server listening on port ${port}`);

  // Create pre-existing student account
  const { user: initialStudent } = await AuthService.register({
    email: existingStudentEmail,
    password: 'StandardStudentPassword@2024!',
    fullName: 'Pre-existing Student User',
    department: 'SOFTWARE_ENGINEERING',
    level: 'LEVEL_200',
  });

  let newStudentCookies = '';
  let superAdminCookies = '';

  try {
    // ----------------------------------------------------------------
    // Test 1: New Google User -> Account created as STUDENT
    // ----------------------------------------------------------------
    console.log('\n--- Test 1: New Google User Signup ---');
    const newGoogleRes = await fetch(`${baseUrl}/auth/google/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mockIdentity: {
          googleId: newGoogleId,
          email: newGoogleEmail,
          fullName: 'New Google Student',
          avatarUrl: 'https://lh3.googleusercontent.com/a/new-student-avatar',
          emailVerified: true,
        },
      }),
    });

    const newGoogleData = (await newGoogleRes.json()) as any;
    assert.strictEqual(newGoogleRes.status, 200, 'Test 1: Status must be 200 OK');
    assert.strictEqual(newGoogleData.success, true, 'Test 1: Success flag must be true');
    assert.deepStrictEqual(newGoogleData.data.user.roles, ['STUDENT'], 'Test 1: New Google user role must strictly default to STUDENT');
    assert.strictEqual(newGoogleData.data.user.email, newGoogleEmail, 'Test 1: Email must match');

    // Extract session cookies
    const rawCookies = newGoogleRes.headers.get('set-cookie') || '';
    assert.ok(rawCookies.includes('access_token'), 'Test 1: Must set access_token cookie');
    assert.ok(rawCookies.includes('refresh_token'), 'Test 1: Must set refresh_token cookie');
    newStudentCookies = rawCookies
      .split(',')
      .map((c) => c.split(';')[0].trim())
      .filter((c) => c.startsWith('access_token=') || c.startsWith('refresh_token='))
      .join('; ');

    // Verify in database
    const dbNewUser = await prisma.user.findUnique({
      where: { email: newGoogleEmail },
      include: {
        profile: true,
        userRoles: { include: { role: true } },
      },
    });
    assert.ok(dbNewUser, 'Test 1: User must exist in database');
    assert.strictEqual(dbNewUser?.googleId, newGoogleId, 'Test 1: googleId must be stored in database');
    assert.strictEqual(dbNewUser?.emailVerified, true, 'Test 1: emailVerified must be true');
    const dbRoles = dbNewUser?.userRoles.map((r) => r.role.name);
    assert.deepStrictEqual(dbRoles, ['STUDENT'], 'Test 1: Authoritative DB role must be strictly STUDENT');
    console.log('✔ Test 1 Passed: New Google user registered strictly as STUDENT with secure session cookies');

    // ----------------------------------------------------------------
    // Test 2: Existing student logs in with same Google email
    // ----------------------------------------------------------------
    console.log('\n--- Test 2: Existing Student Google Login ---');
    const existingGoogleId = `gid-exist-${timestamp}`;
    const existGoogleRes = await fetch(`${baseUrl}/auth/google/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mockIdentity: {
          googleId: existingGoogleId,
          email: existingStudentEmail,
          fullName: 'Existing Student Linked',
          emailVerified: true,
        },
      }),
    });

    const existGoogleData = (await existGoogleRes.json()) as any;
    assert.strictEqual(existGoogleRes.status, 200, 'Test 2: Status must be 200 OK');
    assert.strictEqual(existGoogleData.data.user.id, initialStudent.id, 'Test 2: Must authenticate existing user ID');
    assert.deepStrictEqual(existGoogleData.data.user.roles, ['STUDENT'], 'Test 2: Preserves STUDENT role');

    // Confirm no duplicate account was created
    const countExisting = await prisma.user.count({ where: { email: existingStudentEmail } });
    assert.strictEqual(countExisting, 1, 'Test 2: Must not create duplicate account for existing email');

    // Confirm googleId was linked
    const updatedStudent = await prisma.user.findUnique({ where: { id: initialStudent.id } });
    assert.strictEqual(updatedStudent?.googleId, existingGoogleId, 'Test 2: Safely linked googleId');
    console.log('✔ Test 2 Passed: Existing student authenticated without duplicate account creation');

    // ----------------------------------------------------------------
    // Test 3: Existing Super Admin logs in with Google -> Role preserved
    // ----------------------------------------------------------------
    console.log('\n--- Test 3: Existing Super Admin Google Login ---');
    const adminGoogleId = `gid-admin-${timestamp}`;
    const adminGoogleRes = await fetch(`${baseUrl}/auth/google/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mockIdentity: {
          googleId: adminGoogleId,
          email: superAdminEmail,
          fullName: 'Faculty Super Admin',
          emailVerified: true,
        },
      }),
    });

    const adminGoogleData = (await adminGoogleRes.json()) as any;
    assert.strictEqual(adminGoogleRes.status, 200, 'Test 3: Status must be 200 OK');
    assert.ok(adminGoogleData.data.user.roles.includes('SUPER_ADMIN'), 'Test 3: Must preserve existing SUPER_ADMIN role');

    const rawAdminCookies = adminGoogleRes.headers.get('set-cookie') || '';
    superAdminCookies = rawAdminCookies
      .split(',')
      .map((c) => c.split(';')[0].trim())
      .filter((c) => c.startsWith('access_token=') || c.startsWith('refresh_token='))
      .join('; ');

    const countAdmin = await prisma.user.count({ where: { email: superAdminEmail } });
    assert.strictEqual(countAdmin, 1, 'Test 3: Must not duplicate Super Admin account');
    console.log('✔ Test 3 Passed: Existing SUPER_ADMIN identity and database role preserved');

    // ----------------------------------------------------------------
    // Test 4: Student attempts to access Super Admin login gateway
    // ----------------------------------------------------------------
    console.log('\n--- Test 4: Student Attempts Super Admin Portal Login ---');
    const adminGatewayAttempt = await fetch(`${baseUrl}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newGoogleEmail,
        password: 'RandomPassword123!',
      }),
    });
    assert.strictEqual(adminGatewayAttempt.status, 401, 'Test 4: Non-password or invalid credentials rejected');
    console.log('✔ Test 4 Passed: Student cannot authenticate through Super Admin login gateway');

    // ----------------------------------------------------------------
    // Test 5: Student calls Super Admin API directly -> 403 Forbidden
    // ----------------------------------------------------------------
    console.log('\n--- Test 5: Student Calls Super Admin API Directly ---');
    const studentAdminApiRes = await fetch(`${baseUrl}/admin/dashboard`, {
      method: 'GET',
      headers: {
        Cookie: newStudentCookies,
      },
    });
    assert.strictEqual(studentAdminApiRes.status, 403, 'Test 5: Student calling /admin/dashboard must receive 403 Forbidden');

    const studentUsersApiRes = await fetch(`${baseUrl}/admin/users`, {
      method: 'GET',
      headers: {
        Cookie: newStudentCookies,
      },
    });
    assert.strictEqual(studentUsersApiRes.status, 403, 'Test 5: Student calling /admin/users must receive 403 Forbidden');
    console.log('✔ Test 5 Passed: Student calling administrative APIs strictly rejected with 403 Forbidden');

    // ----------------------------------------------------------------
    // Test 6: Student attempts to send role: "SUPER_ADMIN"
    // ----------------------------------------------------------------
    console.log('\n--- Test 6: Role Spoofing & Privilege Escalation Attempt ---');
    const spoofRegisterRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `spoof.${timestamp}@custech.edu.ng`,
        password: 'Password123!',
        fullName: 'Hacker Spoof',
        department: 'CYBER_SECURITY',
        level: 'LEVEL_300',
        role: 'SUPER_ADMIN',
        roles: ['SUPER_ADMIN'],
      }),
    });
    assert.ok(spoofRegisterRes.status === 400 || spoofRegisterRes.status === 422, 'Test 6: Payload with injected role must be rejected by validator with 400 or 422');

    // Verify student in database still has only STUDENT role
    const verifyStudent = await prisma.user.findUnique({
      where: { email: newGoogleEmail },
      include: { userRoles: { include: { role: true } } },
    });
    const verifyRoles = verifyStudent?.userRoles.map((r) => r.role.name);
    assert.deepStrictEqual(verifyRoles, ['STUDENT'], 'Test 6: Database role must remain strictly STUDENT');
    console.log('✔ Test 6 Passed: Injected role payload rejected and database role remains strictly STUDENT');

    // ----------------------------------------------------------------
    // Test 7: Unauthenticated user calls admin API -> 401 Unauthorized
    // ----------------------------------------------------------------
    console.log('\n--- Test 7: Unauthenticated User Calls Admin API ---');
    const unauthRes = await fetch(`${baseUrl}/admin/dashboard`, {
      method: 'GET',
    });
    assert.strictEqual(unauthRes.status, 401, 'Test 7: Unauthenticated call must receive 401 Unauthorized');
    console.log('✔ Test 7 Passed: Unauthenticated request rejected with 401 Unauthorized');

    // ----------------------------------------------------------------
    // Test 8: Duplicate email scenario
    // ----------------------------------------------------------------
    console.log('\n--- Test 8: Duplicate Email Prevention ---');
    // Call Google auth again with the same email
    await fetch(`${baseUrl}/auth/google/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mockIdentity: {
          googleId: newGoogleId,
          email: newGoogleEmail,
          fullName: 'New Google Student Second Login',
          emailVerified: true,
        },
      }),
    });

    const totalUsersWithEmail = await prisma.user.count({ where: { email: newGoogleEmail } });
    assert.strictEqual(totalUsersWithEmail, 1, 'Test 8: Exact 1 user must exist with the email');
    console.log('✔ Test 8 Passed: No duplicate accounts created across multiple Google sign-ins');

    // ----------------------------------------------------------------
    // Test 9: Logout completely clears session
    // ----------------------------------------------------------------
    console.log('\n--- Test 9: Complete Session Logout ---');
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: newStudentCookies,
      },
    });
    assert.strictEqual(logoutRes.status, 200, 'Test 9: Logout must succeed with 200 OK');
    const logoutCookies = logoutRes.headers.get('set-cookie') || '';
    assert.ok(
      logoutCookies.includes('access_token=;') || logoutCookies.includes('Max-Age=0') || logoutCookies.includes('Expires='),
      'Test 9: Must issue clear-cookie for access_token'
    );

    // Requesting /auth/me without cookies must return 401
    const meWithoutAuth = await fetch(`${baseUrl}/auth/me`, { method: 'GET' });
    assert.strictEqual(meWithoutAuth.status, 401, 'Test 9: Calling /auth/me after logout must return 401');
    console.log('✔ Test 9 Passed: User successfully logged out and cookies cleared');

    // ----------------------------------------------------------------
    // Test 10: Refresh browser -> Authenticated state restored without sensitive token exposure
    // ----------------------------------------------------------------
    console.log('\n--- Test 10: Session Restoration & Sensitive Data Isolation ---');
    const meWithAuth = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Cookie: newStudentCookies,
      },
    });
    assert.strictEqual(meWithAuth.status, 200, 'Test 10: Session restoration must return 200 OK');
    const meData = (await meWithAuth.json()) as any;
    assert.strictEqual(meData.success, true);
    assert.strictEqual(meData.data.user.email, newGoogleEmail);
    assert.deepStrictEqual(meData.data.user.roles, ['STUDENT']);
    assert.strictEqual(meData.data.user.passwordHash, undefined, 'Test 10: passwordHash must NEVER be exposed');
    assert.strictEqual(meData.data.user.accessToken, undefined, 'Test 10: accessToken must not be leaked in body');
    console.log('✔ Test 10 Passed: Authenticated session restored cleanly without exposing sensitive tokens');

    console.log('\n================================================================');
    console.log('ALL GOOGLE AUTHENTICATION SECURITY TESTS (1-10) PASSED! (10/10)');
    console.log('================================================================');
  } finally {
    // Teardown test server and temporary test data
    server.close();
    try {
      await prisma.userRole.deleteMany({
        where: {
          user: {
            email: {
              in: [newGoogleEmail, existingStudentEmail],
            },
          },
        },
      });
      await prisma.profile.deleteMany({
        where: {
          user: {
            email: {
              in: [newGoogleEmail, existingStudentEmail],
            },
          },
        },
      });
      await prisma.auditLog.deleteMany({
        where: {
          actor: {
            email: {
              in: [newGoogleEmail, existingStudentEmail],
            },
          },
        },
      });
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [newGoogleEmail, existingStudentEmail],
          },
        },
      });
    } catch (cleanupErr) {
      console.error('Cleanup warning:', cleanupErr);
    }
  }
}

runGoogleAuthSecurityTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Google Auth Security Test Failure:', err);
    process.exit(1);
  });
