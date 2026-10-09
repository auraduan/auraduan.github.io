/**
 * 中英文之间自动加一点间距。
 *
 * 「中英文混排时，汉字与拉丁字母／数字之间应该留一点空隙」是中文排版的基本惯例，
 * 但 Markdown 里手写空格既麻烦又容易漏。这个插件在构建时自动处理正文文本。
 *
 * 做法：在 mdast 的 **text 节点**上，把「汉字 + 拉丁」与「拉丁 + 汉字」的边界
 * 插入一个 U+2009（THIN SPACE，比普通空格窄得多）。
 *
 * 为什么用 U+2009 而不是普通空格：
 *   普通空格会被 HTML 折叠，且宽度偏大；U+2009 既不折叠、宽度也刚好。
 * 为什么不用 CSS 的 `text-autospace`：
 *   Safari / Firefox 支持度不稳，构建时处理才是确定性的。
 * 谁来渲染这个细空格：
 *   中文字体（Noto Sans SC）里没有 U+2009 字形，但字体栈里 Inter 排在前面且
 *   覆盖 U+2000-206F，所以浏览器会用 Inter 的字形渲染它 —— 正好。
 *
 * 不处理的位置：
 *   - 代码块与行内代码（它们是 `code` / `inlineCode` 节点，不是 text）
 *   - 全角标点与拉丁之间（「（Python）」不会变成「（ Python」）——
 *     所以下面的 HAN 只含汉字，不含标点区段。
 *
 * ⚠ 禁用方式：把本插件从 astro.config.ts 的 remarkPlugins 里移除即可。
 */

/** 汉字区段（不含标点） */
const HAN = '\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uF900-\\uFAFF';
/** 拉丁字母与数字 */
const LATIN = 'A-Za-z0-9';

const THIN_SPACE = '\u2009';

const HAN_LATIN = new RegExp(`([${HAN}])([${LATIN}])`, 'g');
const LATIN_HAN = new RegExp(`([${LATIN}])([${HAN}])`, 'g');

interface MdNode {
  type?: string;
  value?: string;
  children?: MdNode[];
}

function walk(node: MdNode): void {
  if (!node || typeof node !== 'object') return;

  if (node.type === 'text' && typeof node.value === 'string') {
    node.value = node.value
      .replace(HAN_LATIN, `$1${THIN_SPACE}$2`)
      .replace(LATIN_HAN, `$1${THIN_SPACE}$2`);
    return;
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child);
  }
}

export default function remarkCjkSpacing() {
  return (tree: MdNode): void => {
    walk(tree);
  };
}
