import assert from 'assert';
import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from '../routes';
import { errorHandler } from '../middleware/errorHandler';
import { prisma } from '../config/prisma';
import { AuthService } from '../services/auth.service';

async function runE2ETests() {
  console.log('================================================================');
  console.log('STARTING END-TO-END HTTP API TESTS FOR PASSWORD RESET & OTP');
  console.log('================================================================\n');

  // Create isolated express app for testing
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/v1', apiRouter);
  app.use(errorHandler);

  // Start test server on random port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}/api/v1`;

  const testEmail = `student.e2e.${Date.now()}@custech.edu.ng`;
  const oldPassword = 'OldPassword@2024!';
  const newPassword = 'BrandNewPassword@2025#';

  console.log(`[TEST SETUP] Created test user: ${testEmail} on test server port ${port}`);

  const { user } = await AuthService.register({
    email: testEmail,
    password: oldPassword,
    fullName: 'E2E Reset Student',
    department: 'COMPUTER_SCIENCE',
    level: 'LEVEL_200',
  });

  try {
    // ----------------------------------------------------------------
    // 1. POST /api/v1/auth/forgot-password (Unregistered)
    // ----------------------------------------------------------------
    console.log('1. Testing POST /auth/forgot-password with unknown email...');
    const unknownRes = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ghost@custech.edu.ng' }),
    });
    const unknownData = (await unknownRes.json()) as any;
    assert.strictEqual(unknownRes.status, 200);
    assert.strictEqual(unknownData.success, true);
    assert.strictEqual(
      unknownData.message,
      'If an account exists for that email, a verification code has been sent.',
    );
    console.log('   ✔ Identical generic response returned for unregistered account');

    // ----------------------------------------------------------------
    // 2. POST /api/v1/auth/forgot-password (Registered)
    // ----------------------------------------------------------------
    console.log('2. Testing POST /auth/forgot-password with registered user...');
    const forgotRes = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const forgotData = (await forgotRes.json()) as any;
    assert.strictEqual(forgotRes.status, 200);
    assert.strictEqual(forgotData.success, true);
    assert.strictEqual(
      forgotData.message,
      'If an account exists for that email, a verification code has been sent.',
    );
    console.log('   ✔ Identical generic response returned for registered account');

    // Retrieve generated OTP hash from DB
    const dbRecord = await prisma.passwordResetOtp.findFirst({
      where: { userId: user.id, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(dbRecord, 'OTP record created in database');
    assert.strictEqual(dbRecord.otpHash.length, 64, 'OTP is securely hashed with SHA-256 HMAC');
    console.log('   ✔ OTP record stored securely (hashed representation)');

    // ----------------------------------------------------------------
    // 3. POST /api/v1/auth/resend-otp (Cooldown check)
    // ----------------------------------------------------------------
    console.log('3. Testing POST /auth/resend-otp cooldown enforcement...');
    const cooldownRes = await fetch(`${baseUrl}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    assert.strictEqual(cooldownRes.status, 429, 'Immediate resend should return 429 Too Many Requests');
    const cooldownData = (await cooldownRes.json()) as any;
    assert.ok(
      cooldownData.error?.message?.includes('second(s) before requesting another verification code'),
    );
    console.log(`   ✔ Cooldown enforced: ${cooldownData.error?.message}`);

    // ----------------------------------------------------------------
    // 4. POST /api/v1/auth/verify-otp (Invalid code & attempt tracking)
    // ----------------------------------------------------------------
    console.log('4. Testing POST /auth/verify-otp with incorrect OTP...');
    const wrongOtpRes = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '111111' }),
    });
    assert.strictEqual(wrongOtpRes.status, 400);
    const wrongOtpData = (await wrongOtpRes.json()) as any;
    assert.ok(wrongOtpData.error?.message?.includes('4 attempt(s) remaining'));
    console.log(`   ✔ Failed attempt correctly tracked: ${wrongOtpData.error?.message}`);

    // Set known OTP hash so we can verify with exact code
    const validOtp = '654321';
    await prisma.passwordResetOtp.update({
      where: { id: dbRecord.id },
      data: { otpHash: AuthService.hashOtp(validOtp) },
    });

    // ----------------------------------------------------------------
    // 5. POST /api/v1/auth/verify-otp (Valid code)
    // ----------------------------------------------------------------
    console.log('5. Testing POST /auth/verify-otp with correct OTP...');
    const verifyRes = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: validOtp }),
    });
    assert.strictEqual(verifyRes.status, 200);
    const verifyData = (await verifyRes.json()) as any;
    assert.strictEqual(verifyData.success, true);
    assert.ok(verifyData.resetToken, 'Must receive reset authorization token');
    const resetToken = verifyData.resetToken;
    console.log('   ✔ Correct OTP verified, single-use reset authorization token granted');

    // ----------------------------------------------------------------
    // 6. POST /api/v1/auth/verify-otp (Replay prevention)
    // ----------------------------------------------------------------
    console.log('6. Testing replay of consumed OTP...');
    const replayRes = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: validOtp }),
    });
    assert.strictEqual(replayRes.status, 400);
    console.log('   ✔ Replay attempt rejected as consumed');

    // ----------------------------------------------------------------
    // 7. POST /api/v1/auth/reset-password (Validation failure)
    // ----------------------------------------------------------------
    console.log('7. Testing password mismatch validation...');
    const mismatchRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        resetToken,
        newPassword: 'ValidPassword123!',
        confirmPassword: 'MismatchPassword123!',
      }),
    });
    assert.strictEqual(mismatchRes.status, 422);
    console.log('   ✔ Password mismatch rejected by backend validation (422)');

    // ----------------------------------------------------------------
    // 8. POST /api/v1/auth/reset-password (Success)
    // ----------------------------------------------------------------
    console.log('8. Testing POST /auth/reset-password with valid parameters...');
    const resetRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        resetToken,
        newPassword,
        confirmPassword: newPassword,
      }),
    });
    assert.strictEqual(resetRes.status, 200);
    const resetData = (await resetRes.json()) as any;
    assert.strictEqual(resetData.success, true);
    assert.ok(resetData.message.includes('successfully'));
    console.log('   ✔ Password successfully reset in database');

    // ----------------------------------------------------------------
    // 9. POST /api/v1/auth/login (Old password fails, new password succeeds)
    // ----------------------------------------------------------------
    console.log('9. Verifying login with old password fails...');
    const oldLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: oldPassword }),
    });
    assert.strictEqual(oldLoginRes.status, 401);
    console.log('   ✔ Old password rejected with 401 Unauthorized');

    console.log('10. Verifying login with new password succeeds...');
    const newLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: newPassword }),
    });
    assert.strictEqual(newLoginRes.status, 200);
    const newLoginData = (await newLoginRes.json()) as any;
    assert.strictEqual(newLoginData.success, true);
    assert.strictEqual(newLoginData.data?.user?.email, testEmail);

    const setCookie = newLoginRes.headers.get('set-cookie');
    assert.ok(setCookie?.includes('access_token'), 'Login sets access_token cookie');
    assert.ok(setCookie?.includes('refresh_token'), 'Login sets refresh_token cookie');
    console.log('   ✔ Login with new password succeeded, JWT cookies established');

    console.log('\n================================================================');
    console.log('ALL END-TO-END HTTP API TESTS PASSED SUCCESSFULLY!');
    console.log('================================================================\n');
  } finally {
    // Cleanup
    server.close();
    await prisma.passwordResetOtp.deleteMany({ where: { userId: user.id } }).catch(() => {});
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } }).catch(() => {});
    await prisma.userRole.deleteMany({ where: { userId: user.id } }).catch(() => {});
    await prisma.profile.deleteMany({ where: { userId: user.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  }
}

runE2ETests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('E2E TEST FAILED:', err);
    process.exit(1);
  });
