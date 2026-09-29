import { prisma } from '../../config/prisma';
import { ApiError } from '../../middleware/errorHandler';
import { env } from '../../config/env';
import { PromptGuard } from './promptGuard';
import { ContextBuilder } from './contextBuilder';
import { AIProviderFactory } from './aiProvider.factory';
import { CopilotPromptMessage } from './aiProvider.interface';

export class CopilotService {
  /**
   * Check and enforce student daily & monthly AI usage limits
   */
  static async checkUsageLimit(userId: string): Promise<{ allowed: boolean; remainingToday: number; reason?: string }> {
    const dailyLimit = Number(env.COPILOT_DAILY_LIMIT) || 50;
    const monthlyLimit = Number(env.COPILOT_MONTHLY_LIMIT) || 500;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's usage
    const todayUsage = await prisma.copilotUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    const requestsToday = todayUsage?.requestCount || 0;
    if (requestsToday >= dailyLimit) {
      return {
        allowed: false,
        remainingToday: 0,
        reason: `You have reached your daily limit of ${dailyLimit} messages. Usage resets at midnight.`,
      };
    }

    // Get current month's usage
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlySum = await prisma.copilotUsage.aggregate({
      where: {
        userId,
        date: { gte: startOfMonth },
      },
      _sum: { requestCount: true },
    });

    const requestsThisMonth = monthlySum._sum.requestCount || 0;
    if (requestsThisMonth >= monthlyLimit) {
      return {
        allowed: false,
        remainingToday: 0,
        reason: `You have reached your monthly limit of ${monthlyLimit} messages. Please contact support or wait for next month.`,
      };
    }

    return {
      allowed: true,
      remainingToday: dailyLimit - requestsToday,
    };
  }

  /**
   * Increment usage record after successful generation
   */
  static async recordUsage(userId: string, tokensUsed = 0): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.copilotUsage.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      create: {
        userId,
        date: today,
        requestCount: 1,
        tokenCount: tokensUsed,
      },
      update: {
        requestCount: { increment: 1 },
        tokenCount: { increment: tokensUsed },
      },
    });
  }

  /**
   * Get user usage stats
   */
  static async getUserUsage(userId: string) {
    const dailyLimit = Number(env.COPILOT_DAILY_LIMIT) || 50;
    const monthlyLimit = Number(env.COPILOT_MONTHLY_LIMIT) || 500;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayUsage, monthlyAgg] = await Promise.all([
      prisma.copilotUsage.findUnique({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
      }),
      prisma.copilotUsage.aggregate({
        where: {
          userId,
          date: { gte: new Date(today.getFullYear(), today.getMonth(), 1) },
        },
        _sum: { requestCount: true, tokenCount: true },
      }),
    ]);

    const requestsToday = todayUsage?.requestCount || 0;
    const requestsThisMonth = monthlyAgg._sum.requestCount || 0;

    return {
      dailyLimit,
      monthlyLimit,
      requestsToday,
      remainingToday: Math.max(0, dailyLimit - requestsToday),
      requestsThisMonth,
      remainingThisMonth: Math.max(0, monthlyLimit - requestsThisMonth),
      totalTokensThisMonth: monthlyAgg._sum.tokenCount || 0,
      activeProvider: AIProviderFactory.getProvider().name,
    };
  }

  /**
   * Create a new conversation
   */
  static async createConversation(userId: string, initialTitle?: string) {
    return prisma.copilotConversation.create({
      data: {
        userId,
        title: (initialTitle || 'New Conversation').slice(0, 100),
      },
    });
  }

  /**
   * List all conversations for the authenticated user
   */
  static async getConversations(userId: string) {
    return prisma.copilotConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  /**
   * Get conversation details with messages, verifying ownership
   */
  static async getConversation(userId: string, conversationId: string) {
    const conversation = await prisma.copilotConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        feedback: true,
      },
    });

    if (!conversation) {
      throw ApiError.notFound('Conversation not found or unauthorized');
    }

    return conversation;
  }

  /**
   * Delete a conversation, verifying ownership
   */
  static async deleteConversation(userId: string, conversationId: string) {
    const conversation = await prisma.copilotConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!conversation) {
      throw ApiError.notFound('Conversation not found or unauthorized');
    }

    await prisma.copilotConversation.delete({
      where: { id: conversationId },
    });

    return { success: true };
  }

  /**
   * Send a message and generate assistant response
   */
  static async sendMessage(userId: string, conversationId: string, content: string) {
    // 1. Verify ownership of conversation
    const conversation = await prisma.copilotConversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 12,
        },
      },
    });

    if (!conversation) {
      throw ApiError.notFound('Conversation not found or unauthorized');
    }

    // 2. Check usage limit
    const usageCheck = await this.checkUsageLimit(userId);
    if (!usageCheck.allowed) {
      throw ApiError.tooManyRequests(usageCheck.reason || 'AI usage limit reached');
    }

    // 3. Prompt injection & safety check
    const guardResult = PromptGuard.evaluate(content);
    if (!guardResult.isSafe) {
      // Create user message
      await prisma.copilotMessage.create({
        data: {
          conversationId,
          role: 'user',
          content: guardResult.sanitizedContent || content,
        },
      });

      // Return refusal as assistant message
      const refusalMessage = await prisma.copilotMessage.create({
        data: {
          conversationId,
          role: 'assistant',
          content: guardResult.refusalReason!,
          provider: 'guardrail',
          model: 'safety-filter',
        },
      });

      return {
        userMessage: { role: 'user', content },
        assistantMessage: refusalMessage,
        conversationId,
      };
    }

    // 4. Save sanitized user message
    const userMessage = await prisma.copilotMessage.create({
      data: {
        conversationId,
        role: 'user',
        content: guardResult.sanitizedContent,
      },
    });

    // Update conversation title if default
    if (conversation.title === 'New Conversation') {
      const generatedTitle = guardResult.sanitizedContent.slice(0, 36);
      await prisma.copilotConversation.update({
        where: { id: conversationId },
        data: { title: generatedTitle },
      });
    }

    // 5. Build controlled, authorized student context
    const studentContext = await ContextBuilder.buildStudentContext(userId);

    // 6. Build prompt message sequence
    const systemPrompt = `
You are FCI Copilot, the official AI Academic, Technical, and Career Personal Assistant for the Faculty of Computing and Informatics (FCI) at Confluence University of Science and Technology (CUSTECH), Osara, Kogi State, Nigeria.

Strict Boundaries:
- Only assist with academic guidance, technical skills, project ideas, team matchmaking, opportunities, and campus events.
- Never disclose passwords, secret tokens, private emails, matric numbers, or database structures.
- Respect student privacy and CUSTECH FCI regulations.
- Reference relevant FCI Connect features when helpful (Smart Study & Learning Hub at /learning, Digital FCI ID at /digital-id, Student Clubs & Communities at /communities, Mentorship & Peer Learning Hub at /mentorship, Opportunity Hub, Skill Graph, AI Team Builder, Digital Portfolio, Achievements).
- If students ask for study materials, learning paths, or next skills to learn, guide them to actual FCI Learning Hub resources or recommended paths. Clearly distinguish existing platform resources from external recommendations.
- If students ask for mentors or clubs, match recommendations based on their desired skills, availability, and areas.

${studentContext.contextSummary}
`.trim();

    const promptMessages: CopilotPromptMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Include recent history (up to last 6 messages)
    for (const msg of conversation.messages.slice(-6)) {
      promptMessages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    // Add current user message
    promptMessages.push({
      role: 'user',
      content: guardResult.sanitizedContent,
    });

    // 7. Generate response via active AI Provider
    const provider = AIProviderFactory.getProvider();
    const aiResult = await provider.generateResponse(promptMessages, {
      contextSummary: studentContext.contextSummary,
    });

    // 8. Sanitize output
    const cleanContent = PromptGuard.sanitizeOutput(aiResult.content);

    // 9. Store assistant message in DB
    const assistantMessage = await prisma.copilotMessage.create({
      data: {
        conversationId,
        role: 'assistant',
        content: cleanContent,
        provider: aiResult.provider,
        model: aiResult.model,
        tokenUsage: aiResult.tokenUsage ? (aiResult.tokenUsage as any) : undefined,
        suggestedActions: aiResult.suggestedActions ? (aiResult.suggestedActions as any) : undefined,
      },
    });

    // Update conversation updatedAt
    await prisma.copilotConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // 10. Record usage
    await this.recordUsage(userId, aiResult.tokenUsage?.totalTokens || 0);

    return {
      userMessage,
      assistantMessage,
      conversationId,
    };
  }

  /**
   * Submit feedback on a conversation or message
   */
  static async submitFeedback(
    userId: string,
    data: { conversationId: string; messageId?: string; rating: number; feedback?: string },
  ) {
    // Verify conversation belongs to user
    const conversation = await prisma.copilotConversation.findFirst({
      where: { id: data.conversationId, userId },
    });

    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    return prisma.copilotFeedback.create({
      data: {
        conversationId: data.conversationId,
        messageId: data.messageId || null,
        userId,
        rating: Math.min(5, Math.max(1, data.rating)),
        feedback: data.feedback?.trim() || null,
      },
    });
  }
}
