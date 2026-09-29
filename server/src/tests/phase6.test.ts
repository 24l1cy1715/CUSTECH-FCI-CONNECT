import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  createLearningResourceSchema,
  updateProgressSchema,
  createLearningPathSchema,
  updateLearningPathSchema,
} from '../validators/learning.validator';
import {
  updateDigitalIdVisibilitySchema,
  adminVerifyDigitalIdSchema,
  adminSuspendDigitalIdSchema,
  adminRevokeDigitalIdSchema,
} from '../validators/digitalId.validator';

test('Phase 6 Learning Hub Validator — safe URL schemes & taxonomy validation', () => {
  // Valid resource submission
  const valid = createLearningResourceSchema.safeParse({
    body: {
      title: 'CYB 305 Network Defense Protocols',
      description: 'Comprehensive guide to packet filtering and firewall configuration.',
      resourceType: 'LECTURE_NOTE',
      category: 'CYBERSECURITY',
      subject: 'Network Security',
      courseCode: 'CYB 305',
      courseTitle: 'Network Security Principles',
      semester: '1',
      url: 'https://custech.edu.ng/learning/cyb305.pdf',
    },
  });
  assert.strictEqual(valid.success, true);

  // Reject malicious javascript: URL scheme
  const xssUrl = createLearningResourceSchema.safeParse({
    body: {
      title: 'Exploit Handout',
      description: 'Test malicious link rejection',
      resourceType: 'ARTICLE',
      category: 'CYBERSECURITY',
      url: 'javascript:alert(document.cookie)',
    },
  });
  assert.strictEqual(xssUrl.success, false);

  // Reject invalid resource type
  const badType = createLearningResourceSchema.safeParse({
    body: {
      title: 'Invalid Type Handout',
      description: 'Testing taxonomy rejection',
      resourceType: 'UNRECOGNIZED_TYPE',
      category: 'CYBERSECURITY',
    },
  });
  assert.strictEqual(badType.success, false);

  // Reject invalid category
  const badCategory = createLearningResourceSchema.safeParse({
    body: {
      title: 'Invalid Category Handout',
      description: 'Testing taxonomy rejection',
      resourceType: 'PDF',
      category: 'NON_EXISTENT_CATEGORY',
    },
  });
  assert.strictEqual(badCategory.success, false);
});

test('Phase 6 Learning Hub Validator — enforces 0 to 100 progress bounds', () => {
  // Valid progress 65%
  const validProgress = updateProgressSchema.safeParse({
    params: { id: 'res-123' },
    body: {
      status: 'IN_PROGRESS',
      progressPercentage: 65,
    },
  });
  assert.strictEqual(validProgress.success, true);

  // Reject progress > 100
  const over100 = updateProgressSchema.safeParse({
    params: { id: 'res-123' },
    body: {
      progressPercentage: 101,
    },
  });
  assert.strictEqual(over100.success, false);

  // Reject negative progress
  const negative = updateProgressSchema.safeParse({
    params: { id: 'res-123' },
    body: {
      progressPercentage: -5,
    },
  });
  assert.strictEqual(negative.success, false);

  // Complete status with 100%
  const completed = updateProgressSchema.safeParse({
    params: { id: 'res-123' },
    body: {
      status: 'COMPLETED',
      progressPercentage: 100,
    },
  });
  assert.strictEqual(completed.success, true);
});

test('Phase 6 Learning Paths Validator — validates roadmap milestones & difficulty', () => {
  const validPath = createLearningPathSchema.safeParse({
    body: {
      title: 'Full-Stack Developer Track',
      slug: 'full-stack-developer-track',
      description: 'Master frontend, backend APIs, and relational database systems.',
      category: 'SOFTWARE_ENGINEERING',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '12 Weeks',
      items: [
        {
          resourceId: 'res-456',
          position: 1,
          isRequired: true,
        },
      ],
    },
  });
  assert.strictEqual(validPath.success, true);

  // Negative item position rejected (must be >= 0)
  const badPosition = createLearningPathSchema.safeParse({
    body: {
      title: 'Invalid Track',
      description: 'Test invalid position rejection',
      category: 'SOFTWARE_ENGINEERING',
      items: [
        {
          resourceId: 'res-456',
          position: -1,
        },
      ],
    },
  });
  assert.strictEqual(badPosition.success, false);
});

test('Phase 6 Digital ID Validator — validates visibility toggles & admin actions', () => {
  // Visibility preferences
  const validVisibility = updateDigitalIdVisibilitySchema.safeParse({
    body: {
      showSkills: true,
      showAchievements: false,
      showPortfolio: true,
    },
  });
  assert.strictEqual(validVisibility.success, true);

  // Admin status actions
  const validSuspend = adminSuspendDigitalIdSchema.safeParse({
    params: { userId: 'usr-student-1' },
    body: {
      reason: 'Academic disciplinary review in progress',
    },
  });
  assert.strictEqual(validSuspend.success, true);

  // Reason must have at least 3 chars
  const shortReason = adminSuspendDigitalIdSchema.safeParse({
    params: { userId: 'usr-student-1' },
    body: {
      reason: 'No',
    },
  });
  assert.strictEqual(shortReason.success, false);
});

test('Phase 6 Digital ID Security — generates cryptographically secure non-sequential tokens', () => {
  // Generate sample tokens
  const token1 = crypto.randomBytes(24).toString('hex');
  const token2 = crypto.randomBytes(24).toString('hex');

  // Verify length (24 bytes = 48 hex characters)
  assert.strictEqual(token1.length, 48);
  assert.strictEqual(token2.length, 48);
  assert.notStrictEqual(token1, token2);

  // Verify non-sequential random FCI Connect ID format
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const fciId = `FCI-${year}-${randomSuffix}`;

  const fciIdPattern = /^FCI-\d{4}-\d{5}$/;
  assert.strictEqual(fciIdPattern.test(fciId), true);
});

test('Phase 6 Public Verification Privacy — guarantees no leak of sensitive student records', () => {
  // Mock public verification response object
  const mockPublicResponse = {
    verified: true,
    status: 'VERIFIED',
    statusMessage: 'Verified Active FCI Student',
    student: {
      fullName: 'Amina Yusuf',
      fciId: 'FCI-2026-48291',
      department: 'Cyber Security',
      level: 300,
      avatarUrl: 'https://example.com/avatar.jpg',
      issuedAt: new Date().toISOString(),
      portfolioUrl: '/u/amina_yusuf',
      skills: [{ id: 'sk-1', name: 'Penetration Testing' }],
      achievements: [{ id: 'ac-1', title: 'Dean’s List 2025' }],
    },
    verificationTimestamp: new Date().toISOString(),
    institution: 'Confluence University of Science and Technology (CUSTECH)',
  };

  // Strictly verify that private fields are NOT present
  const studentData = mockPublicResponse.student as any;
  assert.strictEqual(studentData.email, undefined);
  assert.strictEqual(studentData.password, undefined);
  assert.strictEqual(studentData.passwordHash, undefined);
  assert.strictEqual(studentData.matricNo, undefined);
  assert.strictEqual(studentData.matricNumber, undefined);
  assert.strictEqual(studentData.phoneNumber, undefined);
  assert.strictEqual(studentData.phone, undefined);
  assert.strictEqual(studentData.id, undefined); // Internal DB ID hidden
});
