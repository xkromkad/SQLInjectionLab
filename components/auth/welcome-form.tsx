'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { acceptTerms } from '@/app/actions/terms';

export function WelcomeForm() {
  const t = useTranslations('Welcome');
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleAccept() {
    startTransition(async () => {
      await acceptTerms();
      router.push('/dashboard');
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <label className="flex items-start gap-3 rounded-lg border p-4">
        <Checkbox
          checked={agreed}
          onCheckedChange={(v) => setAgreed(v === true)}
          className="mt-0.5"
        />
        <span className="text-sm">
          {t('acceptPrefix')}{' '}
          <Link
            href="/legal/terms"
            target="_blank"
            className="font-medium underline underline-offset-4"
          >
            {t('termsLink')}
          </Link>
          .
        </span>
      </label>
      <Button
        className="w-full"
        size="lg"
        disabled={!agreed || pending}
        onClick={handleAccept}
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? t('submitting') : t('accept')}
      </Button>
    </div>
  );
}
