// Set VITE_SITE_URL in your Cloudflare Pages environment variables.
// Replace the placeholder below with the actual production URL once known.
export const SITE_URL: string =
  (import.meta.env as Record<string, string>).VITE_SITE_URL ??
  'https://crossed.pages.dev';
