# Open Peeps × Subagent 形象提示词套件

基于 [Open Peeps](https://www.openpeeps.com/)（Pablo Stanley）的模块化角色生成规则，改编为 subagent 形象信息生成提示词。  
风格锚点：手绘矢量插画 · Mix & Match 部件拼装 · 黑白为起点可换色 · 友好可辨识。

---

## 0. 系统规则（先读这段）

你是 subagent 形象设计师。生成任何 subagent 的视觉身份时，严格遵守：

1. **模块化拼装**：像 Open Peeps 一样，角色由可互换部件构成，不要发明一体式不可拆的描述。
2. **必填五轴**：发型 / 表情 / 身体姿态与服装 / 胡须 / 配饰；颜色可选。
3. **构图三选一**：`bust`（半身，工卡/头像） | `standing`（全身站立） | `sitting`（坐姿）。
4. **语义一致**：部件组合要能映射到 subagent 的职责气质（冷静、冲锋、执行、审查…）。
5. **输出可执行**：给出自然语言形象描述 + 结构化部件 JSON，方便后续出图或做 SVG 工卡。
6. **禁止**：写实照片风、写实人脸细节、复杂背景叙事、品牌 logo、过度装饰。

### 风格锁定（每次生成都附带）

```
手绘矢量人物插画，Open Peeps 风格：黑色描边 + 平涂/浅色填充，线条略带手绘抖动感，
无阴影无渐变（或仅极简单色渐变），友好、干净、可辨识，白底或透明底。
```

---

## 1. 部件词典（可选值）

### 1.1 发型 Hair

| 类别 | 选项 |
|------|------|
| 短发 | Short, ShortCurly, ShortMessy, ShortScratch, ShortVolumed, ShortWavy, FlatTop, FlatTopLong, Mohawk, MohawkDino, ShavedRight, ShavedSides, ShavedWavy, Bald, BaldSides, BaldTop |
| 中长 | Medium, MediumBangs, MediumBangsFilled, MediumLong, MediumShort, MediumStraight, MediumShade, Bangs, BangsFilled, Bear, Pomp |
| 长发 | Long, LongAfro, LongBangs, LongCurly, Afro, Twists, TwistsVolumed, CornRows, CornRowsFilled, BantuKnots |
| 盘发/帽饰 | Bun, Buns, BunCurly, BunFancy, GrayBun, Beanie, HatHip, Hijab, Turban, GrayMedium, GrayShort |
| 职业变体 | DocBouffant, DocSurgery, DocShield |

### 1.2 表情 Face

| 情绪域 | 选项 |
|--------|------|
| 平静/友好 | Calm, CalmNM, Smile, SmileNM, SmileBig, SmileLol, SmileTeeth, Cute, Cheeky, Blank |
| 专注/专业 | Serious, Solemn, Driven, Explaining, Contempt |
| 疲惫/担忧 | Tired, Concerned, ConcernedFear, Suspicious |
| 强烈情绪 | Angry, VeryAngry, Rage, Fear, Awe, Hectic, Monster, Cyclops |
| 放松/其他 | EyesClosed, EatingHappy, LoveGrin, LoveGrinTeeth, CheersNM, OldAged |

### 1.3 胡须 FacialHair

`None, Chin, Full, FullMajestic, FullMedium, Goatee, GoateeCircle, Dali, Handlebars, Imperial, Painters, PaintersFilled, Swashbuckler, MoustacheThin, Yosemite, GrayFull, MajesticHandlebars`

### 1.4 配饰 Accessories

`None, GlassRound, GlassRoundThick, GlassClubmaster, GlassAviator, GlassButterfly, GlassButterflyOutline, SunglassClubmaster, SunglassWayfarer, Eyepatch`

### 1.5 身体 / 姿态与服装 Body

**半身 bust（工卡首选）**

| 气质 | 选项 |
|------|------|
| 商务专业 | BlazerBlackTee, ShirtCoat, Turtleneck, ButtonShirt |
| 技术极客 | Geek, Gaming, Device, Paper |
| 休闲日常 | Hoodie, Shirt, ShirtFilled, PocketShirt, Sweater, SweaterDots, PoloSweater, StripedShirt, SportyShirt, DotJacket, FurJacket |
| 动作姿态 | ArmsCrossed, PointingUp, Explaining, Coffee, Whatever, Thunder, Killer, Selena, Dress |

**站立 standing**

| 类型 | 选项 |
|------|------|
| 职业装 | BlazerBW/WB, BlazerPantsBW/WB, ShirtBW/WB, ShirtPantsBW/WB |
| 动作 | CrossedArmsBW/WB, PointingFingerBW/WB, WalkingBW/WB/WalkingFilled, EasingBW/WB, RestingBW/WB, RoboDanceBW/WB/Outline, PolkaDots |
| 医护 | Doc, DocProtectiveClothe, DocStethoscope |

> 命名中 `BW` = Black & White（线稿感更强），`WB` = White on Black / 浅底反色感。

**坐姿 sitting**

`Bike, ClosedLegBW, ClosedLegWB, CrossedLegs, HandsBackBW, HandsBackWB, MediumBW, MediumWB, OneLegUpBW, OneLegUpWB, WheelChair`

### 1.6 颜色 Colors（可选层）

- **stroke**：描边色，默认 `#111111` 或 `#000000`
- **fill**：皮肤/服装填充，默认浅灰/白 `#F5F5F5` / `#FFFFFF`
- **accent**：角色识别色（每个 subagent 一个记忆色），例：
  - 探索蓝 `#3B82F6`、执行橙 `#F97316`、审查绿 `#22C55E`、告警红 `#EF4444`、研究紫 `#8B5CF6`
- **background**：`transparent` 或浅底色块

---

## 2. 主提示词（Master Prompt）

把下面整段发给模型，填入 `{{...}}` 即可：

```text
# 任务
为 subagent「{{AGENT_NAME}}」生成 Open Peeps 风格的形象信息。

# Subagent 背景
- 角色名：{{AGENT_NAME}}
- 职责：{{AGENT_ROLE}}
- 工具/技能：{{AGENT_TOOLS}}
- 气质关键词（2–4 个）：{{AGENT_VIBES}}
- 构图：{{COMPOSITION}}  # bust | standing | sitting
- 是否需要配饰偏好：{{ACCESSORY_HINT}}  # 如：眼镜=学者，无=行动派

# 生成规则
1. 从下方部件词典中选择，禁止发明词典外部件名。
2. 每个部件必须能解释「为什么匹配职责」（一句话即可）。
3. 默认黑白线稿；为该 agent 指定 1 个 accent 色。
4. 输出两部分：
   A. 形象自然语言描述（用于工卡左侧/文档，80–120 字中文）
   B. 结构化 JSON（便于出图/程序化渲染）
5. 若职责含「审查/冷静/架构」→ 偏 Serious/Calm + 稳重发型 + 眼镜。
6. 若职责含「执行/冲锋/实现」→ 偏 Driven/SmileBig + 干净短发或帽 + 动作型 body。
7. 若职责含「研究/深思」→ 偏 Solemn/Explaining + 中长发或 Bun + Device/Paper。
8. 若职责含「协调/沟通」→ 偏 Smile/SmileTeeth + 轻松发型 + ArmsCrossed/Pointing。

# 部件词典
（粘贴第 1 节完整词典）

# 输出格式
## 形象描述
<80–120 字中文，可直接贴进工卡>

## 部件 JSON
```json
{
  "agent": "{{AGENT_NAME}}",
  "composition": "{{COMPOSITION}}",
  "hair": "...",
  "face": "...",
  "facialHair": "...",
  "accessory": "...",
  "body": "...",
  "colors": {
    "stroke": "#111111",
    "fill": "#F5F5F5",
    "accent": "#......",
    "background": "transparent"
  },
  "reasoning": {
    "hair": "...",
    "face": "...",
    "body": "...",
    "accent": "..."
  }
}
```

## 一句话记忆点
「这个 subagent 一眼看起来像 ______」
```

---

## 3. 轻量快捷模板（常见 subagent 预设）

### 3.1 总控 / Orchestrator

```text
发型：Medium 或 BunFancy
表情：Driven 或 Serious
胡须：None
配饰：GlassClubmaster（可选）
身体：bust + BlazerBlackTee 或 ArmsCrossed
描边 #111111，accent #111111 或深蓝 #1E3A5F
构图：bust
```

**形象描述范例：**  
中长发束在脑后，神情专注而果断，西装内搭黑 Tee，双臂微收。黑白线稿、黑描边，一枚深蓝作为识别色——像把整支 subagent 团队捏在手里的总控台。

### 3.2 探索 / Explore Agent

```text
发型：ShortMessy 或 Mohawk 或 HatHip
表情：Awe 或 Cheeky 或 SmileBig
配饰：None 或 SunglassWayfarer
身体：standing + WalkingWB 或 bust + Hoodie
accent #3B82F6（探索蓝）
构图：standing 优先，工卡用 bust
```

### 3.3 实现 / General Build Agent

```text
发型：Short 或 MediumShort 或 Beanie
表情：SmileTeeth 或 Driven
胡须：Goatee 或 None
身体：bust + Hoodie 或 Geek，或 standing + ShirtPantsWB
accent #F97316（执行橙）
构图：bust
```

### 3.4 审查 / Review Agent

```text
发型：MediumStraight 或 GrayShort 或 BaldTop
表情：Serious 或 Solemn
配饰：GlassRoundThick 或 GlassClubmaster
胡须：FullMedium 或 None
身体：bust + Turtleneck 或 ShirtCoat
accent #22C55E（审查绿）
构图：bust
```

### 3.5 研究 / Research Agent

```text
发型：Long 或 Medium 或 Bun
表情：Explaining 或 Solemn
配饰：GlassRound 或 GlassAviator
身体：bust + Device 或 Paper，或 sitting + MediumWB
accent #8B5CF6（研究紫）
构图：sitting 或 bust
```

### 3.6 调试 / Debug Agent

```text
发型：ShortScratch 或 ShavedSides
表情：Suspicious 或 Concerned 或 Hectic
配饰：None 或 Eyepatch（戏剧化）
身体：bust + Gaming 或 Device
accent #EF4444（告警红，慎用，仅故障排查场景）
构图：bust
```

### 3.7 文档 / Docs Agent

```text
发型：Bangs 或 MediumBangs 或 BunFancy
表情：Smile 或 Cute
配饰：GlassButterflyOutline 或 None
身体：bust + StripedShirt 或 PocketShirt
accent #0EA5E9（天蓝）
构图：bust
```

---

## 4. 批量生成提示词（一次产一支小队）

```text
# 任务
为以下 subagent 小队生成一组「可同框但不撞脸」的形象。每人独立五轴，但共享同一画风与描边规范。

# 约束
- 全员：Open Peeps 手绘矢量，黑描边 #111111，白底
- 每人一个不同 accent 色，禁止两人同色
- 发型互不重复；表情可同族但不得同名
- 构图统一 bust（工卡）或按名单指定
- 输出：每人「形象描述 + JSON + 一句话记忆点」，最后给一张「小队合影构图建议」

# 名单
1. {{name}} — {{role}} — vibes: {{vibes}}
2. ...
```

---

## 5. 出图用正向提示词（接 image_gen / SD / Midjourney）

把 JSON 翻译成图像模型能吃的正向提示：

```text
Open Peeps style hand-drawn vector character illustration,
{{composition}} portrait of a person,
hair: {{hair}}, facial expression: {{face}},
facial hair: {{facialHair}}, accessory: {{accessory}},
outfit/pose: {{body}},
flat colors, thick black outline, simple shapes,
minimal shading, clean white background,
no text, no watermark, no photorealism
accent color {{accent}} on clothing or accessories only
```

**反向提示词（通用）：**

```text
photorealistic, 3d render, complex background, gradient mesh,
heavy shadows, anime eyes, extra fingers, text, logo, watermark
```

---

## 6. 工卡（横向 Badge）输出模板

左侧形象、右侧职责——可直接给 `demo-badge-writer` 或人工排版：

```markdown
### {{AGENT_NAME}}

**形象**  
{{形象描述 80–120 字}}

**一句话**  
{{一句话记忆点}}

**职责**  
- {{职责 1}}
- {{职责 2}}

**工具**  
`{{tool1}}` `{{tool2}}` `{{tool3}}`

**部件**  
hair={{hair}} · face={{face}} · body={{body}} · acc={{accessory}} · accent={{accent}}
```

---

## 7. 使用示例

**输入：**

> 为 subagent「代码审查员 Code Reviewer」生成形象。职责：PR 审查、安全与可维护性把关。工具：grep, read, tests。气质：冷静、挑剔、可靠。构图：bust。

**期望输出（示意）：**

> 中长直发，神情严肃专注，圆框厚眼镜，高领毛衣；黑白线稿，仅领口一道审查绿 `#22C55E` 作为识别色。像把 CI 门禁画成了一个人。

```json
{
  "agent": "Code Reviewer",
  "composition": "bust",
  "hair": "MediumStraight",
  "face": "Serious",
  "facialHair": "None",
  "accessory": "GlassRoundThick",
  "body": "Turtleneck",
  "colors": {
    "stroke": "#111111",
    "fill": "#F5F5F5",
    "accent": "#22C55E",
    "background": "transparent"
  }
}
```

---

## 8. 组合规模（设计激励）

Open Peeps 官方称约 **58.4 万+** 种合法组合。  
为 subagent 阵容选型时：优先「职责可读性」，其次「队伍差异度」，最后才追求花活。

| 优先级 | 目标 | 做法 |
|--------|------|------|
| P0 | 一眼认出角色 | 构图统一 + 表情/服装映射职责 |
| P1 | 互不撞脸 | 发型与 accent 色全队唯一 |
| P2 | 可扩展 | 新 agent 只换五轴，不改画风 |

---

## 9. 与现有技能的衔接

| 场景 | 用法 |
|------|------|
| 工卡文案 | 本套件第 6 节 → `demo-badge-writer` |
| 批量角色设定 | 第 4 节批量提示 |
| 直接出图 | 第 5 节翻译给 `image_gen` |
| 程序化渲染 | 第 2 节 JSON → react-peeps / SVG 组件 |

---

*Open Peeps by Pablo Stanley · CC0 · 规则整理自 openpeeps.com 与开源组件目录（react-peeps / peeps-generator）*
