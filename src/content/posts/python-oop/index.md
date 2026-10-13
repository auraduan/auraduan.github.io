---
title: "Python 面向对象编程（Object Oriented Programming）"
description: "类与对象、属性与方法、封装继承多态，再到 __str__、__add__ 等魔术方法的重载写法——附两道完整可运行的例题。"
publishedAt: 2026-10-13
category: "Python"
tags: ["Python", "面向对象", "OOP", "笔记"]
draft: false
toc: true
math: false
---

## 0 面向对象技术简介

**一句话**：面向对象（OO）是一种把世界看成一个个「对象」的思路——不盯操作步骤，先想清系统里有哪些东西，再让它们各自做事。

**对比面向过程**：面向过程把任务拆成一步步流程，像照菜谱做菜，小任务好用、程序一大就互相纠缠；面向对象则改为**拆角色**，像开公司设岗位（会计管账、司机开车），各司其职、互相配合——「岗位」是类，上岗的人是对象。

**类与对象**：类是一张**图纸**，描述这类东西长什么样、能做什么；对象是按图纸**造出的实物**，一张图纸能造很多个，彼此独立。**类是概念，对象是实体。**

**属性与方法**：属性是对象**拥有**的数据（车的颜色、油量），方法是对象**能做**的事（启动、刹车）。属性是名词、方法是动词，把数据与处理数据的方法绑在同一件东西上，正是面向对象的关键。

**三大特性**：

- **封装**：打包属性方法，只露必要的操作面板，内部藏起来。像踩油门就走、无需懂发动机原理——用着简单，也保护内部不被改坏。
- **继承**：子类直接获得父类已有的部分，只补特有内容。像电动车天生具备汽车的轮子与前进能力，再添电池、充电口——代码得以复用。
- **多态**：同一指令、不同反应。对猫说「叫一声」它喵，对狗说「叫一声」它汪——发令方不必关心对方是谁，灵活易扩展。

**为什么用它**：贴近现实、便于分工（一类一人负责）、易于复用、方便维护扩展（改动限制在对象内部，不易牵连全局）。

## 1 创建类（class）

以下是一段基础语法：

```python
class NameOfClass:      # 命名类用大驼峰
    # 定义类………………
```

以下是一道例题：

```python
"""
题目：设计二维平面点类 Point

【任务要求】
1. 构造方法（Constructor）：
   - 定义 __init__ 方法，接收两个浮点型参数 x 和 y（默认值均为 0.0）。
   - 将参数绑定为实例属性：self.x 与 self.y。

2. 实例方法（Instance Method）：
   - 定义 distance_to 方法，接收另一个 Point 对象参数 other。
   - 计算并返回当前点与目标点之间的欧几里得距离：
     dist = sqrt((x1 - x2)^2 + (y1 - y2)^2)
   - 可选用 math.sqrt() 或内置运算符 ** 0.5。

3. 测试验证：
   - 实例化点 p1(0.0, 0.0) 与 p2(3.0, 4.0)。
   - 调用 p1.distance_to(p2) 计算距离。
   - 使用 f-string 配合 :.2f 格式化输出结果（期望输出：Distance: 5.00）。
"""

from math import sqrt

class Point:
    def __init__(self, x:float = 0.0, y:float = 0.0):
        self.x = x
        self.y = y

    def distance_to(self, other):
        dist = sqrt((self.x - other.x) ** 2 + (self.y - other.y) ** 2)
        return dist

p1 = Point(0.0, 0.0)
p2 = Point(3.0, 4.0)

print(f"两点距离 {p1.distance_to(p2):.2f}")  # 这里默认将 p2 传给 other，p1 传给 self

print(p1)     # 输出 <__main__.Point object at 0x00000225F2F68590>
```

为了解决输出 `<__main__.Point object at 0x00000225F2F68590>` 的无意义，Python 提供了两种魔术方法如下：

- `__str__`：告诉 Python“打印我的时候，显示什么字”
- `__add__`：告诉 Python“别人用 `+` 加我的时候，怎么计算”

```python
from math import sqrt

class Point:
    def __init__(self, x: float = 0.0, y: float = 0.0):
        self.x = x
        self.y = y

    def distance_to(self, other):
        return sqrt((self.x - other.x) ** 2 + (self.y - other.y) ** 2)

    # 1. 专门用于打印的魔术方法
    def __str__(self):
        return f"({self.x}, {self.y})"

    # 2. 专门响应 '+' 运算符的魔术方法
    def __add__(self, other):
        return Point(self.x + other.x, self.y + other.y)


# --- 测试 ---
p1 = Point(1.0, 2.0)
p2 = Point(3.0, 4.0)

# 测试 __str__：不再显示内存地址
print(f"p1 的坐标是: {p1}")  # 终端输出: p1 的坐标是: (1.0, 2.0)

# 测试 __add__：支持两点直接用 '+' 相加
p3 = p1 + p2
print(f"p1 + p2 的结果是: {p3}")  # 终端输出: p1 + p2 的结果是: (4.0, 6.0)
```

**以下是其他常见的魔术方法：**

| 分类 | 触发语法 / 函数 | 魔术方法 | 核心作用与返回值规范 |
| :--- | :--- | :--- | :--- |
| **生命周期** | `Point()` | `__init__(self, ...)` | 构造初始化，绑定实例属性，不返回值（`None`） |
| | `del obj` | `__del__(self)` | 析构方法，对象被垃圾回收时触发 |
| **字符串与展示** | `print(obj)` / `str(obj)` | `__str__(self)` | 面向用户的可读描述，必须返回 `str` |
| | 终端直接输入交互 / `repr(obj)` | `__repr__(self)` | 面向开发者的精确表示，通常返回形如 `Point(x, y)` 的 `str` |
| **数学运算** | `a + b` | `__add__(self, other)` | 加法（Addition） |
| | `a - b` | `__sub__(self, other)` | 减法（Subtraction） |
| | `a * b` | `__mul__(self, other)` | 乘法（Multiplication） |
| | `a / b` | `__truediv__(self, other)` | 浮点真除法（True Division） |
| | `a // b` | `__floordiv__(self, other)` | 整除（Floor Division） |
| | `a % b` | `__mod__(self, other)` | 取模 / 求余（Modulo） |
| | `a ** b` | `__pow__(self, other)` | 幂运算（Power） |
| | `-a` | `__neg__(self)` | 一元负号（Negative） |
| **反向运算符** | `b + a`（当 `b` 不支持与 `a` 相加时） | `__radd__(self, other)` | 右侧反向加法（Right Addition） |
| | `b * a`（当 `b` 不支持与 `a` 相乘时） | `__rmul__(self, other)` | 右侧反向乘法（Right Multiplication） |
| **类型转换** | `int(obj)` | `__int__(self)` | 转换为整数，必须返回 `int` |
| | `float(obj)` | `__float__(self)` | 转换为浮点数，必须返回 `float` |
| | `bool(obj)` | `__bool__(self)` | 条件判断（如 `if obj:`），必须返回 `bool` |
| **比较运算** | `a == b` | `__eq__(self, other)` | 等于（Equal） |
| | `a != b` | `__ne__(self, other)` | 不等于（Not Equal） |
| | `a < b` | `__lt__(self, other)` | 小于（Less Than） |
| | `a <= b` | `__le__(self, other)` | 小于等于（Less Than or Equal） |
| | `a > b` | `__gt__(self, other)` | 大于（Greater Than） |
| | `a >= b` | `__ge__(self, other)` | 大于等于（Greater Than or Equal） |
| **容器与调用** | `len(obj)` | `__len__(self)` | 返回长度，必须返回非负 `int` |
| | `obj[key]` | `__getitem__(self, key)` | 索引访问（如列表或字典取值） |
| | `obj(args)` | `__call__(self, ...)` | 让实例对象像普通函数一样被直接调用 |

```python
from math import sqrt


class Vector2D:
    """二维向量 / 点类，演示核心魔术方法的标准工程写法"""

    def __init__(self, x: float = 0.0, y: float = 0.0):
        self.x = float(x)
        self.y = float(y)

    # 1. 显示控制
    def __str__(self) -> str:
        """print() 或 str() 时的用户友好展示"""
        return f"({self.x:.2f}, {self.y:.2f})"

    def __repr__(self) -> str:
        """代码审查与调试用，输出可重建对象的标准字符串"""
        return f"Vector2D(x={self.x}, y={self.y})"

    # 2. 算术运算符重载
    def __add__(self, other: "Vector2D") -> "Vector2D":
        """重载 + ：向量加法"""
        return Vector2D(self.x + other.x, self.y + other.y)

    def __sub__(self, other: "Vector2D") -> "Vector2D":
        """重载 - ：向量减法"""
        return Vector2D(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar: float) -> "Vector2D":
        """重载 * ：向量数乘 (v * 2)"""
        return Vector2D(self.x * scalar, self.y * scalar)

    def __rmul__(self, scalar: float) -> "Vector2D":
        """重载右乘：解决标量在前的问题 (2 * v)"""
        return self.__mul__(scalar)

    def __neg__(self) -> "Vector2D":
        """重载一元负号：-v (取反向量)"""
        return Vector2D(-self.x, -self.y)

    # 3. 类型转换
    def __float__(self) -> float:
        """重载 float(v)：返回向量欧几里得范数（长度）"""
        return sqrt(self.x ** 2 + self.y ** 2)

    def __bool__(self) -> bool:
        """重载布尔判断：非零向量为 True，零向量为 False"""
        return self.x != 0.0 or self.y != 0.0

    # 4. 比较运算符
    def __eq__(self, other: object) -> bool:
        """重载 == ：判断坐标是否相等"""
        if not isinstance(other, Vector2D):
            return False
        return self.x == other.x and self.y == other.y

    # 5. 可调用对象（Callable）
    def __call__(self, scale_factor: float = 1.0) -> "Vector2D":
        """让对象可以被像函数一样调用：v(2.0)"""
        return self * scale_factor


# ===================== 测试验证 =====================
v1 = Vector2D(3.0, 4.0)
v2 = Vector2D(1.0, 2.0)

# 测试 __str__ 与 __repr__
print(f"v1 坐标: {v1}")             # 输出: v1 坐标: (3.00, 4.00)
print(f"repr 调试信息: {repr(v1)}") # 输出: repr 调试信息: Vector2D(x=3.0, y=4.0)

# 测试加法 __add__ 与减法 __sub__
print(f"v1 + v2 = {v1 + v2}")       # 输出: v1 + v2 = (4.00, 6.00)
print(f"v1 - v2 = {v1 - v2}")       # 输出: v1 - v2 = (2.00, 2.00)

# 测试左乘 __mul__ 与右乘 __rmul__
print(f"v1 * 2 = {v1 * 2}")         # 输出: v1 * 2 = (6.00, 8.00)
print(f"2 * v1 = {2 * v1}")         # 输出: 2 * v1 = (6.00, 8.00)

# 测试一元负号 __neg__
print(f"-v1 = {-v1}")               # 输出: -v1 = (-3.00, -4.00)

# 测试强制类型转换 __float__
print(f"v1 的模长: {float(v1):.2f}") # 输出: v1 的模长: 5.00

# 测试比较运算 __eq__
print(f"v1 == v2: {v1 == v2}")       # 输出: v1 == v2: False
print(f"v1 == Vector2D(3, 4): {v1 == Vector2D(3, 4)}")  # 输出: True

# 测试 __call__
v_scaled = v1(0.5)
print(f"调用 v1(0.5): {v_scaled}")  # 输出: 调用 v1(0.5): (1.50, 2.00)
```

## 2 继承类

以下是一段简洁的示例代码：

```python
class 子类名(父类名):      # 命名类用大驼峰
    # 定义类………………
```

以下是一道例题：

```python
"""
题目：设计三维空间点类 Point3D（继承自二维 Point 类）

【任务要求】
1. 基类（Base Class）：
   - 使用现有的二维点类 Point（具有 self.x, self.y，以及自定义的 __str__）。

2. 派生类（Derived Class / Subclass）：
   - 定义子类 Point3D，继承自 Point。
   - 构造方法 __init__：
     * 接收 x, y, z 三个浮点参数（默认值均设为 0.0）。
     * 必须使用 super().__init__(x, y) 调用父类构造方法初始化 x 和 y。
     * 在子类中单独绑定 self.z = z。

3. 魔术方法（Magic Method）：
   - 重写（Override）父类的 __str__(self) 方法。
   - 使其打印三维坐标格式："(x, y, z)"，例如 "(1.0, 2.0, 3.0)"。
   - 实现加法运算符 __add__(self, other)：
     * 支持两个三维点直接相加：(x1+x2, y1+y2, z1+z2)。
     * 返回一个新的 Point3D 对象。

4. 测试验证：
   - 实例化 p1 = Point3D(1.0, 2.0, 3.0) 与 p2 = Point3D(4.0, 5.0, 6.0)。
   - 验证父类属性继承：打印 p1.x, p1.y, p1.z。
   - 验证 __str__ 与 __add__：
     * 执行 p3 = p1 + p2。
     * 直接 print(p3)，验证预期输出是否为 "(5.0, 7.0, 9.0)"。
"""

from math import sqrt


class Point:
    """父类：二维平面点"""
    def __init__(self, x: float = 0.0, y: float = 0.0):
        self.x = x
        self.y = y

    def __str__(self) -> str:
        return f"({self.x}, {self.y})"


class Point3D(Point):
    """子类：三维空间点，继承自 Point"""
    def __init__(self, x: float = 0.0, y: float = 0.0, z: float = 0.0):
        # 1. 规范调用父类构造函数
        super().__init__(x, y)
        self.z = z

    # 2. 重写父类的 __str__ 方法，使其展示 (x, y, z)
    def __str__(self) -> str:
        return f"({self.x}, {self.y}, {self.z})"

    # 3. 规范实现三维向量加法
    def __add__(self, other: "Point3D") -> "Point3D":
        return Point3D(
            self.x + other.x,
            self.y + other.y,
            self.z + other.z
        )

p1 = Point3D(1.0, 2.0, 3.0)
p2 = Point3D(5.0, 7.0, 9.0)

# 测试继承的属性与新增属性
print(f"p1 坐标: x={p1.x}, y={p1.y}, z={p1.z}")

# 测试加法运算与子类的 __str__
p3 = p1 + p2
print(f"p1 + p2 的结果是: {p3}")
# 期望终端输出: (6.0, 9.0, 12.0)
```
