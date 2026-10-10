---
title: "删掉 Ubuntu 分区后卡在 GRUB，怎么回 Windows"
description: "双系统卸载 Ubuntu 后无法开机的根因、三种脱困方案与彻底清理残留引导项，附避坑清单。"
publishedAt: 2026-10-10
category: "信息技术"
tags: ["Linux", "Ubuntu", "GRUB", "双系统", "引导修复"]
coverAspect: "auto"
draft: false
toc: true
math: false
---

现象：Windows + Ubuntu 双系统中，直接在 Windows 磁盘管理里删除 Ubuntu 分区，重启后无法进入 Windows。屏幕表现为一个朴素的 `grub rescue>` 黑框，或直接落入 GRUB 菜单。

这不是 Windows 损坏，也不是数据丢失。本文先说明故障根因，再给出三个从"临时恢复"到"彻底修复"的方案，最后是残留引导项的清理。

## 0 前置结论：数据完好

被删除的是 Ubuntu 分区，Windows 分区及其数据未受影响。当前的启动失败属于**引导程序寻址失败**，与磁盘数据无关。

只要能进入 Windows（哪怕是临时进入），文件即完好。因此下文所有操作均不涉及数据风险——唯一存在风险的是最后一节的 EFI 分区清理，届时会单独标注。

## 1 根因：为什么删掉 Ubuntu 后无法启动

理解根因之后，后续所有方案都变得顺理成章。

安装 Ubuntu 双系统时，安装器默认会把 **GRUB 引导程序写入磁盘最前面的位置**，由它接管开机流程。该位置取决于固件模式：

- **传统 BIOS / MBR 模式**：GRUB 被写入硬盘主引导记录（MBR），覆盖原有的 Windows 引导代码。
- **现代 UEFI / GPT 模式**（近十年设备的主流）：GRUB 可执行文件 `grubx64.efi` 存放于隐藏的 **EFI 系统分区（ESP）**，同时固件启动顺序表中多出一条名为 `ubuntu` 的启动项，排序在 Windows 之前。

关键在于：**GRUB 的引导程序本体与配置文件是分离存放的**。本体位于磁盘最前面（MBR 或 ESP），而配置文件 `/boot/grub/grub.cfg` 位于 Ubuntu 根分区。

删除 Ubuntu 分区时，配置文件随之丢失。开机后固件仍按原顺序执行 GRUB，但 GRUB 既找不到配置文件，也找不到任何可启动系统，只能落到一个极简急救终端：

```
grub rescue>
```

**问题的本质是**：引导程序本体仍在，但它依赖的配置数据已被删除。三个方案分别对应三种处理思路——绕开它、隔离它、或替换它。

| 方案 | 思路 | 效果 | 适用场景 |
| --- | --- | --- | --- |
| 方法 1 输入 `exit` | 使 GRUB 退出，控制权交还固件 | 临时恢复 | 急需使用，手边无任何介质 |
| 方法 2 改 BIOS 启动顺序 | 绕过 GRUB，直接指定 Windows | 基本持久 | UEFI 设备，推荐 |
| 方法 3 修复 Windows 引导 | 重建引导程序，移除 GRUB | 彻底修复 | 前两法无效，或需根治 |

## 2 方法 1：输入 `exit`

在 `grub rescue>` 提示符下输入：

```
exit
```

回车。若一次无响应，可重复多次。

**原理**：`exit` 使 GRUB 主动退出，将控制权交还固件。固件启动列表中通常仍保留 `Windows Boot Manager` 一项，固件因而继续启动 Windows。

**优点**：零成本，无需任何外部介质，足以应急。**局限**：不持久——只是本次让固件继续往下执行，若后续调整了启动顺序，下次开机可能重现同样的黑框。因此它适用于急救，不适用于根治。

## 3 方法 2：进 BIOS 调整启动顺序

UEFI 设备上最省事、最接近一劳永逸的做法。

1. 在 GRUB 界面输入 `reboot` 回车重启（或长按电源键）
2. 开机时按进 BIOS 的快捷键（常见为 `F2` / `Del` / `F12`，笔记本多为 `F2`）
3. 进入 **Boot（启动）** 选项卡，其中列出全部启动项，形如：
   - `ubuntu`（位于首位，即故障来源）
   - `Windows Boot Manager`
4. 将 **`Windows Boot Manager` 移至首位**，保存并退出（通常为 `F10`）

重启后将跳过 GRUB，直接进入 Windows。

**为何接近一劳永逸**：该操作本质是在固件启动顺序表中把 Windows 排在 Ubuntu 之前。只要该顺序不被其他操作打乱，GRUB 便不会再抢先执行。它比方法 1 可靠，且不触碰任何系统文件，无风险。

> **若启动列表中不存在 `Windows Boot Manager`**：转方法 3，用 `bcdboot` 重建，重建后该项会重新出现。

## 4 方法 3：重建 Windows 引导（根治）

若前两法无效，或需要将 GRUB 彻底移出引导链，采用此法。需要一个 **Windows 安装 U 盘或系统修复盘**（任意一台 Windows 电脑均可通过微软官方工具制作）。

进入 Windows 恢复环境的路径：

1. 从 U 盘启动，在安装界面点击左下角 **"修复计算机"**（不要点击"现在安装"）
2. 依次进入 **疑难解答 → 高级选项 → 命令提示符**

随后按固件模式执行对应命令：

### 4.1 传统 BIOS / MBR 设备

```
bootrec /fixmbr
bootrec /fixboot
bootrec /rebuildbcd
```

三条命令的作用分别为：`/fixmbr` 将 Windows 引导代码写回主引导记录（覆盖 GRUB）；`/fixboot` 写入新的引导扇区；`/rebuildbcd` 重新扫描所有磁盘上的 Windows 并重建启动配置。绝大多数 BIOS 设备的引导故障可由这三条命令解决。

### 4.2 UEFI / GPT 设备（推荐）

```
bcdboot C:\Windows /s S: /f UEFI
```

该命令将一套完整的 Windows 引导文件写入 EFI 分区，并自动重建 UEFI 启动项。两个参数需注意：

- `C:\Windows` 为 **Windows 系统目录所在盘符**。恢复环境中的盘符可能与平时不同，先用 `dir C:\Windows` 确认；若不在 C 盘，替换为实际盘符（如 `D:\Windows`）。
- `S:` 为 **EFI 分区盘符**。EFI 分区默认无盘符，需先手动分配：

```
diskpart
list volume
select volume <EFI 分区对应的卷号>
assign letter=S
exit
```

执行成功后会提示"已成功创建启动文件"。重启并从硬盘启动，即可进入 Windows。

## 5 收尾：清理残留的 Ubuntu 引导项

完成上一步后，系统已可正常使用。但仍有两处残留：BIOS 启动菜单中失效的 `ubuntu` 项，以及 EFI 分区中遗留的引导文件。二者**不影响使用**，但部分主板上会拖慢开机自检，建议一并清理。

> ⚠️ **本节是全篇唯一存在风险的操作**，务必确认后再执行。EFI 分区中同时存放 Windows 自身的引导文件，误删会导致设备再次无法启动。

### 5.1 删除 BIOS 启动项（二选一）

**图形化工具**（推荐，不易出错）：在 Windows 中使用 **EasyUEFI**，在列表中找到描述为 `ubuntu` 的项，删除即可。

**命令行**：以管理员身份打开命令提示符：

```
bcdedit /enum firmware
```

该命令列出全部固件引导项。找到 description 中含 `ubuntu` 或 `Linux` 的一项，复制其大括号标识符，然后执行：

```
bcdedit /delete {上述标识符}
```

> **删除前必须确认 `Windows Boot Manager` 一项完好无损**，否则将导致彻底无法启动。

### 5.2 删除 EFI 分区中的残留文件

使用可读写 EFI 分区的工具（如 **DiskGenius**，或上文 `diskpart` 的 `assign letter` 方式挂载），打开 EFI 分区，可见如下结构：

```
EFI/
├─ Microsoft/     ← Windows 引导文件，绝对不可删除
├─ BOOT/          ← 其中 Bootx64.efi 有时被主板优先调用，不宜删除
└─ ubuntu/        ← Ubuntu 遗留，可安全删除
```

**仅删除 `EFI/ubuntu/` 这一个目录**。删除后，对应启动项基本不再出现。

> **常见误传**：部分教程称"找到 `~/ubuntu` 目录并删除"。`~/` 是 Linux 中"家目录"的写法，Windows 或 EFI 分区中**不存在**该路径——其实际所指为 ESP 中的 `EFI/ubuntu`。照抄会导致找不到目标。

## 6 正确的卸载顺序

若 Ubuntu 尚在，只是需要干净地卸载，正确顺序与多数直觉**相反**：

1. **先修复 Windows 引导**（方法 3），确认仍可正常进入系统
2. **再删除 Ubuntu 分区**，将腾出的空间并回 Windows 分区
3. **最后清理残留**（第 5 节）

核心逻辑是**每一步都保留退路**：先让系统不再依赖 GRUB，再动分区，最后清理。若反序先删分区，就会落入本文开头的故障——虽仍可修复，但排查链路更绕。

此外需注意，**Windows 磁盘管理中的"扩展卷"常为灰置**：未分配空间必须紧邻 C 盘右侧才能合并。若 Ubuntu 分区夹在中间，需先移动中间分区，或改用 DiskGenius 等支持"移动分区"的工具处理。

## 7 避坑速查表

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `grub rescue>` 黑框 | GRUB 本体仍在，配置随分区被删 | 恢复进入 Windows：`exit`／改 BIOS 顺序／`bcdboot` |
| `exit` 后仍为黑框 | 固件列表中 Windows 项排位靠后 | 进 BIOS 将 `Windows Boot Manager` 提至首位 |
| BIOS 中无 Windows 启动项 | 引导文件缺失或损坏 | 恢复环境执行 `bcdboot C:\Windows /s S: /f UEFI` |
| 可进系统但菜单保留 `ubuntu` 项 | ESP 中残留引导项 | EasyUEFI 或 `bcdedit /delete` 删除 |
| 扩展卷选项灰置 | 未分配空间不紧邻 C 盘 | 使用支持移动分区的工具，或保持未分配 |
| 删分区前是否需关闭 Secure Boot | **不需要** | 保持开启，无需为此改动固件设置 |

## 8 小结

- 删除 Ubuntu 后卡在 GRUB，**Windows 与数据均完好**
- 根因：**引导程序本体仍在，但其读取的配置已随分区删除**
- 应急用 `exit`；UEFI 设备改 BIOS 启动顺序最省事；根治用 `bcdboot` 重建引导
- 彻底清理两步：删除 BIOS 启动项 + 删除 ESP 中的 `EFI/ubuntu`
- 操作顺序：**先修引导，再删分区，最后清残留**

其中最关键的是最后一条——预先确认操作顺序的成本，远低于事后排查的成本。
