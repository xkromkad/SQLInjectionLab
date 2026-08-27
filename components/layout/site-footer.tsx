import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function SiteFooter() {
  const t = await getTranslations('Footer');
  const year = new Date().getFullYear();

  const columns: { title: string; links: { href: string; label: string }[] }[] =
    [
      {
        title: t('sections.product'),
        links: [
          { href: '/', label: t('links.home') },
          { href: '/about', label: t('links.about') },
          { href: '/lab', label: t('links.lab') },
        ],
      },
      {
        title: t('sections.legal'),
        links: [
          { href: '/legal/terms', label: t('links.terms') },
          { href: '/legal/privacy', label: t('links.privacy') },
          { href: '/legal/cookies', label: t('links.cookies') },
          { href: '/legal/disclaimer', label: t('links.disclaimer') },
        ],
      },
    ];

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-semibold">
            <Image
              src="/injection.svg"
              alt=""
              width={24}
              height={24}
              className="size-6"
            />
            SQL Injection Lab
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            {t('tagline')}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {t('educationalNotice')}
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {year} SQL Injection Lab. {t('rights')}
          </p>
          <p>
            {t('madeBy')}{' '}
            <a
              href="https://kromka.it"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              kromka.it
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
