'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { createSession } from '@/app/actions/sessions';
import { Button } from '@/components/ui/button';

export function StartSessionButton({ taskSetId }: { taskSetId: string }) {
  const t = useTranslations('TaskSets');
  const tc = useTranslations('Common');
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleStart() {
    startTransition(async () => {
      try {
        const { id } = await createSession(taskSetId);
        router.push(`/lab/${id}`);
      } catch {
        toast.error(tc('error'));
      }
    });
  }

  return (
    <Button onClick={handleStart} disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Play className="size-4" />
      )}
      {pending ? t('starting') : t('start')}
    </Button>
  );
}
