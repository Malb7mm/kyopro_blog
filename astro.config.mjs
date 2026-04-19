// @ts-check
import { defineConfig } from 'astro/config';
import remarkEmoji from 'remark-emoji';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import tailwindcss from '@tailwindcss/vite';
import { tailwindColors } from './scripts/palette-generator/vite-plugin-tw-colors';

import mdx from '@astrojs/mdx';

import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkEmoji, remarkMath],
    rehypePlugins: [rehypeKatex],
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

  integrations: [expressiveCode({
    themes: ["github-light"],
    styleOverrides: {
      borderRadius: "0",
      codeBackground: "var(--tw-color-p-50)",
      codeFontSize: "0.85rem",
      codeLineHeight: "1.1rem",
      frames: {
        tooltipSuccessBackground: "var(--tw-color-p-150)",
        tooltipSuccessForeground: "black",
      }
    },
    defaultProps: {
      showLineNumbers: true,
    },
  }), mdx()],
  site: "https://cp.waniwala.com",
});