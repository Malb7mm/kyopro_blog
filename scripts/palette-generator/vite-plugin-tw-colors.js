// vite-plugin-tw-colors.js
// YAML を監視して @theme CSS を自動再生成する Vite プラグイン

import { generateCssFromYaml } from './generate.js';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

/**
 * @param {Object} [options]
 * @param {string} [options.yamlPath='./colors.yaml']   - 監視する YAML ファイルのパス
 * @param {string} [options.cssPath='./tw-colors.css']
 * @param {string} [options.outputId='virtual:tw-colors'] - CSS を注入する仮想モジュール ID
 */
export function tailwindColors(options = {}) {
  const {
    yamlPath = './colors.yaml',
    cssPath = './tw-colors.css',
    outputId = 'virtual:tw-colors',
  } = options;

  const virtualModuleId = outputId;
  const resolvedVirtualModuleId = '\0' + virtualModuleId;
  let resolvedYamlPath;
  let resolvedCssPath;
  let server; // ViteDevServer の参照

  return {
    name: 'vite-plugin-tw-colors',

    // ビルド開始時に YAML パスを解決
    configResolved(config) {
      resolvedYamlPath = resolve(config.root, yamlPath);
      resolvedCssPath = resolve(config.root, cssPath);
      // 初回書き出し
      try {
        const css = generateCssFromYaml(resolvedYamlPath);
        writeFileSync(resolvedCssPath, css, 'utf-8');
        console.log(`[vite-plugin-tw-colors] initial generation: ${resolvedCssPath}`);
      } catch (err) {
        console.error('[vite-plugin-tw-colors] initial generation error:', err.message);
      }
    },

    // 仮想モジュールの解決
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    // 仮想モジュールのコンテンツを返す
    load(id) {
      if (id === resolvedVirtualModuleId) {
        try {
          const css = generateCssFromYaml(resolvedYamlPath);
          // CSS を JS モジュールとして注入（Vite の ?inline 相当）
          return `
const css = ${JSON.stringify(css)};
const style = document.createElement('style');
style.setAttribute('data-tw-colors', '');
// 既存のスタイルタグを置き換える（HMR 時）
const existing = document.querySelector('style[data-tw-colors]');
if (existing) existing.remove();
document.head.appendChild(style);
style.textContent = css;
export default css;
`;
        } catch (err) {
          console.error('[vite-plugin-tw-colors] error while generating:', err.message);
          return 'export default ""';
        }
      }
    },

    // dev server 起動時に YAML ファイルを監視対象に追加
    configureServer(devServer) {
      server = devServer;

      // Vite の watcher（chokidar）に YAML を追加
      server.watcher.add(resolvedYamlPath);

      server.watcher.on('change', (changedPath) => {
        if (changedPath !== resolvedYamlPath) return;

        console.log('[vite-plugin-tw-colors] regenerating...');
        try {
          const css = generateCssFromYaml(resolvedYamlPath);
          writeFileSync(resolvedCssPath, css, 'utf-8');
        } catch (err) {
          console.error('[vite-plugin-tw-colors] update error:', err.message);
        }

        // 仮想モジュールのキャッシュを無効化して HMR を発火
        const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
        }

        // 変更を通知（接続中のクライアントに HMR update を送信）
        server.hot.send({
          type: 'full-reload',
          path: '*',
        });
      });
    },

    // ------ SSR / ビルド時の CSS ファイル出力 ------
    // generateBundle フックで独立した CSS ファイルとしても出力できるよう対応
    generateBundle() {
      try {
        const css = generateCssFromYaml(resolvedYamlPath);
        this.emitFile({
          type: 'asset',
          fileName: resolvedCssPath,
          source: css,
        });
      } catch (err) {
        console.warn('[vite-plugin-tw-colors] error while generating:', err.message);
      }
    },
  };
}
