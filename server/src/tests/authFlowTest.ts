async function testAuthFlow() {
  console.log('--- Testing CUSTECH FCI Connect Auth & Protected Routes Lifecycle ---');

  // 1. Login
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@custech.edu.ng',
      password: 'Admin@FCI2024!',
    }),
  });

  console.log('1. Login status:', loginRes.status);
  const loginData = (await loginRes.json()) as any;
  console.log('   User returned:', loginData.data?.user?.email, 'Roles:', loginData.data?.user?.roles);

  const rawCookies = loginRes.headers.get('set-cookie');
  console.log('   Set-Cookie received:', !!rawCookies);

  if (!rawCookies) {
    throw new Error('No cookies returned by login');
  }

  // Parse cookies for subsequent requests
  const cookies = rawCookies
    .split(',')
    .map((c) => c.split(';')[0].trim())
    .join('; ');

  // 2. Auth /me
  const meRes = await fetch('http://localhost:5000/api/v1/auth/me', {
    headers: { Cookie: cookies },
  });
  console.log('2. /auth/me status:', meRes.status);
  const meData = (await meRes.json()) as any;
  console.log('   Profile returned:', meData.data?.user?.profile?.fullName, 'Roles:', meData.data?.user?.roles);

  // 3. Digital ID Governance (admin)
  const digitalIdRes = await fetch('http://localhost:5000/api/v1/digital-id/admin', {
    headers: { Cookie: cookies },
  });
  console.log('3. /digital-id/admin status:', digitalIdRes.status);
  const digitalIdData = (await digitalIdRes.json()) as any;
  console.log('   Digital ID count:', digitalIdData.data?.identities?.length ?? 0);

  // 4. My FCI (intelligence dashboard)
  const myFciRes = await fetch('http://localhost:5000/api/v1/intelligence/my-fci', {
    headers: { Cookie: cookies },
  });
  console.log('4. /intelligence/my-fci status:', myFciRes.status);
  const myFciData = (await myFciRes.json()) as any;
  console.log('   My FCI success:', myFciData.success);

  // 5. Mentorship Dashboard
  const mentorRes = await fetch('http://localhost:5000/api/v1/mentorship/dashboard', {
    headers: { Cookie: cookies },
  });
  console.log('5. /mentorship/dashboard status:', mentorRes.status);
  const mentorData = (await mentorRes.json()) as any;
  console.log('   Mentorship dashboard success:', mentorData.success);

  // 6. SIWES Placement
  const siwesRes = await fetch('http://localhost:5000/api/v1/siwes/my-placement', {
    headers: { Cookie: cookies },
  });
  console.log('6. /siwes/my-placement status:', siwesRes.status);
  const siwesData = (await siwesRes.json()) as any;
  console.log('   SIWES placement success:', siwesData.success);

  // 7. Skill Assessment Attempts
  const assessRes = await fetch('http://localhost:5000/api/v1/assessments/my-attempts', {
    headers: { Cookie: cookies },
  });
  console.log('7. /assessments/my-attempts status:', assessRes.status);

  // 8. Refresh Token
  const refreshRes = await fetch('http://localhost:5000/api/v1/auth/refresh-token', {
    method: 'POST',
    headers: { Cookie: cookies },
  });
  console.log('8. /auth/refresh-token status:', refreshRes.status);
  const refreshData = (await refreshRes.json()) as any;
  console.log('   Refresh message:', refreshData.message);

  // 9. Logout
  const logoutRes = await fetch('http://localhost:5000/api/v1/auth/logout', {
    method: 'POST',
    headers: { Cookie: cookies },
  });
  console.log('9. /auth/logout status:', logoutRes.status);

  console.log('--- ALL AUTH & PROTECTED ROUTE TESTS COMPLETED ---');
}

testAuthFlow().catch(console.error);
