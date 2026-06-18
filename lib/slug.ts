/** Produces a URL-safe slug from arbitrary text. */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** A slug guaranteed to be reasonably unique by appending a short suffix. */
export function uniqueSlug(text: string): string {
  const base = slugify(text) || 'task-set';
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}
