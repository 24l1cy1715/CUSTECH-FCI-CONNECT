import apiClient from './client';

export interface CopilotMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  provider?: string;
  model?: string;
  suggestedActions?: {
    label: string;
    action: string;
    url?: string;
    description?: string;
    payload?: any;
  }[];
  createdAt: string;
}

export interface CopilotConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: CopilotMessage[];
}

export interface CopilotUsageStats {
  dailyLimit: number;
  monthlyLimit: number;
  requestsToday: number;
  remainingToday: number;
  requestsThisMonth: number;
  remainingThisMonth: number;
  totalTokensThisMonth: number;
  activeProvider: string;
}

export const copilotApi = {
  getConversations: async (): Promise<CopilotConversation[]> => {
    const res = await apiClient.get('/copilot/conversations');
    return res.data.data;
  },

  createConversation: async (title?: string): Promise<CopilotConversation> => {
    const res = await apiClient.post('/copilot/conversations', { title });
    return res.data.data;
  },

  getConversation: async (id: string): Promise<CopilotConversation> => {
    const res = await apiClient.get(`/copilot/conversations/${id}`);
    return res.data.data;
  },

  deleteConversation: async (id: string): Promise<void> => {
    await apiClient.delete(`/copilot/conversations/${id}`);
  },

  sendMessage: async (
    conversationId: string,
    content: string,
  ): Promise<{
    userMessage: CopilotMessage;
    assistantMessage: CopilotMessage;
    conversationId: string;
  }> => {
    const res = await apiClient.post(`/copilot/conversations/${conversationId}/messages`, {
      content,
    });
    return res.data.data;
  },

  submitFeedback: async (data: {
    conversationId: string;
    messageId?: string;
    rating: number;
    feedback?: string;
  }): Promise<void> => {
    await apiClient.post('/copilot/feedback', data);
  },

  getUsage: async (): Promise<CopilotUsageStats> => {
    const res = await apiClient.get('/copilot/usage');
    return res.data.data;
  },
};
