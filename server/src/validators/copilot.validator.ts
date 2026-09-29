import { z } from 'zod';

export const createConversationSchema = z.object({
  title: z.string().max(100).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(4000, 'Message cannot exceed 4000 characters'),
});

export const submitFeedbackSchema = z.object({
  conversationId: z.string().uuid(),
  messageId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(1000).optional(),
});
