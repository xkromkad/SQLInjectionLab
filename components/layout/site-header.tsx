'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Menu, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { UserMenu } from '@/components/layout/user-menu';
import { cn } from '@/lib/utils';

type NavKey = 'home' | 'about' | 'dashboard' | 'taskSets';
type NavLink = { href: string; key: NavKey };

const PUBLIC_LINKS: NavLink[] = [
  { href: '/', key: 'home' },
  { href: '/about', key: 'about' },
];

const AUTH_LINKS: NavLink[] = [
  { href: '/dashboard', key: 'dashboard' },
  { href: '/task-sets', key: 'taskSets' },
];

export function SiteHeader() {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const isAuthed = status === 'authenticated';
  const links = isAuthed ? [...PUBLIC_LINKS, ...AUTH_LINKS] : PUBLIC_LINKS;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image
            src="/injection.svg"
            alt=""
            width={28}
            height={28}
            className="size-7"
            priority
          />
          <span className="hidden sm:inline">SQL Injection Lab</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Button
              key={link.href}
              asChild
              variant="ghost"
              size="sm"
              className={cn(pathname === link.href && 'text-primary')}
            >
              <Link href={link.href}>{t(link.key)}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          {isAuthed && session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/login">{t('signIn')}</Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={t('openMenu')}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                {t(link.key)}
              </Link>
            ))}
            {!isAuthed && (
              <Button asChild size="sm" className="mt-2">
                <Link href="/login" onClick={() => setOpen(false)}>
                  {t('signIn')}
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
