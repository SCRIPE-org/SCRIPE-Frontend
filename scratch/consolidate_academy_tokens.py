#!/usr/bin/env python3
"""
SCRIPE Academy — Design System Consolidation Engine
Reconciles legacy hardcoded hex colors, non-canonical limes, and hardcoded dark backgrounds
with the canonical SCRIPE Nexus design token architecture (--nx-*, @core/ui/*).
"""

import os
import re
import sys

# Comprehensive token replacement table
EXACT_REPLACEMENTS = [
    # 1. Base / Root
    ("text-white dark:text-white", "text-nx-ink academy-bg"),
    ("text-white/40", "text-nx-ink-3"),
    ("text-white/60", "text-nx-ink-2"),
    ("text-white/70", "text-nx-ink-2"),
    ("text-white/80", "text-nx-ink"),
    ("text-white/90", "text-nx-ink"),

    # 2. Hardcoded non-canonical lime replacements
    ("#c8ff05", "#c6ff00"),
    ("#c6ff1a", "#c6ff00"),
    ("#b9fb30", "#c6ff00"),
    ("#b2e600", "#c6ff00"),
    ("#b0e600", "#c6ff00"),
    ("#cfff64", "#c6ff00"),
    ("#d0ff05", "#c6ff00"),

    # 3. Direct class replacements for lime focus & borders & text & backgrounds
    ("focus:border-[#c8ff05]", "focus:border-nx-accent"),
    ("focus:border-[#c6ff00]", "focus:border-nx-accent"),
    ("focus:ring-[#c8ff05]", "focus:ring-nx-accent"),
    ("focus:ring-[#c6ff00]", "focus:ring-nx-accent"),
    ("focus:ring-[#c8ff05]/30", "focus:ring-nx-accent/30"),
    ("focus:ring-[#c6ff00]/30", "focus:ring-nx-accent/30"),
    ("hover:border-[#c8ff05]", "hover:border-nx-accent"),
    ("hover:border-[#c6ff00]", "hover:border-nx-accent"),
    ("hover:border-[#c8ff05]/50", "hover:border-nx-accent/50"),
    ("hover:border-[#c8ff05]/60", "hover:border-nx-accent/60"),
    ("hover:border-[#5a7800]", "hover:border-nx-accent/50"),
    ("border-[#c8ff05]", "border-nx-accent-fill"),
    ("border-[#c6ff00]", "border-nx-accent-fill"),
    ("border-[#c8ff05]/30", "border-nx-accent-fill/30"),
    ("border-[#c8ff05]/40", "border-nx-accent-fill/40"),
    ("border-[#c8ff05]/60", "border-nx-accent-fill/60"),
    ("border-[#c8ff05]/80", "border-nx-accent-fill/80"),
    ("border-[#c6ff00]/30", "border-nx-accent-fill/30"),
    ("border-[#c6ff00]/40", "border-nx-accent-fill/40"),
    ("border-s-[#c8ff05]", "border-s-nx-accent-fill"),
    ("border-s-[#c6ff00]", "border-s-nx-accent-fill"),
    ("text-[#c8ff05]", "text-nx-accent"),
    ("text-[#c6ff00]", "text-nx-accent"),
    ("text-[#c8ff05]/80", "text-nx-accent/80"),
    ("group-hover:text-[#c8ff05]", "group-hover:text-nx-accent"),
    ("hover:text-[#c8ff05]", "hover:text-nx-accent"),
    ("bg-[#c8ff05]", "bg-nx-accent-fill"),
    ("bg-[#c6ff00]", "bg-nx-accent-fill"),
    ("bg-[#c8ff05]/5", "bg-nx-accent-fill/5"),
    ("bg-[#c8ff05]/10", "bg-nx-accent-fill/10"),
    ("bg-[#c8ff05]/15", "bg-nx-accent-fill/15"),
    ("bg-[#c8ff05]/20", "bg-nx-accent-fill/20"),
    ("hover:bg-[#b2e600]", "hover:bg-nx-accent-fill/90"),
    ("hover:bg-[#b0e600]", "hover:bg-nx-accent-fill/90"),
    ("hover:bg-[#c8ff05]", "hover:bg-nx-accent-fill/90"),
    ("selection:bg-[#c8ff05]", "selection:bg-nx-accent-fill"),
    ("selection:bg-[#c6ff00]", "selection:bg-nx-accent-fill"),
    ("shadow-[#c8ff05]/20", "shadow-nx-glow"),

    # Dark text on lime buttons/chips
    ("text-[#131600]", "text-nx-on-fill"),
    ("text-[#121600]", "text-nx-on-fill"),
    ("text-[#0a0c06]", "text-nx-on-fill"),
    ("text-[#0b1000]", "text-nx-on-fill"),
    ("text-[#0b0e11]", "text-nx-on-fill"),
    ("hover:text-[#0b0e11]", "hover:text-nx-on-fill"),
    ("hover:text-[#080a0b]", "hover:text-nx-on-fill"),

    # Lime accent tints & borders
    ("bg-[#1a2307]", "bg-nx-accent-fill/15"),
    ("bg-[#1a2307]/40", "bg-nx-accent-fill/15"),
    ("bg-[#1a2307]/50", "bg-nx-accent-fill/15"),
    ("bg-[#202b09]", "bg-nx-accent-fill/15"),
    ("bg-[#222e00]", "bg-nx-accent-fill/15"),
    ("bg-[#1c2707]", "bg-nx-accent-fill/15"),
    ("bg-[#1e2b09]", "bg-nx-accent-fill/15"),
    ("bg-[#1e2800]", "bg-nx-accent-fill/15"),
    ("bg-[#243817]", "bg-nx-accent-fill/15"),
    ("bg-[#253006]/60", "bg-nx-accent-fill/15"),
    ("bg-[#0c1510]", "bg-nx-accent-fill/15"),
    ("bg-[#12160d]", "bg-nx-accent-fill/15"),
    ("bg-[#122815]", "bg-nx-accent-fill/15"),
    ("bg-[#142617]", "bg-nx-accent-fill/15"),
    ("bg-[#5a7800]", "bg-nx-accent-fill/25"),
    ("bg-[#606963]", "bg-nx-raised"),
    ("border-[#5a7800]", "border-nx-accent-fill/40"),
    ("border-[#627b00]", "border-nx-accent-fill/40"),
    ("border-[#668000]", "border-nx-accent-fill/40"),
    ("border-[#687e00]", "border-nx-accent-fill/40"),
    ("border-[#728b00]", "border-nx-accent-fill/40"),
    ("border-[#7ca100]", "border-nx-accent-fill/40"),
    ("border-[#91b900]", "border-nx-accent-fill/40"),
    ("border-[#345327]", "border-nx-accent-fill/40"),
    ("border-[#454d41]", "border-nx-accent-fill/40"),
    ("border-[#3a4d00]", "border-nx-accent-fill/40"),
    ("text-[#b9fb30]", "text-nx-accent"),
    ("text-[#c9dfb4]", "text-nx-accent"),
    ("text-[#a6f76b]", "text-nx-accent"),
    ("text-[#5a7800]", "text-nx-accent"),

    # 4. Muted text replacements -> text-nx-ink-2 / text-nx-ink-3
    ("text-[#9aa1a6]", "text-nx-ink-2"),
    ("text-[#aeb5b5]", "text-nx-ink-2"),
    ("text-[#aab5b5]", "text-nx-ink-2"),
    ("text-[#8f9c9f]", "text-nx-ink-2"),
    ("text-[#929da2]", "text-nx-ink-2"),
    ("text-[#8e9598]", "text-nx-ink-2"),
    ("text-[#9da9a9]", "text-nx-ink-2"),
    ("text-[#9fa8a8]", "text-nx-ink-2"),
    ("text-[#a0a8a7]", "text-nx-ink-2"),
    ("text-[#a0aaab]", "text-nx-ink-2"),
    ("text-[#a2aaa9]", "text-nx-ink-2"),
    ("text-[#a3adad]", "text-nx-ink-2"),
    ("text-[#a9b0b1]", "text-nx-ink-2"),
    ("text-[#afb4b7]", "text-nx-ink-2"),
    ("text-[#b9c0c1]", "text-nx-ink-2"),
    ("text-[#c9d0d4]", "text-nx-ink-2"),
    ("text-[#c9d1d0]", "text-nx-ink-2"),
    ("text-[#cdd5d6]", "text-nx-ink-2"),
    ("text-[#cfd8d8]", "text-nx-ink-2"),
    ("text-[#d0d6d8]", "text-nx-ink-2"),
    ("text-[#555d62]", "text-nx-ink-2"),
    ("text-[#6b7280]", "text-nx-ink-2"),
    ("text-[#eef2f2]", "text-nx-ink"),
    ("text-[#f5f7f8]", "text-nx-ink"),
    ("placeholder-[#788083]", "placeholder:text-nx-ink-3"),
    ("placeholder-[#9aa1a6]", "placeholder:text-nx-ink-3"),
    ("placeholder:text-[#9aa1a6]", "placeholder:text-nx-ink-3"),

    # 5. Borders & Dividers -> border-nx-line / divide-nx-line / border-nx-line-hi
    ("border-[#222629]", "border-nx-line"),
    ("border-[#222629]/40", "border-nx-line/40"),
    ("border-[#222629]/50", "border-nx-line/50"),
    ("border-[#222629]/60", "border-nx-line/60"),
    ("border-[#293238]", "border-nx-line"),
    ("border-[#2a3031]", "border-nx-line"),
    ("border-[#2a3033]", "border-nx-line"),
    ("border-[#2a3033]/60", "border-nx-line/60"),
    ("sm:border-[#2a3033]", "sm:border-nx-line"),
    ("border-[#2f3839]", "border-nx-line"),
    ("border-[#303738]", "border-nx-line"),
    ("border-[#30383a]", "border-nx-line"),
    ("border-[#31373a]", "border-nx-line"),
    ("border-[#32393c]", "border-nx-line"),
    ("border-[#323b3d]", "border-nx-line"),
    ("border-[#343b3e]", "border-nx-line"),
    ("border-[#343b3f]", "border-nx-line"),
    ("border-[#353d3c]", "border-nx-line-hi"),
    ("border-[#374146]", "border-nx-line-hi"),
    ("border-[#374151]", "border-nx-line-hi"),
    ("border-[#3a4446]", "border-nx-line-hi"),
    ("border-[#41474a]", "border-nx-line-hi"),
    ("border-[#4a5356]", "border-nx-line-hi"),
    ("hover:border-[#353b40]", "hover:border-nx-line-hi"),
    ("hover:border-[#353d42]", "hover:border-nx-line-hi"),
    ("hover:border-[#384247]", "hover:border-nx-line-hi"),
    ("hover:border-[#424a4e]", "hover:border-nx-line-hi"),
    ("divide-[#1e2327]", "divide-nx-line"),
    ("divide-[#222629]/50", "divide-nx-line/50"),
    ("divide-[#222629]/60", "divide-nx-line/60"),
    ("divide-[#22272b]", "divide-nx-line"),
    ("divide-[#2a3031]", "divide-nx-line"),
    ("divide-[#2d3434]", "divide-nx-line"),
    ("divide-[#303638]", "divide-nx-line"),

    # 6. Surfaces & Backgrounds -> bg-nx-surface / bg-nx-raised / bg-nx-ground
    ("bg-[#080a0b]", "bg-nx-surface"),
    ("bg-[#0b0e10]", "bg-nx-surface"),
    ("bg-[#0b1012]", "bg-nx-surface"),
    ("bg-[#0c1012]", "bg-nx-surface"),
    ("bg-[#0c1217]", "bg-nx-surface"),
    ("bg-[#0d0f11]", "bg-nx-surface"),
    ("bg-[#0e1012]", "bg-nx-surface"),
    ("bg-[#101214]", "bg-nx-surface"),
    ("bg-[#101214]/80", "bg-nx-surface/80"),
    ("bg-[#101315]", "bg-nx-surface"),
    ("bg-[#101519]", "bg-nx-surface"),
    ("bg-[#111416]", "bg-nx-surface"),
    ("bg-[#121618]", "bg-nx-surface"),
    ("bg-[#14171a]", "bg-nx-raised"),
    ("bg-[#14171a]/50", "bg-nx-raised/50"),
    ("bg-[#14171a]/70", "bg-nx-raised/70"),
    ("bg-[#14181a]", "bg-nx-raised"),
    ("bg-[#141b1b]", "bg-nx-raised"),
    ("bg-[#141b22]", "bg-nx-raised"),
    ("bg-[#151a1c]", "bg-nx-raised"),
    ("bg-[#181c20]", "bg-nx-raised"),
    ("bg-[#191d20]", "bg-nx-raised"),
    ("bg-[#1a1e20]", "bg-nx-raised"),
    ("bg-[#1a1e21]", "bg-nx-raised"),
    ("bg-[#1b1e20]", "bg-nx-raised"),
    ("bg-[#1b2022]", "bg-nx-raised"),
    ("bg-[#1c2023]", "bg-nx-raised"),
    ("bg-[#1e2326]", "bg-nx-raised"),
    ("bg-[#1e2327]", "bg-nx-raised"),
    ("bg-[#1f2224]", "bg-nx-raised"),
    ("bg-[#1f2428]", "bg-nx-raised"),
    ("bg-[#222629]", "bg-nx-raised"),
    ("bg-[#2a3033]", "bg-nx-raised"),
    ("bg-[#30363a]", "bg-nx-raised"),
    ("bg-[#303739]", "bg-nx-raised"),
    ("bg-[#31383b]", "bg-nx-raised"),
    ("bg-[#343b3e]", "bg-nx-raised"),
    ("hover:bg-[#14171a]", "hover:bg-nx-raised"),
    ("hover:bg-[#14171a]/50", "hover:bg-nx-raised/50"),
    ("hover:bg-[#14171a]/80", "hover:bg-nx-raised/80"),
    ("hover:bg-[#15191b]", "hover:bg-nx-raised"),
    ("hover:bg-[#191d20]", "hover:bg-nx-raised"),
    ("hover:bg-[#1a1e21]", "hover:bg-nx-raised"),
    ("hover:bg-[#1a1f21]", "hover:bg-nx-raised"),
    ("hover:bg-[#1c2024]", "hover:bg-nx-raised"),
    ("hover:bg-[#1e2327]", "hover:bg-nx-raised"),
    ("hover:bg-[#1f2428]", "hover:bg-nx-raised"),
    ("hover:bg-[#222629]", "hover:bg-nx-raised"),

    # 7. Semantic Status: Warning, Destructive, Info, Success
    # Warning
    ("text-[#fbbf24]", "text-warning"),
    ("text-[#ffd24d]", "text-warning"),
    ("text-[#e5be42]", "text-warning"),
    ("bg-[#fbbf24]", "bg-warning"),
    ("bg-[#372b09]", "bg-warning/15"),
    ("bg-[#2a1d08]", "bg-warning/15"),
    ("bg-[#1c1803]", "bg-warning/15"),
    ("bg-[#282105]", "bg-warning/15"),
    ("border-[#715a12]", "border-warning/30"),
    ("border-[#735c0b]", "border-warning/30"),
    ("border-[#f59e0b]", "border-warning"),
    ("border-[#f59e0b]/40", "border-warning/40"),
    ("border-[#fbbf24]/40", "border-warning/40"),
    ("border-[#fbbf24]/50", "border-warning/50"),
    # Destructive
    ("text-[#ff8290]", "text-destructive"),
    ("text-[#ff6672]", "text-destructive"),
    ("text-[#ff909b]", "text-destructive"),
    ("bg-[#ff8290]", "bg-destructive"),
    ("bg-[#151012]", "bg-destructive/15"),
    ("bg-[#160d0e]", "bg-destructive/15"),
    ("bg-[#1a1214]", "bg-destructive/15"),
    ("bg-[#2b1114]", "bg-destructive/15"),
    ("bg-[#2d1115]", "bg-destructive/15"),
    ("bg-[#3b1c20]", "bg-destructive/15"),
    ("bg-[#3b1c20]/60", "bg-destructive/20"),
    ("hover:bg-[#201416]", "hover:bg-destructive/20"),
    ("hover:bg-[#80404b]/20", "hover:bg-destructive/20"),
    ("border-[#7a343e]", "border-destructive/30"),
    ("border-[#80404b]", "border-destructive/30"),
    ("border-[#3b1c20]", "border-destructive/30"),
    ("border-[#f43f5e]", "border-destructive"),
    ("border-[#f43f5e]/30", "border-destructive/30"),
    ("border-[#ff8290]/40", "border-destructive/40"),
    ("focus:border-[#ff8290]", "focus:border-destructive"),
    ("hover:border-[#ff8290]", "hover:border-destructive"),
    # Info
    ("text-[#38bdf8]", "text-info"),
    ("text-[#73adff]", "text-info"),
    ("text-[#93c5fd]", "text-info"),
    ("bg-[#38bdf8]", "bg-info"),
    ("bg-[#0c2331]", "bg-info/15"),
    ("bg-[#0c2331]/60", "bg-info/20"),
    ("border-[#38bdf8]/40", "border-info/40"),
    ("border-[#38bdf8]/50", "border-info/50"),
    ("border-[#3b82f6]/30", "border-info/30"),
    ("hover:border-[#38bdf8]", "hover:border-info"),
    ("hover:border-[#38bdf8]/50", "hover:border-info/50"),
    # Success
    ("text-[#4ade80]", "text-success"),
    ("border-[#22c55e]", "border-success"),
    ("border-[#22c55e]/30", "border-success/30"),
    ("border-[#4ade80]/50", "border-success/50"),
    # Purple
    ("text-[#c084fc]", "text-purple-400"),
    ("border-[#c084fc]/40", "border-purple-400/40"),

    # 8. Gradients
    ("from-[#171b1b]", "from-nx-surface"),
    ("from-[#15191b]", "from-nx-surface"),
    ("from-[#101214]", "from-nx-surface"),
    ("from-[#14171a]", "from-nx-raised"),
    ("from-[#172102]", "from-nx-surface"),
    ("from-[#191f0f]", "from-nx-surface"),
    ("from-[#1c2602]", "from-nx-surface"),
    ("from-[#222923]", "from-nx-surface"),
    ("from-[#222e00]", "from-nx-accent-fill/15"),
    ("from-[#253309]", "from-nx-accent-fill/15"),
    ("from-[#26360c]", "from-nx-accent-fill/15"),
    ("from-[#36460e]", "from-nx-accent-fill/20"),
    ("from-[#7ca100]", "from-nx-accent-fill/40"),
    ("from-[#9bc900]", "from-nx-accent-fill/40"),
    ("to-[#0d1110]", "to-nx-surface"),
    ("to-[#0e1112]", "to-nx-surface"),
    ("to-[#101214]", "to-nx-surface"),
    ("to-[#101314]", "to-nx-surface"),
    ("to-[#101315]", "to-nx-surface"),
    ("to-[#101416]", "to-nx-surface"),
    ("to-[#101c14]", "to-nx-surface"),
    ("to-[#12160d]", "to-nx-surface"),
    ("to-[#121804]", "to-nx-surface"),
    ("to-[#141a13]", "to-nx-surface"),
    ("to-[#172009]", "to-nx-accent-fill/15"),
    ("to-[#c8ff05]", "to-nx-accent-fill"),
    ("to-[#d0ff05]", "to-nx-accent-fill"),
    ("via-[#14171a]", "via-nx-raised"),
    ("via-[#161a1d]", "via-nx-raised"),

    # 9. Hardcoded text-white where it breaks light mode readability
    ("font-bold text-white", "font-bold text-nx-ink"),
    ("font-black text-white", "font-black text-nx-ink"),
    ("font-semibold text-white", "font-semibold text-nx-ink"),
    ("font-medium text-white", "font-medium text-nx-ink"),
    ("hover:text-white", "hover:text-nx-ink"),
]

def consolidate_content(content: str) -> str:
    for target, replacement in EXACT_REPLACEMENTS:
        content = content.replace(target, replacement)
    
    # Glow regex
    content = re.sub(r'shadow-\[0_0_12px_rgba\([0-9]+,[0-9]+,[0-9]+,[0-9.]+\)\]', 'shadow-nx-glow', content)
    content = re.sub(r'shadow-\[0_0_16px_rgba\([0-9]+,[0-9]+,[0-9]+,[0-9.]+\)\]', 'shadow-nx-glow', content)
    content = re.sub(r'shadow-\[0_0_24px_rgba\([0-9]+,[0-9]+,[0-9]+,[0-9.]+\)\]', 'shadow-nx-glow', content)

    return content

def process_file(filepath: str):
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    updated = consolidate_content(original)
    if updated != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(updated)
        print(f"Updated: {filepath}")
    else:
        print(f"No changes: {filepath}")

if __name__ == '__main__':
    targets = sys.argv[1:]
    for target in targets:
        if os.path.isfile(target):
            process_file(target)
        elif os.path.isdir(target):
            for root, _, files in os.walk(target):
                for file in files:
                    if file.endswith('.tsx') or file.endswith('.ts'):
                        process_file(os.path.join(root, file))
