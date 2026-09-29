import {
  AIProvider,
  CopilotPromptMessage,
  AIGenerateOptions,
  AIGenerateResult,
} from '../aiProvider.interface';
import { env } from '../../../config/env';

export class GeminiProvider implements AIProvider {
  name = 'Google Gemini';

  isAvailable(): boolean {
    return !!env.GEMINI_API_KEY;
  }

  async generateResponse(
    messages: CopilotPromptMessage[],
    options?: AIGenerateOptions,
  ): Promise<AIGenerateResult> {
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const model = options?.model || env.AI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

    // Transform messages to Gemini format
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Prepend system prompt if available
    let systemInstruction = undefined;
    const systemMsg = messages.find((m) => m.role === 'system');
    if (systemMsg) {
      systemInstruction = {
        parts: [{ text: systemMsg.content }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents.filter((c) => c.role !== 'system'),
        systemInstruction,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    const candidate = data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || 'No response generated.';
    const usage = data?.usageMetadata;

    return {
      content: text,
      provider: 'gemini',
      model,
      tokenUsage: usage
        ? {
            promptTokens: usage.promptTokenCount,
            completionTokens: usage.candidatesTokenCount,
            totalTokens: usage.totalTokenCount,
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
