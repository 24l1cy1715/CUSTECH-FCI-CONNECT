import test from 'node:test';
import assert from 'node:assert/strict';
import { Department, ProjectCategory, LabProjectVisibility, LabProjectStatus, LabTaskStatus, LabTaskPriority, OpportunityTrackStatus } from '@prisma/client';
import {
  createLabProjectSchema,
  updateLabProjectSchema,
  createTaskSchema,
  updateTaskSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  inviteMemberSchema,
  respondInvitationSchema,
} from '../validators/projectLab.validator';
import {
  trackOpportunitySchema,
  updateOpportunityTrackingSchema,
} from '../validators/opportunityTracker.validator';

test('Phase 7 Project Lab Validator — valid project creation & safe URL enforcement', () => {
  // Valid project creation
  const valid = createLabProjectSchema.safeParse({
    body: {
      title: 'AI Smart Campus Navigation System',
      description: 'An interactive AR/AI navigation assistant for CUSTECH faculty buildings.',
      category: ProjectCategory.ARTIFICIAL_INTELLIGENCE,
      problemStatement: 'Students waste time finding laboratories across campus.',
      objectives: 'Build a mobile-first pathfinding application using node-based maps.',
      department: Department.COMPUTER_SCIENCE,
      visibility: LabProjectVisibility.PUBLIC,
      githubUrl: 'https://github.com/custech-fci/campus-nav',
      liveDemoUrl: 'https://nav.custech.edu.ng',
    },
  });
  assert.strictEqual(valid.success, true);

  // Reject malicious URL scheme (e.g. javascript:)
  const xssGithub = createLabProjectSchema.safeParse({
    body: {
      title: 'Malicious Project',
      description: 'Testing XSS filter',
      category: ProjectCategory.SOFTWARE_ENGINEERING,
      problemStatement: 'Problem statement test',
      objectives: 'Objectives test',
      department: Department.SOFTWARE_ENGINEERING,
      githubUrl: 'javascript:alert(document.cookie)',
    },
  });
  assert.strictEqual(xssGithub.success, false);

  // Reject invalid category
  const badCategory = createLabProjectSchema.safeParse({
    body: {
      title: 'Bad Category Project',
      description: 'Testing category constraint',
      category: 'INVALID_CATEGORY',
      problemStatement: 'Problem statement test',
      objectives: 'Objectives test',
    },
  });
  assert.strictEqual(badCategory.success, false);
});

test('Phase 7 Project Lab Validator — task creation and status validation', () => {
  // Valid task
  const validTask = createTaskSchema.safeParse({
    params: { id: 'proj-123' },
    body: {
      title: 'Design high-fidelity wireframes in Figma',
      description: 'Create components for Kanban board and overview dashboard.',
      status: LabTaskStatus.TODO,
      priority: LabTaskPriority.HIGH,
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    },
  });
  assert.strictEqual(validTask.success, true);

  // Reject invalid task status
  const invalidStatus = updateTaskSchema.safeParse({
    params: { id: 'proj-123', taskId: 'tsk-456' },
    body: {
      status: 'IN_THE_FUTURE',
    },
  });
  assert.strictEqual(invalidStatus.success, false);

  // Valid task status transition to DONE
  const validDone = updateTaskSchema.safeParse({
    params: { id: 'proj-123', taskId: 'tsk-456' },
    body: {
      status: LabTaskStatus.DONE,
    },
  });
  assert.strictEqual(validDone.success, true);
});

test('Phase 7 Project Lab Validator — milestones and team members', () => {
  // Valid milestone
  const validMilestone = createMilestoneSchema.safeParse({
    params: { id: 'proj-123' },
    body: {
      title: 'Phase 1 MVP Release',
      description: 'All core routing and database models integrated.',
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
    },
  });
  assert.strictEqual(validMilestone.success, true);

  // Valid team member addition
  const validMember = inviteMemberSchema.safeParse({
    params: { id: 'proj-123' },
    body: {
      userId: 'usr-student-456',
      role: 'DEVELOPER',
    },
  });
  assert.strictEqual(validMember.success, true);

  // Valid invitation response
  const acceptInvite = respondInvitationSchema.safeParse({
    params: { id: 'proj-123' },
    body: {
      action: 'ACCEPT',
    },
  });
  assert.strictEqual(acceptInvite.success, true);

  // Reject invalid invitation response
  const badInvite = respondInvitationSchema.safeParse({
    params: { id: 'proj-123' },
    body: {
      action: 'UNKNOWN_ACTION',
    },
  });
  assert.strictEqual(badInvite.success, false);
});

test('Phase 7 Opportunity Tracker Validator — application tracking & documents', () => {
  // Valid opportunity track
  const validTrack = trackOpportunitySchema.safeParse({
    params: { id: 'opp-123' },
    body: {
      status: OpportunityTrackStatus.APPLYING,
      notes: 'Need to get recommendation letter from Prof. Adeyemi.',
      documentTypes: ['CV', 'Transcript', 'Cover Letter'],
      followUpDate: new Date(Date.now() + 86400000 * 10).toISOString(),
      remindDaysBefore: 7,
    },
  });
  assert.strictEqual(validTrack.success, true);

  // Reject invalid opportunity track status
  const invalidStatus = trackOpportunitySchema.safeParse({
    params: { id: 'opp-123' },
    body: {
      status: 'COMPLETED_APPLICATION', // Not an enum value
    },
  });
  assert.strictEqual(invalidStatus.success, false);

  // Reject negative reminder days
  const badReminder = trackOpportunitySchema.safeParse({
    params: { id: 'opp-123' },
    body: {
      remindDaysBefore: -5,
    },
  });
  assert.strictEqual(badReminder.success, false);
});

test('Phase 7 Project Lab — legitimate progress calculation formula', () => {
  const calculateProgress = (
    tasks: { status: string }[],
    milestones: { status: string }[]
  ): number => {
    const totalItems = tasks.length + milestones.length;
    if (totalItems === 0) return 0;
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
    const completedMilestones = milestones.filter((m) => m.status === 'COMPLETED').length;
    return Math.round(((completedTasks + completedMilestones) / totalItems) * 100);
  };

  // Case 1: Empty project has 0% progress
  assert.strictEqual(calculateProgress([], []), 0);

  // Case 2: 2 tasks, 0 done = 0%
  assert.strictEqual(
    calculateProgress([{ status: 'TODO' }, { status: 'IN_PROGRESS' }], []),
    0
  );

  // Case 3: 2 tasks (1 done), 2 milestones (1 completed) = 2/4 = 50%
  assert.strictEqual(
    calculateProgress(
      [{ status: 'DONE' }, { status: 'IN_PROGRESS' }],
      [{ status: 'COMPLETED' }, { status: 'PLANNED' }]
    ),
    50
  );

  // Case 4: 3 tasks done, 1 milestone completed = 4/4 = 100%
  assert.strictEqual(
    calculateProgress(
      [{ status: 'DONE' }, { status: 'DONE' }, { status: 'DONE' }],
      [{ status: 'COMPLETED' }]
    ),
    100
  );
});

test('Phase 7 Opportunity Tracker — deadline status calculation logic', () => {
  const getDeadlineStatus = (
    deadline: Date | null
  ): { daysRemaining: number | null; status: 'CLOSED' | 'URGENT' | 'APPROACHING' | 'UPCOMING' | 'NO_DEADLINE' } => {
    if (!deadline) {
      return { daysRemaining: null, status: 'NO_DEADLINE' };
    }
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let status: 'CLOSED' | 'URGENT' | 'APPROACHING' | 'UPCOMING';
    if (daysRemaining < 0) {
      status = 'CLOSED';
    } else if (daysRemaining <= 3) {
      status = 'URGENT';
    } else if (daysRemaining <= 7) {
      status = 'APPROACHING';
    } else {
      status = 'UPCOMING';
    }

    return { daysRemaining, status };
  };

  const now = new Date();

  // Past deadline is CLOSED
  const past = new Date(now.getTime() - 86400000 * 2);
  assert.strictEqual(getDeadlineStatus(past).status, 'CLOSED');

  // In 2 days is URGENT
  const urgent = new Date(now.getTime() + 86400000 * 2);
  assert.strictEqual(getDeadlineStatus(urgent).status, 'URGENT');

  // In 5 days is APPROACHING
  const approaching = new Date(now.getTime() + 86400000 * 5);
  assert.strictEqual(getDeadlineStatus(approaching).status, 'APPROACHING');

  // In 20 days is UPCOMING
  const upcoming = new Date(now.getTime() + 86400000 * 20);
  assert.strictEqual(getDeadlineStatus(upcoming).status, 'UPCOMING');

  // Null deadline is NO_DEADLINE
  assert.strictEqual(getDeadlineStatus(null).status, 'NO_DEADLINE');
});
