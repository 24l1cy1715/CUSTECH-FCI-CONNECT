/**
 * Sanitizes external URLs to prevent Cross-Site Scripting (XSS) via dangerous schemes.
 * Rejects javascript:, data:, vbscript:, and file: URLs.
 * Strictly permits only http: and https: protocols.
 */
export function sanitizeExternalUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // Block dangerous schemes immediately
  const dangerousPatterns = /^(javascript:|data:|vbscript:|file:)/i;
  if (dangerousPatterns.test(trimmed)) {
    return null;
  }

  try {
    // If it's already an absolute URL
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.href;
    }
    return null;
  } catch {
    // If relative or lacks protocol but looks like a domain, ensure safe prefix
    if (/^[a-zA-Z0-9][a-zA-Z0-9-._]+\.[a-zA-Z]{2,}/.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return null;
  }
}

/**
 * Standard safe external link attributes (prevents window.opener hijacking)
 */
export const SAFE_EXTERNAL_LINK_ATTRS = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const;
