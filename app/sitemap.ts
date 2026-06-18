import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';
import { routing } from '@/i18n/routing';
import { LEGAL_DOCS } from '@/lib/legal-content';

// Public, indexable paths (locale prefix added below). Auth-gated app routes
// (dashboard, lab, task-sets) are intentionally excluded.
const PUBLIC_PATHS = [
  '',
  '/about',
  '/login',
  ...LEGAL_DOCS.map((doc) => `/legal/${doc}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

  return PUBLIC_PATHS.flatMap((path) => {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
      languages[locale] = `${base}${prefix}${path}`;
    }
    // One entry per locale, each advertising the full set of alternates.
    return routing.locales.map((locale) => {
      const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
      return {
        url: `${base}${prefix}${path}`,
        lastModified: new Date(),
        alternates: { languages },
      };
    });
  });
}
