import { Request, Response, NextFunction } from 'express';
import { CopilotService } from '../services/copilot/copilot.service';
import {
  createConversationSchema,
  sendMessageSchema,
  submitFeedbackSchema,
} from '../validators/copilot.validator';

/**
 * GET /api/v1/copilot/conversations
 */
export async function getConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const conversations = await CopilotService.getConversations(userId);
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/copilot/conversations
 */
export async function createConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { title } = createConversationSchema.parse(req.body);
    const conversation = await CopilotService.createConversation(userId, title);
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/copilot/conversations/:id
 */
export async function getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = String(req.params.id);
    const conversation = await CopilotService.getConversation(userId, id);
    res.json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/copilot/conversations/:id
 */
export async function deleteConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = String(req.params.id);
    const result = await CopilotService.deleteConversation(userId, id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/copilot/conversations/:id/messages
 */
export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = String(req.params.id);
    const { content } = sendMessageSchema.parse(req.body);

    const result = await CopilotService.sendMessage(userId, id, content);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/copilot/feedback
 */
export async function submitFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const data = submitFeedbackSchema.parse(req.body);
    const result = await CopilotService.submitFeedback(userId, data);
    res.json({ success: true, message: 'Thank you for your feedback!', data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/copilot/usage
 */
export async function getUsage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const usage = await CopilotService.getUserUsage(userId);
    res.json({ success: true, data: usage });
  } catch (error) {
    next(error);
  }
}
