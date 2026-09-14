# Agent Deck (ai-mange)

统一管理 **Claude Code / Codex / Trae / Qoder / MiMo / ZCode** 的 subagent 与 skill 的可视化管理台。

在一个页面里完成：扫描 → 校验 → 浏览 → 一键生成。不再需要在各 Agent 的目录约定之间来回翻文档。

## 功能特性

- **全局 + 项目级扫描**：同时扫描 `~/.<agent>/` 与 `<project>/.<agent>/` 下的 skills / subagents
- **规则校验**：按各 Agent 官方约定校验 frontmatter、路径、`tools` 字段格式，并给出修复建议
- **横向工卡展示**：左侧卡通形象、右侧介绍，按 name hash 自动分配头像
- **一键生成**：按目标 Agent 的规则生成对应目录结构与入口文件（`SKILL.md` / `AGENT.md` 等）
- **全文检索**：按 agent / scope / type / 关键词过滤 artifacts

## 环境要求

- Node.js **>= 20**
- npm（随 Node 附带）

## 快速开始

```bash
cd ai-mange
npm install

# 开发：API :3789 + Vite :5173（/api 已代理）
npm run dev
# 打开 http://127.0.0.1:5173

# 生产：编译 TS 后由 Express 托管 dist/client
npm run build
npm start
# 打开 http://127.0.0.1:3789
```

### 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 并行启动后端 watch 与 Vite dev server |
| `npm run build` | 编译 server（tsc）与 client（vite build） |
| `npm start` | 运行编译产物 `dist/server/index.js` |
| `npm run typecheck` | 对 server 与 client 分别做 `tsc --noEmit` |

## 技术栈

- **后端**：TypeScript + Express
- **前端**：Vite + React 19 + Tailwind CSS + shadcn/Radix

## 可选环境变量

| 变量 | 说明 |
|------|------|
| `PORT` | 默认 `3789` |
| `AI_MANGE_PROJECT` | 默认扫描的项目根目录（也可在页面顶部修改） |

## 扫描路径

| Agent | Skill | Subagent |
|-------|-------|----------|
| claude | `~/.claude/skills` · `<proj>/.claude/skills` | `~/.claude/agents` · `<proj>/.claude/agents` |
| codex | `~/.codex/skills` · `<proj>/.codex/skills` | — |
| trae | `~/.trae/builtin_skills` · plugins · `<proj>/.trae/skills` | — |
| qoder | `~/.qoder/skills` · `<proj>/.qoder/skills` | `~/.qoder/agents` · `<proj>/.qoder/agents`（含 `AGENT.md` 目录形态） |
| mimo | 同 claude + `Xiaomi MiMo/engine-config/skills` | 同 claude |
| zcode | `~/.zcode/skills` · `<proj>/.zcode/skills` | — |

## 校验要点（摘要）

- **Skill**：目录名 == `name`（kebab-case）；`description` / 正文必填；入口 `SKILL.md`
- **Claude/MiMo subagent**：`tools` 必须是 YAML 列表
- **Qoder subagent**：`tools` 必须是逗号分隔字符串
- **MiMo skill**：建议附带 `locales/zh-CN.json` 与 `locales/en-US.json`
- **Codex/ZCode skill**：可选 `agents/openai.yaml`
- **Trae skill**：内置名习惯 `TRAE-` 前缀

## API

```
GET  /api/meta
GET  /api/artifacts?agent=&scope=&type=&q=&project=
GET  /api/artifacts/:id
POST /api/validate
POST /api/generate
GET  /api/specs/:agent
GET  /api/outdir?agent=&type=&scope=
```

## 目录结构

```
ai-mange/
  server/                 # 后端 TypeScript：specs/parser/scanner/validator/generator
  src/                    # React + shadcn 管理台
    components/ui/        # shadcn 风格组件（Select/Dialog/Sheet/Tabs…）
  public/                 # 静态资源（工卡头像等）
  assets/                 # 位图资源（见下节）
  ai-mange-redesign/      # 静态设计稿 demo（Apple 风）
  ai-mange-traework/      # 静态设计稿 demo（Trae Work 风）
  DESIGN.md               # 产品/视觉设计说明
  README.md
```

## 图片资源 `assets/`

所有形象图、参考图、历史版本与 UI 工卡头像统一放在 `assets/`，**不要**再散落到项目根目录。

```
assets/
  reference/              # 风格权威与对照样本（只读，生成时必须对齐）
    new_avatars_rounded_square.jpg   # 唯一风格基准图
    base_ref_01_cap_green.jpg
    base_ref_02_braids_lavender.jpg
    base_ref_03_glasses_yellow.jpg
  current/                # 当前有效系列（可继续派生）
    rounded/              # rounded_*.jpg —— 圆角方底，当前主系列
    retro/                # avatar_*.jpg —— 早期角色系列
  archive/                # 历史归档，仅供存档，不作参考
    v1-retro/             # 旧 retro / 黑白体系与返工旧版
    paper-wip/            # 纸片底 WIP 草稿
    paper-torn/           # 纸片底原图（已转换为 rounded_）
  ui/
    avatars/              # 管理台 demo 工卡头像（按角色语义命名）
  docs/
    screenshots/          # 界面截图与说明用图
```

### 各目录用途

| 目录 | 用途 | 谁会读它 |
|------|------|----------|
| `reference/` | 风格铁律基准；生成头像时作参考图 | `retro-avatar-illustrator` skill |
| `current/rounded/` | 当前交付用的圆角方底头像源文件 | 设计/替换流程 |
| `current/retro/` | 早期 avatar 系列有效文件 | 设计/对照 |
| `archive/` | 返工前版本、废稿；**禁止**再当参考 | 人工追溯 |
| `ui/avatars/` | `ai-mange-redesign` / `ai-mange-traework` 页面引用的工卡图 | 两个静态 demo |
| `docs/screenshots/` | README/文档配图 | 文档 |

### UI 头像映射（`assets/ui/avatars/`）

| 文件 | 演示角色 |
|------|----------|
| `code-reviewer.jpg` | 代码审查 |
| `badge-writer.jpg` | 工卡文案 |
| `cn-agent.jpg` | 中文 Agent |
| `avatar-illustrator.jpg` | 头像插画 skill |
| `codex-analyzer.jpg` | Codex 分析 |
| `translator.jpg` | 翻译 |
| `formatter.jpg` | 格式化 |
| `skill-builder.jpg` | Skill 构建 |
| `test-runner.jpg` | 测试执行 |
| `refactor-bot.jpg` | 重构 |
| `doc-gen.jpg` | 文档生成 |
| `bug-finder.jpg` | 缺陷发现 |
| `api-mock.jpg` | API Mock |
| `perf-check.jpg` | 性能检查 |
| `sec-scan.jpg` | 安全扫描 |

页面中的引用路径为：

```html
<img src="../../assets/ui/avatars/<name>.jpg" ...>
```

（相对 `ai-mange-*/pages/dashboard.html`）

### 主管理台头像

`src/components/avatar-image.tsx` 按 name hash 从 `public/avatars/` 选取位图工卡头像。

### 新增 / 替换形象时

1. 以 `assets/reference/new_avatars_rounded_square.jpg` 为唯一风格参考生成
2. 新文件写入 `assets/current/rounded/`（或对应系列目录）
3. 被替换的旧图移入 `assets/archive/<系列>/`
4. 若同步到 demo 工卡，更新 `assets/ui/avatars/<role>.jpg`（两处 demo 共用同一路径）
5. 在本节表格中补一行映射（如涉及 UI）

## 设计稿 demo

| 目录 | 说明 |
|------|------|
| `ai-mange-redesign/pages/dashboard.html` | Apple library 风静态 dashboard |
| `ai-mange-traework/pages/dashboard.html` | Trae Work 风静态 dashboard |

二者均从 `../../assets/ui/avatars/` 读取头像，无各自独立的 `assets/avatars` 副本。

## 许可证

[Apache-2.0](LICENSE)
