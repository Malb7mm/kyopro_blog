#!/usr/bin/env node
// cli.js
// 単独実行用 CLI: node cli.js [yaml] [output]
// 例: node cli.js colors.yaml src/tw-colors.css

import { generateCssFromYaml } from './generate.js';
import { writeFileSync } from 'fs';

const [,, yamlPath = 'colors.yaml', outPath] = process.argv;

try {
  const css = generateCssFromYaml(yamlPath);
  if (outPath) {
    writeFileSync(outPath, css, 'utf-8');
    console.log(`[tw-colors] ${outPath} を生成しました`);
  } else {
    process.stdout.write(css + '\n');
  }
} catch (err) {
  console.error('[tw-colors] エラー:', err.message);
  process.exit(1);
}
