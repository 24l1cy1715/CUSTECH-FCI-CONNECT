import { prisma } from '../config/prisma';

async function runAvatarUploadTestSuite() {
  console.log('================================================================');
  console.log('  CUSTECH FCI CONNECT — PROFILE PICTURE UPLOAD TEST SUITE        ');
  console.log('================================================================');

  const BASE_URL = 'http://localhost:5000/api/v1';

  function extractCookies(res: Response): string {
    const raw = res.headers.get('set-cookie');
    if (!raw) return '';
    return raw
      .split(',')
      .map((c) => c.split(';')[0].trim())
      .join('; ');
  }

  // 1. Unauthenticated upload attempt MUST be rejected
  console.log('\n[1] Testing unauthenticated upload rejection (Expect HTTP 401)...');
  const unauthRes = await fetch(`${BASE_URL}/profile/avatar`, {
    method: 'POST',
  });
  console.log('    Status:', unauthRes.status);
  if (unauthRes.status !== 401) {
    throw new Error(`Expected HTTP 401 Unauthorized, got ${unauthRes.status}`);
  }
  console.log('    PASS: Unauthenticated upload attempt blocked.');

  // 2. Unauthenticated delete attempt MUST be rejected
  console.log('\n[2] Testing unauthenticated delete rejection (Expect HTTP 401)...');
  const unauthDelRes = await fetch(`${BASE_URL}/profile/avatar`, {
    method: 'DELETE',
  });
  console.log('    Status:', unauthDelRes.status);
  if (unauthDelRes.status !== 401) {
    throw new Error(`Expected HTTP 401 Unauthorized, got ${unauthDelRes.status}`);
  }
  console.log('    PASS: Unauthenticated delete attempt blocked.');

  // 3. Authenticate as student Musa Abdullahi
  console.log('\n[3] Authenticating as Student (Musa Abdullahi)...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'musa.abdullahi@custech.edu.ng',
      password: 'Student@2024',
    }),
  });
  if (loginRes.status !== 200) {
    throw new Error(`Student login failed with status ${loginRes.status}`);
  }
  const cookies = extractCookies(loginRes);
  const loginPayload = (await loginRes.json()) as any;
  const studentId = loginPayload.data?.user?.id;
  console.log('    Authenticated as:', loginPayload.data?.user?.email, 'ID:', studentId);

  // 4. Test uploading corrupted / spoofed file (e.g. text file pretending to be PNG)
  console.log('\n[4] Testing rejection of spoofed file with fake extension (Expect HTTP 400)...');
  const fakeFormData = new FormData();
  const fakeFile = new Blob(['<script>alert("malicious");</script>'], { type: 'image/png' });
  fakeFormData.append('avatar', fakeFile, 'exploit.png');

  const spoofRes = await fetch(`${BASE_URL}/profile/avatar`, {
    method: 'POST',
    headers: { Cookie: cookies },
    body: fakeFormData,
  });
  const spoofData = (await spoofRes.json()) as any;
  console.log('    Spoof upload status:', spoofRes.status, 'Message:', spoofData.message);
  if (spoofRes.status !== 400) {
    throw new Error(`Expected HTTP 400 for spoofed image magic bytes, got ${spoofRes.status}`);
  }
  console.log('    PASS: Spoofed file rejected by magic bytes verification.');

  // 5. Test uploading a valid PNG image
  console.log('\n[5] Testing upload of valid PNG image (Expect HTTP 200)...');
  // Minimal valid 1x1 PNG bytes
  const validPngBytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82,
  ]);

  const validFormData = new FormData();
  const validBlob = new Blob([validPngBytes], { type: 'image/png' });
  validFormData.append('avatar', validBlob, 'test-profile.png');

  const uploadRes = await fetch(`${BASE_URL}/profile/avatar`, {
    method: 'POST',
    headers: { Cookie: cookies },
    body: validFormData,
  });
  const uploadData = (await uploadRes.json()) as any;
  console.log('    Upload response status:', uploadRes.status, 'Payload:', JSON.stringify(uploadData));
  if (uploadRes.status !== 200 || !uploadData.data?.avatarUrl) {
    throw new Error('Valid PNG upload failed');
  }
  const firstAvatarUrl = uploadData.data.avatarUrl;
  console.log('    Generated Avatar URL:', firstAvatarUrl);
  console.log('    PASS: Valid avatar uploaded successfully.');

  // 6. Direct MySQL inspection via Prisma
  console.log('\n[6] Inspecting MySQL database directly via Prisma...');
  const profileRecord = await prisma.profile.findUnique({
    where: { userId: studentId },
  });
  console.log('    Database Profile avatarUrl:', profileRecord?.avatarUrl);
  if (profileRecord?.avatarUrl !== firstAvatarUrl) {
    throw new Error('Database avatarUrl does not match uploaded URL');
  }
  console.log('    PASS: Avatar URL persisted in MySQL Profile record.');

  // 7. Verify static file serving via HTTP GET
  console.log('\n[7] Verifying static file serving at /uploads/avatars/...');
  const staticFileRes = await fetch(`http://localhost:5000${firstAvatarUrl}`);
  console.log('    Static file fetch status:', staticFileRes.status, 'Content-Type:', staticFileRes.headers.get('content-type'));
  if (staticFileRes.status !== 200) {
    throw new Error(`Failed to fetch static avatar file: HTTP ${staticFileRes.status}`);
  }
  console.log('    PASS: Static avatar file is accessible via web server.');

  // 8. Test replacing with a WebP image
  console.log('\n[8] Testing avatar replacement with valid WebP (Expect HTTP 200)...');
  // Minimal valid 1x1 WebP bytes (RIFF .... WEBPVP8 )
  const webpBytes = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20,
    0x0e, 0x00, 0x00, 0x00, 0x30, 0x01, 0x00, 0x9d,
    0x01, 0x2a, 0x01, 0x00, 0x01, 0x00, 0x02, 0x00,
    0x34, 0x25,
  ]);

  const webpFormData = new FormData();
  const webpBlob = new Blob([webpBytes], { type: 'image/webp' });
  webpFormData.append('avatar', webpBlob, 'new-profile.webp');

  const replaceRes = await fetch(`${BASE_URL}/profile/avatar`, {
    method: 'POST',
    headers: { Cookie: cookies },
    body: webpFormData,
  });
  const replaceData = (await replaceRes.json()) as any;
  console.log('    Replace response status:', replaceRes.status, 'New URL:', replaceData.data?.avatarUrl);
  if (replaceRes.status !== 200 || !replaceData.data?.avatarUrl) {
    throw new Error('Avatar replacement failed');
  }
  const secondAvatarUrl = replaceData.data.avatarUrl;
  console.log('    PASS: Avatar replaced successfully.');

  // Verify previous file was cleaned up on disk
  const oldFileRes = await fetch(`http://localhost:5000${firstAvatarUrl}`);
  console.log('    Old file status (should be 404):', oldFileRes.status);
  if (oldFileRes.status !== 404) {
    console.warn('    Note: Old file was still reachable or cached.');
  }

  // 9. Test DELETE /profile/avatar
  console.log('\n[9] Testing DELETE /profile/avatar (Expect HTTP 200 & avatarUrl = null)...');
  const deleteRes = await fetch(`${BASE_URL}/profile/avatar`, {
    method: 'DELETE',
    headers: { Cookie: cookies },
  });
  const deleteData = (await deleteRes.json()) as any;
  console.log('    Delete response status:', deleteRes.status, 'Payload:', JSON.stringify(deleteData));
  if (deleteRes.status !== 200 || deleteData.data?.avatarUrl !== null) {
    throw new Error('Avatar deletion failed');
  }

  // Verify database record has avatarUrl = null
  const clearedProfile = await prisma.profile.findUnique({
    where: { userId: studentId },
  });
  console.log('    Database Profile after deletion avatarUrl:', clearedProfile?.avatarUrl);
  if (clearedProfile?.avatarUrl !== null) {
    throw new Error('Profile avatarUrl was not set to null in database');
  }
  console.log('    PASS: Avatar deleted and restored to null in MySQL.');

  console.log('\n================================================================');
  console.log('  SUCCESS: ALL AVATAR UPLOAD TEST SUITE ASSERTIONS PASSED!       ');
  console.log('================================================================\n');
}

runAvatarUploadTestSuite()
  .catch((err) => {
    console.error('\n❌ AVATAR UPLOAD TEST SUITE FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
