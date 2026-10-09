---
title: "Python 里最容易被忽略的一件事：可变与不可变"
description: "同一个函数，传入列表和传入整数，行为完全不一样。根源是可变对象与不可变对象的区别。"
publishedAt: 2026-10-05
category: "Python"
tags: ["Python", "踩坑", "基础"]
cover: "./cover.png"
coverAspect: "auto"
draft: false
toc: true
math: false
---

**示例文章，演示正方形封面。**

## 先看一段会出错的代码

```python
def add_item(item, target=[]):
    target.append(item)
    return target


print(add_item("a"))   # ['a']
print(add_item("b"))   # ['a', 'b']  ← 不是 ['b']
```

第二次调用返回了上一次的结果。原因不是函数写错了，而是**默认参数 `[]` 只在定义时创建一次**[^default-arg]，之后每次调用都复用同一个列表。

## 根源：可变与不可变

Python 里的对象分两类：

| 类型 | 例子 | 能不能原地修改 |
|---|---|---|
| 不可变 | `int` `str` `tuple` `frozenset` | 不能，每次「修改」都是新建对象 |
| 可变 | `list` `dict` `set` | 能，原地改，所有引用都看得见 |

`int` 之所以没有这个问题，是因为 `x += 1` 实际上是新建了一个整数对象并让 `x` 指向它，原来的对象没被碰过[^small-int]。

## 正确的写法

```python
def add_item(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target
```

用 `None` 当哨兵值，在函数体内新建列表——这样每次调用拿到的是全新的对象。

> 记住这条规则：**默认参数永远不要用可变对象**。

[^default-arg]: 这就是著名的「可变默认参数陷阱」，Python 官方 FAQ 里有专门条目（*Why are default arguments evaluated only once?*）。它反直觉的地方在于：默认参数写在函数**签名**里，看起来像是"每次调用时求值"，实际却在定义时求一次。

[^small-int]: 有个例外：CPython 会缓存 −5 到 256 之间的小整数，所以 `a = 100; b = 100` 时 `a is b` 为真。但这属于实现细节，写代码时不该依赖它。
