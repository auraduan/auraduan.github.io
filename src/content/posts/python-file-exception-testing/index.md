---
title: "Python 基础（三）：文件、异常、测试与高阶函数"
description: "文件读写的 open 模式与 a+ 指针陷阱、try/except 四段式与常见异常对照表、unittest 的夹具与断言手册，以及 map / filter / sorted 与 lambda 的用法。"
publishedAt: 2026-10-13
category: "Python"
tags: ["Python", "Python基础", "文件", "异常", "测试", "笔记"]
draft: false
toc: true
math: true
---

## 1 读取文件

常见的读取文件函数有 `read`、`readline`、`readlines`。这里只介绍现代 Python 常用的方式。

```python
with open("flight_log.txt", "r", encoding="utf-8") as f:
    for line in f:
        data = line.strip().split(",")
        # 处理数据...
# 退出代码块后，底层自动完成 f.close()
```

`r` 表示只读，`w` 表示覆盖写入，`a` 表示附加写入，`r+` 表示读 + 覆写，`a+` 表示读 + 追加

```python
# --- 使用 a+ 打开（文件不存在会自动新建） ---
with open("test_a_plus.txt", "a+", encoding="utf-8") as f:
    # 1. 写入第一行日志
    f.write("log_line_1\n")

    # 2. 踩坑点验证：此时指针在文件末尾，直接 read() 会读空
    empty_read = f.read()
    print(f"[a+] 未 seek 时直接读取长度: {len(empty_read)}")  # 输出: 0

    # 3. 正确做法：必须调用 seek(0) 拨回文件头再读
    f.seek(0)
    print(f"[a+] seek(0) 后的读取结果:\n{f.read().strip()}")  # 输出: log_line_1

    # 4. 测试强制追加机制：哪怕指针此时在位置 0，调用 write() 依然写在末尾
    f.seek(0)  # 故意将指针拨回开头
    f.write("log_line_2\n")  # 底层强制追加到文件尾部，绝不会覆盖开头

    # 5. 再次拨回开头验证完整内容
    f.seek(0)
    print(f"[a+] 最终追加后的完整文件:\n{f.read().strip()}")
    # 输出:
    # log_line_1
    # log_line_2
```

## 2 异常的处理与捕捉

```python
try:
    # 尝试执行可能引发异常的高风险代码 (Monitored Block)
    ...
except SpecificException as e:
    # 捕获特定类型的异常并执行补救或记录措施 (Handling Block)
    ...
else:
    # 当 try 块内没有任何异常发生时，才会执行 (No Exception)
    ...
finally:
    # 无论是否发生异常，最终都必须强制执行的代码（通常用于资源清理与释放）
    ...
```

下面是一段简单的示例程序：

```python
try:
    robot_id = float(input("请输入机器人的 id"))  # 假设用户在此输入字符串 “完蛋了”
except ValueError:
    print("你输入的数据类型不合理")
```

除了被动捕获外部错误，还可以使用 `raise` 显式触发异常，用于检查输入参数的物理合理性（如质量不能为负、采样周期不能小于等于 0）：

```python
def calc_kinetic_energy(mass: float, velocity: float) -> float:
    """计算动能：Ek = 0.5 * m * v^2"""
    if mass < 0:
        # 主动截断非法物理状态
        raise ValueError(f"质量 mass 必须为非负数，当前输入为: {mass}")
    return 0.5 * mass * (velocity ** 2)

# 测试主动异常
try:
    ek = calc_kinetic_energy(-2.0, 5.0)
except ValueError as err:
    print(f"参数越界拦截: {err}")
```

以下是常见的异常类型：

| 异常类型（Exception Type） | 触发机制与原因 | 典型代码示例 | 排查与修复方案 |
| :--- | :--- | :--- | :--- |
| **`SyntaxError`** | 语法错误，代码不符合 Python 解析规则，在编译期被拦截 | `if x == 1`（末尾漏写冒号 `:`） | 检查语法符号、括号匹配、关键字拼写及冒号缺失 |
| **`IndentationError`** | 缩进错误，代码块对齐不一致或混用空格与制表符（Tab） | 函数体内部未缩进或缩进空格数不一致 | 统一使用 4 个空格缩进，检查 VS Code 底部缩进设置 |
| **`NameError`** | 尝试访问尚未声明或未导入的变量、函数名 | `print(speed)`（此前未定义 `speed`） | 检查变量名拼写、作用域（局部 vs 全局）及模块导入 |
| **`TypeError`** | 操作符或函数应用在不兼容的数据类型上 | `'speed: ' + 5` 或 `len(100)` | 检查操作数类型，使用 `str()`、`int()` 等显式类型转换 |
| **`ValueError`** | 数据类型正确，但传入的值内容不合法 | `int('abc')` 或 `math.sqrt(-1.0)` | 检查输入数据格式，避免对负数求实数平方根 |
| **`IndexError`** | 序列对象（列表/元组）索引越界 | `lst = [1, 2]; val = lst[2]` | 确认序列长度 `len(lst)`，确保索引在 `0` 至 `len-1` 范围内 |
| **`KeyError`** | 在字典（dict）中访问不存在的键名 | `d = {'kp': 1.0}; print(d['ki'])` | 使用 `key in d` 预检，或改用字典的 `d.get('ki', 0.0)` 方法 |
| **`AttributeError`** | 访问对象不存在的属性或方法 | `p = Point(); p.fly()` | 检查类定义中是否包含该属性，排查对象是否意外为 `None` |
| **`ZeroDivisionError`** | 除法或求模运算中分母为零 | `a / 0` 或 `a % 0` | 在执行除法前对分母做非零校验（`if denom != 0:`） |
| **`FileNotFoundError`** | 尝试以读模式打开磁盘上不存在的文件 | `open('data.txt', 'r')` | 检查相对路径与工作目录一致性，或使用绝对路径/`os.path.exists()` |
| **`ImportError` / `ModuleNotFoundError`** | 尝试导入不存在的模块，或模块内成员名称拼写错误 | `import numpys` 或 `from math import sqrtt` | 检查库名与函数名拼写，确认对应第三方库是否已 `pip install` |
| **`RecursionError`** | 函数递归调用层数超出解释器最大栈深度限制 | 未设置基线终止条件（Base Case）的递归函数 | 补充递归收敛条件，或将递归逻辑重构为 `while`/`for` 迭代循环 |

## 3 Python 的测试

我们一般将测试代码与实现代码分开。一个良好的工作空间应该有以下布局：

```markdown
robot_project/
├── README.md
├── pyproject.toml
├── src/
│   └── robot_project/
│       ├── __init__.py
│       ├── imu_driver.py
│       ├── attitude_estimator.py
│       └── controller.py
├── tests/
│   └── test_add.py
└── docs/
    └── system_design.md
```

以上面为例，我的实现代码存储在 `controller.py` 中，如下：

```python
...
def cac_add(a, b):
    return a + b
...
```

以下是测试代码，存储在 `test_add.py` 中，如下：

```python
import unittest                  # 1. 引入 unittest 框架
from controller import cac_add   # 2. 引入待测试的函数


class TestCacAdd(unittest.TestCase):  # 注意类定义末尾的冒号 :
    
    # 测试方法必须以 test_ 开头
    def test_positive_integers(self):
        """测试正常正整数相加"""
        result = cac_add(2, 3)
        # 断言结果是否严格等于 5：self.assertEqual(实际值, 期望值)
        self.assertEqual(result, 5)

    def test_negative_numbers(self):
        """测试负数边界情况"""
        result = cac_add(-1, -4)
        self.assertEqual(result, -5)

    def test_float_addition(self):
        """测试浮点数加法（处理浮点精度）"""
        result = cac_add(1.1, 1.1)
        # 针对浮点数，使用 assertAlmostEqual 验证保留 2 位小数的精度
        self.assertAlmostEqual(result, 2.2, places=2)


# 运行入口：直接用 python test_add.py 执行时自动触发
if __name__ == "__main__":
    unittest.main()
```

以下是一些常见的方法：

| 方法分类 | 断言方法 / 框架函数 | 校验条件与底层逻辑 | 典型应用场景示例 |
| :--- | :--- | :--- | :--- |
| **生命周期夹具** | `setUp(self)` | 在**每个**测试用例（以 `test_` 开头的方法）执行前自动运行 | 初始化对象实例、连接测试数据库、重置变量环境 |
| | `tearDown(self)` | 在**每个**测试用例执行完成后强制自动运行 | 释放文件句柄、清理生成的临时文件、断开外设通信 |
| | `setUpClass(cls)` | 在**整个测试类**开始执行前仅运行一次（需加 `@classmethod`） | 建立耗时较长的全局资源（如加载大型物理模型、初始化硬件通道） |
| | `tearDownClass(cls)` | 在**整个测试类**所有用例执行完毕后仅运行一次（需加 `@classmethod`） | 销毁全局类资源、彻底关闭网络服务端 |
| **等值与对象判断** | `assertEqual(a, b)` | 校验 `a == b` 是否成立 | 校验整数、字符串、列表或字典等基础运算返回值 |
| | `assertNotEqual(a, b)` | 校验 `a != b` 是否成立 | 确保两次生成的状态 ID、随机种子或更新后的增量不相同 |
| | `assertIs(a, b)` | 校验 `a is b`（检验是否为同一内存对象，`id(a) == id(b)`） | 单例模式校验、确认变量是否严格指向全局唯一实例 |
| | `assertIsNot(a, b)` | 校验 `a is not b` | 确保深拷贝（Deepcopy）生成了全新的独立内存对象 |
| **布尔与空值校验** | `assertTrue(x)` | 校验 `bool(x) is True` | 检查电机使能标志、飞行器解锁标志（Arm）、算法收敛收拢标志 |
| | `assertFalse(x)` | 校验 `bool(x) is False` | 检查传感器故障告警位、超温标志位、越界触发位 |
| | `assertIsNone(x)` | 校验 `x is None` | 验证初始化时的空指针状态、缓存未命中时的返回结果 |
| | `assertIsNotNone(x)` | 校验 `x is not None` | 确保通信报文成功解析、指针非空、句柄创建成功 |
| **数值与浮点精度** | `assertAlmostEqual(a, b, places=7)` | 校验 `round(a - b, 7) == 0`（按保留小数位近似） | **浮点数计算防护**（消除 IEEE 754 精度误差，如几何坐标与力矩） |
| | `assertAlmostEqual(a, b, delta=0.01)` | 校验 `abs(a - b) <= delta`（按绝对公差容限近似） | 传感器采样噪声滤波判定、动态响应容差范围验证 |
| | `assertGreater(a, b)` | 校验 $a > b$ | 校验推重比大于阈值、速度递增、时间戳严格递增 |
| | `assertGreaterEqual(a, b)` | 校验 $a \ge b$ | 校验物理质量非负、绝对误差非负、采样间隔合法性 |
| | `assertLess(a, b)` | 校验 $a < b$ | 校验误差在死区上限以内、延迟小于通信周期 |
| | `assertLessEqual(a, b)` | 校验 $a \le b$ | 校验控制量是否落在执行器最大饱和限幅（Saturation Limit）内 |
| **集合与成员关系** | `assertIn(a, b)` | 校验 `a in b` | 校验报文指令是否包含在指令集内、配置字典中是否存在目标键名 |
| | `assertNotIn(a, b)` | 校验 `a not in b` | 确认黑名单关键词被过滤、错误代码不在成功响应体中 |
| | `assertCountEqual(a, b)` | 校验列表元素是否相同，**忽略元素排列顺序** | 校验并行任务收集的节点 ID 集合、无序传感器列表是否齐备 |
| **异常抛出拦截** | `assertRaises(exc, callable, *args)` | 校验调用目标函数时是否抛出指定异常类 `exc` | 拦截除以零、非法输入参数（如向几何函数传入负数半径） |
| | `with self.assertRaises(exc):` | 上下文管理器语法，校验代码块内是否抛出指定异常 | **工程标准写法**：验证模块在异常输入下是否主动触发防御拦截 |

以下是完整的示例代码：

**实现代码**

```python
class MotorTelemetry:
    """电机遥测数据与状态解析类"""

    def __init__(self, raw_rpm: float, current_a: float):
        self.rpm = float(raw_rpm)
        self.current = float(current_a)

    def rad_per_sec(self) -> float:
        """将转速 RPM 转换为角速度 rad/s：omega = rpm * 2 * pi / 60"""
        return self.rpm * (3.1415926535 / 30.0)

    def power_watts(self, voltage_v: float = 12.0) -> float:
        """根据供电电压计算电功率：P = U * I"""
        return voltage_v * self.current

    def is_overloaded(self, max_current: float = 20.0) -> bool:
        """过流保护状态检测：电流是否超出设定阈值"""
        return self.current > max_current
```

**测试代码**

```python
import unittest
from telemetry import MotorTelemetry


class TestMotorTelemetry(unittest.TestCase):

    def setUp(self):
        """测试夹具：每个测试用例启动前都会自动构建一个标准的电机对象"""
        self.motor = MotorTelemetry(raw_rpm=3000.0, current_a=15.5)

    def test_rad_per_sec(self):
        """测试角速度换算（针对浮点数使用 assertAlmostEqual 验证精度）"""
        expected_rad_s = 314.159
        self.assertAlmostEqual(self.motor.rad_per_sec(), expected_rad_s, places=2)

    def test_power_watts(self):
        """测试功率计算：12V * 15.5A = 186.0W"""
        expected_power = 186.0
        self.assertAlmostEqual(self.motor.power_watts(12.0), expected_power, places=2)

    def test_is_overloaded(self):
        """测试过流保护判断（使用 assertTrue / assertFalse）"""
        # 当前电流 15.5A，未超过 20.0A 阈值，应判定为 False
        self.assertFalse(self.motor.is_overloaded(max_current=20.0))
        # 当阈值降到 10.0A 时，应判定为超载 True
        self.assertTrue(self.motor.is_overloaded(max_current=10.0))


if __name__ == "__main__":
    unittest.main()
```

## 4 高阶函数与匿名函数

### 4.1 高阶函数

高阶函数是指**接收函数作为参数**，或者**返回一个函数**的函数。在 Python 中函数是“一等公民”——它可以像普通变量一样被赋值、传递和返回。

以下是三个常用的内置高阶函数，它们的共同点是：把“做什么”交给外部传入的函数来决定。

```python
imu_data = [-0.3, 12.5, 0.0, 8.8, -1.1]

# 1. sorted 的 key 接收一个函数，用来决定“按什么排序”
print(sorted(imu_data, key=abs))         # 按绝对值升序: [0.0, -0.3, -1.1, 8.8, 12.5]

# 2. map：对序列的每个元素套用同一个函数
print(list(map(abs, imu_data)))          # [0.3, 12.5, 0.0, 8.8, 1.1]

# 3. filter：只保留让函数返回 True 的元素
def is_valid(x):
    return x != 0.0

print(list(filter(is_valid, imu_data)))  # [-0.3, 12.5, 8.8, -1.1]
```

我们也可以自己编写高阶函数：

```python
def apply_twice(func, x):
    """将同一个函数连续作用两次"""
    return func(func(x))

print(apply_twice(abs, -5))  # abs(abs(-5)) = 5
```

| 内置高阶函数 | 作用 | 接收的函数 |
| :--- | :--- | :--- |
| `map(func, iter)` | 对每个元素套用 `func`，返回迭代器 | 一元函数 |
| `filter(func, iter)` | 保留使 `func` 返回 `True` 的元素 | 判定函数 |
| `sorted(iter, key=func)` | 按 `func` 的返回值排序 | 取键函数 |
| `max(iter, key=func)` / `min(iter, key=func)` | 按 `func` 的返回值取最大 / 最小 | 取键函数 |


### 4.2 匿名函数 `lambda`

匿名函数使代码更加紧凑。以下两种写法等价：

```python
def sum(a, b):
    return a + b

lambda a, b: a + b
```
