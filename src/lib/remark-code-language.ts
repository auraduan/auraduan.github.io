import type { Root } from 'mdast';

/**
 * 自动给代码块补上 `title="<语言>"`，让 Expressive Code 的标题栏显示语言类型。
 *
 * 为什么要在 remark 阶段做：
 * Expressive Code 没有「显示语言」的配置项，标题栏只认代码围栏上的 `title` 元数据
 * （或代码首行的文件名注释）。手工每块都写 title 太啰嗦，所以在 Markdown AST
 * 层面统一补齐——此时 Expressive Code 的 rehype 插件还没跑，能读到补好的 meta。
 *
 * 注意：如果代码块自己写了 `title="..."`，这里不会覆盖。也就是说想用
 * 「文件名注释自动提取」（首行 `// index.js`）时，显式写 title 即可。
 */

interface MdastNode {
  type: string;
  lang?: string | null;
  meta?: string | null;
  children?: MdastNode[];
}

function walk(node: MdastNode): void {
  if (node.type === 'code' && node.lang) {
    const meta = node.meta ?? '';
    if (!/\btitle\s*=/.test(meta)) {
      node.meta = `${meta} title="${node.lang}"`.trim();
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child);
  }
}

export default function remarkCodeLanguage() {
  return (tree: Root): void => {
    walk(tree as unknown as MdastNode);
  };
}
