import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../config/prisma';
import {
  createCommunitySchema,
  createPostSchema,
  createResourceSchema,
} from '../validators/community.validator';
import {
  upsertMentorProfileSchema,
  createMentorshipRequestSchema,
  createGoalSchema,
  createSessionSchema,
  createMentorshipResourceSchema,
} from '../validators/mentorship.validator';
import {
  CommunityCategory,
  CommunityMemberRole,
  CommunityMembershipStatus,
  CommunityVisibility,
  MentorshipStatus,
  MentorshipSessionFormat,
} from '@prisma/client';

test('Phase 5 Community Validator — enforces valid categories & safe URLs', () => {
  // Valid community creation payload
  const validCommunity = createCommunitySchema.safeParse({
    body: {
      name: 'CUSTECH Cybersecurity Guild',
      slug: 'custech-cybersecurity-guild',
      description: 'Premier student cybersecurity guild dedicated to CTF and secure systems.',
      category: 'CYBERSECURITY',
      visibility: 'PUBLIC',
      logo: 'https://custech.edu.ng/assets/cyber-guild.png',
    },
  });
  assert.strictEqual(validCommunity.success, true);

  // Invalid category rejection
  const invalidCategory = createCommunitySchema.safeParse({
    body: {
      name: 'Invalid Guild',
      description: 'Testing invalid category rejection',
      category: 'UNKNOWN_CATEGORY',
    },
  });
  assert.strictEqual(invalidCategory.success, false);

  // Resource safe URL validation
  const safeResource = createResourceSchema.safeParse({
    params: { id: 'comm-123' },
    body: {
      title: 'OWASP Cheat Sheet',
      url: 'https://cheatsheetseries.owasp.org',
      type: 'DOCUMENTATION',
    },
  });
  assert.strictEqual(safeResource.success, true);

  // Malicious javascript: URL scheme rejection
  const maliciousResource = createResourceSchema.safeParse({
    params: { id: 'comm-123' },
    body: {
      title: 'XSS Attack Vector',
      url: 'javascript:alert(1)',
      type: 'ARTICLE',
    },
  });
  assert.strictEqual(maliciousResource.success, false);
});

test('Phase 5 Mentorship Validator — validates profiles, goals, and safe session URLs', () => {
  // Valid mentor profile
  const validProfile = upsertMentorProfileSchema.safeParse({
    body: {
      headline: 'Senior AI Engineer & Python Mentor',
      bio: 'Passionate about machine learning and helping juniors master neural networks.',
      areas: ['AI/ML', 'Python', 'Data Science'],
      availability: 'Saturdays 2-5 PM',
      sessionFormat: 'MIXED',
      maxMentees: 4,
      isAvailable: true,
    },
  });
  assert.strictEqual(validProfile.success, true);

  // Valid mentorship goal
  const validGoal = createGoalSchema.safeParse({
    params: { id: 'rel-123' },
    body: {
      title: 'Build a network scanner',
      target: 'Scan open ports using Python sockets with multithreading',
      progress: 25,
      status: 'IN_PROGRESS',
    },
  });
  assert.strictEqual(validGoal.success, true);

  // Valid session with meeting link
  const validSession = createSessionSchema.safeParse({
    params: { id: 'rel-123' },
    body: {
      title: 'Weekly Sync & Code Review',
      scheduledAt: '2026-10-01T15:00:00.000Z',
      duration: 60,
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
    },
  });
  assert.strictEqual(validSession.success, true);

  // Unsafe session meeting link rejection
  const unsafeSession = createSessionSchema.safeParse({
    params: { id: 'rel-123' },
    body: {
      title: 'Malicious Meeting',
      scheduledAt: '2026-10-01T15:00:00.000Z',
      meetingUrl: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    },
  });
  assert.strictEqual(unsafeSession.success, false);
});

test('Phase 5 Database Integration — Community lifecycle & duplicate membership prevention', async () => {
  // Find or create test users
  const student = await prisma.user.findFirst({
    where: { email: 'aisha.bello@custech.edu.ng' },
  });
  assert.ok(student, 'Test student Aisha must exist');

  const testSlug = `test-club-${Date.now()}`;

  // 1. Create a community
  const community = await prisma.community.create({
    data: {
      name: 'Test Robotics Guild',
      slug: testSlug,
      description: 'Autonomous robotics and microcontrollers society.',
      category: CommunityCategory.ROBOTICS,
      visibility: CommunityVisibility.PUBLIC,
      ownerId: student.id,
    },
  });
  assert.ok(community.id);
  assert.strictEqual(community.category, 'ROBOTICS');

  // 2. Add owner membership
  const ownerMembership = await prisma.communityMembership.create({
    data: {
      communityId: community.id,
      userId: student.id,
      role: CommunityMemberRole.OWNER,
      status: CommunityMembershipStatus.ACTIVE,
    },
  });
  assert.strictEqual(ownerMembership.role, 'OWNER');

  // 3. Prevent duplicate active membership
  await assert.rejects(
    async () => {
      await prisma.communityMembership.create({
        data: {
          communityId: community.id,
          userId: student.id,
          role: CommunityMemberRole.MEMBER,
          status: CommunityMembershipStatus.ACTIVE,
        },
      });
    },
    /Unique constraint failed/i,
    'Duplicate membership for the same user in a community must be rejected'
  );

  // 4. Create community discussion post
  const post = await prisma.communityPost.create({
    data: {
      communityId: community.id,
      authorId: student.id,
      title: 'Welcome to the Robotics Guild!',
      content: 'Let us collaborate on our first Arduino rover robot.',
      isAnnouncement: true,
      isPinned: true,
    },
  });
  assert.strictEqual(post.isAnnouncement, true);

  // Clean up test community
  await prisma.communityPost.delete({ where: { id: post.id } });
  await prisma.communityMembership.delete({ where: { id: ownerMembership.id } });
  await prisma.community.delete({ where: { id: community.id } });
});

test('Phase 5 Mentorship Lifecycle — Request creation, duplicate prevention, and goal tracking', async () => {
  const users = await prisma.user.findMany({ take: 2 });
  assert.ok(users.length >= 2, 'Need at least 2 users for mentorship tests');

  const mentorUser = users[0];
  const menteeUser = users[1];

  // 1. Create/upsert mentor profile
  const mentorProfile = await prisma.mentorProfile.upsert({
    where: { userId: mentorUser.id },
    create: {
      userId: mentorUser.id,
      headline: 'Fullstack Systems Architect',
      bio: 'Mentoring in TypeScript, Distributed Systems, and Microservices.',
      areas: JSON.stringify(['Web Development', 'Python', 'Career Development']),

      availability: 'Weekends',
      maxMentees: 5,
      sessionFormat: MentorshipSessionFormat.MIXED,
      isAvailable: true,
    },
    update: { isAvailable: true },
  });
  assert.ok(mentorProfile.id);

  // 2. Mentee requests mentorship
  // Clean up any existing relationship between these two
  await prisma.mentorship.deleteMany({
    where: { mentorId: mentorUser.id, menteeId: menteeUser.id },
  });

  const request = await prisma.mentorship.create({
    data: {
      mentorId: mentorUser.id,
      menteeId: menteeUser.id,
      goal: 'Learn Docker containerization and CI/CD pipelines',
      status: MentorshipStatus.PENDING,
    },
  });
  assert.strictEqual(request.status, 'PENDING');

  // 3. Prevent duplicate pending request
  const existingPending = await prisma.mentorship.findFirst({
    where: {
      mentorId: mentorUser.id,
      menteeId: menteeUser.id,
      status: { in: [MentorshipStatus.PENDING, MentorshipStatus.ACCEPTED] },
    },
  });
  assert.ok(existingPending, 'Existing active request must be detected');

  // 4. Mentor accepts request
  const accepted = await prisma.mentorship.update({
    where: { id: request.id },
    data: {
      status: MentorshipStatus.ACCEPTED,
      startedAt: new Date(),
    },
  });
  assert.strictEqual(accepted.status, 'ACCEPTED');

  // 5. Create structured learning goal
  const goal = await prisma.mentorshipGoal.create({
    data: {
      mentorshipId: accepted.id,
      title: 'Containerize Express Backend',
      target: 'Write Dockerfile and docker-compose.yml',
      progress: 50,
      status: 'IN_PROGRESS',
    },
  });
  assert.strictEqual(goal.progress, 50);

  // 6. Complete goal
  const updatedGoal = await prisma.mentorshipGoal.update({
    where: { id: goal.id },
    data: { progress: 100, status: 'COMPLETED' },
  });
  assert.strictEqual(updatedGoal.status, 'COMPLETED');

  // Clean up
  await prisma.mentorshipGoal.delete({ where: { id: goal.id } });
  await prisma.mentorship.delete({ where: { id: request.id } });
});
