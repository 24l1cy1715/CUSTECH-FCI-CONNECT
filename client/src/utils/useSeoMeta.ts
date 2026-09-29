import { useEffect } from 'react';

interface SeoMetaOptions {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const SITE_NAME = 'CUSTECH FCI Connect';
const DEFAULT_DESCRIPTION =
  'The unified digital hub of the Faculty of Computing and Informatics, Confluence University of Science and Technology.';
const DEFAULT_OG_IMAGE = '/og-image.png';

/**
 * Lightweight per-page SEO meta manager.
 * Sets document.title and canonical meta tags without a heavy dep.
 * Use inside any page component — it cleans up on unmount.
 */
export function useSeoMeta(options: SeoMetaOptions = {}): void {
  useEffect(() => {
    const {
      title,
      description = DEFAULT_DESCRIPTION,
      ogTitle,
      ogDescription,
      ogImage = DEFAULT_OG_IMAGE,
      noIndex = false,
    } = options;

    const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const resolvedOgTitle = ogTitle || title || SITE_NAME;
    const resolvedOgDesc = ogDescription || description;

    // ── Title ──
    const prevTitle = document.title;
    document.title = pageTitle;

    // ── Helper: upsert meta tag ──
    const setMeta = (attr: string, value: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, value);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
      return el;
    };

    // ── Description ──
    const descEl = setMeta('name', 'description', description);
    // ── Robots ──
    const robotsEl = setMeta('name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow');

    // ── Open Graph ──
    const ogTitleEl  = setMeta('property', 'og:title',       resolvedOgTitle);
    const ogDescEl   = setMeta('property', 'og:description', resolvedOgDesc);
    const ogImageEl  = setMeta('property', 'og:image',       ogImage);
    const ogTypeEl   = setMeta('property', 'og:type',        'website');

    // ── Twitter Card ──
    const twitterCardEl = setMeta('name', 'twitter:card',        'summary_large_image');
    const twitterTitleEl = setMeta('name', 'twitter:title',      resolvedOgTitle);
    const twitterDescEl = setMeta('name', 'twitter:description', resolvedOgDesc);
    const twitterImageEl = setMeta('name', 'twitter:image',      ogImage);

    return () => {
      document.title = prevTitle;
      // Restore sensible defaults on unmount
      descEl.setAttribute('content', DEFAULT_DESCRIPTION);
      robotsEl.setAttribute('content', 'index,follow');
      ogTitleEl.setAttribute('content',  SITE_NAME);
      ogDescEl.setAttribute('content',   DEFAULT_DESCRIPTION);
      ogImageEl.setAttribute('content',  DEFAULT_OG_IMAGE);
      ogTypeEl.setAttribute('content',   'website');
      twitterCardEl.setAttribute('content', 'summary_large_image');
      twitterTitleEl.setAttribute('content', SITE_NAME);
      twitterDescEl.setAttribute('content', DEFAULT_DESCRIPTION);
      twitterImageEl.setAttribute('content', DEFAULT_OG_IMAGE);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.title, options.description, options.noIndex]);
}
