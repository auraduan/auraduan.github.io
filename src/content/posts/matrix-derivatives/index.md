---
title: "矩阵的导数运算与相关公式"
description: "统一采用分母布局，用「求微分 → 写成迹 → 读出导数」三步套路推导矩阵求导，并汇总四类导数的常用公式与最小二乘等应用。"
publishedAt: 2026-09-22
category: "数学"
tags: ["数学", "矩阵", "微积分", "机器学习"]
cover: "./cover.jpg"
coverAspect: "16:9"
draft: false
toc: true
math: true
---

## 1 一般形式

### 1.1 标量方程对向量的导数

记 $\mathbf{y} = \begin{bmatrix} y_1 \\ y_2 \\ \vdots \\ y_m \end{bmatrix}$ ，有函数 $f(\mathbf{y})$，那么
$$
\frac{\partial f(\mathbf{y})}{\partial \mathbf{y}}
=
\begin{bmatrix}
    \frac{\partial}{\partial y_1} f(\mathbf{y}) \\
    \frac{\partial}{\partial y_2} f(\mathbf{y}) \\
    \vdots \\
    \frac{\partial}{\partial y_m} f(\mathbf{y})
\end{bmatrix} \tag{1}
$$
$$
\frac{\partial f(\mathbf{y})}{\partial \mathbf{y}^T}
=
\begin{bmatrix}
    \frac{\partial}{\partial y_1} f(\mathbf{y}) &
    \frac{\partial}{\partial y_2} f(\mathbf{y}) &
    \cdots &
    \frac{\partial}{\partial y_m} f(\mathbf{y})
\end{bmatrix} \tag{2}
$$

我们称式（1）为**分母布局（Denominator Layout）**，式（2）为**分子布局（Numerator Layout）**，后文基于分母布局展开。注意式（2）的记号写作 $\frac{\partial f(\mathbf{y})}{\partial \mathbf{y}^T}$ ，以与式（1）区分。

两种布局的结果互为转置，换算规则为
$$
\left. \frac{\partial f}{\partial \mathbf{y}} \right|_{\text{分子布局}}
= \left( \left. \frac{\partial f}{\partial \mathbf{y}} \right|_{\text{分母布局}} \right)^T
$$
因此引用其它文献中的公式前，务必先确认其所采用的布局约定。

### 1.2 向量方程对向量的导数

设
$$
\mathbf{f}(\mathbf{y}) =
\begin{bmatrix}
    f_1(\mathbf{y}) \\
    f_2(\mathbf{y}) \\
    \vdots \\
    f_n(\mathbf{y})
\end{bmatrix}
,
\quad
\mathbf{y} =
\begin{bmatrix}
    y_1 \\
    y_2 \\
    \vdots \\
    y_m
\end{bmatrix}
$$
为书写简洁，以下省略函数记号中的自变量 $\mathbf{y}$ ，即以 $f_j$ 代替 $f_j(\mathbf{y})$ 。那么
$$
\frac{\partial}{\partial \mathbf{y}} \mathbf{f} =
\begin{bmatrix}
    \frac{\partial}{\partial y_1} \mathbf{f} \\
    \frac{\partial}{\partial y_2} \mathbf{f} \\
    \vdots \\
    \frac{\partial}{\partial y_m} \mathbf{f}
\end{bmatrix} =
\begin{bmatrix}
    \frac{\partial f_1}{\partial y_1} & \frac{\partial f_2}{\partial y_1} & \cdots & \frac{\partial f_n}{\partial y_1} \\
    \frac{\partial f_1}{\partial y_2} & \frac{\partial f_2}{\partial y_2} & \cdots & \frac{\partial f_n}{\partial y_2} \\
    \vdots & \vdots & \ddots & \vdots \\
    \frac{\partial f_1}{\partial y_m} & \frac{\partial f_2}{\partial y_m} & \cdots & \frac{\partial f_n}{\partial y_m}
\end{bmatrix} \tag{3}
$$

该矩阵为 $m \times n$ 矩阵，即**雅可比矩阵（Jacobian）的转置**，$\left(\frac{\partial \mathbf{f}}{\partial \mathbf{y}}\right)_{ij} = \frac{\partial f_j}{\partial y_i}$ 。若采用分子布局，则对应 $n \times m$ 的雅可比矩阵 $\mathbf{J}$ ，其元素为 $\mathbf{J}_{ij} = \frac{\partial f_i}{\partial y_j}$ 。

### 1.3 标量方程对矩阵的导数

设 $\mathbf{X} = (x_{ij})_{m \times n}$ ，有标量函数 $f(\mathbf{X})$ ，那么
$$
\frac{\partial f(\mathbf{X})}{\partial \mathbf{X}} =
\begin{bmatrix}
    \frac{\partial f}{\partial x_{11}} & \frac{\partial f}{\partial x_{12}} & \cdots & \frac{\partial f}{\partial x_{1n}} \\
    \frac{\partial f}{\partial x_{21}} & \frac{\partial f}{\partial x_{22}} & \cdots & \frac{\partial f}{\partial x_{2n}} \\
    \vdots & \vdots & \ddots & \vdots \\
    \frac{\partial f}{\partial x_{m1}} & \frac{\partial f}{\partial x_{m2}} & \cdots & \frac{\partial f}{\partial x_{mn}}
\end{bmatrix}
\tag{4}
$$
即 $\left(\frac{\partial f}{\partial \mathbf{X}}\right)_{ij} = \frac{\partial f}{\partial x_{ij}}$ ，在分母布局下导数与 $\mathbf{X}$ **同形**（$m \times n$）；分子布局下则为其转置。

由式（4）可写出全微分
$$
\mathrm{d}f = \sum_{i=1}^{m}\sum_{j=1}^{n} \frac{\partial f}{\partial x_{ij}} \,\mathrm{d}x_{ij}
= \mathrm{tr}\left[ \left( \frac{\partial f}{\partial \mathbf{X}} \right)^T \mathrm{d}\mathbf{X} \right]
\tag{5}
$$
式（5）是矩阵求导的核心枢纽：只要能把 $\mathrm{d}f$ 整理成 $\mathrm{tr}(\mathbf{A}^T \mathrm{d}\mathbf{X})$ 的形式，就立即有 $\frac{\partial f}{\partial \mathbf{X}} = \mathbf{A}$ 。

### 1.4 矩阵方程对标量的导数

设 $\mathbf{F}(x) = (F_{ij}(x))_{m \times n}$ ，则逐元素求导，结果与 $\mathbf{F}$ 同形：
$$
\left( \frac{\partial \mathbf{F}}{\partial x} \right)_{ij} = \frac{\partial F_{ij}}{\partial x}
\tag{6}
$$

### 1.5 四类导数汇总

| 类型 | 记号 | 形状（分母布局） | 元素 |
| --- | --- | --- | --- |
| 标量对向量 | $\frac{\partial f}{\partial \mathbf{x}}$ ，$\mathbf{x} \in \mathbb{R}^n$ | $n \times 1$ | $\frac{\partial f}{\partial x_i}$ |
| 向量对向量 | $\frac{\partial \mathbf{f}}{\partial \mathbf{x}}$ ，$\mathbf{f} \in \mathbb{R}^m$ | $m \times n$ | $\frac{\partial f_j}{\partial x_i}$ |
| 标量对矩阵 | $\frac{\partial f}{\partial \mathbf{X}}$ ，$\mathbf{X} \in \mathbb{R}^{m \times n}$ | $m \times n$ | $\frac{\partial f}{\partial x_{ij}}$ |
| 矩阵对标量 | $\frac{\partial \mathbf{F}}{\partial x}$ ，$\mathbf{F} \in \mathbb{R}^{m \times n}$ | 与 $\mathbf{F}$ 同形 | $\frac{\partial F_{ij}}{\partial x}$ |

一句话记忆：**分母（自变量）的指标走行，分子（因变量）的指标走列**；标量没有指标，故对标量求导时直接与另一侧同形。

另外，本表只讨论这四类基本情形。矩阵对矩阵的逐元素导数虽可在形式上写出四维数组，但不便使用，实际中一般先用 3.6 节的 $\mathrm{vec}$ 算子把它转化为向量对向量的问题。

## 2 微分法与迹（Trace）技巧

### 2.1 微分的定义

$$
f(\mathbf{X} + \mathrm{d}\mathbf{X}) - f(\mathbf{X}) = \mathrm{d}f + o(\|\mathrm{d}\mathbf{X}\|)
\tag{7}
$$
其中 $\mathrm{d}f$ 是 $\mathrm{d}\mathbf{X}$ 的**线性**部分。矩阵微分在形式上就是对矩阵的每个元素分别微分，再按原位置写成矩阵，故其运算规则与标量微分一致，其中最常用的两条是：

- **乘积法则**：$\mathrm{d}(\mathbf{X}\mathbf{Y}) = (\mathrm{d}\mathbf{X})\mathbf{Y} + \mathbf{X}(\mathrm{d}\mathbf{Y})$
- **微分形式不变性**：可直接对中间变量微分，故链式求导无需另行展开

### 2.2 常用微分公式

| $f$ | $\mathrm{d}f$ |
| --- | --- |
| $\mathbf{A}$（常数矩阵） | $\mathbf{0}$ |
| $a\mathbf{X} + b\mathbf{Y}$ | $a\,\mathrm{d}\mathbf{X} + b\,\mathrm{d}\mathbf{Y}$ |
| $\mathbf{X}^T$ | $(\mathrm{d}\mathbf{X})^T$ |
| $\mathbf{X}\mathbf{Y}$ | $(\mathrm{d}\mathbf{X})\mathbf{Y} + \mathbf{X}(\mathrm{d}\mathbf{Y})$ |
| $\mathbf{X}^{-1}$ | $-\mathbf{X}^{-1}(\mathrm{d}\mathbf{X})\mathbf{X}^{-1}$ |
| $\mathbf{X} \odot \mathbf{Y}$ | $\mathrm{d}\mathbf{X} \odot \mathbf{Y} + \mathbf{X} \odot \mathrm{d}\mathbf{Y}$ |
| $\sigma(\mathbf{X})$（逐元素） | $\sigma'(\mathbf{X}) \odot \mathrm{d}\mathbf{X}$ |
| $\mathrm{tr}(\mathbf{X})$ | $\mathrm{tr}(\mathrm{d}\mathbf{X})$ |
| $\det(\mathbf{X})$ | $\det(\mathbf{X})\,\mathrm{tr}(\mathbf{X}^{-1}\mathrm{d}\mathbf{X})$ |
| $\ln\det(\mathbf{X})$ | $\mathrm{tr}(\mathbf{X}^{-1}\mathrm{d}\mathbf{X})$ |
| $\mathbf{a}^T\mathbf{X}\mathbf{b}$ | $\mathbf{a}^T(\mathrm{d}\mathbf{X})\mathbf{b} = \mathrm{tr}(\mathbf{b}\mathbf{a}^T\mathrm{d}\mathbf{X})$ |

其中 $\odot$ 为 **Hadamard 积**（逐元素乘积），$\sigma(\cdot)$ 为逐元素作用的一元函数，$\sigma'(\cdot)$ 为其导数。

### 2.3 迹（Trace）技巧

1. 标量的迹等于自身：$a = \mathrm{tr}(a)$
2. 线性：$\mathrm{tr}(\mathbf{A} + \mathbf{B}) = \mathrm{tr}(\mathbf{A}) + \mathrm{tr}(\mathbf{B})$
3. 转置不变：$\mathrm{tr}(\mathbf{A}^T) = \mathrm{tr}(\mathbf{A})$
4. 轮换：$\mathrm{tr}(\mathbf{A}\mathbf{B}) = \mathrm{tr}(\mathbf{B}\mathbf{A})$ ，$\mathrm{tr}(\mathbf{A}\mathbf{B}\mathbf{C}) = \mathrm{tr}(\mathbf{B}\mathbf{C}\mathbf{A}) = \mathrm{tr}(\mathbf{C}\mathbf{A}\mathbf{B})$
5. 内积形式：$\mathrm{tr}(\mathbf{A}^T\mathbf{B}) = \mathrm{tr}(\mathbf{B}^T\mathbf{A}) = \sum_{i,j} A_{ij}B_{ij}$
6. 与外积：$\mathbf{a}^T\mathbf{X}\mathbf{b} = \mathrm{tr}(\mathbf{b}\mathbf{a}^T\mathbf{X})$
7. 与 Hadamard 积：$\mathrm{tr}\left[\mathbf{A}^T(\mathbf{B} \odot \mathbf{C})\right] = \mathrm{tr}\left[(\mathbf{A} \odot \mathbf{B})^T\mathbf{C}\right]$

### 2.4 微分法求导的一般步骤

1. 求 $\mathrm{d}f$ （套用 2.2 中的公式展开）；
2. 用 2.3 的技巧把结果整理为 $\mathrm{d}f = \mathrm{tr}(\mathbf{A}^T \mathrm{d}\mathbf{X})$ ：先用技巧 1 把标量形式的项写成迹，再用技巧 4 把 $\mathrm{d}\mathbf{X}$ 轮换到最右侧，从而“读出” $\mathbf{A}$ ；其中 $\mathbf{A}$ 与 $\mathbf{X}$ 同形且不含 $\mathrm{d}\mathbf{X}$ ；
3. 对照式（5）即得 $\frac{\partial f}{\partial \mathbf{X}} = \mathbf{A}$ 。

若自变量是向量 $\mathbf{x}$ ，则结论退化为 $\mathrm{d}f = \mathbf{A}^T \mathrm{d}\mathbf{x} \Rightarrow \frac{\partial f}{\partial \mathbf{x}} = \mathbf{A}$ ，步骤完全相同。

**例** 求 $f = \mathrm{tr}(\mathbf{A}\mathbf{X}\mathbf{B})$ 对 $\mathbf{X}$ 的导数：
$$
\mathrm{d}f = \mathrm{tr}(\mathbf{A}\,\mathrm{d}\mathbf{X}\,\mathbf{B})
= \mathrm{tr}(\mathbf{B}\mathbf{A}\,\mathrm{d}\mathbf{X})
= \mathrm{tr}\left[ (\mathbf{A}^T\mathbf{B}^T)^T \mathrm{d}\mathbf{X} \right]
\quad \Longrightarrow \quad
\frac{\partial f}{\partial \mathbf{X}} = \mathbf{A}^T\mathbf{B}^T
$$

## 3 常用公式速查

以下公式均按分母布局给出，且无需证明，可直接查用。

### 3.1 标量对向量

设 $\mathbf{x} \in \mathbb{R}^n$ ，$\mathbf{a}, \mathbf{b}, \mathbf{y} \in \mathbb{R}^n$ ，$\mathbf{A} \in \mathbb{R}^{n \times n}$ ，$\mathbf{y}$ 与 $\mathbf{x}$ 无关，结果均为 $n \times 1$ 列向量（与 $\mathbf{x}$ 同形）。

| $f(\mathbf{x})$ | $\frac{\partial f}{\partial \mathbf{x}}$ |
| --- | --- |
| $\mathbf{a}^T\mathbf{x}$ 或 $\mathbf{x}^T\mathbf{a}$ | $\mathbf{a}$ |
| $\mathbf{x}^T\mathbf{x}$ | $2\mathbf{x}$ |
| $\mathbf{x}^T\mathbf{A}\mathbf{x}$ | $(\mathbf{A} + \mathbf{A}^T)\mathbf{x}$ |
| $\mathbf{x}^T\mathbf{A}\mathbf{x}$ （$\mathbf{A}$ 对称） | $2\mathbf{A}\mathbf{x}$ |
| $\frac{1}{2}\mathbf{x}^T\mathbf{A}\mathbf{x} - \mathbf{b}^T\mathbf{x}$ （$\mathbf{A}$ 对称） | $\mathbf{A}\mathbf{x} - \mathbf{b}$ |
| $\mathbf{x}^T\mathbf{A}\mathbf{y}$ （对 $\mathbf{x}$ 求导） | $\mathbf{A}\mathbf{y}$ |
| $(\mathbf{x} - \mathbf{a})^T(\mathbf{x} - \mathbf{a})$ | $2(\mathbf{x} - \mathbf{a})$ |
| $(\mathbf{A}\mathbf{x} - \mathbf{b})^T(\mathbf{A}\mathbf{x} - \mathbf{b})$ | $2\mathbf{A}^T(\mathbf{A}\mathbf{x} - \mathbf{b})$ |
| $\ln(\mathbf{a}^T\mathbf{x})$ | $\dfrac{\mathbf{a}}{\mathbf{a}^T\mathbf{x}}$ |

注：$\ln$ 一行要求 $\mathbf{a}^T\mathbf{x} > 0$ 。

### 3.2 向量对向量

设 $\mathbf{x} \in \mathbb{R}^n$ ，$\mathbf{f}(\mathbf{x}) \in \mathbb{R}^m$ ，$\mathbf{y}$ 与 $\mathbf{x}$ 无关，结果均为 $m \times n$ 矩阵。

| $\mathbf{f}(\mathbf{x})$ | $\frac{\partial \mathbf{f}}{\partial \mathbf{x}}$ |
| --- | --- |
| $\mathbf{x}$ | $\mathbf{I}_n$ |
| $\mathbf{A}\mathbf{x}$ | $\mathbf{A}^T$ |
| $\mathbf{A}\mathbf{x} + \mathbf{b}$ | $\mathbf{A}^T$ |
| $\mathbf{x}^T\mathbf{A}$ | $\mathbf{A}$ |
| $\mathbf{x} \odot \mathbf{y}$ | $\mathrm{diag}(\mathbf{y})$ |

注：$\mathbf{x}^T\mathbf{A}$ 一行中的函数取值为行向量，此处仍按分量逐一处理，即 $\frac{\partial (\mathbf{x}^T\mathbf{A})_j}{\partial x_i} = A_{ij}$ ，故结果为 $\mathbf{A}$ 。

**链式法则**：若 $\mathbf{u} = \mathbf{u}(\mathbf{x})$ ，$\mathbf{v} = \mathbf{v}(\mathbf{u})$ ，则
$$
\frac{\partial \mathbf{v}}{\partial \mathbf{x}} = \frac{\partial \mathbf{u}}{\partial \mathbf{x}} \cdot \frac{\partial \mathbf{v}}{\partial \mathbf{u}}
\tag{8}
$$
即分母布局下，链式求导就是按顺序直接相乘，无需转置。

### 3.3 标量对矩阵

设 $\mathbf{X} \in \mathbb{R}^{m \times n}$ ，其余矩阵为适当维数的常数矩阵，结果均与 $\mathbf{X}$ 同形。

| $f(\mathbf{X})$ | $\frac{\partial f}{\partial \mathbf{X}}$ |
| --- | --- |
| $\mathbf{a}^T\mathbf{X}\mathbf{b}$ | $\mathbf{a}\mathbf{b}^T$ |
| $\mathbf{a}^T\mathbf{X}^T\mathbf{b}$ | $\mathbf{b}\mathbf{a}^T$ |
| $\mathrm{tr}(\mathbf{A}\mathbf{X})$ | $\mathbf{A}^T$ |
| $\mathrm{tr}(\mathbf{X}^T\mathbf{A})$ | $\mathbf{A}$ |
| $\mathrm{tr}(\mathbf{A}\mathbf{X}\mathbf{B})$ | $\mathbf{A}^T\mathbf{B}^T$ |
| $\mathrm{tr}(\mathbf{X}^T\mathbf{X})$ | $2\mathbf{X}$ |
| $\mathrm{tr}(\mathbf{X}^T\mathbf{A}\mathbf{X})$ | $(\mathbf{A} + \mathbf{A}^T)\mathbf{X}$ |
| $\mathrm{tr}(\mathbf{X}\mathbf{A}\mathbf{X}^T)$ | $\mathbf{X}(\mathbf{A} + \mathbf{A}^T)$ |
| $\mathrm{tr}(\mathbf{A}\mathbf{X}\mathbf{B}\mathbf{X}^T)$ | $\mathbf{A}^T\mathbf{X}\mathbf{B}^T + \mathbf{A}\mathbf{X}\mathbf{B}$ |
| $\mathrm{tr}(\mathbf{X}^{-1}\mathbf{A})$ | $-(\mathbf{X}^{-1}\mathbf{A}\mathbf{X}^{-1})^T$ |
| $\mathrm{tr}(\mathbf{X}^{-1})$ | $-(\mathbf{X}^{-1}\mathbf{X}^{-1})^T$ |
| $\det(\mathbf{X})$ | $\det(\mathbf{X})(\mathbf{X}^{-1})^T$ |
| $\ln\det(\mathbf{X})$ | $(\mathbf{X}^{-1})^T$ |
| $\mathrm{tr}\left[(\mathbf{A}\mathbf{X} - \mathbf{B})^T(\mathbf{A}\mathbf{X} - \mathbf{B})\right]$ | $2\mathbf{A}^T(\mathbf{A}\mathbf{X} - \mathbf{B})$ |
| $\mathrm{tr}\left[(\mathbf{A}\mathbf{X}\mathbf{B} - \mathbf{C})^T(\mathbf{A}\mathbf{X}\mathbf{B} - \mathbf{C})\right]$ | $2\mathbf{A}^T(\mathbf{A}\mathbf{X}\mathbf{B} - \mathbf{C})\mathbf{B}^T$ |

两点补充：

- 含 $\mathbf{X}^{-1}$ 的式子要求 $\mathbf{X}$ 可逆，含 $\ln\det$ 的要求还须 $\det(\mathbf{X}) > 0$ ；
- 转置关系：$\frac{\partial f}{\partial \mathbf{X}^T} = \left(\frac{\partial f}{\partial \mathbf{X}}\right)^T$ ，这正是式（1）与式（2）所述两种布局的换算规则在矩阵情形的体现。

### 3.4 矩阵对标量

设 $\mathbf{X}(x)$ 、$\mathbf{Y}(x)$ 、$\mathbf{F}(x)$ 为矩阵函数，$\sigma(\cdot)$ 为逐元素函数，结果均与被求导矩阵同形；为简洁，以下把 $\frac{\partial \mathbf{X}}{\partial x}$ 记作 $\dot{\mathbf{X}}$ 。

| $\mathbf{F}(x)$ | $\frac{\partial \mathbf{F}}{\partial x}$ |
| --- | --- |
| $\mathbf{X}\mathbf{Y}$ | $\dot{\mathbf{X}}\mathbf{Y} + \mathbf{X}\dot{\mathbf{Y}}$ |
| $\mathbf{X}^{-1}$ | $-\mathbf{X}^{-1}\dot{\mathbf{X}}\mathbf{X}^{-1}$ |
| $\mathrm{tr}(\mathbf{X})$ | $\mathrm{tr}(\dot{\mathbf{X}})$ |
| $\det(\mathbf{X})$ | $\det(\mathbf{X})\,\mathrm{tr}(\mathbf{X}^{-1}\dot{\mathbf{X}})$ |
| $\sigma(\mathbf{X})$ | $\sigma'(\mathbf{X}) \odot \dot{\mathbf{X}}$ |

### 3.5 二阶导数（Hessian 矩阵）

对 $f(\mathbf{x})$ ，Hessian 矩阵定义为
$$
\mathbf{H}(\mathbf{x}) = \frac{\partial^2 f}{\partial \mathbf{x}\, \partial \mathbf{x}^T},
\qquad \mathbf{H}_{ij} = \frac{\partial^2 f}{\partial x_i \partial x_j}
\tag{9}
$$
即对梯度 $\frac{\partial f}{\partial \mathbf{x}}$ （列向量）再按分母布局求一次导，故 $\mathbf{H}$ 为 $n \times n$ 矩阵；若 $f$ 二阶连续可微，则 $\mathbf{H}$ 对称。

- $f = \mathbf{x}^T\mathbf{A}\mathbf{x}$ ：$\mathbf{H} = \mathbf{A} + \mathbf{A}^T$ ；若 $\mathbf{A}$ 对称，则 $\mathbf{H} = 2\mathbf{A}$
- $f = \frac{1}{2}\mathbf{x}^T\mathbf{A}\mathbf{x} - \mathbf{b}^T\mathbf{x}$ （$\mathbf{A}$ 对称）：$\dfrac{\partial f}{\partial \mathbf{x}} = \mathbf{A}\mathbf{x} - \mathbf{b}$ ，$\mathbf{H} = \mathbf{A}$

### 3.6 向量化（vec）与 Kronecker 积

设 $\mathrm{vec}(\mathbf{X})$ 表示把矩阵 $\mathbf{X}$ 按**列**依次堆叠成的长向量，$\otimes$ 为 Kronecker 积，则
$$
\mathrm{tr}(\mathbf{A}^T\mathbf{B}) = \mathrm{vec}(\mathbf{A})^T \mathrm{vec}(\mathbf{B}),
\qquad
\mathrm{vec}(\mathbf{A}\mathbf{X}\mathbf{B}) = (\mathbf{B}^T \otimes \mathbf{A})\,\mathrm{vec}(\mathbf{X})
\tag{10}
$$

利用式（10）可以把矩阵求导转化为标准的向量求导。例如 $\mathrm{vec}(\mathbf{A}\mathbf{X}\mathbf{B})$ 对 $\mathrm{vec}(\mathbf{X})$ 的导数，在分子布局下为
$$
\frac{\partial\, \mathrm{vec}(\mathbf{A}\mathbf{X}\mathbf{B})}{\partial\, \mathrm{vec}(\mathbf{X})} = \mathbf{B}^T \otimes \mathbf{A}
$$
按 1.1 节的换算规则取转置，即得本文分母布局下的结果 $\mathbf{B} \otimes \mathbf{A}^T$ 。

## 4 常用结论与应用

### 4.1 最小二乘

设设计矩阵 $\mathbf{X} \in \mathbb{R}^{N \times n}$ ，参数 $\boldsymbol\beta \in \mathbb{R}^n$ ，观测 $\mathbf{y} \in \mathbb{R}^N$ （$N$ 为样本数）。平方损失
$$
f(\boldsymbol\beta) = (\mathbf{X}\boldsymbol\beta - \mathbf{y})^T(\mathbf{X}\boldsymbol\beta - \mathbf{y})
$$
由 3.1 节得
$$
\frac{\partial f}{\partial \boldsymbol\beta} = 2\mathbf{X}^T(\mathbf{X}\boldsymbol\beta - \mathbf{y})
$$
令其为零，得到**正规方程**
$$
\mathbf{X}^T\mathbf{X}\boldsymbol\beta = \mathbf{X}^T\mathbf{y}
$$

### 4.2 岭回归

在平方损失上加正则项 $\lambda \boldsymbol\beta^T\boldsymbol\beta$ （$\lambda > 0$），可得
$$
(\mathbf{X}^T\mathbf{X} + \lambda\mathbf{I})\boldsymbol\beta = \mathbf{X}^T\mathbf{y}
$$

### 4.3 逻辑回归

设 $\mathbf{z} = \mathbf{X}\boldsymbol\beta$ ，$\mathbf{y} \in \{0,1\}^N$ 为标签向量，$\boldsymbol\sigma(\mathbf{z})$ 为逐元素 Sigmoid 函数，则负对数似然的梯度与 Hessian 为
$$
\frac{\partial L}{\partial \boldsymbol\beta} = \mathbf{X}^T\left(\boldsymbol\sigma(\mathbf{z}) - \mathbf{y}\right),
\qquad
\mathbf{H} = \mathbf{X}^T \mathrm{diag}\left(\boldsymbol\sigma(\mathbf{z}) \odot (\mathbf{1} - \boldsymbol\sigma(\mathbf{z}))\right)\mathbf{X}
$$

### 4.4 多元高斯分布的对数似然

设样本 $\mathbf{x}_1, \dots, \mathbf{x}_N \in \mathbb{R}^n$ 来自 $p = \mathcal{N}(\boldsymbol\mu, \boldsymbol\Sigma)$ ，并记
$$
\mathbf{S} = \sum_{i=1}^{N}(\mathbf{x}_i - \boldsymbol\mu)(\mathbf{x}_i - \boldsymbol\mu)^T
$$
对精度矩阵 $\mathbf{P} = \boldsymbol\Sigma^{-1}$ 求导：
$$
\frac{\partial \ln p}{\partial \mathbf{P}} = \frac{1}{2}\boldsymbol\Sigma - \frac{1}{2}\mathbf{S}^T
$$
令其为零。由于 $\mathbf{S}$ 对称，极大似然估计为 $\hat{\boldsymbol\Sigma} = \mathbf{S}$ 。（此处设 $\boldsymbol\mu$ 已知；若 $\boldsymbol\mu$ 也需估计，上式中的 $\boldsymbol\mu$ 换成样本均值即可。）

## 5 小结

1. **布局先行**：本文统一采用分母布局，即**分母（自变量）的指标定行，分子（因变量）的指标定列**，两种布局的结果互为转置（1.1 节）；引用其它文献的公式前先确认其布局约定。
2. **一般形式**：见 1.5 节汇总表——$\frac{\partial f}{\partial \mathbf{x}}$ 为列向量，$\frac{\partial \mathbf{f}}{\partial \mathbf{x}}$ 为 $m \times n$ 矩阵（Jacobian 的转置），$\frac{\partial f}{\partial \mathbf{X}}$ 与 $\mathbf{X}$ 同形，$\frac{\partial \mathbf{F}}{\partial x}$ 与 $\mathbf{F}$ 同形。
3. **实用套路**：绝大多数公式都可由“**求微分 → 写成迹 → 读出导数**”三步得到，参见式（5）与 2.4 节。

> 本文章仅为学习用途。不构成学术或工程建议。
