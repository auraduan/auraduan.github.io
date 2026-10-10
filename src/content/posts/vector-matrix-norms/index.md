---
title: "向量与矩阵的范数"
description: "从范数的三条公理出发，梳理向量与矩阵常用范数的闭式、相容性与常用不等式，并附定义、性质、不等式三张速查表。"
publishedAt: 2026-09-23
category: "数学"
tags: ["数学", "线性代数", "范数", "矩阵"]
cover: "./cover.jpg"
coverAspect: "16:9"
draft: false
toc: true
math: true
---

## 0 结论与要点 (Conclusion & Key Points)

- **范数的三条公理**：非负性、齐次性、三角不等式。向量范数衡量“长度”，矩阵范数衡量“作用的放大倍数”；工程中常用的是向量的 $1$、$2$、$\infty$ 范数与矩阵的 $1$、$2$、$\infty$、Frobenius（F）范数。

- **矩阵 $1$、$2$、$\infty$ 范数是算子范数**：由相应向量范数诱导，满足**相容性（Submultiplicativity / Consistency）** $\|A\mathbf{x}\| \le \|A\|\,\|\mathbf{x}\|$ 与 $\|A\mathbf{B}\| \le \|A\|\,\|\mathbf{B}\|$；F 范数不是诱导范数，但同样满足这两条不等式。

- **计算闭式**：$1$ 范数取**最大列和**，$\infty$ 范数取**最大行和**，$2$ 范数（谱范数）取**最大奇异值**，F 范数为**全部元素平方和的平方根**（亦即 $\sqrt{\mathrm{tr}(\mathbf{A}^T\mathbf{A})}$ ）。

- **常用不等式**：Cauchy–Schwarz、Hölder、Minkowski 是向量侧的三大基石；矩阵侧则有 $\|A\|_2 \le \|A\|_F \le \sqrt{r}\,\|A\|_2$ 、$\|A\|_2 \le \sqrt{\|A\|_1\|A\|_\infty}$ 以及谱半径不超过任意相容范数等结论。

## 1 向量的范数

### 1.1 范数的定义

设 $V$ 是数域 $\mathbb{K}$（$\mathbb{R}$ 或 $\mathbb{C}$ ）上的线性空间。映射 $\|\cdot\| : V \to \mathbb{R}$ 称为 $V$ 上的**范数（Norm）**，若对任意 $\mathbf{x}, \mathbf{y} \in V$ 与标量 $\alpha \in \mathbb{K}$ ，满足

1. **非负性**：$\|\mathbf{x}\| \ge 0$ ，且 $\|\mathbf{x}\| = 0 \iff \mathbf{x} = \mathbf{0}$ ；
2. **齐次性**：$\|\alpha \mathbf{x}\| = |\alpha|\,\|\mathbf{x}\|$ ；
3. **三角不等式**（Minkowski 不等式）：$\|\mathbf{x} + \mathbf{y}\| \le \|\mathbf{x}\| + \|\mathbf{y}\|$ 。

赋范空间 $(V, \|\cdot\|)$ 中，两点距离定义为 $d(\mathbf{x}, \mathbf{y}) = \|\mathbf{x} - \mathbf{y}\|$ 。

### 1.2 常用向量范数（1、2、∞ 范数）

设 $\mathbf{x} = [x_1, x_2, \dots, x_n]^T \in \mathbb{K}^n$ 。

**（a）$1$ 范数（和范数 / 曼哈顿范数）**

$$
\|\mathbf{x}\|_1 = \sum_{i=1}^{n} |x_i|
\tag{1}
$$

**（b）$2$ 范数（欧几里得范数）**

$$
\|\mathbf{x}\|_2 = \sqrt{\sum_{i=1}^{n} |x_i|^2} = \sqrt{\mathbf{x}^H \mathbf{x}}
\tag{2}
$$

实向量时 $\mathbf{x}^H\mathbf{x} = \mathbf{x}^T\mathbf{x}$ ，即通常的“长度”。式（2）也常记作 $|\mathbf{x}|$ 或 $\|\mathbf{x}\|$ （省略下标时一般默认指 $2$ 范数）。

**（c）$\infty$ 范数（最大模范数 / 切比雪夫范数）**

$$
\|\mathbf{x}\|_\infty = \max_{1 \le i \le n} |x_i|
\tag{3}
$$

**（d）一般 $p$ 范数**

$$
\|\mathbf{x}\|_p = \left( \sum_{i=1}^{n} |x_i|^p \right)^{1/p}, \qquad 1 \le p < \infty
\tag{4}
$$

当 $p \ge 1$ 时式（4）满足全部范数公理；$p = 1, 2$ 即为式（1）、（2），且有极限 $\|\mathbf{x}\|_\infty = \lim_{p \to \infty} \|\mathbf{x}\|_p$ 。

复向量的内积与共轭转置记号：$\mathbf{x}^H = \bar{\mathbf{x}}^T$ ；下文若无特别说明，向量可为实或复，公式形式一致。

### 1.3 向量范数的比较与等价性

对任意 $\mathbf{x} \in \mathbb{K}^n$ ，有

$$
\|\mathbf{x}\|_\infty \le \|\mathbf{x}\|_2 \le \|\mathbf{x}\|_1 \le \sqrt{n}\,\|\mathbf{x}\|_2 \le n\,\|\mathbf{x}\|_\infty
\tag{5}
$$

以及

$$
\|\mathbf{x}\|_\infty \le \|\mathbf{x}\|_2 \le \sqrt{n}\,\|\mathbf{x}\|_\infty,
\qquad
\|\mathbf{x}\|_2 \le \|\mathbf{x}\|_1 \le \sqrt{n}\,\|\mathbf{x}\|_2
\tag{6}
$$

更一般地，**有限维空间上任意两种范数等价**：存在常数 $c_1, c_2 > 0$ （只依赖于维数与所选范数，与 $\mathbf{x}$ 无关），使得

$$
c_1 \|\mathbf{x}\|_a \le \|\mathbf{x}\|_b \le c_2 \|\mathbf{x}\|_a, \qquad \forall \mathbf{x} \in \mathbb{K}^n
\tag{7}
$$

因此有限维中“收敛、连续、有界”等概念与所取范数无关；但**不同范数的数值大小不同**，比较算法复杂度或误差界时必须写明范数。

注：

- 式（5）右端的 $\sqrt{n}$ 、 $n$ 均为**紧界**（可取等号的向量存在，如 $\mathbf{x} = \mathbf{1}$ 或只有一个非零分量的向量）；
- 某些文献把 $\|\mathbf{x}\|_2^2$（平方）称为能量，注意范数与平方范数的区分。

## 2 矩阵的范数

### 2.1 矩阵范数的定义与相容性

设 $\mathbf{A} \in \mathbb{K}^{m \times n}$ 。矩阵范数是定义在矩阵空间上的范数，除三条公理外，工程上还要求与向量乘法**相容**：

$$
\|\mathbf{A}\mathbf{B}\| \le \|\mathbf{A}\|\,\|\mathbf{B}\|
\quad (\text{方阵乘法}),
\qquad
\|\mathbf{A}\mathbf{x}\| \le \|\mathbf{A}\|\,\|\mathbf{x}\|
\tag{8}
$$

式（8）称为**次可乘性（Submultiplicativity）** 与 **向量相容性（Consistency）**。满足式（8）的范数也称**相容范数**。

算子范数自动满足式（8）；Frobenius 范数虽非诱导范数，也满足式（8）。

### 2.2 由向量范数诱导的算子范数

对给定的向量 $p$ 范数，矩阵的**算子范数（Operator Norm）/ 诱导范数（Induced Norm）**定义为

$$
\|\mathbf{A}\|_p
= \max_{\mathbf{x} \ne \mathbf{0}} \frac{\|\mathbf{A}\mathbf{x}\|_p}{\|\mathbf{x}\|_p}
= \max_{\|\mathbf{x}\|_p = 1} \|\mathbf{A}\mathbf{x}\|_p,
\qquad \mathbf{A} \in \mathbb{K}^{m \times n}
\tag{9}
$$

几何意义：单位球面 $\{\mathbf{x} : \|\mathbf{x}\|_p = 1\}$ 在映射 $\mathbf{x} \mapsto \mathbf{A}\mathbf{x}$ 下像集的最大“伸长倍数”。由定义直接得到

$$
\|\mathbf{A}\mathbf{x}\|_p \le \|\mathbf{A}\|_p \|\mathbf{x}\|_p
\tag{10}
$$

### 2.3 常用矩阵范数（1、2、∞、F 范数）

设 $\mathbf{A} = (a_{ij}) \in \mathbb{K}^{m \times n}$ ， $\mathbf{A}$ 的第 $j$ 列、第 $i$ 行分别记作 $\mathbf{a}_{:j}$ 、 $\mathbf{a}_{i:}$ 。

**（a）矩阵 $1$ 范数（列和范数）**

$$
\|\mathbf{A}\|_1 = \max_{1 \le j \le n} \sum_{i=1}^{m} |a_{ij}|
= \max_j \|\mathbf{a}_{:j}\|_1
\tag{11}
$$

即：先对每一列取 $1$ 范数，再取所有列中的最大值。由向量 $1$ 范数诱导。

**（b）矩阵 $\infty$ 范数（行和范数）**

$$
\|\mathbf{A}\|_\infty = \max_{1 \le i \le m} \sum_{j=1}^{n} |a_{ij}|
= \max_i \|\mathbf{a}_{i:}\|_1
\tag{12}
$$

即：先对每一行取 $1$ 范数，再取所有行中的最大值。由向量 $\infty$ 范数诱导。

**（c）矩阵 $2$ 范数（谱范数）**

$$
\|\mathbf{A}\|_2 = \max_{\|\mathbf{x}\|_2 = 1} \|\mathbf{A}\mathbf{x}\|_2
= \sigma_{\max}(\mathbf{A}) = \sqrt{\lambda_{\max}(\mathbf{A}^H\mathbf{A})}
\tag{13}
$$

其中 $\sigma_{\max}(\mathbf{A})$ 为 $\mathbf{A}$ 的**最大奇异值**， $\lambda_{\max}$ 为最大特征值。由向量 $2$ 范数诱导，是理论分析中最常用的矩阵范数。

**（d）Frobenius 范数（F 范数）**

$$
\|\mathbf{A}\|_F
= \sqrt{\sum_{i=1}^{m}\sum_{j=1}^{n} |a_{ij}|^2}
= \sqrt{\mathrm{tr}(\mathbf{A}^H \mathbf{A})}
= \|\mathrm{vec}(\mathbf{A})\|_2
\tag{14}
$$

其中 $\mathrm{vec}(\mathbf{A})$ 按列拉直。F 范数把矩阵视为长向量后的 $2$ 范数，**不是**由向量范数诱导的算子范数，但同样满足式（8）。

| 范数 | 记号 | 闭式 | 是否诱导范数 |
| --- | --- | --- | --- |
| $1$ 范数 | $\|\mathbf{A}\|_1$ | 最大列和 | 是（由 $\|\cdot\|_1$ 诱导） |
| $2$ 范数 | $\|\mathbf{A}\|_2$ | $\sigma_{\max}(\mathbf{A})$ | 是（由 $\|\cdot\|_2$ 诱导） |
| $\infty$ 范数 | $\|\mathbf{A}\|_\infty$ | 最大行和 | 是（由 $\|\cdot\|_\infty$ 诱导） |
| F 范数 | $\|\mathbf{A}\|_F$ | $\sqrt{\sum_{i,j}\lvert a_{ij}\rvert^2}$ | 否（但相容） |

### 2.4 谱范数与奇异值的进一步关系

设 $\mathbf{A}$ 的奇异值为 $\sigma_1 \ge \sigma_2 \ge \dots \ge \sigma_r > 0$ （ $r = \mathrm{rank}(\mathbf{A})$ ），则

$$
\|\mathbf{A}\|_2 = \sigma_1,
\qquad
\|\mathbf{A}\|_F = \sqrt{\sum_{k=1}^{r} \sigma_k^2}
\tag{15}
$$

且对奇异值分解 $\mathbf{A} = \mathbf{U}\boldsymbol{\Sigma}\mathbf{V}^H$ （ $\mathbf{U}, \mathbf{V}$ 列正交），有

$$
\|\mathbf{A}\|_2 = \|\boldsymbol{\Sigma}\|_2,
\qquad
\|\mathbf{A}\|_F = \|\boldsymbol{\Sigma}\|_F
\tag{16}
$$

方阵情形：

- $\mathbf{A}$ 可逆 $\iff \sigma_{\min}(\mathbf{A}) > 0 \iff \|\mathbf{A}^{-1}\|_2 < \infty$ （注意 $\|\mathbf{A}\|_2 = \sigma_{\max}(\mathbf{A}) > 0$ 只表明 $\mathbf{A} \ne \mathbf{O}$ ，不能作为可逆判据，如 $\mathrm{diag}(1, 0)$ 有 $\|\mathbf{A}\|_2 = 1$ 却不可逆）；
- 条件数 $\kappa_2(\mathbf{A}) = \dfrac{\sigma_{\max}(\mathbf{A})}{\sigma_{\min}(\mathbf{A})} = \|\mathbf{A}\|_2\|\mathbf{A}^{-1}\|_2$ ；
- $|\det(\mathbf{A})| = \prod_{k=1}^{n} \sigma_k \le \|\mathbf{A}\|_2^{\,n}$ 。

### 2.5 常用特殊矩阵的范数

设 $\mathbf{Q}$ 为酉矩阵 / 正交矩阵（ $\mathbf{Q}^H\mathbf{Q} = \mathbf{I}$ ），则

$$
\|\mathbf{Q}\|_2 = 1,
\qquad
\|\mathbf{Q}\|_F = \sqrt{n}
\quad (\mathbf{Q} \in \mathbb{K}^{n \times n})
\tag{17}
$$

对任意 $\mathbf{A}$ 与酉矩阵 $\mathbf{U}, \mathbf{V}$ （维数适当），

$$
\|\mathbf{U}\mathbf{A}\|_2 = \|\mathbf{A}\|_2 = \|\mathbf{A}\mathbf{V}\|_2,
\qquad
\|\mathbf{U}\mathbf{A}\mathbf{V}\|_F = \|\mathbf{A}\|_F
\tag{18}
$$

即 $2$ 范数与 F 范数都是**酉不变范数（Unitarily Invariant Norm）**——奇异值相同则范数相同。对角阵、置换阵等在 $1$、$\infty$、F 范数下也有直观闭式，此处从略。

## 3 常用不等式

以下结论只列结果，不作证明；未特别说明时设 $\mathbf{x}, \mathbf{y} \in \mathbb{K}^n$ ， $\mathbf{A}, \mathbf{B}$ 维数适配。

### 3.1 向量不等式

**（1）三角不等式 / Minkowski**

$$
\|\mathbf{x} + \mathbf{y}\|_p \le \|\mathbf{x}\|_p + \|\mathbf{y}\|_p,
\qquad 1 \le p \le \infty
\tag{19}
$$

**（2）Cauchy–Schwarz 不等式（$2$ 范数）**

$$
|\mathbf{x}^H \mathbf{y}| \le \|\mathbf{x}\|_2\,\|\mathbf{y}\|_2
\tag{20}
$$

等号成立当且仅当 $\mathbf{x}, \mathbf{y}$ 线性相关。这是内积空间中最基本的估计，也是“投影长度不超过原向量长度”的来源。

**（3）Hölder 不等式**

设 $p, q \in (1, \infty)$ 且 $\dfrac{1}{p} + \dfrac{1}{q} = 1$ （共轭指数），则

$$
\sum_{i=1}^{n} |x_i y_i|
\le \|\mathbf{x}\|_p\,\|\mathbf{y}\|_q
\tag{21}
$$

特别地：

- $p = q = 2$ 时退化为 Cauchy–Schwarz 式（20）；
- $p = 1,\ q = \infty$ 时： $\sum_i |x_i y_i| \le \|\mathbf{x}\|_1 \|\mathbf{y}\|_\infty$ ；
- 式（21）的等号可被取到（$1 < p < \infty$ 时取 $y_i \propto \mathrm{sign}(x_i)\lvert x_i\rvert^{p-1}$ 并按 $q$ 范数归一；$p = 1$ 时取 $y_i = \mathrm{sign}(x_i)$ ；$p = \infty$ 时在 $\lvert x_i\rvert$ 最大处取 $y_i = \mathrm{sign}(x_i)$ 、其余分量为 $0$ ），由此即得 $\|\mathbf{x}\|_p$ 的对偶刻画 $\|\mathbf{x}\|_p = \max_{\|\mathbf{y}\|_q \le 1} \lvert\mathbf{x}^H\mathbf{y}\rvert$ 。

**（4）范数比较不等式**

即式（5）（6），此处不再重复。

**（5）对偶范数形式**

$$
\|\mathbf{x}\|_p = \max_{\|\mathbf{y}\|_q \le 1} \mathrm{Re}(\mathbf{x}^H \mathbf{y}),
\qquad \frac{1}{p} + \frac{1}{q} = 1
\tag{22}
$$

### 3.2 矩阵不等式

**（1）相容性（次可乘 + 向量相容）**

$$
\|\mathbf{A}\mathbf{B}\| \le \|\mathbf{A}\|\,\|\mathbf{B}\|,
\qquad
\|\mathbf{A}\mathbf{x}\|_p \le \|\mathbf{A}\|_p\,\|\mathbf{x}\|_p
\tag{23}
$$

对 $\|\cdot\|_1,\ \|\cdot\|_2,\ \|\cdot\|_\infty,\ \|\cdot\|_F$ 均成立。

**（2）矩阵范数之间的比较**

对 $\mathbf{A} \in \mathbb{K}^{m \times n}$ ，记 $r = \mathrm{rank}(\mathbf{A})$ ，则

$$
\frac{1}{\sqrt{n}}\,\|\mathbf{A}\|_F \le \|\mathbf{A}\|_2 \le \|\mathbf{A}\|_F
\le \sqrt{r}\,\|\mathbf{A}\|_2 \le \sqrt{\min(m,n)}\,\|\mathbf{A}\|_2
\tag{24}
$$

（式（24）左端的 $\sqrt{n}$ 换成 $\sqrt{r}$ 更紧，即 $\dfrac{1}{\sqrt{r}}\,\|\mathbf{A}\|_F \le \|\mathbf{A}\|_2$ ；其中 $\|\mathbf{A}\|_2 \le \|\mathbf{A}\|_F$ 对任意形状的矩阵（含长条、扁平）均成立。）

另外

$$
\|\mathbf{A}\|_2 \le \sqrt{\|\mathbf{A}\|_1\,\|\mathbf{A}\|_\infty}
\le \max\big(\|\mathbf{A}\|_1,\ \|\mathbf{A}\|_\infty\big)
\tag{25}
$$

注意：一般**没有** $\|\mathbf{A}\|_2 \le \|\mathbf{A}\|_1$ 或 $\|\mathbf{A}\|_2 \le \|\mathbf{A}\|_\infty$ （取一行全 $1$ 的行向量 $\mathbf{A} \in \mathbb{K}^{1 \times n}$ ，即 $\|\mathbf{A}\|_2 = \sqrt{n}$ 、 $\|\mathbf{A}\|_1 = 1$ 、 $\|\mathbf{A}\|_\infty = n$ ）；只成立带维数因子的版本（行和配 $\sqrt{m}$ 、列和配 $\sqrt{n}$ ）：

$$
\|\mathbf{A}\|_2 \le \sqrt{m}\,\|\mathbf{A}\|_\infty,
\qquad
\|\mathbf{A}\|_2 \le \sqrt{n}\,\|\mathbf{A}\|_1
\tag{26}
$$

$$
\frac{1}{\sqrt{m}}\,\|\mathbf{A}\|_F \le \|\mathbf{A}\|_\infty \le \sqrt{n}\,\|\mathbf{A}\|_2,
\qquad
\frac{1}{\sqrt{n}}\,\|\mathbf{A}\|_F \le \|\mathbf{A}\|_1 \le \sqrt{m}\,\|\mathbf{A}\|_2
\tag{27}
$$

以及行和 / 列和的粗界

$$
\|\mathbf{A}\|_F \le \sqrt{m}\,\|\mathbf{A}\|_\infty,
\qquad
\|\mathbf{A}\|_F \le \sqrt{n}\,\|\mathbf{A}\|_1
\tag{28}
$$

**（3）转置与共轭**

$$
\|\mathbf{A}^T\|_1 = \|\mathbf{A}\|_\infty,
\qquad
\|\mathbf{A}^H\|_2 = \|\mathbf{A}\|_2,
\qquad
\|\mathbf{A}^H\|_F = \|\mathbf{A}\|_F
\tag{29}
$$

**（4）谱半径不等式**

记谱半径 $\rho(\mathbf{A}) = \max\{|\lambda| : \lambda \in \sigma(\mathbf{A})\}$ ，对**任意相容范数**，

$$
\rho(\mathbf{A}) \le \|\mathbf{A}\|,
\qquad
\rho(\mathbf{A}) = \lim_{k \to \infty} \|\mathbf{A}^k\|^{1/k}
\tag{30}
$$

特别地 $\rho(\mathbf{A}) \le \|\mathbf{A}\|_2$ ，且当 $\rho(\mathbf{A}) < 1$ 时 $\mathbf{A}^k \to \mathbf{0}$ （离散系统渐近稳定的矩阵判据）。

**（5）行列式的 Hadamard 不等式**

设 $\mathbf{A} = [\mathbf{a}_1, \dots, \mathbf{a}_n] \in \mathbb{K}^{n \times n}$ ，则

$$
|\det(\mathbf{A})| \le \prod_{j=1}^{n} \|\mathbf{a}_j\|_2
\le \|\mathbf{A}\|_F^{\,n}
\tag{31}
$$

等号当且仅当各列两两正交（或含零列导致两边同为 $0$）。

**（6）Weyl / 扰动型不等式（常用形式）**

设 $\mathbf{A}, \mathbf{B} \in \mathbb{K}^{n \times n}$ ，奇异值按降序排列，则

$$
\sigma_{k}(\mathbf{A} + \mathbf{B}) \le \sigma_k(\mathbf{A}) + \sigma_1(\mathbf{B}),
\qquad
\big| \|\mathbf{A} + \mathbf{B}\|_2 - \|\mathbf{A}\|_2 \big| \le \|\mathbf{B}\|_2
\tag{32}
$$

后者即 $2$ 范数的**逆向三角不等式**，对任意相容范数皆有 $\big|\,\|\mathbf{A}+\mathbf{B}\| - \|\mathbf{A}\|\,\big| \le \|\mathbf{B}\|$ 。

**（7）F 范数的内积形式**

$$
\|\mathbf{A} + \mathbf{B}\|_F^2
= \|\mathbf{A}\|_F^2 + \|\mathbf{B}\|_F^2 + 2\,\mathrm{Re}\,\mathrm{tr}(\mathbf{A}^H\mathbf{B})
\tag{33}
$$

$$
\big| \mathrm{tr}(\mathbf{A}^H\mathbf{B}) \big| \le \|\mathbf{A}\|_F\,\|\mathbf{B}\|_F
\tag{34}
$$

式（34）是把 Cauchy–Schwarz 推广到“矩阵内积” $\langle \mathbf{A}, \mathbf{B}\rangle = \mathrm{tr}(\mathbf{A}^H\mathbf{B})$ 的结果，也是 $\big|\,\|\mathbf{A}\|_F - \|\mathbf{B}\|_F\,\big| \le \|\mathbf{A} - \mathbf{B}\|_F$ 的来源。

## 4 速查表

### 4.1 定义速查

| 对象 | 范数 | 定义要点 |
| --- | --- | --- |
| 向量 | $\|\mathbf{x}\|_1$ | 分量绝对值之和 |
| 向量 | $\|\mathbf{x}\|_2$ | $\sqrt{\mathbf{x}^H\mathbf{x}}$ |
| 向量 | $\|\mathbf{x}\|_\infty$ | 分量绝对值的最大值 |
| 矩阵 | $\|\mathbf{A}\|_1$ | $\max_j \sum_i \lvert a_{ij}\rvert$ （列和最大） |
| 矩阵 | $\|\mathbf{A}\|_2$ | $\sigma_{\max}(\mathbf{A})$ （谱范数） |
| 矩阵 | $\|\mathbf{A}\|_\infty$ | $\max_i \sum_j \lvert a_{ij}\rvert$ （行和最大） |
| 矩阵 | $\|\mathbf{A}\|_F$ | $\sqrt{\mathrm{tr}(\mathbf{A}^H\mathbf{A})} = \sqrt{\sum_{i,j}\lvert a_{ij}\rvert^2}$ |

### 4.2 性质速查

| 性质 | $\|\cdot\|_1$ | $\|\cdot\|_2$ | $\|\cdot\|_\infty$ | $\|\cdot\|_F$ |
| --- | --- | --- | --- | --- |
| 三条范数公理 | ✓ | ✓ | ✓ | ✓ |
| 诱导自某向量范数 | ✓（$1$） | ✓（$2$） | ✓（$\infty$） | ✗ |
| $\|\mathbf{A}\mathbf{x}\| \le \|\mathbf{A}\|\|\mathbf{x}\|$ | ✓ | ✓ | ✓ | ✓ |
| $\|\mathbf{A}\mathbf{B}\| \le \|\mathbf{A}\|\|\mathbf{B}\|$ | ✓ | ✓ | ✓ | ✓ |
| 酉不变 | ✗ | ✓ | ✗ | ✓ |
| 与向量同名范数直接对应 | 列上取 $\|\cdot\|_1$ | 谱 | 行上取 $\|\cdot\|_1$ | 拉直后取 $\|\cdot\|_2$ |

### 4.3 不等式速查

| 不等式 | 结论 |
| --- | --- |
| Cauchy–Schwarz | $\lvert \mathbf{x}^H\mathbf{y}\rvert \le \|\mathbf{x}\|_2\|\mathbf{y}\|_2$ |
| Hölder | $\sum_i \lvert x_i y_i\rvert \le \|\mathbf{x}\|_p\|\mathbf{y}\|_q$ ，$1/p+1/q=1$ |
| Minkowski | $\|\mathbf{x}+\mathbf{y}\|_p \le \|\mathbf{x}\|_p+\|\mathbf{y}\|_p$ |
| 向量范数比较 | $\|\mathbf{x}\|_\infty \le \|\mathbf{x}\|_2 \le \|\mathbf{x}\|_1 \le \sqrt{n}\|\mathbf{x}\|_2 \le n\|\mathbf{x}\|_\infty$ |
| 矩阵 $2$–F 比较 | $\|\mathbf{A}\|_2 \le \|\mathbf{A}\|_F \le \sqrt{r}\|\mathbf{A}\|_2$ |
| 谱与行列表和 | $\|\mathbf{A}\|_2 \le \sqrt{\|\mathbf{A}\|_1\|\mathbf{A}\|_\infty} \le \max(\|\mathbf{A}\|_1, \|\mathbf{A}\|_\infty)$ |
| 谱半径 | $\rho(\mathbf{A}) \le \|\mathbf{A}\|$ （任意相容范数） |
| 酉不变 | $\|\mathbf{U}\mathbf{A}\mathbf{V}\|_2 = \|\mathbf{A}\|_2$ ，$\|\mathbf{U}\mathbf{A}\mathbf{V}\|_F = \|\mathbf{A}\|_F$ |
| Hadamard | $\lvert \det(\mathbf{A})\rvert \le \prod_j \|\mathbf{a}_j\|_2$ |

## 5 小结

1. **向量侧**：$1$ 范数是分量绝对值之和，$2$ 范数是欧氏长度，$\infty$ 范数取最大分量；三者（及一般 $p$ 范数）满足式（5）（6）的比较关系，有限维下彼此等价。
2. **矩阵侧**：$1$、$2$、$\infty$ 范数由向量范数诱导，具有相容性式（8）；计算上分别对应最大列和、最大奇异值、最大行和。F 范数把矩阵当向量取 $2$ 范数，同样相容且酉不变，但不是算子范数。
3. **不等式工具箱**：向量以 Cauchy–Schwarz、Hölder、Minkowski 为骨架；矩阵以相容性、$\|A\|_2 \le \|A\|_F \le \sqrt{r}\|A\|_2$ 、 $\|A\|_2 \le \sqrt{\|A\|_1\|A\|_\infty}$ 与 $\rho(A) \le \|A\|$ 最常用。写误差界、收敛性、条件数估计时，务必标明所用范数。

---

> **声明**：本文内容为个人学习笔记，仅供学习交流使用，不构成任何工程或学术建议。文中公式以常见数值线性代数与矩阵分析教材为准，未给出证明；若需严格推导，请参阅相应教材。<br>
**作者**：SD_1631<br>
**e-mail**：Lingchen1503@outlook.com
