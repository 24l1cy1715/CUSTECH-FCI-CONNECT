import {
  AIProvider,
  CopilotPromptMessage,
  AIGenerateOptions,
  AIGenerateResult,
} from '../aiProvider.interface';
import { env } from '../../../config/env';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI Compatible';

  isAvailable(): boolean {
    return !!env.OPENAI_API_KEY || !!env.OPENAI_BASE_URL;
  }

  async generateResponse(
    messages: CopilotPromptMessage[],
    options?: AIGenerateOptions,
  ): Promise<AIGenerateResult> {
    const baseURL = env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const apiKey = env.OPENAI_API_KEY || 'ollama';
    const model = options?.model || env.AI_MODEL || 'gpt-4o-mini';

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    const choice = data?.choices?.[0];
    const text = choice?.message?.content || 'No response generated.';
    const usage = data?.usage;

    return {
      content: text,
      provider: 'openai',
      model,
      tokenUsage: usage
        ? {
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens,
          }
        : undefined,
    };
  }

  async generateStructuredResponse<T>(
    messages: CopilotPromptMessage[],
    _schemaDescription: string,
    options?: AIGenerateOptions,
  ): Promise<T> {
    const res = await this.generateResponse(messages, options);
    try {
      return JSON.parse(res.content) as T;
    } catch {
      return { message: res.content } as unknown as T;
    }
  }
}
