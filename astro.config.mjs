import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://sabino.pro',
  base: '/ios',
  trailingSlash: 'always',
  output: 'static',
  devToolbar: { enabled: false },
  markdown: { syntaxHighlight: false },
});
