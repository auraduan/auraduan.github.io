/**
 * 构建前提取每张专辑封面的主色（需求方案 §7.3.1）。
 *
 * 用途：**只给专辑详情页做一层极淡的径向光晕**，让「看一张专辑」有一点环境色。
 * 不用于卡片网格 —— 一屏彩色会立刻变花哨，违反「全站只有一个强调色」。
 *
 * 为什么不用 sharp 的 `stats().dominant`：那个值接近「平均色」，人像/渐变封面上
 * 取出来往往是一片发灰的土色，上墙看不出是哪张专辑的色。这里改成：
 *   ① 降采样到 32×32（够统计，又不受噪点干扰）
 *   ② 丢掉太灰（s<0.15）、太黑、太白的像素
 *   ③ 按**饱和度加权**投到 24 个色相桶，取权重最高的桶
 *   ④ 桶内像素做加权平均 → 得到真正的「这张封面是什么颜色」
 *   ⑤ **亮度钳制** 0.25–0.85：太暗的话深色主题下光晕看不见，太亮的话浅色主题下刺眼
 *
 * 纯构建时计算，产物是一个静态 JSON，**零运行时依赖**（四不原则）。
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const albumsDir = path.join(process.cwd(), 'src', 'content', 'albums');
const outFile = path.join(process.cwd(), 'src', 'data', 'album-colors.json');

const SAMPLE = 32;
const HUE_BUCKETS = 24; // 每 15° 一桶

function rgbToHsl(r, g, b) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) return [0, 0, l];

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6;
  else if (max === gg) h = ((bb - rr) / d + 2) / 6;
  else h = ((rr - gg) / d + 4) / 6;

  return [h * 360, s, l];
}

function hslToHex(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  const toHex = (v) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

async function dominantColor(file) {
  const { data, info } = await sharp(file)
    .resize(SAMPLE, SAMPLE, { fit: 'cover' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const buckets = new Map();
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    sumR += r;
    sumG += g;
    sumB += b;
    count += 1;

    const [h, s, l] = rgbToHsl(r, g, b);
    // 灰的、近黑近白的像素不参与「这是什么颜色」的判断
    if (s < 0.15 || l < 0.08 || l > 0.95) continue;

    const key = Math.floor(h / (360 / HUE_BUCKETS)) % HUE_BUCKETS;
    const weight = s;
    const bucket = buckets.get(key) ?? { w: 0, r: 0, g: 0, b: 0 };
    bucket.w += weight;
    bucket.r += r * weight;
    bucket.g += g * weight;
    bucket.b += b * weight;
    buckets.set(key, bucket);
  }

  // 灰阶封面（黑白摄影、单色设计）：退回全图平均色
  if (buckets.size === 0) {
    if (count === 0) return '#808080';
    const [h, s, l] = rgbToHsl(sumR / count, sumG / count, sumB / count);
    return hslToHex(h, s, Math.min(0.85, Math.max(0.25, l)));
  }

  let best = null;
  for (const bucket of buckets.values()) {
    if (!best || bucket.w > best.w) best = bucket;
  }

  const [h, s, l] = rgbToHsl(best.r / best.w, best.g / best.w, best.b / best.w);
  // 亮度钳制：保证两种主题下都只是「隐约有色」，而不是看不见或刺眼
  const clamped = Math.min(0.85, Math.max(0.25, l));
  return hslToHex(h, s, clamped);
}

async function main() {
  if (!fs.existsSync(albumsDir)) {
    console.error('[album-colors] 找不到 src/content/albums，跳过');
    process.exit(0);
  }

  const result = {};
  let done = 0;

  for (const entry of fs.readdirSync(albumsDir)) {
    const dir = path.join(albumsDir, entry);
    if (!fs.statSync(dir).isDirectory()) continue;

    const cover = fs
      .readdirSync(dir)
      .find((name) => /^cover\.(png|jpe?g|webp|avif)$/i.test(name));
    if (!cover) continue;

    try {
      result[entry] = await dominantColor(path.join(dir, cover));
      done += 1;
    } catch (error) {
      // 一张坏图不该让整个构建中断 —— 取不到色就跳过（该专辑在页面上就只是没有光晕）
      console.warn(`[album-colors] 跳过 ${entry}（封面读取失败）：${error.message}`);
    }
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(result, null, 2)}\n`, 'utf-8');

  console.log(`[album-colors] 提取 ${done} 张封面主色 → ${path.relative(process.cwd(), outFile)}`);
}

main().catch((error) => {
  console.error('[album-colors] 失败：', error);
  process.exit(1);
});
