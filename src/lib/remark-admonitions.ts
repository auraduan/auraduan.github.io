/**
 * 提示框（Admonition）—— 把带标记的引用块转成「注意 / 实验结果 / 前置知识 / 常见错误」卡片。
 *
 * 写法（沿用 GitHub Alerts 的形状，不与任何私有语法绑定）：
 *
 *   > [!注意]
 *   > 正文内容，可以有多段、列表、代码、公式。
 *
 *   > [!前置知识] 也可以把内容直接跟在标记后面（同一行）。
 *
 *   > [!实验结果]
 *   >
 *   > 空一行再写，更接近引用块的自然写法。
 *
 * 设计要点：
 *
 * 1. **只认块引用开头的标记**。正文里正文写 `[!注意]` 不会误伤——
 *    不在引用块首段开头就不转换，普通引用块一个字节都不动。
 *
 * 2. **改 mdast 的 `data.hName` / `hProperties`，不直接吐 HTML 字符串**。
 *    吐 HTML 会绕过后续插件（CJK 间距、代码语言标注），也会让嵌套的
 *    代码块 / 公式失去处理机会；改节点属性则整条管线照常工作。
 *
 * 3. **不引第三方遍历库**。整棵树递归一遍十几行，比多一个运行时依赖便宜。
 *
 * 注册顺序见 astro.config.ts：必须排在 `remarkCjkSpacing` 之前，
 * 否则标记文本里可能被插入细空格，`[!注意]` 就匹配不上了。
 */

/** 类型表：key 进 DOM（data-callout），label 是默认标题 */
const CALLOUTS = {
  note: { label: '注意', aliases: ['note', '注意'] },
  tip: { label: '提示', aliases: ['tip', 'tips', '提示', '技巧'] },
  experiment: { label: '实验结果', aliases: ['experiment', '实验结果', '实验'] },
  prereq: { label: '前置知识', aliases: ['prereq', 'prerequisite', '前置知识', '前置'] },
  warning: { label: '常见错误', aliases: ['warning', 'caution', 'danger', '常见错误', '错误', '易错'] },
} as const;

type CalloutKind = keyof typeof CALLOUTS;

/** `[!注意]` —— 大小写不敏感（英文别名按 NOTE / note 写都行） */
const MARKER = /^\[!([^\]\s]{1,16})\]/;

const ALIAS_TO_KIND = new Map<string, CalloutKind>();
for (const [kind, { aliases }] of Object.entries(CALLOUTS) as [CalloutKind, { aliases: readonly string[] }][]) {
  for (const alias of aliases) ALIAS_TO_KIND.set(alias.toLowerCase(), kind);
}

/** 未知类型只喊一次，避免同一篇里刷屏（与 lib/content.ts 的 warnOnce 同一思路） */
const warned = new Set<string>();

interface MdNode {
  type: string;
  value?: string;
  children?: MdNode[];
  data?: Record<string, unknown>;
}

function walk(node: MdNode, visit: (node: MdNode) => void): void {
  visit(node);
  if (!Array.isArray(node.children)) return;
  for (const child of node.children) walk(child, visit);
}

/** 提示框标题那一行：<p class="callout-title">注意</p> */
function titleNode(label: string): MdNode {
  return {
    type: 'paragraph',
    data: {
      hName: 'p',
      hProperties: { className: ['callout-title'] },
    },
    children: [{ type: 'text', value: label }],
  };
}

/** 处理单个引用块，返回是否发生了转换 */
function convert(blockquote: MdNode): boolean {
  const first = blockquote.children?.[0];
  if (!first || first.type !== 'paragraph') return false;

  const text = first.children?.[0];
  if (!text || text.type !== 'text' || !text.value) return false;

  const match = MARKER.exec(text.value);
  if (!match) return false;

  const kind = ALIAS_TO_KIND.get(match[1].toLowerCase());
  if (!kind) {
    const key = `[callout] 未知的提示框类型「${match[1]}」，将按普通引用块渲染。` +
      `可用类型：注意 / 提示 / 实验结果 / 前置知识 / 常见错误。`;
    if (!warned.has(key)) {
      warned.add(key);
      console.warn(key);
    }
    return false;
  }

  // 剥掉标记；同一行后面的内容留作正文（软换行也在这里一并去掉）
  const rest = text.value.slice(match[0].length).replace(/^[ \t]*\n?/, '');
  text.value = rest;

  if (rest === '') {
    // 这个文本节点空了就摘掉（后面可能还跟着 **加粗** 之类的内容）
    first.children!.shift();
    // 整段只剩标记 → 这一行是纯标题行，删掉这个段落
    if (first.children!.length === 0) blockquote.children!.shift();
  }

  blockquote.children!.unshift(titleNode(CALLOUTS[kind].label));

  blockquote.data = {
    ...blockquote.data,
    hName: 'aside',
    hProperties: {
      className: ['callout'],
      'data-callout': kind,
    },
  };

  return true;
}

export default function remarkAdmonitions() {
  return (tree: MdNode) => {
    walk(tree, (node) => {
      if (node.type === 'blockquote') convert(node);
    });
  };
}
