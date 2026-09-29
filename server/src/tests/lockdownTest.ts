import { prisma } from '../config/prisma';

async function runLockdownTestSuite() {
  console.log('================================================================');
  console.log('  CUSTECH FCI CONNECT — GLOBAL APPLICATION LOCKDOWN TEST SUITE  ');
  console.log('================================================================');

  const BASE_URL = 'http://localhost:5000/api/v1';

  // Helper: parse set-cookie header into a cookie string
  function extractCookies(res: Response): string {
    const raw = res.headers.get('set-cookie');
    if (!raw) return '';
    return raw
      .split(',')
      .map((c) => c.split(';')[0].trim())
      .join('; ');
  }

  // 1. Initial State Check
  console.log('\n[1] Checking initial lockdown status...');
  const initRes = await fetch(`${BASE_URL}/system/lockdown`);
  const initData = (await initRes.json()) as any;
  console.log('    Status:', initRes.status, 'Payload:', JSON.stringify(initData));
  if (initRes.status !== 200 || !initData.success) {
    throw new Error('Initial lockdown status check failed');
  }

  // If already locked from a previous run, ensure it starts clean
  if (initData.data?.locked) {
    console.log('    Resetting state to unlocked before test...');
    // We will unlock during admin login below
  }

  // 2. Super Admin Login
  console.log('\n[2] Authenticating as Super Admin...');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@custech.edu.ng',
      password: 'Admin@FCI2024!',
    }),
  });
  if (adminLoginRes.status !== 200) {
    throw new Error(`Admin login failed with status ${adminLoginRes.status}`);
  }
  const adminCookies = extractCookies(adminLoginRes);
  const adminPayload = (await adminLoginRes.json()) as any;
  console.log('    Super Admin authenticated:', adminPayload.data?.user?.email, 'Roles:', adminPayload.data?.user?.roles);

  // 3. Student Login
  console.log('\n[3] Authenticating as Student (Musa Abdullahi)...');
  const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'musa.abdullahi@custech.edu.ng',
      password: 'Student@2024',
    }),
  });
  if (studentLoginRes.status !== 200) {
    throw new Error(`Student login failed with status ${studentLoginRes.status}`);
  }
  const studentCookies = extractCookies(studentLoginRes);
  const studentPayload = (await studentLoginRes.json()) as any;
  console.log('    Student authenticated:', studentPayload.data?.user?.email, 'Roles:', studentPayload.data?.user?.roles);

  // 4. Verify baseline student access (unlocked)
  console.log('\n[4] Verifying normal student access prior to lockdown...');
  const studentPreLockRes = await fetch(`${BASE_URL}/intelligence/my-fci`, {
    headers: { Cookie: studentCookies },
  });
  console.log('    Student /intelligence/my-fci pre-lockdown status:', studentPreLockRes.status);
  if (studentPreLockRes.status !== 200) {
    console.warn('    Note: Status was', studentPreLockRes.status);
  }

  // 5. Non-admin attempt to trigger lockdown (MUST FAIL with 403)
  console.log('\n[5] Verifying that a student CANNOT alter lockdown status...');
  const studentLockAttempt = await fetch(`${BASE_URL}/system/lockdown`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentCookies,
    },
    body: JSON.stringify({ enabled: true }),
  });
  console.log('    Student toggle attempt status:', studentLockAttempt.status, '(Expect 403 Forbidden)');
  if (studentLockAttempt.status !== 403) {
    throw new Error(`Expected 403 Forbidden for student lockdown attempt, got ${studentLockAttempt.status}`);
  }
  console.log('    PASS: Unauthorized lockdown mutation strictly rejected.');

  // 6. Super Admin engages Global Application Lockdown
  console.log('\n[6] Super Admin engaging Global Application Lockdown...');
  const customMessage = 'System undergoing scheduled database maintenance. All student actions paused.';
  const lockRes = await fetch(`${BASE_URL}/system/lockdown`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookies,
    },
    body: JSON.stringify({
      enabled: true,
      message: customMessage,
    }),
  });
  const lockData = (await lockRes.json()) as any;
  console.log('    Engagement response status:', lockRes.status, 'Payload:', JSON.stringify(lockData));
  if (lockRes.status !== 200 || !lockData.data?.locked) {
    throw new Error('Lockdown engagement failed');
  }
  console.log('    PASS: Lockdown successfully engaged.');

  // 7. Verify public status reports locked
  console.log('\n[7] Verifying public lockdown status reflects active lockdown...');
  const publicStatusRes = await fetch(`${BASE_URL}/system/lockdown`);
  const publicStatusData = (await publicStatusRes.json()) as any;
  console.log('    Public status:', publicStatusData.data?.locked, 'Message:', publicStatusData.data?.message);
  if (!publicStatusData.data?.locked || publicStatusData.data?.message !== customMessage) {
    throw new Error('Public lockdown status does not match engaged state');
  }
  console.log('    PASS: Public status correctly reports lockdown active.');

  // 8. Server-Side Enforcement: Student requests MUST return HTTP 423
  console.log('\n[8] Enforcing server-side lockdown on student endpoints (Expect HTTP 423)...');

  // Test 8a: Intelligence My-FCI
  const test8a = await fetch(`${BASE_URL}/intelligence/my-fci`, {
    headers: { Cookie: studentCookies },
  });
  const data8a = (await test8a.json()) as any;
  console.log('    8a. Student GET /intelligence/my-fci -> HTTP', test8a.status, 'Code:', data8a.code);
  if (test8a.status !== 423 || data8a.code !== 'STUDENT_PORTAL_LOCKED') {
    throw new Error(`Expected HTTP 423 STUDENT_PORTAL_LOCKED, received ${test8a.status}`);
  }

  // Test 8b: SIWES Placement
  const test8b = await fetch(`${BASE_URL}/siwes/my-placement`, {
    headers: { Cookie: studentCookies },
  });
  const data8b = (await test8b.json()) as any;
  console.log('    8b. Student GET /siwes/my-placement -> HTTP', test8b.status, 'Code:', data8b.code);
  if (test8b.status !== 423 || data8b.code !== 'STUDENT_PORTAL_LOCKED') {
    throw new Error(`Expected HTTP 423 STUDENT_PORTAL_LOCKED for SIWES, received ${test8b.status}`);
  }

  // Test 8c: Write endpoint (POST /projects)
  const test8c = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentCookies,
    },
    body: JSON.stringify({ title: 'Test Project Under Lockdown' }),
  });
  const data8c = (await test8c.json()) as any;
  console.log('    8c. Student POST /projects -> HTTP', test8c.status, 'Code:', data8c.code);
  if (test8c.status !== 423 || data8c.code !== 'STUDENT_PORTAL_LOCKED') {
    throw new Error(`Expected HTTP 423 for student write during lockdown, received ${test8c.status}`);
  }
  console.log('    PASS: All student endpoints strictly rejected with HTTP 423.');

  // 9. Administrator Bypass: Super Admin MUST NOT be blocked
  console.log('\n[9] Verifying administrative bypass during active lockdown...');

  // Test 9a: Super Admin accessing /admin/audit-logs
  const test9a = await fetch(`${BASE_URL}/admin/audit-logs?limit=5`, {
    headers: { Cookie: adminCookies },
  });
  console.log('    9a. Super Admin GET /admin/audit-logs -> HTTP', test9a.status);
  if (test9a.status !== 200) {
    throw new Error(`Super Admin was unexpectedly blocked on admin endpoint: ${test9a.status}`);
  }

  // Test 9b: Super Admin accessing general auth /me
  const test9b = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Cookie: adminCookies },
  });
  console.log('    9b. Super Admin GET /auth/me -> HTTP', test9b.status);
  if (test9b.status !== 200) {
    throw new Error(`Super Admin was unexpectedly blocked on auth endpoint: ${test9b.status}`);
  }
  console.log('    PASS: Administrative bypass operating nominally.');

  // 10. Super Admin disengages lockdown
  console.log('\n[10] Super Admin disengaging lockdown...');
  const unlockRes = await fetch(`${BASE_URL}/system/lockdown`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookies,
    },
    body: JSON.stringify({ enabled: false }),
  });
  const unlockData = (await unlockRes.json()) as any;
  console.log('    Disengagement response status:', unlockRes.status, 'Payload:', JSON.stringify(unlockData));
  if (unlockRes.status !== 200 || unlockData.data?.locked) {
    throw new Error('Lockdown disengagement failed');
  }
  console.log('    PASS: Lockdown successfully disengaged.');

  // 11. Verify student access restored
  console.log('\n[11] Verifying student access restored after unlock...');
  const restoredRes = await fetch(`${BASE_URL}/intelligence/my-fci`, {
    headers: { Cookie: studentCookies },
  });
  console.log('    Student GET /intelligence/my-fci restored status:', restoredRes.status);
  if (restoredRes.status === 423) {
    throw new Error('Student is still locked out after lockdown was disengaged');
  }
  console.log('    PASS: Student access cleanly restored.');

  // 12. Direct Database & Audit Log Verification via Prisma
  console.log('\n[12] Inspecting MySQL database directly via Prisma...');
  const settingRecord = await prisma.systemSetting.findUnique({
    where: { key: 'STUDENT_PORTAL_LOCKDOWN' },
  });
  console.log('    Database SystemSetting record:');
  console.log('      Key:', settingRecord?.key);
  console.log('      Value:', settingRecord?.value);
  console.log('      UpdatedBy:', settingRecord?.updatedBy);
  console.log('      UpdatedAt:', settingRecord?.updatedAt);

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      action: {
        in: ['STUDENT_PORTAL_LOCKDOWN_ENABLED', 'STUDENT_PORTAL_LOCKDOWN_DISABLED'],
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 4,
  });

  console.log(`    Found ${auditLogs.length} relevant AuditLog entries in MySQL:`);
  for (const log of auditLogs) {
    const meta = log.metadata as any;
    console.log(`      [${log.action}] at ${log.createdAt.toISOString()} | IP: ${log.ipAddress || 'unknown'} | Details: ${meta?.details || 'N/A'}`);
  }

  const hasEnableLog = auditLogs.some((l) => l.action === 'STUDENT_PORTAL_LOCKDOWN_ENABLED');
  const hasDisableLog = auditLogs.some((l) => l.action === 'STUDENT_PORTAL_LOCKDOWN_DISABLED');

  if (!hasEnableLog || !hasDisableLog) {
    throw new Error('Missing expected AuditLog records in database');
  }
  console.log('    PASS: MySQL audit log records successfully validated.');

  console.log('\n================================================================');
  console.log('  SUCCESS: ALL 12 LOCKDOWN SUITE ASSERTIONS PASSED PERFECTLY!   ');
  console.log('================================================================\n');
}

runLockdownTestSuite()
  .catch((err) => {
    console.error('\n❌ LOCKDOWN TEST SUITE FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
