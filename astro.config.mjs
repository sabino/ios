import { defineConfig } from 'astro/config';
import {satteri} from '@astrojs/markdown-satteri';
import {accessibleTables} from './scripts/accessible-tables.mjs';
export default defineConfig({
  site: 'https://sabino.pro',
  base: '/ios',
  trailingSlash: 'always',
  output: 'static',
  devToolbar: { enabled: false },
  markdown: { syntaxHighlight: false, processor:satteri({hastPlugins:[accessibleTables()]}) },
});
