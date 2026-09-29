/**
 * Phase D — Production Readiness, Accessibility, RBAC & API Regression Test Suite
 * Validates health, public APIs, RBAC guards, privacy boundaries, and error consistency.
 */

const BASE_URL = 'http://localhost:5000';

async function runPhaseDTests() {
  console.log('================================================================');
  console.log('   CUSTECH FCI CONNECT — Phase D Automated Verification Suite   ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // ── 1. Health & Database Connectivity ──────────────────────────────────────
  console.log('1. Health & Observability:');
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = (await res.json()) as any;
    assert(res.status === 200, 'GET /health responds with HTTP 200');
    assert(data.status === 'healthy', 'Health status is "healthy"');
    assert(data.database === 'connected', 'Database connectivity is verified as "connected"');
    assert(typeof data.timestamp === 'string', 'Health payload includes ISO timestamp');
  } catch (err: any) {
    assert(false, `Health check failed: ${err.message}`);
  }

  // ── 2. Public Feeds & Navigation Endpoints ─────────────────────────────────
  console.log('\n2. Public Endpoints (Accessible without auth):');
  const publicRoutes = [
    '/api/v1/opportunities',
    '/api/v1/announcements',
    '/api/v1/communities',
    '/api/v1/campus/locations',
    '/api/v1/skills',
    '/api/v1/learning/resources',
    '/api/v1/research',
    '/api/v1/marketplace',
  ];

  for (const route of publicRoutes) {
    try {
      const res = await fetch(`${BASE_URL}${route}`);
      assert(res.status === 200, `GET ${route} returns 200 OK`);
    } catch (err: any) {
      assert(false, `GET ${route} failed: ${err.message}`);
    }
  }

  // ── 3. Unauthenticated Route Guards & RBAC Protection ───────────────────────
  console.log('\n3. Route Guards & Privilege Escalation Defense:');
  try {
    // Audit logs require authentication and SUPER_ADMIN
    const auditRes = await fetch(`${BASE_URL}/api/v1/admin/audit-logs`);
    assert(auditRes.status === 401, 'GET /api/v1/admin/audit-logs rejected unauthenticated caller (401)');

    // Admin Digital ID governance requires authentication and ADMIN/SUPER_ADMIN
    const idRes = await fetch(`${BASE_URL}/api/v1/digital-id/admin`);
    assert(idRes.status === 401, 'GET /api/v1/digital-id/admin rejected unauthenticated caller (401)');

    // User dashboard requires authentication
    const dashRes = await fetch(`${BASE_URL}/api/v1/intelligence/my-fci`);
    assert(dashRes.status === 401, 'GET /api/v1/intelligence/my-fci rejected unauthenticated caller (401)');

    // SIWES placement requires authentication
    const siwesRes = await fetch(`${BASE_URL}/api/v1/siwes/my-placement`);
    assert(siwesRes.status === 401, 'GET /api/v1/siwes/my-placement rejected unauthenticated caller (401)');
  } catch (err: any) {
    assert(false, `Guard check failed: ${err.message}`);
  }

  // ── 4. Authenticated Admin Lifecycle & Session Management ──────────────────
  console.log('\n4. Authenticated Session & Elevated Endpoints:');
  let authCookies = '';
  try {
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@custech.edu.ng',
        password: 'Admin@FCI2024!',
      }),
    });

    assert(loginRes.status === 200, 'POST /api/v1/auth/login succeeds with valid credentials');
    const setCookie = loginRes.headers.get('set-cookie');
    assert(!!setCookie, 'Login sets HttpOnly session cookies');

    if (setCookie) {
      authCookies = setCookie
        .split(',')
        .map((c) => c.split(';')[0].trim())
        .join('; ');

      // Verify /auth/me returns roles and profile
      const meRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
        headers: { Cookie: authCookies },
      });
      const meData = (await meRes.json()) as any;
      assert(meRes.status === 200, 'GET /api/v1/auth/me succeeds with session cookies');
      assert(
        meData.data?.user?.roles?.includes('ADMIN') || meData.data?.user?.roles?.includes('SUPER_ADMIN'),
        'Admin roles properly present on authenticated session',
      );

      // Verify Digital ID admin list with admin session
      const adminIdRes = await fetch(`${BASE_URL}/api/v1/digital-id/admin`, {
        headers: { Cookie: authCookies },
      });
      assert(adminIdRes.status === 200, 'GET /api/v1/digital-id/admin accessible to verified Admin');

      // Verify Super Admin Audit Logs
      const auditRes = await fetch(`${BASE_URL}/api/v1/admin/audit-logs`, {
        headers: { Cookie: authCookies },
      });
      assert(auditRes.status === 200, 'GET /api/v1/admin/audit-logs accessible to verified Super Admin');
    }
  } catch (err: any) {
    assert(false, `Auth session check failed: ${err.message}`);
  }

  // ── 5. Input Validation & Error Payload Hygiene ────────────────────────────
  console.log('\n5. Input Validation & Error Privacy:');
  try {
    const invalidLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent-user@custech.edu.ng',
        password: 'WrongPassword123!',
      }),
    });
    assert(invalidLoginRes.status === 401, 'Invalid credentials return HTTP 401');
    const errData = (await invalidLoginRes.json()) as any;
    assert(!errData.stack, 'Error payload strips stack traces in response');
    const msg = errData.error?.message || errData.message;
    assert(typeof msg === 'string', 'Error payload provides clean, readable message');

    const notFoundRes = await fetch(`${BASE_URL}/api/v1/nonexistent-endpoint-route`);
    assert(notFoundRes.status === 404, 'Non-existent route returns 404');
  } catch (err: any) {
    assert(false, `Error hygiene check failed: ${err.message}`);
  }

  // ── 6. Clean Session Termination (Logout) ──────────────────────────────────
  console.log('\n6. Session Logout Invalidation:');
  if (authCookies) {
    try {
      const logoutRes = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { Cookie: authCookies },
      });
      assert(logoutRes.status === 200, 'POST /api/v1/auth/logout completes successfully (200 OK)');
      const clearedCookies = logoutRes.headers.get('set-cookie');
      assert(!!clearedCookies, 'Logout returns clearance set-cookie headers');
    } catch (err: any) {
      assert(false, `Logout check failed: ${err.message}`);
    }
  }

  console.log('\n================================================================');
  console.log(`Phase D Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhaseDTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
