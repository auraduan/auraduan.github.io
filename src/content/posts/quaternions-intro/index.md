---
title: "浅谈四元数"
description: "从四元数的定义与运算法则讲到欧拉角双向换算，并附一段无人机姿态解算的 C++ 实现与万向节死锁处理。"
publishedAt: 2026-06-25
category: "数学"
tags: ["数学", "四元数", "旋转", "飞控"]
cover: "./cover.jpg"
coverAspect: "16:9"
draft: false
toc: true
math: true
---

## 0 结论与要点 (Conclusion & Key Points)

- **空间旋转的三重特征**：三维空间旋转可通过**欧拉角 (Euler Angles)**、**旋转矩阵 (Rotation Matrix)** 和**四元数 (Quaternions)** 表述。欧拉角直观但存在几何奇异性；旋转矩阵冗余度高（9个元素表达3自由度）；四元数（4个元素）计算效率最高且全局无奇异。

- **双向换算的桥梁**：欧拉角与四元数的直接换算公式极度复杂，在理论推导与工程实现中，统一通过特殊的 $3 \times 3$ 正交旋转矩阵作为等价映射的中间桥梁。

- **工程应用规范**：在低空技术与飞控开发中，必须严格指定旋转顺规 (Rotation Sequence)（默认采用惯性导航的 $Z-Y-X$ 顺规，即 Yaw-Pitch-Roll）与坐标系定义（如 Hamilton 规范与 JPL 规范）。

## 1 四元数的基础概念与运算

### 1.1 定义

四元数属于超复数。一个完整的四元数 $q$ 由1个实部和3个虚部构成：

$$ q = q_0 + q_1 i + q_2 j + q_3 k$$

或

$$\quad q = [q_0, \mathbf{q}_v]^T, \; \mathbf{q}_v = [q_1, q_2, q_3]^T$$

其中 $i, j, k$ 为空间虚数单位，满足**哈密顿乘法规则 (Hamilton)** ：

$$ i^2 = j^2 = k^2 = ijk = -1$$

因此有：

$$ 
\begin{cases}
    \begin{split}
        ij = -ji = k\\
        jk = -kj = i\\
        ki = -ik = j\\
    \end{split}
\end{cases}
$$

### 1.2 运算法则

设两个四元数 $q_a = [s_a, \mathbf{v}_a]^T$ 和 $q_b = [s_b, \mathbf{v}_b]^T$，其工程常用基础运算如下：

- 四元数乘法 (Quaternion Multiplication / Kronecker Product)：
四元数乘法满足结合律和分配律，但不满足交换律 ($q_a \otimes q_b \neq q_b \otimes q_a$)。其向量解析式为：

$$q_a \otimes q_b = \begin{bmatrix} s_a s_b - \mathbf{v}_a \cdot \mathbf{v}_b \\ s_a \mathbf{v}_b + s_b \mathbf{v}_a + \mathbf{v}_a \times \mathbf{v}_b \end{bmatrix}$$

注：公式中的 $\cdot$ 为向量点积， $\times$ 为向量叉积。叉积项的存在直接导致了乘法非交换性。

- 共轭 (Conjugate)：虚部符号取反：

$$q^* = [q_0, -\mathbf{q}_v]^T = q_0 - q_1i - q_2j - q_3k$$

- 模长 (Norm)：

$$\Vert q \Vert = \sqrt{q_0^2 + q_1^2 + q_2^2 + q_3^2}$$

- 逆 (Inverse)：

$$q^{-1} = \frac{q^*}{\Vert q \Vert^2}$$

对于工程中用于表示旋转的单位四元数 (Unit Quaternion)，由于 $\Vert q \Vert = 1$，故其逆与共轭相等：$q^{-1} = q^*$ .

### 1.3 旋转的轴角物理图像

单位四元数表示三维旋转的物理本质是轴角表示法。假设刚体绕空间中某一固定的单位方向轴 $\mathbf{n} = [n_x, n_y, n_z]^T$ 旋转了 $\theta$ 角度，则对应的单位四元数构造为：

$$
q=
\begin{bmatrix}
    \cos{\theta / 2} \\
    n_x\sin{\theta / 2}\\
    n_y\sin{\theta / 2}\\
    n_z\sin{\theta / 2}
\end{bmatrix}
$$

## 2 欧拉角与四元数的换算

本节换算采用航空航天工程领域标准的 $Z - Y - X$ 顺规， 即航向角 $Yaw\space\psi \rightarrow$ 俯仰角 $Pitch\space\theta\rightarrow$ 横滚角 $Roll\space\phi$

### 2.1 利用旋转矩阵作为桥梁

将三维向量 $\mathbf{p}$ 旋转至 $\mathbf{p}'$，使用欧拉角导出的旋转矩阵 $R_{\text{euler}}$ 与使用四元数导出的旋转矩阵 $R_{\text{quat}}$ 具备完全等价的数学表征。

1. 欧拉角合成的旋转矩阵 $R_{\text{euler}}$：

$$
R_{\text{euler}} = \begin{bmatrix} 
\cos\psi\cos\theta & -\sin\psi\cos\phi + \cos\psi\sin\theta\sin\phi & \sin\psi\sin\phi + \cos\psi\sin\theta\cos\phi \\
\sin\psi\cos\theta & \cos\psi\cos\phi + \sin\psi\sin\theta\sin\phi & -\cos\psi\sin\phi + \sin\psi\sin\theta\cos\phi \\
-\sin\theta & \cos\theta\sin\phi & \cos\theta\cos\phi
\end{bmatrix}
$$

2. 单位四元数导出的旋转矩阵 $R_{\text{quat}}$：

$$
R_{\text{quat}} = \begin{bmatrix} 
1 - 2(q_2^2 + q_3^2) & 2(q_1q_2 - q_0q_3) & 2(q_1q_3 + q_0q_2) \\
2(q_1q_2 + q_0q_3) & 1 - 2(q_1^2 + q_3^2) & 2(q_2q_3 - q_0q_1) \\
2(q_1q_3 - q_0q_2) & 2(q_2q_3 + q_0q_1) & 1 - 2(q_1^2 + q_2^2)
\end{bmatrix}
$$

详细推导于文末给出。

### 2.2 四元数转化欧拉角

令 $R_{\text{euler}} = R_{\text{quat}}$，对应矩阵中的元素进行数学求解：

俯仰角 $\theta$ (Pitch)：对比矩阵第三行第一列元素：

$$-\sin\theta = 2(q_1q_3 - q_0q_2) \implies \theta = \arcsin\big(2(q_0q_2 - q_1q_3)\big)$$

横滚角 $\phi$ (Roll)：对比第三行第二列与第三列元素：

$$
\begin{split}
    \frac{R_{32}}{R_{33}} = \frac{\cos\theta\sin\phi}{\cos\theta\cos\phi} = \tan\phi \implies \phi 
    &= \text{arctan}\space\frac{2(q_2q_3 + q_0q_1)}{1 - 2(q_1^2 + q_2^2)} \\
    &= \text{atan2}\big(2(q_2q_3 + q_0q_1), \, 1 - 2(q_1^2 + q_2^2)\big)
    \end{split}
$$

航向角 $\psi$ (Yaw)：对比第二行第一列与第一行第一列元素：

$$
\begin{split}
    \frac{R_{21}}{R_{11}} = \frac{\sin\psi\cos\theta}{\cos\psi\cos\theta} = \tan\psi \implies \psi 
    &= \text{arctan}\space\frac{2(q_1q_2 + q_0q_3)}{1 - 2(q_2^2 + q_3^2)}\\
    &= \text{atan2}\big(2(q_1q_2 + q_0q_3), \, 1 - 2(q_2^2 + q_3^2)\big)
\end{split}
$$

>当 $\theta = \pm 90^\circ$（即无人机垂直仰天或垂直向下俯冲）时，$\cos\theta = 0$，此时 $R_{32}$ 和 $R_{33}$ 同时变为 0，atan2(0,0) 无法求解。此时发生万向节死锁，航向变化与横滚变化退化在同一平面内。

>处理方案：在代码中若检测到 $2(q_0q_2 - q_1q_3) \approx \pm 1$，需强制退化处理，令 $\phi = 0$，退化求解 $\psi = 2\,\text{atan2}(q_3, q_0)$。

### 2.3 欧拉角转化四元数

已知三个单轴旋转对应的单位四元数分别为 $q_z(\psi) = [c_{\psi/2}, 0, 0, s_{\psi/2}]^T$、 $q_y(\theta) = [c_{\theta/2}, 0, s_{\theta/2}, 0]^T$、 $q_x(\phi) = [c_{\phi/2}, s_{\phi/2}, 0, 0]^T$。

根据 $Z-Y-X$ 顺规进行四元数相乘：

$$q = q_z(\psi) \otimes q_y(\theta) \otimes q_x(\phi)$$

经过代数项展开整理，得到直接转换公式（此处简写：$c_{\phi2} = \cos(\phi/2)$, $s_{\phi2} = \sin(\phi/2)$ 等）：

$$
\begin{bmatrix} 
    q_0 \\ q_1 \\ q_2 \\ q_3 
\end{bmatrix} 
=
\begin{bmatrix}
    c_{\phi2}c_{\theta2}c_{\psi2} + s_{\phi2}s_{\theta2}s_{\psi2} \\
    s_{\phi2}c_{\theta2}c_{\psi2} - c_{\phi2}s_{\theta2}s_{\psi2} \\
    c_{\phi2}s_{\theta2}c_{\psi2} + s_{\phi2}c_{\theta2}s_{\psi2} \\
    c_{\phi2}c_{\theta2}s_{\psi2} - s_{\phi2}s_{\theta2}c_{\psi2}
\end{bmatrix}
$$

## 3 工程背景与 C++ 算法案例

### 3.1 工业应用背景描述

在无人机自主飞行或多轴机械臂姿态控制系统中，惯性测量单元（IMU）内的微机电陀螺仪以 $500 Hz$ 的高频率对角速度积分，并利用互补滤波或扩展卡尔曼滤波进行动态解算，输出姿态四元数。然而，地面站监控软件或控制反馈回路需要可读性高的欧拉角来设定 PID 目标。因此，双向换算函数是飞控核心库的必备底层结构。

### 3.2 一段C++代码实现

```cpp
#include <cmath>

constexpr float M_PI_F = 3.14159265358979323846f;

// 姿态四元数结构体定义
struct Quaternion_t 
{
    float w; // q0
    float x; // q1
    float y; // q2
    float z; // q3
};

// 欧拉角结构体定义（单位：弧度 rad）
struct EulerAngles_t
{
    float roll;  // 横滚角 phi
    float pitch; // 俯仰角 theta
    float yaw;   // 航向角 psi
};

/**
 * @brief  将欧拉角转换为单位四元数 (顺规: Z-Y-X)
 * @param  euler: 输入的欧拉角
 * @param  quat:  输出的四元数
 */
void EulerToQuaternion(const EulerAngles_t& euler, Quaternion_t& quat) 
{
    float cosRollHalf  = std::cos(euler.roll * 0.5f);
    float sinRollHalf  = std::sin(euler.roll * 0.5f);
    float cosPitchHalf = std::cos(euler.pitch * 0.5f);
    float sinPitchHalf = std::sin(euler.pitch * 0.5f);
    float cosYawHalf   = std::cos(euler.yaw * 0.5f);
    float sinYawHalf   = std::sin(euler.yaw * 0.5f);

    quat.w = cosRollHalf * cosPitchHalf * cosYawHalf + sinRollHalf * sinPitchHalf * sinYawHalf;
    quat.x = sinRollHalf * cosPitchHalf * cosYawHalf - cosRollHalf * sinPitchHalf * sinYawHalf;
    quat.y = cosRollHalf * sinPitchHalf * cosYawHalf + sinRollHalf * cosPitchHalf * sinYawHalf;
    quat.z = cosRollHalf * cosPitchHalf * sinYawHalf - sinRollHalf * sinPitchHalf * cosYawHalf;
    
    // 工程防错：进行一次强制归一化，规避浮点数乘法累积误差
    float norm = std::sqrt(quat.w * quat.w + quat.x * quat.x + quat.y * quat.y + quat.z * quat.z);
    if (norm > 1e-6f) {
        quat.w /= norm;
        quat.x /= norm;
        quat.y /= norm;
        quat.z /= norm;
    }
}

/**
 * @brief  将单位四元数转换为欧拉角 (考虑万向节死锁边缘处理)
 * @param  quat:  输入的单位四元数
 * @param  euler: 输出的欧拉角
 */
void QuaternionToEuler(const Quaternion_t& quat, EulerAngles_t& euler)
{
    // 提取等价旋转矩阵中第三行第一列对应的 sin(theta) 映射项
    float sinTheta = 2.0f * (quat.w * quat.y - quat.x * quat.z);

    // 万向节死锁临界阈值判定 (sin(90 deg) = 1, 此处取 0.9995 留出安全裕度)
    if (std::abs(sinTheta) >= 0.9995f) {
        // 遭遇万向节死锁奇异点 (Gimbal Lock)
        // 强行令横滚角 Roll = 0，退化求解航向角 Yaw
        euler.roll = 0.0f;
        if (sinTheta > 0.0f) {
            euler.pitch =  M_PI_F / 2.0f; //  90度 正向死锁
            euler.yaw   =  2.0f * std::atan2(quat.z, quat.w);
        } else {
            euler.pitch = -M_PI_F / 2.0f; // -90度 负向死锁
            euler.yaw   =  2.0f * std::atan2(quat.z, quat.w);
        }
    } else {
        // 常规状态非奇异解算
        euler.pitch = std::asin(sinTheta);
        
        // 利用 atan2 处理全象限角度输出
        euler.roll  = std::atan2(2.0f * (quat.w * quat.x + quat.y * quat.z), 1.0f - 2.0f * (quat.x * quat.x + quat.y * quat.y));
        euler.yaw   = std::atan2(2.0f * (quat.w * quat.z + quat.x * quat.y), 1.0f - 2.0f * (quat.y * quat.y + quat.z * quat.z));
    }
}
```

## 4 补充四元数转化欧拉角的详细过程

以在平面 $XOY$ 上的向量 $\vec v$ 为例绕 $Z$ 轴逆时针旋转一个角度 $\psi$，得到新向量 $\vec v'$

我们在不动的 $X-Y$ 平面上看这个旋转：

- 原来的 $X$ 轴单位向量 $[1, 0, 0]^T$，转了 $\psi$ 度后，它的 $X$ 分量变成了 $\cos\psi$， $Y$ 分量变成了 $\sin\psi$。所以它变成了 $[\cos\psi, \sin\psi, 0]^T$。

- 原来的 $Y$ 轴单位向量 $[0, 1, 0]^T$，转了 $\psi$ 度后，它的 $X$ 分量变成了 $-\sin\psi$， $Y$ 分量变成了 $\cos\psi$。所以它变成了 $[-\sin\psi, \cos\psi, 0]^T$。

把这两个新生成的基向量组合成一个矩阵（第三列是 $Z$ 轴，保持不变），这就是绕 Z 轴的旋转矩阵 $R_z(\psi)$：

$$R_z(\psi) = \begin{bmatrix} \cos\psi & -\sin\psi & 0 \\ \sin\psi & \cos\psi & 0 \\ 0 & 0 & 1 \end{bmatrix}$$

同理，如果是绕 $Y$ 轴旋转 $\theta$，绕 $X$ 轴旋转 $\phi$，也可以用同样的方法画出单轴旋转矩阵 $R_y(\theta)$ 和 $R_x(\phi)$。

在线性代数中，绕新轴（动态轴）连续旋转，矩阵是“右乘”；绕固定轴（比如永远不动的地面系）连续旋转，矩阵是“左乘”。

因为无人机是绕着自己身体内部的轴在转，所以我们用右乘（即按照旋转顺序，从左往右乘）：

$$
\begin{split}
    R_{\text{euler}} 
    &= R_z(\psi) \cdot R_y(\theta) \cdot R_x(\phi) \\
    &= 
        \begin{bmatrix} 
        c\psi & -s\psi & 0 \\ s\psi & c\psi & 0 \\ 0 & 0 & 1 
        \end{bmatrix} 
    \cdot 
        \begin{bmatrix} 
        c\theta & 0 & s\theta \\ 0 & 1 & 0 \\ -s\theta & 0 & c\theta 
        \end{bmatrix} 
    \cdot 
        \begin{bmatrix} 
        1 & 0 & 0 \\ 0 & c\phi & -s\phi \\ 0 & s\phi & c\phi 
        \end{bmatrix} \\
    &= 
    \begin{bmatrix} 
        c_\psi c_\theta & -s_\psi c_\phi + c_\psi s_\theta s_\phi & s_\psi s_\phi + c_\psi s_\theta c_\phi \\
        s_\psi c_\theta & c_\psi c_\phi + s_\psi s_\theta s_\phi & -c_\psi s_\phi + s_\psi s_\theta c_\phi \\
        -s_\theta & c_\theta s_\phi & c_\theta c_\phi
    \end{bmatrix}
\end{split}
$$

现给出四元数基本形式 

$$q = q_0 + q_1 i + q_2 j + q_3 k $$

一个空间中的点 $P = (x, y, z)$ 可以写作对应的四元数 $p_v = 0 + xi +yj +zk$，此时：

$$\vec{p}'_{v} = q \cdot \vec{p}_{v} \cdot q^{-1}$$

把 $q = q_0 + q_1i + q_2j + q_3k$ 和 $\vec{p}_{v}$ 代入，利用 $i^2=j^2=k^2=-1, ij=k$ 等规则全部展开，最后把 $i, j, k$ 前面的系数重新提取出来，拼成一个新的三维向量 $\vec{p}' = [x', y', z']$。

展开后的结果，如果写成线性代数的矩阵乘法 $\mathbf{p}' = R_{\text{quat}} \cdot \mathbf{p}$，那么：

$$
R_{\text{quat}} = 
\begin{bmatrix} 
    1 - 2(q_2^2 + q_3^2) & 2(q_1q_2 - q_0q_3) & 2(q_1q_3 + q_0q_2) \\
    2(q_1q_2 + q_0q_3) & 1 - 2(q_1^2 + q_3^2) & 2(q_2q_3 - q_0q_1) \\
    2(q_1q_3 - q_0q_2) & 2(q_2q_3 + q_0q_1) & 1 - 2(q_1^2 + q_2^2)
\end{bmatrix}
$$

---

> **声明**：本文内容为个人学习笔记，仅供学习交流使用，不构成任何工程或学术建议。文中的公式推导与代码实现虽经核对，但仍可能存在疏漏或未覆盖的边缘情况，实际工程应用中请以相应领域的官方文档或标准规范为准。<br>
**作者**：SD_1631<br>
**e-mail**：Lingchen1503@outlook.com