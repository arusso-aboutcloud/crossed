// Override with VITE_SITE_URL in Cloudflare Pages environment variables for forks.
export const SITE_URL: string =
  (import.meta.env as Record<string, string>).VITE_SITE_URL ??
  'https://crossec.aboutcloud.io';
