export interface CopilotPromptMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIGenerateOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  contextSummary?: string;
}

export interface SuggestedAction {
  label: string;
  action: 'navigate' | 'filter' | 'explore' | 'action';
  url?: string;
  description?: string;
  payload?: Record<string, any>;
}

export interface AIGenerateResult {
  content: string;
  provider: string;
  model: string;
  tokenUsage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  suggestedActions?: SuggestedAction[];
}

export interface AIProvider {
  name: string;
  isAvailable(): boolean;
  generateResponse(messages: CopilotPromptMessage[], options?: AIGenerateOptions): Promise<AIGenerateResult>;
  generateStructuredResponse<T>(
    messages: CopilotPromptMessage[],
    schemaDescription: string,
    options?: AIGenerateOptions,
  ): Promise<T>;
}
