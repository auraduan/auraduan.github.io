---
title: "这个博客是怎么搭起来的"
description: "用 Astro 7 + Tailwind 4 从零搭一个零后端的个人博客，顺便记录几个踩过的坑。"
publishedAt: 2026-10-06
category: "随笔"
tags: ["Astro", "建站", "踩坑"]
cover: "./cover.png"
coverAspect: "auto"
draft: false
toc: true
math: true
---

这是一篇用来跑通渲染管线的示例文章——**看完可以删掉**。

它顺带验证了几件事：Markdown、代码高亮、LaTeX 公式、表格、引用块，是否都能正常渲染。

## 为什么要自己搭

现成的博客主题很多，但大多数会给你一个装不下的衣柜：主题、插件、评论、统计一层叠一层，最后你花在维护上的时间比写作还多。

这个站的取舍是——**把维护面压到「改配置 + 写文章」两件事**，没有第三种操作。

- 没有后端，没有数据库，没有 CMS
- 文章是纯 Markdown，`git push` 即发布
- 部署只有一条通道，不再手写第二个脚本

## 一个代码例子

数学公式用 LaTeX 语法，行内直接写 $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$，独立公式单独成行：

$$
T = \begin{bmatrix}
\cos\theta & -\sin\theta & 0 & l_1\cos\theta \\
\sin\theta & \cos\theta & 0 & l_1\sin\theta \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

上面这个是平面二连杆机械臂的齐次变换矩阵——写运动学时随手就能排版出来，不用再截图贴图。

代码块带行号和复制按钮：

```python
import rclpy
from rclpy.node import Node


class MinimalPublisher(Node):
    def __init__(self):
        super().__init__("minimal_publisher")
        self.publisher_ = self.create_publisher(String, "topic", 10)
```

## 表格与引用

| 项 | 取值 | 说明 |
|---|---|---|
| 工具链 | Astro 7 + Tailwind 4 | 零后端静态站 |
| 部署 | GitHub Actions → Pages | 唯一通道 |
| 写作 | 本地 Markdown | push 即发布 |

> 关于字体的一条教训：Windows 上没有苹方。如果依赖系统字体兜底，你自己看到的是微软雅黑、别人看到的是苹方——同一篇文章两种排版。所以中英文字体都得自托管。

## 接下来

第一版做好之后，值得加的还有站内搜索、访问统计、作品集页。评论区已经明确不做了。
