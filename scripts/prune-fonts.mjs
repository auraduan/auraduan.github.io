/**
 * 构建后清理 KaTeX 的冗余字体格式。
 *
 * KaTeX 官方 CSS 为每个字体族声明了三种格式的 fallback：
 *   src: url(...woff2) format('woff2'),
 *        url(...woff)  format('woff'),
 *        url(...ttf)   format('truetype');
 * Vite 会把三个 URL 全部当作资源打包，于是产物里躺着三份同样的字形。
 * 现代浏览器一律用 woff2，后两份永远不会被下载 —— 纯属白占体积。
 *
 * 这个脚本在 `astro build` 之后删掉 .ttf / .woff，只留 .woff2。
 * 数量可控（约 40 个），不会触发批量删除保护。
 */
import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'dist', '_astro');

if (!fs.existsSync(dir)) {
  console.error('[prune-fonts] 找不到 dist/_astro，跳过');
  process.exit(0);
}

let removed = 0;
let freed = 0;

for (const file of fs.readdirSync(dir)) {
  // 只动 KaTeX 的字体，不动 woff2，也不碰其他任何资源
  if (!/^KaTeX_.*\.(ttf|woff)$/.test(file)) continue;

  const full = path.join(dir, file);
  freed += fs.statSync(full).size;
  fs.rmSync(full);
  removed += 1;
}

console.log(
  `[prune-fonts] 已删除 ${removed} 个冗余字体，释放 ${(freed / 1048576).toFixed(2)} MB`
);
