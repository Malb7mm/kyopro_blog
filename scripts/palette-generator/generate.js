// generate.js
// YAML から読み取って Tailwind v4 用 @theme CSS を生成するコアロジック

import { interpolate, formatHex, formatCss, clampChroma } from 'culori';
import { readFileSync } from 'fs';
import { load as loadYaml } from 'js-yaml';

/**
 * @typedef {Object} PaletteConfig
 * @property {[number, string][]} anchors
 * @property {number}   [interval=50]   - 生成ステップの刻み幅
 * @property {'hex'|'oklch'} [format='oklch'] - 出力フォーマット
 */

/**
 * 1つのパレット設定からカラーストップの Map を生成する
 * @param {PaletteConfig} config
 * @returns {Map<number, string>}  stop -> CSS color string
 */
export function generatePalette(config) {
  const { anchors, interval = 50, format = 'oklch' } = config;

  if (!anchors || anchors.length < 2) {
    throw new Error('anchors は 2 つ以上必要です');
  }

  // pos を 0〜1 に正規化
  const sorted = [...anchors].sort((a, b) => a[0] - b[0]);
  const positions = sorted.map(a => a[0] / 1000);
  const hexes = sorted.map(a => a[1]);

  const scale = interpolate(hexes, 'oklch', { pos: positions });

  const result = new Map();

  // 0 から 1000 まで interval 刻みで生成
  for (let stop = 0; stop <= 1000; stop += interval) {
    const t = stop / 1000;
    const color = clampChroma(scale(t), 'oklch');

    if (format === 'oklch') {
      // 小数点以下を丸めて読みやすく
      const l = round(color.l, 4);
      const c = round(color.c, 4);
      const h = isNaN(color.h) ? 0 : round(color.h, 3);
      result.set(stop, `oklch(${l} ${c} ${h})`);
    } else {
      result.set(stop, formatHex(color));
    }
  }

  return result;
}

/**
 * YAML ファイルを読み込んで全パレットの CSS 文字列を生成する
 * @param {string} yamlPath
 * @returns {string}  @theme { ... } ブロック
 */
export function generateCssFromYaml(yamlPath) {
  const raw = readFileSync(yamlPath, 'utf-8');
  const config = loadYaml(raw);

  if (!config?.palettes) {
    throw new Error('YAML に palettes キーがありません');
  }

  const lines = [];
  lines.push('@theme {');

  for (const [name, palette] of Object.entries(config.palettes)) {
    lines.push(`  /* ${name} */`);
    const stops = generatePalette(palette);
    for (const [stop, value] of stops) {
      lines.push(`  --color-${name}-${stop}: ${value};`);
    }
    lines.push('');
  }

  lines.push('}');
  return lines.join('\n');
}

function round(n, digits) {
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
}
