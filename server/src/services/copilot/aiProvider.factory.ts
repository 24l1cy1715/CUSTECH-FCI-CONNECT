import { AIProvider } from './aiProvider.interface';
import { MockSmartProvider } from './providers/mockProvider';
import { GeminiProvider } from './providers/geminiProvider';
import { OpenAIProvider } from './providers/openaiProvider';
import { env } from '../../config/env';

export class AIProviderFactory {
  private static mockProvider = new MockSmartProvider();
  private static geminiProvider = new GeminiProvider();
  private static openAIProvider = new OpenAIProvider();

  static getProvider(): AIProvider {
    const configured = (env.AI_PROVIDER || 'mock').toLowerCase();

    if (configured === 'gemini' && this.geminiProvider.isAvailable()) {
      return this.geminiProvider;
    }

    if (
      (configured === 'openai' || configured === 'ollama') &&
      this.openAIProvider.isAvailable()
    ) {
      return this.openAIProvider;
    }

    // Default to the intelligent mock provider (smart local engine)
    return this.mockProvider;
  }
}
