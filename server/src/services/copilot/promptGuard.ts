export interface GuardCheckResult {
  isSafe: boolean;
  refusalReason?: string;
  sanitizedContent: string;
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above)\s+(instructions|prompts|rules)/i,
  /disregard\s+(all\s+)?(prior|previous)\s+(instructions|directives)/i,
  /you\s+are\s+now\s+(an?\s+)?unrestricted/i,
  /system\s+prompt\s*(leak|dump|reveal|print|expose)/i,
  /reveal\s+(your\s+)?(initial|system|hidden)\s+(prompt|instructions)/i,
  /what\s+is\s+your\s+(secret|hidden|system)\s+(prompt|key|token)/i,
  /print\s+(the\s+)?(system|internal)\s+(prompt|instructions)/i,
  /dan\s+mode/i,
  /jailbreak/i,
  /bypass\s+(security|authorization|guardrails|safety)/i,
];

const PRIVATE_DATA_PATTERNS = [
  /show\s+me\s+(all\s+)?(student\s+)?passwords/i,
  /give\s+me\s+(user|student)\s+(tokens|secrets|jwt|hashes)/i,
  /reveal\s+(other\s+)?students?['’]?\s*(private|matric|phone|email|password)/i,
  /database\s+dump/i,
  /drop\s+table/i,
  /select\s+\*\s+from\s+users/i,
  /union\s+select/i,
  /api[_\s-]?key/i,
  /auth[_\s-]?secret/i,
];

export class PromptGuard {
  /**
   * Evaluates untrusted user prompt against injection, exfiltration, and privacy abuse
   */
  static evaluate(userInput: string): GuardCheckResult {
    const trimmed = (userInput || '').trim();

    // 1. Length check
    if (trimmed.length > 4000) {
      return {
        isSafe: false,
        refusalReason: 'Message is too long. Please keep questions within 4,000 characters.',
        sanitizedContent: trimmed.slice(0, 4000),
      };
    }

    // 2. Check for system prompt extraction & instruction hijacking
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          isSafe: false,
          refusalReason:
            'I cannot fulfill this request. FCI Copilot operates strictly within CUSTECH academic, career, and community guidelines and cannot reveal system prompts or override security boundaries.',
          sanitizedContent: '',
        };
      }
    }

    // 3. Check for private data / secret extraction requests
    for (const pattern of PRIVATE_DATA_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          isSafe: false,
          refusalReason:
            'Security Alert: FCI Copilot strictly protects student privacy and platform security. I cannot query, display, or reveal private credentials, passwords, tokens, API keys, or confidential administrative data.',
          sanitizedContent: '',
        };
      }
    }

    // 4. Sanitize text for harmless output
    const sanitized = trimmed
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '');

    return {
      isSafe: true,
      sanitizedContent: sanitized,
    };
  }

  /**
   * Sanitizes AI response before returning to user to guarantee no inadvertent leaks
   */
  static sanitizeOutput(output: string): string {
    if (!output) return '';

    // Remove any accidental leak of secrets or tokens
    return output
      .replace(/custech_fci_connect_jwt_[a-zA-Z0-9_-]+/g, '[REDACTED_SECRET]')
      .replace(/eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]+/g, '[REDACTED_TOKEN]')
      .replace(/AIzaSy[a-zA-Z0-9_-]{33}/g, '[REDACTED_KEY]')
      .replace(/sk-[a-zA-Z0-9_-]{20,}/g, '[REDACTED_KEY]');
  }
}
