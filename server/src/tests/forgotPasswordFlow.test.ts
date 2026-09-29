import assert from 'assert';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AuthService } from '../services/auth.service';

async function runPasswordResetSuite() {
  console.log('================================================================');
  console.log('STARTING CUSTECH FCI CONNECT PASSWORD RESET & OTP AUTOMATED TESTS');
  console.log('================================================================\n');

  // Test setup: create or find a dedicated test user
  const testEmail = `test.reset.${Date.now()}@custech.edu.ng`;
  const initialPassword = 'OldPassword@2024!';
  const updatedPassword = 'NewSecurePassword@2025#';

  console.log(`[TEST SETUP] Creating test user: ${testEmail}...`);
  const { user: testUser } = await AuthService.register({
    email: testEmail,
    password: initialPassword,
    fullName: 'Test Reset Student',
    matricId: 'FCI/2024/TEST01',
    department: 'COMPUTER_SCIENCE',
    level: 'LEVEL_300',
  });

  assert.ok(testUser, 'Test user should be registered');
  console.log(`[TEST SETUP] Test user created with ID: ${testUser.id}`);

  try {
    // ----------------------------------------------------------------
    // TEST 1: Account Enumeration Protection for Unregistered Email
    // ----------------------------------------------------------------
    console.log('\n--- TEST 1: Account Enumeration Protection (Unregistered Email) ---');
    const fakeEmail = 'unregistered.user@custech.edu.ng';
    const fakeRes = await AuthService.requestPasswordResetOtp(fakeEmail);
    assert.strictEqual(fakeRes.success, true);
    assert.strictEqual(
      fakeRes.message,
      'If an account exists for that email, a verification code has been sent.',
    );

    const fakeOtpCount = await prisma.passwordResetOtp.count({
      where: { email: fakeEmail },
    });
    assert.strictEqual(fakeOtpCount, 0, 'No OTP record should be generated for unregistered emails');
    console.log('✔ PASS: Generic response returned and zero leakage for non-existent account');

    // ----------------------------------------------------------------
    // TEST 2: Request Password Reset OTP for Valid User
    // ----------------------------------------------------------------
    console.log('\n--- TEST 2: Request Password Reset OTP (Valid Account) ---');
    const validRes = await AuthService.requestPasswordResetOtp(testEmail);
    assert.strictEqual(validRes.success, true);
    assert.strictEqual(
      validRes.message,
      'If an account exists for that email, a verification code has been sent.',
    );

    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: { userId: testUser.id, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    assert.ok(otpRecord, 'Active OTP record must exist in MySQL');
    assert.strictEqual(otpRecord.attempts, 0, 'Initial attempts count must be 0');
    assert.strictEqual(otpRecord.otpHash.length, 64, 'otpHash must be SHA-256 HMAC (64 hex characters)');

    // Verify OTP expires in ~10 minutes
    const now = Date.now();
    const expiryDiff = otpRecord.expiresAt.getTime() - now;
    assert.ok(
      expiryDiff > 9 * 60 * 1000 && expiryDiff <= 10 * 60 * 1000 + 5000,
      `Expiration should be approx 10 minutes (got ${Math.round(expiryDiff / 1000)}s)`,
    );
    console.log('✔ PASS: Secure OTP generated, stored hashed, and expires in 10 minutes');

    // ----------------------------------------------------------------
    // TEST 3: Resend Cooldown Enforcement (60 seconds)
    // ----------------------------------------------------------------
    console.log('\n--- TEST 3: Resend Cooldown Enforcement ---');
    try {
      await AuthService.requestPasswordResetOtp(testEmail);
      assert.fail('Should have thrown a 429 Too Many Requests error due to cooldown');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 429);
      assert.ok(
        err.message.includes('second(s) before requesting another verification code'),
        `Expected cooldown error message, got: ${err.message}`,
      );
      console.log(`✔ PASS: Cooldown properly blocked immediate request: "${err.message}"`);
    }

    // ----------------------------------------------------------------
    // TEST 4: Invalid OTP Guessing & Attempt Limit (Max 5 attempts)
    // ----------------------------------------------------------------
    console.log('\n--- TEST 4: Incorrect OTP Guessing & Max 5 Attempt Limit ---');
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        await AuthService.verifyPasswordResetOtp(testEmail, '000000');
        assert.fail('Incorrect OTP should fail');
      } catch (err: any) {
        assert.strictEqual(err.statusCode, 400);
        const expectedRemaining = 5 - attempt;
        assert.ok(
          err.message.includes(`${expectedRemaining} attempt(s) remaining`),
          `Expected remaining count ${expectedRemaining}, got: ${err.message}`,
        );
      }
    }

    const recordAfter4 = await prisma.passwordResetOtp.findUnique({
      where: { id: otpRecord.id },
    });
    assert.strictEqual(recordAfter4?.attempts, 4, 'Attempts must increment to 4');
    assert.strictEqual(recordAfter4?.consumedAt, null, 'Must not be consumed yet');
    console.log('✔ PASS: 4 incorrect attempts properly tracked with remaining attempts message');

    // 5th incorrect attempt -> Invalidation
    try {
      await AuthService.verifyPasswordResetOtp(testEmail, '000000');
      assert.fail('5th incorrect attempt should fail and invalidate OTP');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 400);
      assert.ok(
        err.message.includes('Too many incorrect attempts'),
        `Expected too many attempts message, got: ${err.message}`,
      );
    }

    const recordAfter5 = await prisma.passwordResetOtp.findUnique({
      where: { id: otpRecord.id },
    });
    assert.strictEqual(recordAfter5?.attempts, 5);
    assert.ok(recordAfter5?.consumedAt !== null, 'OTP must be invalidated after 5 failed attempts');
    console.log('✔ PASS: 5th incorrect attempt invalidates the OTP record');

    // ----------------------------------------------------------------
    // TEST 5: Expired OTP Rejection
    // ----------------------------------------------------------------
    console.log('\n--- TEST 5: Expired OTP Rejection ---');
    const expiredRecord = await prisma.passwordResetOtp.create({
      data: {
        userId: testUser.id,
        email: testEmail,
        otpHash: AuthService.hashOtp('654321'),
        expiresAt: new Date(Date.now() - 5000), // Expired 5 seconds ago
        attempts: 0,
      },
    });

    try {
      await AuthService.verifyPasswordResetOtp(testEmail, '654321');
      assert.fail('Expired OTP must be rejected');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 400);
      assert.ok(
        err.message.includes('expired'),
        `Expected expired message, got: ${err.message}`,
      );
      console.log('✔ PASS: Expired OTP correctly rejected with friendly expiration error');
    }

    // Clean up test expired record
    await prisma.passwordResetOtp.delete({ where: { id: expiredRecord.id } });

    // ----------------------------------------------------------------
    // TEST 6: Successful OTP Verification & Short-lived Authorization Token
    // ----------------------------------------------------------------
    console.log('\n--- TEST 6: Valid OTP Verification & Authorization Token Generation ---');
    // Fast-forward cooldown by modifying previous records' createdAt
    await prisma.passwordResetOtp.updateMany({
      where: { userId: testUser.id },
      data: { createdAt: new Date(Date.now() - 70 * 1000) },
    });

    // Request fresh OTP
    await AuthService.requestPasswordResetOtp(testEmail);
    const freshRecord = await prisma.passwordResetOtp.findFirst({
      where: { userId: testUser.id, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(freshRecord, 'Fresh OTP record must exist');

    // Manually set a known test OTP hash so we can verify with exact code
    const knownOtp = '789123';
    await prisma.passwordResetOtp.update({
      where: { id: freshRecord.id },
      data: { otpHash: AuthService.hashOtp(knownOtp) },
    });

    const verifyResult = await AuthService.verifyPasswordResetOtp(testEmail, knownOtp);
    assert.strictEqual(verifyResult.success, true);
    assert.ok(verifyResult.resetToken, 'Must return a raw reset authorization token');
    assert.strictEqual(verifyResult.resetToken.length, 64, 'Reset token must be 32 bytes hex (64 chars)');

    // Verify OTP was marked consumed immediately
    const consumedRecord = await prisma.passwordResetOtp.findUnique({
      where: { id: freshRecord.id },
    });
    assert.ok(consumedRecord?.consumedAt !== null, 'OTP must be marked consumed upon verification');
    assert.ok(consumedRecord?.resetTokenHash !== null, 'resetTokenHash must be stored');
    assert.strictEqual(
      consumedRecord?.resetTokenHash,
      AuthService.hashResetToken(verifyResult.resetToken),
      'Stored token hash must match hash of raw resetToken',
    );
    console.log('✔ PASS: Valid OTP verified, marked consumed immediately, and reset token issued');

    // ----------------------------------------------------------------
    // TEST 7: OTP One-Time Use / Replay Prevention
    // ----------------------------------------------------------------
    console.log('\n--- TEST 7: OTP One-Time Use / Replay Prevention ---');
    try {
      await AuthService.verifyPasswordResetOtp(testEmail, knownOtp);
      assert.fail('Reusing consumed OTP must be rejected');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 400);
      console.log('✔ PASS: Reusing the same OTP failed as expected');
    }

    // ----------------------------------------------------------------
    // TEST 8: Reset Password using Invalid Authorization Token
    // ----------------------------------------------------------------
    console.log('\n--- TEST 8: Reset Password with Forged/Invalid Token ---');
    try {
      await AuthService.resetPassword(testEmail, 'invalid_token_1234567890abcdef', updatedPassword);
      assert.fail('Invalid reset token must be rejected');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 400);
      console.log('✔ PASS: Forged reset token rejected');
    }

    // ----------------------------------------------------------------
    // TEST 9: Successful Password Reset & Invalidation of Reset Session
    // ----------------------------------------------------------------
    console.log('\n--- TEST 9: Successful Password Reset ---');
    const resetResult = await AuthService.resetPassword(testEmail, verifyResult.resetToken, updatedPassword);
    assert.strictEqual(resetResult.success, true);
    assert.ok(resetResult.message.includes('successfully'));

    // Check DB state: User password must be updated and legacy tokens cleared
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
    });
    assert.ok(updatedUser?.passwordHash, 'User must have a password hash');
    const isNewPasswordValid = await bcrypt.compare(updatedPassword, updatedUser!.passwordHash!);
    assert.strictEqual(isNewPasswordValid, true, 'Stored hash must match new password');
    assert.strictEqual(updatedUser?.resetToken, null, 'User resetToken must be cleared');
    assert.strictEqual(updatedUser?.resetExpires, null, 'User resetExpires must be cleared');

    // Check PasswordResetOtp records: all must be consumed
    const activeRecords = await prisma.passwordResetOtp.count({
      where: { userId: testUser.id, resetConsumedAt: null },
    });
    assert.strictEqual(activeRecords, 0, 'All reset authorizations must be marked consumed');
    console.log('✔ PASS: Password hash updated, reset credentials invalidated across DB');

    // ----------------------------------------------------------------
    // TEST 10: Replay Reset Password with Same Token Fails
    // ----------------------------------------------------------------
    console.log('\n--- TEST 10: Replay Reset Password with Used Token Fails ---');
    try {
      await AuthService.resetPassword(testEmail, verifyResult.resetToken, 'AnotherPassword123!');
      assert.fail('Should not be able to reuse consumed reset token');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 400);
      console.log('✔ PASS: Reset token cannot be reused');
    }

    // ----------------------------------------------------------------
    // TEST 11: Authentication Verification: Old Password Rejection & New Password Acceptance
    // ----------------------------------------------------------------
    console.log('\n--- TEST 11: Login Verification (New vs Old Password) ---');
    // Try logging in with old password -> MUST FAIL
    try {
      await AuthService.login(testEmail, initialPassword);
      assert.fail('Old password must be rejected');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 401);
      console.log('✔ PASS: Old password rejected with 401 Unauthorized');
    }

    // Try logging in with new password -> MUST SUCCEED
    const loginResult = await AuthService.login(testEmail, updatedPassword);
    assert.ok(loginResult.user, 'Login with new password must succeed');
    assert.strictEqual(loginResult.user.email, testEmail);
    assert.ok(loginResult.tokens.accessToken, 'Access token returned');
    assert.ok(loginResult.tokens.refreshToken, 'Refresh token returned');
    console.log('✔ PASS: Login with new password succeeded and generated new tokens');

    // ----------------------------------------------------------------
    // TEST 12: Audit Logging Verification
    // ----------------------------------------------------------------
    console.log('\n--- TEST 12: Security Audit Logs Verification ---');
    const logs = await prisma.auditLog.findMany({
      where: { actorId: testUser.id },
      orderBy: { createdAt: 'asc' },
    });

    const actions = logs.map((l) => l.action);
    console.log('   Captured audit actions:', actions);
    assert.ok(actions.includes('PASSWORD_RESET_OTP_SENT'), 'Must log PASSWORD_RESET_OTP_SENT');
    assert.ok(actions.includes('PASSWORD_RESET_OTP_FAILED'), 'Must log PASSWORD_RESET_OTP_FAILED');
    assert.ok(actions.includes('PASSWORD_RESET_OTP_VERIFIED'), 'Must log PASSWORD_RESET_OTP_VERIFIED');
    assert.ok(actions.includes('PASSWORD_RESET_COMPLETED'), 'Must log PASSWORD_RESET_COMPLETED');
    console.log('✔ PASS: All required security audit log events recorded');

    console.log('\n================================================================');
    console.log('ALL 12 BACKEND PASSWORD RESET & OTP SECURITY TESTS PASSED!');
    console.log('================================================================\n');
  } finally {
    // Cleanup test data
    console.log('[CLEANUP] Cleaning up test user and OTP records...');
    await prisma.passwordResetOtp.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
    await prisma.auditLog.deleteMany({ where: { actorId: testUser.id } }).catch(() => {});
    await prisma.userRole.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
    await prisma.profile.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    console.log('[CLEANUP] Completed.');
  }
}

runPasswordResetSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('TEST SUITE FAILED:', err);
    process.exit(1);
  });
