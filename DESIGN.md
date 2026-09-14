# AI Mange — Subagent / Skill 管理台

## 产品目标

一个本地 Web 管理台，统一读取 **全局** 与 **项目级** 的 subagent / skill，按 6 种官方 Agent（claude / codex / trae / qoder / mimo / zcode）规范校验，并能按目标 Agent 规则生成对应文件。

## 视觉方向

- **Style anchor**：现代科技公司横向工卡（flat illustration badge）。米白纸感卡面、左侧扁平人物插画、右侧职责与工具，克制强调色，不是营销站也不是冷冰冰的 admin 表格。
- **Palette**（`src/index.css` tokens + 工卡硬编码）
  - 页面底 `#EDE6D8` / 卡片 `#F6F1E8` / 相框底 `#F0EBE1`
  - 墨色 `#1C1917` / 次文 `#5C564E` / 弱文 `#8A8078`
  - 线 `#E4DDD0` / `#E0D8C8`
  - 各 Agent 强调色（一卡一色）：claude `#E07A5F`, codex `#2A9D8F`, trae `#3D5A80`, qoder `#D4A373`, mimo `#E76F51`, zcode `#6D597A`
- **Type**
  - display/body: `"PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif`
  - mono: `"SF Mono", "Cascadia Code", Consolas, monospace`（路径、frontmatter、工具名）
- **Layout**
  - 顶栏：品牌章 + 搜索 + 扫描（门禁条气质）
  - 筛选：Agent 圆点 chip + 类型/范围 pill
  - 主区：横向工卡网格（1–2 列）
- **禁止**：霓虹色、玻璃拟态、信息过载、外部字体 CDN
- **Signature**：**横向工卡** —— 左 38% 扁平插画相框，右侧强调色短线 → 姓名 → 职位 → 职责标签（accent 细线）→ 工具列表（mono · 分隔）→ 校验分。

## 数据模型

```ts
type AgentKind = 'claude' | 'codex' | 'trae' | 'qoder' | 'mimo' | 'zcode'
type Scope = 'global' | 'project'
type ItemType = 'subagent' | 'skill'

interface Artifact {
  id: string              // 稳定 id
  type: ItemType
  agent: AgentKind
  scope: Scope
  name: string
  description: string
  path: string            // 绝对路径
  relPath: string
  frontmatter: Record<string, unknown>
  body: string
  tools?: string[]
  skills?: string[]
  model?: string
  icon?: string
  displayName?: string    // mimo locales
  brief?: string
  extras?: Record<string, unknown>
}

interface ValidationIssue {
  level: 'error' | 'warn' | 'info'
  code: string
  message: string
  field?: string
}

interface ValidationResult {
  artifactId: string
  agent: AgentKind
  ok: boolean
  issues: ValidationIssue[]
}
```

## Agent 官方规范（基于本机真实样本）

| Agent | Skill 路径 | Agent 路径 | Frontmatter 要点 |
|-------|-----------|-----------|------------------|
| **claude** | `~/.claude/skills/<id>/SKILL.md` · `<proj>/.claude/skills/<id>/SKILL.md` | `~/.claude/agents/<name>.md` · `<proj>/.claude/agents/<name>.md` | skill: `name`,`description`(必填) `icon`(可选)；agent: `name`,`description`,`tools` YAML 列表，可选 `model`,`skills` |
| **codex** | `~/.codex/skills/<id>/SKILL.md` | （skill 内 `agents/` 为 UI 元数据，非 subagent） | `name`,`description`；可选 `metadata.short-description`；`agents/openai.yaml` 提供 `interface.display_name` |
| **trae** | `~/.trae/builtin_skills/<id>/SKILL.md` | 无标准 subagent 目录 | `name`,`description`；name 常用 `TRAE-` 前缀；配套 `guides/` `examples/` `scripts/` |
| **qoder** | `~/.qoder/skills/<id>/SKILL.md` | `~/.qoder/agents/<name>.md` · `<proj>/.qoder/agents/<name>.md` · `<proj>/.qoder/agents/<name>/AGENT.md` | skill: `name`,`description`；agent: `tools` 为**逗号分隔字符串**（非 YAML list） |
| **mimo** | 同 claude 根 + engine-config | 同 claude | 额外 `locales/zh-CN.json` `locales/en-US.json`：`displayName` + `brief` |
| **zcode** | `~/.zcode/skills/<id>/SKILL.md` | 无标准 subagent 目录 | 同 codex 风格：`name`,`description` + 可选 `agents/openai.yaml` |

### 校验规则

**Skill 通用**
- 目录名 == frontmatter `name`（kebab-case: `[a-z0-9-]+`）
- `description` 非空，建议 ≥ 40 字符（warn）
- 必须存在 `SKILL.md`
- body 非空

**Agent 特有**
- claude: `tools` 必须是 YAML 数组；`skills` 若有也必须是数组
- qoder: `tools` 必须是逗号分隔字符串；支持 `AGENT.md` 文件名
- mimo: 建议有 locales（warn if missing）
- codex/zcode: 若有 `agents/` 建议含 `openai.yaml`（info）
- trae: name 建议 `TRAE-` 前缀（warn，仅 builtin）

**Subagent 通用**
- `name` kebab-case
- `description` 非空且宜写清「何时使用」
- body 角色定义非空

## 生成规则

输入：统一中间模型（name, description, tools[], skills[], body, model?）

输出按 target agent：
- **claude subagent** → `.claude/agents/<name>.md`，tools/skills 为 YAML list
- **qoder subagent** → `.qoder/agents/<name>.md`，tools 为 `"Read, Write, ..."` 字符串
- **claude/mimo skill** → `skills/<name>/SKILL.md` +（mimo）`locales/*.json`
- **codex/zcode skill** → `SKILL.md` + `agents/openai.yaml`
- **trae skill** → `SKILL.md`（name 可加 TRAE- 前缀）

## 服务 API

```
GET  /api/health
GET  /api/agents                         # 支持 agent 已发现的路径
GET  /api/artifacts?agent=&scope=&type=
GET  /api/artifacts/:id
POST /api/artifacts/:id/validate
POST /api/validate                       # body: { content, agent, type }
POST /api/generate                       # body: 中间模型 + targetAgent + outDir
GET  /api/specs/:agent
```

## UI 结构

```
┌ Header: 项目路径 · 扫描状态 · 刷新 ┐
├ Sidebar: Agent chips │ Scope │ Type  ┤
├ Main: 工卡网格                         │
│  ┌──[头像]──┬ name · agent · scope ┐ │
│  │  SVG卡  │ description...        │ │
│  │  通形象 │ [tools] [skills]      │ │
│  │         │ ✓ pass  · path        │ │
│  └─────────┴───────────────────────┘ │
└ Detail Drawer: 原文 · 校验 · 生成 ────┘
```

## 技术栈

- Node ≥20 + Express + TypeScript（后端 `server/`）
- Vite + React 19 + Tailwind CSS + shadcn/Radix（前端 `src/`）
- `js-yaml` 解析 frontmatter
- 纸色 engineering-sheet 视觉变量落在 `src/index.css` CSS tokens

## 目录

```
ai-mange/
  package.json
  DESIGN.md
  README.md
  assets/                 # 统一图片资源（见 README「图片资源」）
  server/
    index.js
    specs.js
    parser.js
    scanner.js
    validator.js
    generator.js
  public/
    index.html
    styles.css
    app.js
    avatar.js
```
