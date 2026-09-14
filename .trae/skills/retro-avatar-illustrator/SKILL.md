---
name: retro-avatar-illustrator
description: "生成与用户基准图 assets/reference/new_avatars_rounded_square.jpg 完全同风格的可爱扁平卡通头像：东亚可爱扁平矢量风，核心特征为「一角色一色」同色系染色系统（头发+服装染成底色同色系浅色调）+ 实心黑圆点眼 + 大头幼态比例。支持圆角方底（默认）、圆底、纸片底、纸牌底。当用户要求生成可爱卡通头像、团队头像、随机角色时调用。"
---

# 可爱扁平角色头像生成器（Kawaii Flat Avatar Illustrator）

生成与用户基准图完全统一风格的卡通头像插画。**唯一风格权威 = 基准图 `assets/reference/new_avatars_rounded_square.jpg`**。所有生成必须对齐它，而不是任何 AI 自己生成的图。

## 一、目标风格：东亚可爱扁平矢量风（基准图风格）

**核心设计语言：「一角色一色」同色系染色系统**——每个角色绑定一个专属马卡龙色，头发和服装都染成该色的浅色调，与底色形成同色系统一。这是基准图的灵魂特征，绝不可改为黑白人物。

### 风格指纹（每次生成逐项对照）

| 维度 | 规格 | 提示词表述 |
|------|------|------------|
| **染色系统** | 头发+服装染成与底色同色系的马卡龙浅色调；一角色一色 | `the character's hair AND clothing tinted in the same pastel color family as the badge background, one color theme per character` |
| 眼型 | 实心黑色圆点眼，无眼白无高光无瞳孔 | `solid black dot eyes, no sclera, no highlights` |
| 比例 | 大头幼态，头部占画面约 60%+ | `oversized head with baby-face proportions` |
| 线质 | 细中黑线（2-3px），手绘微抖，单线系统 | `uniform thin-medium black hand-drawn outlines with slight wobble` |
| 上色 | 100% 平涂零渐变零阴影 | `100% flat fills, strictly no shading, no gradients` |
| 肤色 | 浅米白（不染色） | `pale cream skin` |
| 底形 | 竖版圆角矩形（约 4:5），纯色底+白外围 | `single rounded rectangle badge (portrait orientation), clean white background outside` |
| 情感 | 零威胁最大友好 | `maximum friendliness, zero-threat character design` |

### 风格核心段（纯文本生成时逐字复用）

```
Kawaii flat character illustration matching the reference style: East Asian
cute flat vector art. Uniform thin-medium black hand-drawn outlines with
slight wobble, single line-weight system. Oversized head with baby-face
proportions, solid black dot eyes with no sclera, simplified arc brows,
minimal symbolic facial features, soft rounded geometry. 100% flat fills,
strictly no shading, no gradients, no highlights, no textures. Pale cream
skin. Maximum friendliness, zero-threat character design, bust crop from
chest up.
```

## 二、参考图生成法（首选，必须优先使用）

**参考图 = 基准图 `assets/reference/new_avatars_rounded_square.jpg`（唯一标准）**。

**铁律**：
1. **绝不用 AI 自己生成的图做参考图**——会造成自我循环漂移，每代偏离基准一步（已实测翻车：lf/card/ref 系列因参考自身生成物而偏离基准图，被用户否决）
2. 基准图是四人组图，做参考生成单人/多人均有效（已实测：一次生成 3 张一致度全部"高"）
3. 染色规则必须在提示词里显式重申（参考图传递风格大方向，染色等关键规则靠文字锁死）

### 参考图版单人模板（首选）

```
Strictly match the exact illustration style of the reference image (a set
of four pastel avatar cards). CRITICAL color rule from the reference: the
character's hair AND clothing must be tinted in the same pastel color
family as the badge background, exactly like the blue-haired girl on the
blue badge and the pink-haired girl on the pink badge in the reference.
Same uniform thin-medium black hand-drawn outlines, solid black dot eyes
with no sclera, oversized head baby-face proportions, flat fills with zero
shading or gradients, pale cream skin. Generate ONE new original character
in this exact style: {人物特征句}. Single rounded rectangle badge
(portrait orientation), background color: {底色}, hair and clothing tinted
in matching {底色} tones. Clean white background outside the badge.
```

### 纯文本模板（仅当无法用参考图时）

风格核心段 + 底形句 + 染色句 + 人物特征句：

```
{风格核心段} {底形句} Background color: {底色}, absolutely flat uniform
solid fill. The character's hair and clothing are tinted in the same
pastel color family as the badge background ({底色} tones), pale cream
skin. Character: {人物特征句}. Centered composition.
```

## 三、风格校准要点（压制生成器漂移，实测总结）

| 漂移现象 | 压制句（必须加入） |
|----------|---------------------|
| **人物变黑白（黑发+黑白服装），丢失染色系统** | 显式染色句：`the character's hair AND clothing tinted in the same pastel color family as the badge background`（染色系统是基准图灵魂，与旧版"黑白单色规则"相反——旧规则已废弃） |
| 眼睛长出眼白/高光/瞳孔 | `solid black dot eyes, no sclera, no highlights` |
| 头身比例写实化 | `oversized head with baby-face proportions` |
| 底色出现径向渐变 | `absolutely flat uniform solid fill, no radial gradient, no vignette` |
| 戴眼镜角色眼睛藏在镜框后或镜片涂色 | `round glasses with transparent empty lenses` |
| 红晕渲染成黑色 | `subtle round blush marks in light soft pink color (pink, NOT black)` |
| 服装染成底色以外的杂色 | `clothing tinted in the same {底色} color family` |
| 闭眼笑被参考图眼型覆盖为圆点眼 | 闭眼笑角色改用纯文本模板（参考图眼型覆盖是双向的）；眨眼（一闭一开）可正常用参考图 + 详细描述混合眼型 |
| 多人组大小不一、重叠 | `equal size, even spacing, no overlapping` |

## 四、底形选项

生成前确认底形；未指定时**默认竖版圆角矩形（基准图同款，portrait 4:5，图片尺寸用 portrait_4_3）**。

| 底形 | 说明 | 提示词片段 |
|------|------|------------|
| **圆角方底（默认）** | 竖版圆角矩形纯色底+白外围，与基准图一致 | `Single rounded rectangle badge (portrait orientation), clean white background outside the badge.` |
| 圆底 | 正圆形纯色底 | `The character is set inside a perfect circular solid-color badge, centered with generous margin.` |
| 纸片底 | 不规则手撕纸片形状 | `The character is set on an irregular hand-torn paper-shaped solid-color background with naturally wavy organic edges.` |
| 纸牌底 | 扑克牌式竖版圆角矩形+细白牌边 | `The character is set inside a playing-card shaped badge: a tall portrait-oriented rounded rectangle like a poker card, with a thin clean white border frame around its edge, placed on a clean white background. Card fill color: {底色}, absolutely flat uniform solid fill.` |

**染色系统适用于所有底形**（纸牌底、纸片底的角色同样染底色同色系）。

## 五、底色系统（一角色一色）

马卡龙低饱和高明度 pastel，每角色绑定一色，多人组轮换、相邻不同色：

**基准图四色**（已验证）：雾蓝 `powder blue`、奶油黄 `butter cream yellow`、珊瑚 `coral peach`、暖卡其 `warm khaki tan`
**扩展**：柔粉 `soft pastel pink`、灰粉 `dusty rose`、薰衣草紫 `light lavender`、薄荷绿 `mint green`、鼠尾草绿 `muted sage`、浅天蓝 `pale sky blue`、淡杏 `light apricot`

## 六、特征词典（组装人物特征时各维度抽 1 项或省略）

### 表情
gentle smile 浅笑 / open-mouthed enthusiastic smile 露齿大笑 / subtle reserved smile 含蓄微笑 / wink + playful smile 眨眼俏皮笑 / cheerful grin with closed eyes 眯眼笑 / surprised small o mouth 惊讶 / calm neutral 平静 / confident smirk 自信咧嘴

### 眼睛
solid black dot eyes 实心黑圆点（唯一标准）/ closed curved arcs 闭眼笑弧线（纯文本模板专用）

### 眉毛
thin gently curved brows 细弯眉 / thick bold brows 浓粗眉 / flat straight brows 平直眉 / thin arched brows 细拱眉

### 眼镜
oversized thick black-rimmed circular glasses 粗黑框大圆镜 / round glasses 圆框镜 / thin round glasses 细圆框镜 / rectangular glasses 方框镜 / none 无

### 胡须
full beard and mustache 络腮胡 / goatee 山羊胡 / mustache 八字胡 / light stubble 青茬 / white beard 白须（老年）/ clean-shaven 无须

### 脸型
round face 圆脸 / oval face 鹅蛋脸 / square face 方脸 / heart-shaped face 心形脸 / chubby with double chin 胖脸双下巴

### 体型
slim 纤瘦 / average 匀称 / chubby 微胖 / heavyset broad shoulders 壮硕宽肩

### 发型
short neat hair 利落短发 / buzz cut 寸头 / bald 光头 / spiky hair 刺猬头 / wavy tousled hair with tuft 卷发呆毛 / messy medium hair 凌乱中长发 / long straight hair 长直发 / curly shoulder-length hair 卷发披肩 / bob with straight bangs 波波头齐刘海 / shoulder-length side-swept hair 齐肩斜刘海 / high ponytail 高马尾 / low bun 低发髻 / top knot 头顶发髻 / twin braids 双麻花辫 / afro 爆炸头 / white hair 老年白发

### 服饰（染色规则下服装为底色同色系，款式从这里选）
striped shirt 条纹衫 / button-down collared shirt 翻领衬衫 / turtleneck 高领毛衣 / crew-neck sweater 圆领毛衣 / hoodie 连帽卫衣 / denim overalls 背带裤 / jacket 外套 / blazer 西装外套 / cardigan 开衫 / vest 纽扣马甲 / scarf over sweater 围巾叠毛衣 / apron 围裙 / flat cap outfit 鸭舌帽配立领衫 / pinafore dress 背带裙

### 头饰
flat cap 鸭舌帽 / bucket hat 渔夫帽 / beanie 毛线帽 / beret 贝雷帽 / headband 发箍 / hair clip 发夹 / bandana 头巾 / none 无

### 耳饰
small round earrings 小圆耳环 / hoop earrings 圆环耳环 / dangling earrings 垂坠耳环 / ear studs 耳钉 / none 无

### 年龄与点缀
elderly 符号包（白发/白须+眼角皱纹）/ young girl round face 少女圆脸 / subtle round pink blush marks 淡粉红晕 / tiny freckles 小雀斑

## 七、随机角色生成模式

**触发词**："随机来 N 个角色""随便创造""再来一批"。

**机制**：各维度随机抽 1 项（可省略），组合合理性校验：
- bald/buzz cut 不配发夹发箍（可配帽类）
- 老年特征配白发/白须/鸭舌帽/开衫等
- chubby 配圆脸；slim 配鹅蛋/心形脸；heavyset 配方脸
- 每角色特征 ≤6 项保简洁
- 多人组：眼型全员一致、底色轮换不重复

**随机组装模板**：`Character: {脸型} face, {体型}, {发型}, {眉毛}, {眼镜}, {胡须}, {表情}, {服饰}, {头饰}, {耳饰}.`

## 八、多头像组模板

```
Kawaii flat character illustration set matching the reference style,
East Asian cute flat vector art. {N} equal-sized {底形短语} arranged
horizontally with even spacing on a clean white background, consistent
style and size, no overlapping. 1) {底色1} badge: {人物1特征句}, hair and
clothing tinted in {底色1} tones. 2) {底色2} badge: {人物2特征句}, hair and
clothing tinted in {底色2} tones. ... Uniform thin-medium black
hand-drawn outlines. All characters have solid black dot eyes, oversized
heads with baby-face proportions, pale cream skin, 100% flat fills with
zero shading or gradients. Maximum friendliness, bust crop from chest up.
```

底形短语：圆角方底 `rounded rectangle solid-color badges` / 圆底 `circular solid-color badges` / 纸片底 `hand-torn paper-shaped solid-color scraps` / 纸牌底 `playing-card shaped badges with thin white border frames`

多头像组同样**优先用基准图做参考图生成**。

## 九、底形转换模式（已验证）

**触发**：把已有角色图换成另一种底形（如"纸片底改圆角矩形底"），保留角色本身。

**方法**：图像编辑式生成——**参考图 = 原角色图本身**。这是第二节"绝不用 AI 自生成图做参考"铁律的**唯一例外**：任务目标是保留该角色，参考的正是角色本体，不存在风格漂移（实测 15/15 成功）。

### 底形转换模板

```
Image editing task: keep the character in the input image EXACTLY the same
— same {脸型}, same {发型}, same {眼镜/头饰}, same {服饰}, same {表情},
same solid black dot eyes, same colors. ONLY change the background shape:
replace the {原底形描述} background with a {新底形描述，含底形表提示词片段},
filled with the SAME solid {底色} color, with a clean thin-medium black
hand-drawn outline around the badge edge, and a clean white background
outside the badge. Keep the flat vector illustration style, zero shading
or gradients.
```

### 实测数据与注意事项（15 张纸片底→圆角矩形底）

- 底形转换成功率 15/15；角色核心特征（发型/表情/色系/眼镜）保留率高
- **服饰细节可能轻微漂移**（如雨衣→连帽外套、连衣裙→高领毛衣）——核心识别特征不受影响，可接受
- **特殊嘴型必须在提示词里重申形状约束**（嘟嘴 `tiny protruding rounded lips like a small "3" shape, NOT an X shape`、直线嘴 `mouth as a short straight horizontal line, NOT downturned`），否则转换中易丢失
- 转换后按第十节自查清单逐项核对

## 十、工作流程

1. **确认参数**：底形（默认圆角方底竖版）、人数、特征（用户描述或随机）、底色（一角色一色轮换）
2. **组装提示词**：优先参考图生成法（参考图 = 基准图 `assets/reference/new_avatars_rounded_square.jpg`，铁律见第二节）；提示词必须包含染色句 + 第三节全部适用压制句
3. **生成**：保存到 `assets/current/rounded/`（圆角方底）或 `assets/current/retro/`（其它底形），语义化命名（如 `avatar_beret_mint`）；返工时旧文件移入 `assets/archive/` 对应子目录，`current/` 只留有效版本
4. **自查**（对照第一节指纹逐项）：
   - **染色系统：头发+服装染底色同色系（最关键，黑白人物=不合格）**
   - 实心黑圆点眼（多人组全员一致）；大头幼态；细中黑线手绘感
   - 平涂零渐变；红晕浅粉非黑；镜片透明
   - 底形正确；多人组等大等距无重叠
   - 不合格则加强对应压制句重新生成，参考图问题优先检查是否误用了非基准图

## 十一、风格基准图

- **基准图：`assets/reference/new_avatars_rounded_square.jpg`——用户提供的风格权威，四人圆角方底组（雾蓝高马尾女/奶油黄渔夫帽男/珊瑚齐肩发女/卡其白须爷爷）**
- 历史教训：曾因"文字分析基准图 + 用 AI 自生成图做参考"造成系列漂移被用户否决；修正为"基准图直接做参考图"后一次达标（`assets/reference/base_ref_*` 系列 3/3 一致度"高"）
- 可接受偏差：红晕深浅、线条粗细微差；不可接受：黑白人物（丢染色系统）、写实眼睛、渐变

## 附：文件管理

- 有效图片：`assets/current/rounded/`（当前圆角方底系列）、`assets/current/retro/`（早期 avatar 系列）
- 风格基准与参考：`assets/reference/`
- 归档：`assets/archive/v1-retro/`、`assets/archive/paper-wip/`、`assets/archive/paper-torn/`——均仅存档，不再作为任何参考
- UI 工卡头像：`assets/ui/avatars/`（demo 页面共用）
