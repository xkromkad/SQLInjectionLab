import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep authenticated app areas out of search results.
      disallow: ['/dashboard', '/lab', '/task-sets', '/welcome', '/api'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
