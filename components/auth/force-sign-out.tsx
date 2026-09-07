'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

/**
 * Clears a session cookie whose user row no longer exists. Without this the
 * header renders a signed-in user while every gated page bounces to /login.
 */
export function ForceSignOut() {
  const t = useTranslations('Common');

  useEffect(() => {
    void signOut({ callbackUrl: '/login' });
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 py-32 text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
      <p className="text-sm">{t('loading')}</p>
    </div>
  );
}
