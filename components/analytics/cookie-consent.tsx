'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Cookie } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

const COOKIE_NAME = 'cookie-consent';
const ONE_YEAR = 60 * 60 * 24 * 365;

type Consent = 'granted' | 'denied';

function readConsent(): Consent | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  const value = match?.split('=')[1];
  return value === 'granted' || value === 'denied' ? value : null;
}

function writeConsent(value: Consent) {
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
}

function updateGtagConsent(value: Consent) {
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void })
    .gtag;
  if (typeof gtag !== 'function') return;
  const state = value === 'granted' ? 'granted' : 'denied';
  gtag('consent', 'update', {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
}

export function CookieConsent() {
  const t = useTranslations('Consent');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      // Re-apply a previously granted choice on each visit.
      updateGtagConsent(existing);
      return;
    }
    // Defer showing the banner so we don't setState synchronously in the effect.
    const id = window.setTimeout(() => setVisible(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  function decide(value: Consent) {
    writeConsent(value);
    updateGtagConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-xl border bg-background p-5 shadow-lg sm:flex-row sm:items-center">
        <Cookie className="size-6 shrink-0 text-primary" />
        <div className="flex-1 text-sm">
          <p className="font-medium">{t('title')}</p>
          <p className="mt-1 text-muted-foreground">
            {t('description')}{' '}
            <Link
              href="/legal/cookies"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {t('learnMore')}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => decide('denied')}>
            {t('reject')}
          </Button>
          <Button size="sm" onClick={() => decide('granted')}>
            {t('accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}
