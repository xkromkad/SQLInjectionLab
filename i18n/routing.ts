import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['sk', 'en'],
  defaultLocale: 'sk',
  // Default locale (sk) is served without a prefix at "/"; English lives at "/en".
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
