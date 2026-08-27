import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('Nav');
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-32 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Oops.</h1>
      <p className="mt-2 text-muted-foreground">
        Nothing here / Tu nič nie je.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">{t('home')}</Link>
      </Button>
    </div>
  );
}
