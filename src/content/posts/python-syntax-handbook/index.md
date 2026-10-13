---
title: "Python 基础语法自查手册"
description: "从 print、变量命名到列表字典、函数与模块导入——一份可以随时回查的 Python 基础语法清单，常见方法附带「会不会改动原对象」的对照表。"
publishedAt: 2026-10-13
category: "Python"
tags: ["Python", "语法", "笔记"]
draft: false
toc: true
math: false
---

> 对应教程链接：[3小时超快速入门 Python](https://www.bilibili.com/video/BV1Jgf6YvE8e?p=6)

## 0 Python 的安装

Python 相关版本可以在此处安装：[Python Download](https://www.python.org/downloads/windows/)

## 1 Print 打印

```python
print("Hello World")            # 基础用法
print("Hello" + " World")       # 字符串拼接

print("He said \"Let\'s go\"")  # 转义，防止引号层级意义不明

print("Hello \n World")         # 换行
print(""" 1
2
3
""")                            # 同时多行文本
```

## 2 变量

变量的命名规则：由大写、小写、数字（0-9）、下划线 `_` 组成。且首个字符必须是英文字母或下划线。

尽管在 Python 3 时代支持了汉字作为变量名，但是通常不采用。

与 Java/C# 等语言的驼峰命名法则不同的是，Python 主流采用**下划线**命名法，即：

- 字母全部使用小写字母
- 不同字母用下划线分隔开

这是一个很好的示例：无人机电池电压变量命名为 `uav_battery_voltage`。

以下是 Python 的一些关键字，在变量命名时应当避开它们：

| 1        | 2        | 3        | 4        | 5        |
|----------|----------|----------|----------|----------|
| False    | None     | True     | and      | as       |
| assert   | async    | await    | break    | class    |
| continue | def      | del      | elif     | else     |
| except   | finally  | for      | from     | global   |
| if       | import   | in       | is       | lambda   |
| nonlocal | not      | or       | pass     | raise    |
| return   | try      | while    | with     | yield    |

```python
a = 1       # 赋值操作
b = a
```

## 3 Python 数学运算

Python 的数学运算顺序和现实逻辑一样，先括号、再乘方、后乘除、最终加减。

为了实现更多的功能，可以导入 `math` 库，稍后在代码示例中体现（基础语法并不教学 `numpy`）。

> `math` 库中的函数，详见 [`math` 库官方文档](https://docs.python.org/zh-cn/3/library/math.html) 与 [`cmath` 库官方文档](https://docs.python.org/zh-cn/3/library/cmath.html)。

```python
import math

result = math.sin(90)        # 这里的单位制为弧度 (rad)

a = 1
b = 3
c = 2
delta = b ** 2 - 4 * a * c

x = ((-b + math.sqrt(b ** 2 - 4 * a * c)) / (2 * a))    # 这是一个二次方程求根公式
x = ((-b + math.sqrt(delta)) / (2 * a))                 # 两者等价
```

## 4 注释

```python
# 这是一个单行注释
# -*- coding: utf-8 -*-
"""
                   _ooOoo_
                  o8888888o
                  88" . "88
                  (| -_- |)
                  O\  =  /O
               ____/`---'\____
             .'  \\|     |//  `.
            /  \\|||  :  |||//  \
           /  _||||| -:- |||||-  \
           |   | \\\  -  /// |   |
           | \_|  ''\---/''  |   |
           \  .-\__  `-`  ___/-. /
         ___`. .'  /--.--\  `. . __
      ."" '<  `.___\_<|>_/___.'  >'"".
     | | :  `- \`.;`\ _ /`;.`/ - ` : | |
     \  \ `-.   \_ __\ /__ _/   .-` /  /
======`-.____`-.___\_____/___.-`____.-'======
                   `=---='
"""
```

`Docstring`：函数/类开头的三引号字符串，它不只是注释——可以程序化访问 `__doc__`，也是 `help()` 的数据来源。

以下是 `Docstring` 的示例代码：

```python
def battery_report(percent):
    """返回电池电量报告字符串"""
    return (f"电池电量: {percent}%")

print(battery_report(96))
print(battery_report.__doc__)      # 输出: 返回电池电量报告字符串
print(__doc__)                     # 输出: 当前模块顶部的 docstring
```

## 5 数据类型

以下是 Python 中常见的数据类型：

| 数据类型 | 示例 1 | 示例 2 |
| ------- | -------- | ------- |
| 字符串 `str` | "Hello" | "123" |
| 整型 `int` | 0 | 1 |
| 浮点型 `float` | 1.0 | -1.1 |
| 布尔值 `bool` | `True` | `False` |
| 空值 `NoneType` | `None` | |

```python
s = "UAV-2026"

print(s[0])       # U         索引从 0 开始
print(s[-1])      # 6         负索引：-1 是最后一个字符！
print(s[0:3])     # UAV       取第 0~2 个字符（不含 3）
print(s[:3])      # UAV       start 省略 = 从头
print(s[4:])      # 2026      end 省略 = 到末尾
print(s[::2])     # UV22      step=2 跳着取
print(s[::-1])    # 6202-VAU  反转字符串！最经典的技巧
print(len(s))     # 8         计算字符串长度
print(type(s))    # <class 'str'>       返回数据类型
```

## 6 `input` 函数

`input` 函数默认传递字符串形式。

```python
data = float(input("请输入数据"))
```

## 7 `if`

逻辑运算符：`and`、`or`、`not`

```python
if [condition_1]:
  [TODO]
elif [condition_2]:
  [TODO]
else:
  [TODO]
```

## 8 列表

```python
my_list = ["1", "2", "3"]

print(len(my_list))    # 3

my_list.remove("2")    # 此时列表的内容被改变
print(my_list)         # ['1', '3']
```

以下是列表常见的方法及其实现的功能：

| 方法 / 函数 | 功能说明 | 示例 | 是否改变原列表 |
| ---------------- | ------------------------------ | ------------------------ | ---------------- |
| `append(x)` | 在列表**末尾**追加一个元素 | `my_list.append("4")` | ✅ 会 |
| `extend(iter)` | 将另一个可迭代对象的元素**逐个**追加到末尾 | `my_list.extend(["4", "5"])` | ✅ 会 |
| `insert(i, x)` | 在索引 `i` 处插入元素 `x` | `my_list.insert(0, "0")` | ✅ 会 |
| `remove(x)` | 删除**第一个**值为 `x` 的元素，不存在则报错 | `my_list.remove("2")` | ✅ 会 |
| `pop([i])` | 移除并**返回**索引 `i` 处的元素（默认最后一个） | `my_list.pop()` | ✅ 会 |
| `clear()` | 清空列表中的所有元素 | `my_list.clear()` | ✅ 会 |
| `index(x)` | 返回第一个值为 `x` 的元素的索引 | `my_list.index("3")` | ❌ 不会 |
| `count(x)` | 统计元素 `x` 在列表中出现的次数 | `my_list.count("1")` | ❌ 不会 |
| `sort()` | 就地**升序**排序（可加 `reverse=True` 降序） | `my_list.sort()` | ✅ 会 |
| `reverse()` | 就地**反转**列表中元素的顺序 | `my_list.reverse()` | ✅ 会 |
| `copy()` | 返回列表的**浅拷贝** | `new = my_list.copy()` | ❌ 不会 |
| `len(my_list)` | 返回列表的长度（内置函数，非方法） | `len(my_list)` | ❌ 不会 |

> 提示：以上方法均通过 `列表名.方法()` 的形式调用（`len()` 为内置函数除外）。标注 **✅ 会** 的属于“就地操作”，会**直接修改原列表**；标注 **❌ 不会** 的只读取或返回新对象，原列表保持不变。

## 9 字典

字典中存储着**键（key）**与**值（value）**。与现实中类似的，我们通过查找汉字字典中的字（key），来获得字的释义（value）。

列表作为**可变数据类型**，不可作为 key。常见的**不可变数据类型**有：字符串 `str`、整型 `int`、浮点数 `float`、布尔 `bool` 等。

引入一个实际案例：机器人的型号一样，但机龄不一样，如果要建立储存 SN 号的字典，我们可以使用**元组**。

以下是字典的示例：

```python
sn_of_robot = {"No.1":"123456789",
               "No.2":"987654321"}

sn_of_robot["No.1"]         # 以此获得 key 的 value

robot_age = ("No.1", 1)     # 元组使用的是小括号，列表使用中括号

sn_of_robot_and_age = {("No.1", 1):"123456789",
                       ("No.1", 2):"987654321"}

age1_robot_age = sn_of_robot_and_age[("No.1", 1)]

sn_of_robot["No.1"] = "100000000" # 更新 value
sn_of_robot["No.3"] = "543216789" # 添加 key 与 value

print("No.1" in sn_of_robot)      # True
print("No.4" in sn_of_robot)      # False

del sn_of_robot["No.3"]           # 删除键值对
print("No.3" in sn_of_robot)      # False

print(len(sn_of_robot))           # 返回键值对数量

sn_of_robot.keys()          # 返回所有 key
sn_of_robot.values()        # 返回所有 value
sn_of_robot.items()         # 返回所有 键值对
```

## 10 `for` 迭代循环

```python
sn_list = [100, 101, 102, 103]
sn_of_robot = {"No.1":100, "No.2":101, "No.3":102, "No.4":103}

for sn in sn_list:
    if 100 in sn_list:
        print("YES!")
    else:
        print("No...")

for name, sn in sn_of_robot.items():
    if sn == 100:
        print(name)
```

## 11 `while` “直到”循环

当 `条件` 为真时，动作一直执行；当 `条件` 为假时，动作结束，跳出循环。

```python
"""
while 条件：
    动作
"""
```

## 12 格式化字符串

假设情景：要求程序打印出 `x 机器人的 SN 号是：xxxxxx`。

引入 `format` 方法。以下是一段示例程序：

```python
robot_number_sn = {"No.1":100, "No.2":101, "No.3":102}
robot_number_age = {"No.1":5.12, "No.2":3.149, "No.3":4.96}

for number, sn in robot_number_sn.items():
    print("{0} 机器人的 SN 号是：{1}".format(number, sn))
    # `{0}` 中的 `0` 是位置参数索引，表示第一个参数 `number`；`{1}` 中的 `1` 表示第二个参数 `sn`

for number, age in robot_number_age.items():
    print("{0} 机器人的年龄是：{1:.2f}".format(number, age))    # 输出年龄被四舍五入为两位小数
```

## 13 函数

一个函数有 `输入` 与 `输出`。

引入情景：一个长方形面积计算器。

示例代码如下：

```python
def rectangle_area(a: float, b: float) -> float:
    ''' 这是一个矩形面积计算函数 '''
    return a * b

print(f"{rectangle_area(1.1, 1.1):.2f}")
```

## 14 库与模块——不要重复造轮子

我们有四种引入库的语句。

第一种，`import` 整库导入：

```python
import math

# 计算根号 16 和角度转弧度
print(math.sqrt(16))      # 输出: 4.0
print(math.radians(180))   # 输出: 3.141592653589793
```

第二种，`from ... import ...` 定向导入：

```python
from math import sqrt, pi

print(sqrt(25))  # 输出: 5.0
print(pi)        # 输出: 3.141592653589793
```

第三种，`from ... import *` 通配符导入：

```python
from math import *

print(sqrt(25))  # 输出: 5.0
print(pi)        # 输出: 3.141592653589793
```

第四种，`import ... as ...` 别名导入：

```python
import math as m

# 通过缩写 m 访问成员
print(m.sqrt(36))  # 输出: 6.0
print(m.pi)        # 输出: 3.141592653589793
```

`pypi.org` 网站可以搜索第三方库。安装第三方库的指令：`pip install 库的名字`
