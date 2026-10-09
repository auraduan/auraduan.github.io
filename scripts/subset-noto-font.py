#!/usr/bin/env python
"""
Noto Sans SC 字体子集化 —— 把 101 个 unicode-range 分片裁到站点实际用字。

`@fontsource-variable/noto-sans-sc` 是 101 个按 unicode-range 切分的 woff2，
产物里合计约 4MB（浏览器按需加载，但仓库与部署体积都背着它）。
站点实际用到的汉字只是其中一小部分——尤其 `noto-sans-sc-cyrillic` /
`-vietnamese` 这类分片，中文站永远不会命中。

本脚本：
  1. 收集站点实际用字（扫 src 下的文本）
  2. 叠一个「常用字底」：GB2312 一级汉字（3755 个）—— 防止日后新增内容缺字
  3. 对每个分片求交集：命中的裁到交集大小，未命中的整片丢弃
  4. 生成 `src/styles/fonts/noto.css`（只列命中的分片）

⚠ 新增文章若用到「常用字底」之外的生僻字，需要重跑本脚本：
    python scripts/subset-noto-font.py

依赖：fonttools + brotli
    pip install fonttools brotli
"""

import os
import re
import sys

from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
PKG = os.path.join(ROOT, "node_modules", "@fontsource-variable", "noto-sans-sc")
OUT = os.path.join(ROOT, "src", "styles", "fonts")


def collect_chars():
    """站点用字 + 常用字底。"""
    chars = set()

    # 1. 扫源码里的文本（md / astro / ts / json）
    for dirpath, dirnames, filenames in os.walk(SRC):
        dirnames[:] = [d for d in dirnames if d != "fonts"]
        for name in filenames:
            if not name.endswith((".md", ".astro", ".ts", ".js", ".json", ".txt")):
                continue
            try:
                with open(os.path.join(dirpath, name), encoding="utf-8") as fh:
                    chars |= set(fh.read())
            except Exception:
                pass

    # 2. 常用字底：GB2312 一级汉字（16–55 区，共 3755 字）
    for high in range(0xB0, 0xD8):
        for low in range(0xA1, 0xFF):
            try:
                chars.add(bytes([high, low]).decode("gb2312"))
            except Exception:
                pass

    # 3. ASCII 与常用标点 / 符号
    chars |= {chr(c) for c in range(0x20, 0x7F)}
    chars |= set("　，。、；：？！“”‘’（）《》〈〉【】〔〕—…·～`×÷°±≤≥≠≈→←↑↓★☆●○■□▲▼「」『』￥€£©®™½¼¾§¶†‡")

    # 控制字符不参与（字体里没有对应字形）
    return {c for c in chars if c.isprintable() or c == " "}


def parse_ranges(text):
    """把 CSS 的 unicode-range 值解析成码点集合。"""
    out = set()
    for part in text.split(","):
        part = part.strip()
        m = re.fullmatch(r"U\+([0-9A-Fa-f]{1,6})(?:-([0-9A-Fa-f]{1,6}))?", part)
        if not m:
            continue
        start = int(m.group(1), 16)
        end = int(m.group(2), 16) if m.group(2) else start
        out.update(range(start, end + 1))
    return out


def to_ranges(codepoints):
    """把码点集合压回紧凑的 unicode-range 字符串。"""
    points = sorted(codepoints)
    if not points:
        return ""
    spans = []
    start = prev = points[0]
    for cp in points[1:]:
        if cp == prev + 1:
            prev = cp
            continue
        spans.append((start, prev))
        start = prev = cp
    spans.append((start, prev))
    return ",".join(
        f"U+{a:X}" if a == b else f"U+{a:X}-{b:X}" for a, b in spans
    )


def main():
    if not os.path.isdir(PKG):
        sys.exit(f"找不到字体包：{PKG}")

    chars = collect_chars()
    codepoints = {ord(c) for c in chars}
    print(f"收集字符：{len(chars)} 个（含 GB2312 一级汉字字底）")

    with open(os.path.join(PKG, "index.css"), encoding="utf-8") as fh:
        css = fh.read()

    faces = re.findall(
        r"src:\s*url\(\./files/([^)]+\.woff2)\)[^;]*;\s*unicode-range:\s*([^;]+);",
        css,
        re.S,
    )
    print(f"字体内分片：{len(faces)} 个")

    os.makedirs(OUT, exist_ok=True)

    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]  # 保留全部 OpenType 特性
    options.name_IDs = ["*"]
    options.notdef_outline = True

    total_in = 0
    total_out = 0
    entries = []

    for filename, urange in faces:
        src_path = os.path.join(PKG, "files", filename)
        if not os.path.exists(src_path):
            continue

        hit = parse_ranges(urange) & codepoints
        if not hit:
            continue  # 该分片整片用不上，直接丢弃

        font = subset.load_font(src_path, options)
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(unicodes=hit)
        subsetter.subset(font)

        out_name = filename.replace(".woff2", ".subset.woff2")
        subset.save_font(font, os.path.join(OUT, out_name), options)

        total_in += os.path.getsize(src_path)
        total_out += os.path.getsize(os.path.join(OUT, out_name))
        entries.append((out_name, to_ranges(hit)))

    lines = [
        "/* 由 scripts/subset-noto-font.py 生成，请勿手改。 */",
        "/* 新增内容若用到生僻字，重跑该脚本即可。 */",
        "",
    ]
    for out_name, new_range in entries:
        lines.append(
            "@font-face {\n"
            "  font-family: 'Noto Sans SC Variable';\n"
            "  font-style: normal;\n"
            "  font-display: swap;\n"
            "  font-weight: 100 900;\n"
            f"  src: url('./{out_name}') format('woff2-variations');\n"
            f"  unicode-range: {new_range};\n"
            "}"
        )

    with open(os.path.join(OUT, "noto.css"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")

    print(f"命中的分片：{len(entries)} 个")
    print(f"分片体积：{total_in / 1048576:.2f} MB → {total_out / 1024:.0f} KB")


if __name__ == "__main__":
    main()
