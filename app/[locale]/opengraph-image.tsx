import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

// Static per locale, like the rest of the [locale] shell.
export const dynamic = 'force-static';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'SQL Injection Lab';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Home' });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '68px',
          background:
            'linear-gradient(135deg, #0b1020 0%, #111c3a 55%, #1b1035 100%)',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              padding: '8px 20px',
              borderRadius: 999,
              border: '1px solid rgba(148, 163, 184, 0.45)',
              color: '#c7d2fe',
              fontSize: 26,
            }}
          >
            {t('hero.badge')}
          </div>
          <div style={{ fontSize: 30, color: '#818cf8', letterSpacing: 1 }}>
            SQL Injection Lab
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>
            {t('hero.title')}
          </div>
          <div
            style={{
              fontSize: 30,
              color: '#94a3b8',
              lineHeight: 1.35,
              maxWidth: 960,
            }}
          >
            {t('hero.subtitle')}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 24,
            color: '#64748b',
          }}
        >
          <span>kromka.it</span>
          <span>sql.js · WebAssembly</span>
        </div>
      </div>
    ),
    size
  );
}
