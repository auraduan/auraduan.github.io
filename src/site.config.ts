/**
 * 站点配置 —— 全站唯一的配置入口。
 *
 * 改导航、改标题、改工具链接，只改这个文件，不要碰组件代码。
 * （需求方案：docs/需求方案.md）
 *
 * 标注 TODO 的地方是等你提供素材后填写的。
 */

export type NavChild = {
  label: string;
  href: string;
  /** 一句话描述，仅在下拉菜单中显示 */
  desc?: string;
};

export type NavItem = {
  label: string;
  href: string;
  /** 外部链接会自动加 target="_blank" 与 rel="noopener noreferrer" */
  external?: boolean;
  /** 下拉项无需标 external —— href 以 http 开头即自动按外链处理 */
  children?: NavChild[];
};

export type LinkGroup = {
  title: string;
  items: { label: string; href: string; desc?: string }[];
};

export const SITE = {
  // TODO(令宸)：填博客名称与副标题 —— 首页 Hero 会用到
  title: 'Linson\'s Blog',
  subtitle: '音乐、日常、代码与机器人',

  /** 站点描述：用于 SEO meta description 与 RSS */
  description: '段令宸的个人博客 —— 机器人工程、代码与音乐。',

  author: 'Lingchen Duan',

  // TODO(令宸)：关于页照片旁的身份说明
  role: '机器人工程在读 · 烟台大学',

  /**
   * 站点 URL（末尾不带斜杠）。
   * TODO(令宸)：建好仓库后确认为最终域名。
   * GitHub Pages 用户站的默认形式为 https://<用户名>.github.io
   */
  url: 'https://auraduan.github.io',

  lang: 'zh-CN',
  locale: 'zh_CN',
} as const;

/**
 * 顶部导航。
 * 需要「导航栏里放常用工具网站」时，用 children 做下拉分组（见下方示例）。
 */
export const NAV: NavItem[] = [
  { label: '文章', href: '/posts' },
  { label: '专辑', href: '/albums' },
  { label: '归档', href: '/archive' },
  {
    label: '工具',
    href: '/links',
    children: [
      // TODO(令宸)：把你要放在导航栏的常用网站填在这里，也可以只保留「全部工具」进 /links 页
      { label: '全部工具', href: '/links', desc: '按分类浏览全部链接' },
      { label: 'GitHub', href: 'https://github.com', desc: '代码托管' },
    ],
  },
  { label: '关于', href: '/about' },
];

/**
 * 工具导航页（/links）的分组内容。
 * TODO(令宸)：替换成你自己的常用站点清单，增删分组直接改数组即可。
 */
export const LINK_GROUPS: LinkGroup[] = [
  {
    title: '开发',
    items: [
      { label: 'GitHub', href: 'https://github.com', desc: '代码托管与协作' },
      { label: 'MDN Web Docs', href: 'https://developer.mozilla.org', desc: 'Web 技术文档' },
      { label: 'Astro 文档', href: 'https://docs.astro.build', desc: '本站所用框架' },
    ],
  },
  {
    title: '机器人 / 工程',
    items: [
      { label: 'ROS 2 文档', href: 'https://docs.ros.org', desc: '机器人操作系统' },
      { label: 'PX4 开发者指南', href: 'https://docs.px4.io', desc: '无人机飞控' },
    ],
  },
  {
    title: '工具',
    items: [
      { label: '菜鸟教程', href: 'https://www.runoob.com', desc: '编程入门参考' },
      { label: 'Overleaf', href: 'https://www.overleaf.com', desc: '在线 LaTeX 排版' },
    ],
  },
];

/** 页脚社交/联系入口。href 留空则该项不渲染。 */
export const SOCIAL: { label: string; href: string }[] = [
  { label: 'GitHub', href: 'https://github.com/auraduan' },
  { label: 'RSS', href: '/rss.xml' },
  // { label: '邮箱', href: 'mailto:you@example.com' },
];

/**
 * 「关于」页顶部的个人主页按钮。改动链接/文案/顺序只动这里。
 *
 * `icon` 对应 about.astro 里内置的矢量图标（github / xiaohongshu / instagram）；
 * 加新平台时两边都要加一条，漏了会渲染成没有图标的空按钮。
 * 平台主页一律用**不带追踪参数的干净地址**（分享链接里那些 xsec_token / stkn 会过期）。
 */
export const PROFILES: {
  label: string;
  href: string;
  icon: 'github' | 'xiaohongshu' | 'instagram';
}[] = [
  { label: 'GitHub', href: 'https://github.com/auraduan', icon: 'github' },
  {
    label: '小红书',
    href: 'https://www.xiaohongshu.com/user/profile/68a3d4ba000000001902326a',
    icon: 'xiaohongshu',
  },
  { label: 'Instagram', href: 'https://www.instagram.com/linson_duan', icon: 'instagram' },
];

/**
 * 首屏壁纸轮播的间隔（毫秒）。
 * 需求方案 §6.10 规定为 6–8 秒，改这里即可，不要低于 6000。
 */
export const WALLPAPER_INTERVAL_MS = 7000;
