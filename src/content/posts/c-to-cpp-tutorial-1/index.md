---
title: "C 转 C++ 简明教程（1）"
description: "从 VS Code + MinGW 环境配置讲起：C++ 程序框架与 cin/cout、基本数据类型与修饰符、typedef 与 enum、类型转换、变量与 extern 跨文件、常量与运算符。"
publishedAt: 2026-11-01
category: "信息技术"
tags: ["C++", "C", "语法", "笔记"]
collection: "cpp-from-c"
collectionOrder: 1
draft: false
toc: true
math: false
---

> 本文是「C 转 C++」系列的第一篇，仍在完善中：标注「本节待补充」的小节尚未写完，后续会补上。

## 0 VS Code + C++ 环境配置

### 0.1 环境配置

1. 在 VS Code 侧面栏找到“拓展”，搜索 `c++`，然后点击安装。

2. 在终端中运行 `g++ --version`，检查是否已经有对应环境。若提示找不到命令，则环境未配置。

3. 在 [MSYS2官网](https://www.msys2.org/) 下载并安装 `msys2`，推荐安装到短目录，如 `D:\msys2`。

4. 在 MSYS2 终端下运行 `pacman -S --needed base-devel mingw-w64-ucrt-x86_64-toolchain`，安装对应工具链。

5. 将 MinGW 的 `bin` 文件夹添加到环境变量 `PATH` 中。

6. 在终端中运行 `g++ --version`，检查是否已经配置成功，成功情况下会打印出对应版本号。

### 0.2 运行简单的 C++ 文件

1. 新建一文件夹，在其中新建文件如 `example.cpp`

2. 编写完基本程序后，在该终端中运行 `g++ .\example.cpp -o .\example.exe`，生成 `example.exe` 之后，继续在终端运行 `.\example.exe`，即可运行。

3. 说明：指令 `g++ .\文件名.cpp -o .\任意名.exe` 即可。

## 1 基础的 C++ 程序框架

以下是一段经典的 C++ 程序：

```c++
#include <iostream>

using namespace std;

int main()
{
    int n;              // 单行注释
    cin >> n;
    cout << "Hello world!" << n << endl;

    /*
    多
    行
    注
    释
    */

    return 0;
}
```

现在一一讲解这一段程序：

- `#include <iostream>` 是头文件；
- `using namespace std;` 是告诉编译器使用 `std` 命名空间；
- `int main()` 与 `return 0` 和 C 语言一致，主函数与返回值；
- `int n` 定义了一个整型数据 `n`;
- `cin >> n;` 表示让用户输入，与 `scanf()` 等价；
- `cout << "Hello world!" << endl;` 是 C++ 的输出语句，与 `printf()` 等价，`endl` 是换行并刷新输出缓冲区的操纵符。

`std` 是一个比较新的概念，以下这段程序等价于上面的程序：

```c++
#include <iostream>

int main()
{
    int n;
    std::cin >> n;
    std::cout << "Hello world!" << n << std::endl;

    return 0;
}
```

> [!注意]
> `cout` 与 `cin` 的运算速度不如 `printf()` 与 `scanf()`，应当酌情选择。

另外，引入头文件时，以下方式等价：

- `#include <math.h>` 等价于 `#include <cmath>`；
- `#include <string.h>` 等价于 `#include <cstring>`；

即将 `.h` 删除，在开头加上 `c`。

## 2 数据类型

### 2.1 基本的数据类型

下表列出七种基本的 C++ 数据类型：

| 类型 | 关键字 | 取值范围 |
| -- | -- | -- |
| 整型 | `int` | -2,147,483,648 到 2,147,483,647 |
| 浮点型 | `float` | 约 1.2e-38 到 3.4e38（6-7 位有效数字） |
| 双精度浮点型 | `double` | 约 2.2e-308 到 1.7e308（15 位有效数字） |
| 布尔值 | `bool` | `true` 或 `false` |
| 无类型 | `void` | - |
| 字符型 | `char` | ASCII 字符 |
| 宽字符型 | `wchar_t` | 宽字符（Windows 为 UTF-16，Linux 为 UTF-32） |

以下是一些修饰符与限定符：

| 修饰符 / 限定符 | 描述                                    | 示例                      |
| -------- | -------------------------------------------- | ------------------------- |
| `signed`   | 表示有符号类型（默认）                       | `signed int x = -10;`     |
| `unsigned` | 表示无符号类型                               | `unsigned int y = 10;`   |
| `short`    | 表示短整型                                   | `short int z = 100;`     |
| `long`     | 表示长整型                                   | `long int a = 100000;`   |
| `const`    | 表示常量，值不可修改                         | `const int b = 5;`        |
| `volatile` | 表示变量可能被意外修改，禁止编译器优化       | `volatile int c = 10;`     |
| `mutable`  | 表示类成员可以在 const 对象中修改            | `mutable int counter;`    |

以下是一些其他的数据类型：

| 数据类型 | 描述                                               | 示例                                  |
| -------- | -------------------------------------------------- | ------------------------------------- |
| 数组     | 相同类型元素的集合                                 | `int arr[5] = {1, 2, 3, 4, 5};`         |
| 指针     | 存储变量内存地址的类型                             | `int* ptr = &x;`                        |
| 引用     | 变量的别名                                         | `int& ref = x;`                         |
| 函数     | 函数类型，表示函数的签名                           | `int func(int a, int b);`               |
| 结构体   | 用户定义的数据类型，可以包含多个不同类型的成员     | `struct Point { int x; int y; };`       |
| 类       | 用户定义的数据类型，支持封装、继承和多态           | `class MyClass { ... };`               |
| 联合体   | 多个成员共享同一块内存                             | `union Data { int i; float f; };`       |
| 枚举     | 用户定义的整数常量集合                             | `enum Color { RED, GREEN, BLUE };`      |

### 2.2 `typedef` 声明

我们可以使用 `typedef` 为当前已有的类型取一个新名字，标准语句是：

```c++
typedef type newname;
```

如：

```c++
typedef float xiaoshu;  // 给浮点型变量起别名 xiaoshu
xiaoshu a;      // 语句合法，等价于 float a;
```

### 2.3 `enum` 枚举类型

自定义一组具名的整数常量集合，用来限定变量只能取预设的几个值，可读性更好。以下是普通枚举的基础语法结构：

```c++
enum 枚举名
{ 
    标识符[=整型常数],  // 整型常数默认从 0 取
    标识符[=整型常数], 
    ... 
    标识符[=整型常数]
} 枚举变量;
```

例如：

```c++
// 定义枚举类型 Color
enum Color {
    RED,    // 默认 0
    GREEN,  // 1
    BLUE    // 2
};
// 或者
enum Color_1 {
    YELLOW = 10,
    BLACK,  // 自动=11
    PURPLE = 20
};
```

> 本节待补充：强类型枚举（`enum class`）。

### 2.4 类型转换

分为**隐式转换（自动）**和**显式转换（手动）**，显式转换包含 4 种 C++ 专用强制转换运算符，分别是静态转换、动态转换、常量转换与重新解释转换。

#### 2.4.1 隐式转换

```c++
int a = 10;
double b = a;   // int → double，隐式转换，安全

// 以下是可能的风险
double x = 3.99;
int y = x;      // 隐式，小数直接丢掉，y=3
```

#### 2.4.2 静态转换

通常用于**类型相似**的数据。运行时不进行数据类型检查，因此有可能导致运行错误：

```c++
int i = 10;
float f = static_cast<float>(i); // 静态将int类型转换为float类型
```

#### 2.4.3 动态转换

> 本节待补充。

#### 2.4.4 常量（`const`）转换

> 本节待补充。

#### 2.4.5 重新解释转换

> 本节待补充。

## 3 变量

定义一个变量：

```c++
int a = 5;
```

---

声明一个变量：

```c++
extern int a;
```

此时变量 `a` 被声明，未赋值，不占用内存空间。但是下列两个语句等价：

- `extern int a = 5` 等价于 `int a = 5`

---

**接下来详解 `extern`：**

给定场景：有三个文件，分别是 `a.cpp`、`a.h` 和 `main.cpp`。

**文件 1 `a.cpp`** 存放真正变量：

```c++
#include "a.h"

int g_num = 666; // 【定义】真实变量，内存在这里！全局只有这一处定义
```

**文件 2 `a.h`** 头文件：

```c++
#pragma once   // 防止头文件重复包含

extern int g_num; // extern 声明！！不会创建变量，只是告诉别人：有个g_num，在别的cpp
```

**文件 3 `main.cpp`** 使用全局变量：

```c++
#include <iostream>
#include "a.h"   // 引入头文件，就自动拿到 extern int g_num;

using namespace std;

int main()
{
    // 直接用g_num！！用的就是a.cpp里面的那个g_num，同一块内存
    cout << g_num << endl;  //输出666

    g_num = 999;  // 修改的是a.cpp里面的那个变量

    return 0;
}
```

**接下来演示跨文件修改变量：**

在 `a.cpp` 中：

```c++
#include <iostream>
#include "a.h"

using namespace std;

int g_num = 666;

void printA()
{
    cout << "a.cpp 里面 g_num = " << g_num << endl; //打印g_num
}
```

在 `main.cpp` 中：

```c++
#include <iostream>
#include "a.h"

void printA(); // 声明外部函数，函数extern可以省略

int main()
{
    std::cout << g_num << std::endl;
    g_num = 999;   // main里面修改

    printA(); //调用a.cpp的函数，输出 a.cpp里面g_num=999
    return 0;
}
```

## 4 常量

常量是固定的值，可以是任何类型的数据。

### 4.1 整数常量

可以是十进制、八进制或十六进制的常量。前缀指定基数：0x 或 0X 表示十六进制，0 表示八进制，不带前缀则默认表示十进制。

整数常量还可以带一个后缀，U（u, unsigned）是无符号整数、L（l, long）表示长整数。以下是一些案例：

```c++
85         // 十进制
0213       // 八进制 
0x4b       // 十六进制 
30         // 整数 
30u        // 无符号整数 
30l        // 长整数 
30ul       // 无符号长整数

212         // 合法的
215u        // 合法的
0xFeeL      // 合法的
078         // 非法的：8 不是八进制的数字
032UU       // 非法的：不能重复后缀
```

### 4.2 浮点常量

由整数部分、小数点、小数部分和指数部分组成。我们可以用小数形式或者指数形式来表示浮点常量。

- 当使用小数形式表示时，必须包含整数部分、小数部分，或同时包含两者。
- 当使用指数形式表示时，必须包含小数点、指数，或同时包含两者。带符号的指数是用 e 或 E 引入的

以下是一段案例：

```c++
3.14159       // 合法的 
314159E-5L    // 合法的 
510E          // 非法的：不完整的指数
210f          // 非法的：没有小数或指数
.e55          // 非法的：缺少整数或分数
```

### 4.3 布尔常量

即 `true` 和 `false`。

### 4.4 字符常量与转义

| 转义序列 | 含义 |
| ---- | ---- |
| `\\` | \ 字符 |
| `\'` | ' 字符 |
| `\"` | " 字符 |
| `\?` | ? 字符 |
| `\a` | 警报铃声 |
| `\b` | 退格键 |
| `\f` | 换页符 |
| `\n` | 换行符 |
| `\r` | 回车 |
| `\t` | 水平制表符 |
| `\v` | 垂直制表符 |
| `\ooo` | 一到三位的八进制数 |
| `\xhh...` | 一个或多个数字的十六进制数 |

### 4.5 字符串常量

字符串是包含在双引号 `""` 中的，一般是普通的字符、转义序列和通用的字符。也可以使用 `\` 作为分隔符，将很长的字符串进行分行。

以下是一段案例：

```c++
#include <iostream>
#include <string>
using namespace std;

int main() 
{
    string greeting = "hello, world";
    cout << greeting;
    cout << "\n";     // 换行符
    // 反斜杠续行只把两行拼起来，不删下一行的缩进，所以第二行要顶格写
    string greeting2 = "hello, \
world";
    cout << greeting2;
    return 0;
}
```

输出：

```text
hello, world
hello, world
```

### 4.6 定义一个常量

我们可以使用 `#define` 或 `const` 关键字来定义一个常量。

#### 4.6.1 **`define` 预处理**

以下是使用 `define` 的标准语法：

```c++
#define 常量名 值
```

以下是一段案例：

```c++
#include <iostream>
using namespace std;
 
#define LENGTH 10   
#define WIDTH  5
#define NEWLINE '\n'
 
int main()
{
 
   int area;  
   
   area = LENGTH * WIDTH;
   cout << area;
   cout << NEWLINE;
   return 0;
}
```

#### 4.6.2 **`const` 关键字**

以下是使用 `const` 的标准语法：

```c++
const 数据类型 常量名 = 值;
```

以下是一段案例：

```c++
#include <iostream>
using namespace std;
 
int main()
{
   const int  LENGTH = 10;
   const int  WIDTH  = 5;
   const char NEWLINE = '\n';
   int area;  
   
   area = LENGTH * WIDTH;
   cout << area;
   cout << NEWLINE;
   return 0;
}
```

> [!提示]
> 用大写字母来命名一个常量是不错的习惯。

## 5 修饰符与存储

> 本节待补充。

## 6 运算符

### 6.1 算术运算符

假设 `A = 10, B = 20`，那么：

| 运算符 | 描述 | 实例 |
| ---- | ---- | ---- |
| + | 把两个操作数相加 | A + B 将得到 30 |
| - | 从第一个操作数中减去第二个操作数 | A - B 将得到 -10 |
| * | 把两个操作数相乘 | A * B 将得到 200 |
| / | 分子除以分母 | B / A 将得到 2 |
| % | 取模运算符，整除后的余数 | B % A 将得到 0 |
| ++ | 自增运算符，整数值增加 1 | A++ 将得到 11 |
| -- | 自减运算符，整数值减少 1 | A-- 将得到 9 |

以下是一段案例：

```c++
#include <iostream>
using namespace std;
 
int main()
{
   int a = 21;
   int b = 10;
   int c;
 
   c = a + b;
   cout << "c 的值是 " << c << endl ; // 31
   c = a - b;
   cout << "c 的值是 " << c << endl ; // 11
   c = a * b;
   cout << "c 的值是 " << c << endl ; // 210
   c = a / b;
   cout << "c 的值是 " << c << endl ; // 2
   c = a % b;
   cout << "c 的值是 " << c << endl ; // 1
 
   int d = 10;   //  测试自增、自减
   c = d++;
   cout << "c 的值是 " << c << endl ; // 10
 
   d = 10;    // 重新赋值
   c = d--;
   cout << "c 的值是 " << c << endl ; // 10
   return 0;
}
```

### 6.2 关系运算符

假设 `A = 10, B = 100`，那么：

| 运算符 | 描述 | 实例 |
| ---- | ---- | ---- |
| == | 检查两个操作数的值是否相等，如果相等则条件为真。 | (A == B) 不为真。 |
| != | 检查两个操作数的值是否相等，如果不相等则条件为真。 | (A != B) 为真。 |
| > | 检查左操作数的值是否大于右操作数的值，如果是则条件为真。 | (A > B) 不为真。 |
| < | 检查左操作数的值是否小于右操作数的值，如果是则条件为真。 | (A < B) 为真。 |
| >= | 检查左操作数的值是否大于或等于右操作数的值，如果是则条件为真。 | (A >= B) 不为真。 |
| <= | 检查左操作数的值是否小于或等于右操作数的值，如果是则条件为真。 | (A <= B) 为真。 |

### 6.3 逻辑运算符——与、或、非

假设 `A = 1, B = 0`，那么：

| 运算符 | 描述 | 实例 |
| ---- | ---- | ---- |
| && | 逻辑与运算符。如果两个操作数都 true，则条件为 true。 | (A && B) 为 false。 |
| \|\| | 逻辑或运算符。如果两个操作数中有任意一个 true，则条件为 true。 | (A \|\| B) 为 true。 |
| ! | 逻辑非运算符。用来逆转操作数的逻辑状态，如果条件为 true 则逻辑非运算符将使其为 false。 | !(A && B) 为 true。 |

### 6.4 位运算符

> 本节待补充。

### 6.5 赋值运算符

| 运算符 | 描述 | 实例 |
| ---- | ---- | ---- |
| = | 简单的赋值运算符，把右边操作数的值赋给左边操作数 | C = A + B 将把 A + B 的值赋给 C |
| += | 加且赋值运算符，把右边操作数加上左边操作数的结果赋值给左边操作数 | C += A 相当于 C = C + A |
| -= | 减且赋值运算符，把左边操作数减去右边操作数的结果赋值给左边操作数 | C -= A 相当于 C = C - A |
| *= | 乘且赋值运算符，把右边操作数乘以左边操作数的结果赋值给左边操作数 | C *= A 相当于 C = C * A |
| /= | 除且赋值运算符，把左边操作数除以右边操作数的结果赋值给左边操作数 | C /= A 相当于 C = C / A |
| %= | 求模且赋值运算符，求两个操作数的模赋值给左边操作数 | C %= A 相当于 C = C % A |
| <<= | 左移且赋值运算符 | C <<= 2 等同于 C = C << 2 |
| >>= | 右移且赋值运算符 | C >>= 2 等同于 C = C >> 2 |
