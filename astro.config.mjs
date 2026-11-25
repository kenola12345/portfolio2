// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// 公開 URL。SNS の共有画像（og:image）、canonical、言語ごとの alternate に絶対 URL が必要。
// SITE_URL で指定する。Vercel では本番の URL（VERCEL_PROJECT_PRODUCTION_URL）を自動で使う
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

// 静的出力 + Vercel。React は 3D ステージなどインタラクティブな部分だけで使う
export default defineConfig({
  site,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
  adapter: vercel(),
});
