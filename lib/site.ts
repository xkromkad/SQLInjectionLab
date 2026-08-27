export const siteConfig = {
  name: 'SQL Injection Lab',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  // Google Search Console verification token (carried over from the old site).
  googleSiteVerification: 'VgwJNGV-j1itV7oPty7xYlswVco8cTzyi8EPP64GR3o',
  author: {
    name: 'kromka.it',
    url: 'https://kromka.it',
  },
} as const;
