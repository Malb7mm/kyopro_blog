// @ts-check
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import tailwindcss from '@tailwindcss/vite';
import { tailwindColors } from './scripts/palette-generator/vite-plugin-tw-colors';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      wrap: true,
      theme: 'github-light',
    },
  },

  vite: {
    server: {
      watch: {
        awaitWriteFinish: {
          stabilityThreshold: 1000,
          pollInterval: 500,
        },
      },
    },
    plugins: [tailwindColors({
      yamlPath: "./src/styles/palettes.yaml",
      cssPath: "./src/styles/palettes.css",
    }), tailwindcss()],
  },

  integrations: [mdx()]
});