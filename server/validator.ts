import fs from 'node:fs';
import path from 'node:path';
import { AGENT_META } from './specs.js';
import type { Artifact, IssueLevel, ValidationIssue, ValidationResult } from './types.js';

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export interface ValidateInput {
  agent: string;
  type: 'skill' | 'subagent';
  name: string;
  description: string;
  frontmatter: Record<string, unknown>;
  body: string;
  hasFrontmatter?: boolean;
  parseError?: string;
  tools?: string[];
  skills?: string[];
  dirName?: string;
  path?: string;
  icon?: string;
  hasLocales?: boolean;
  hasOpenaiYaml?: boolean;
  scope?: string;
}

export function validateArtifact(input: ValidateInput): ValidationResult {
  const issues: ValidationIssue[] = [];
  const meta = AGENT_META[input.agent as keyof typeof AGENT_META];
  if (!meta) {
    return {
      agent: input.agent,
      type: input.type,
      ok: false,
      issues: [{ level: 'error', code: 'UNKNOWN_AGENT', message: `未知 Agent: ${input.agent}` }],
      score: 0,
    };
  }

  if (input.parseError) {
    issues.push({
      level: 'error',
      code: 'FRONTMATTER_PARSE',
      message: `Frontmatter YAML 解析失败: ${input.parseError}`,
      field: 'frontmatter',
    });
  }

  if (!input.hasFrontmatter) {
    issues.push({
      level: 'error',
      code: 'NO_FRONTMATTER',
      message: '缺少 YAML frontmatter（必须以 --- 包裹）',
      field: 'frontmatter',
    });
  }

  const name = (input.name ?? '').trim();
  if (!name) {
    issues.push({ level: 'error', code: 'NAME_REQUIRED', message: '缺少 name 字段', field: 'name' });
  } else {
    const traeOk = input.agent === 'trae' && /^TRAE-[a-z0-9]+(-[a-z0-9]+)*$/.test(name);
    if (!NAME_RE.test(name) && !traeOk) {
      issues.push({
        level: 'error',
        code: 'NAME_PATTERN',
        message: `name 须为 kebab-case（小写字母/数字/连字符）${input.agent === 'trae' ? '，Trae 可用 TRAE- 前缀' : ''}，当前: ${name}`,
        field: 'name',
      });
    }
  }

  const description = (input.description ?? '').trim();
  if (!description) {
    issues.push({
      level: 'error',
      code: 'DESCRIPTION_REQUIRED',
      message: '缺少 description 字段',
      field: 'description',
    });
  } else if (description.length < 20) {
    issues.push({
      level: 'warn',
      code: 'DESCRIPTION_SHORT',
      message: `description 过短（${description.length} 字），建议写清用途与触发场景（≥20 字）`,
      field: 'description',
    });
  }

  if (!input.body || !input.body.trim()) {
    issues.push({
      level: 'error',
      code: 'BODY_EMPTY',
      message: '正文为空：Skill 需要操作说明，Subagent 需要角色定义',
      field: 'body',
    });
  }

  if (input.type === 'skill') {
    if (input.dirName && name && input.dirName !== name) {
      issues.push({
        level: 'error',
        code: 'DIR_NAME_MISMATCH',
        message: `目录名 "${input.dirName}" 与 frontmatter name "${name}" 不一致`,
        field: 'name',
      });
    }
    if (input.path && path.basename(input.path) !== 'SKILL.md') {
      issues.push({
        level: 'error',
        code: 'ENTRY_FILE',
        message: 'Skill 入口文件必须是 SKILL.md',
        field: 'path',
      });
    }

    if (input.agent === 'mimo' && !input.hasLocales) {
      issues.push({
        level: 'warn',
        code: 'MIMO_LOCALES_MISSING',
        message: 'MiMo 建议提供 locales/zh-CN.json 与 locales/en-US.json（displayName + brief）',
        field: 'locales',
      });
    }
    if ((input.agent === 'codex' || input.agent === 'zcode') && !input.hasOpenaiYaml) {
      issues.push({
        level: 'info',
        code: 'OPENAI_YAML_MISSING',
        message: '可选：提供 agents/openai.yaml 以完善列表展示（display_name / short_description）',
        field: 'agents/openai.yaml',
      });
    }
    if (input.agent === 'trae') {
      if (input.scope === 'global' && name && !name.startsWith('TRAE-') && !name.startsWith('trae-')) {
        issues.push({
          level: 'warn',
          code: 'TRAE_PREFIX',
          message: 'Trae 内置 skill 名称习惯使用 TRAE- 前缀',
          field: 'name',
        });
      }
    }
  }

  if (input.type === 'subagent') {
    if (!meta.supports.subagent) {
      issues.push({
        level: 'error',
        code: 'AGENT_UNSUPPORTED',
        message: `${meta.label} 官方约定中没有独立的 subagent 文件格式`,
        field: 'type',
      });
    } else {
      const toolsRaw = input.frontmatter?.tools;
      if (toolsRaw === undefined || toolsRaw === null || toolsRaw === '') {
        issues.push({
          level: 'error',
          code: 'TOOLS_REQUIRED',
          message: 'Subagent 必须声明 tools',
          field: 'tools',
        });
      } else if (input.agent === 'qoder') {
        if (Array.isArray(toolsRaw)) {
          issues.push({
            level: 'error',
            code: 'TOOLS_QODER_FORMAT',
            message: 'Qoder 的 tools 应为逗号分隔字符串，例如 "Read, Write, Edit"',
            field: 'tools',
          });
        } else if (typeof toolsRaw === 'string') {
          const list = toolsRaw
            .split(/[,，]/)
            .map((t) => t.trim())
            .filter(Boolean);
          if (list.length === 0) {
            issues.push({ level: 'error', code: 'TOOLS_EMPTY', message: 'tools 列表为空', field: 'tools' });
          }
        }
      } else {
        if (!Array.isArray(toolsRaw)) {
          issues.push({
            level: 'error',
            code: 'TOOLS_CLAUDE_FORMAT',
            message: `${meta.label} 的 tools 应为 YAML 列表：\ntools:\n  - Read\n  - Write`,
            field: 'tools',
          });
        } else if (toolsRaw.length === 0) {
          issues.push({
            level: 'warn',
            code: 'TOOLS_EMPTY',
            message: 'tools 列表为空，agent 将无法使用任何工具',
            field: 'tools',
          });
        }
      }

      const skillsRaw = input.frontmatter?.skills;
      if (skillsRaw !== undefined && skillsRaw !== null && skillsRaw !== '') {
        if (input.agent === 'claude' || input.agent === 'mimo') {
          if (!Array.isArray(skillsRaw)) {
            issues.push({
              level: 'error',
              code: 'SKILLS_CLAUDE_FORMAT',
              message: 'skills 应为 YAML 列表',
              field: 'skills',
            });
          }
        }
      }

      if (input.body && input.body.trim().length < 40) {
        issues.push({
          level: 'warn',
          code: 'BODY_THIN',
          message: 'Subagent 正文偏短，建议包含角色定义、职责边界与输出要求',
          field: 'body',
        });
      }
    }
  }

  const errors = issues.filter((i) => i.level === 'error').length;
  const warns = issues.filter((i) => i.level === 'warn').length;
  const ok = errors === 0;
  const score = Math.max(0, 100 - errors * 25 - warns * 8);

  return {
    agent: input.agent,
    type: input.type,
    ok,
    issues,
    score,
  };
}

export function validateScannedArtifact(artifact: Artifact): ValidationResult {
  const hasLocales =
    artifact.type === 'skill' &&
    fs.existsSync(path.join(artifact.dir, 'locales', 'zh-CN.json')) &&
    fs.existsSync(path.join(artifact.dir, 'locales', 'en-US.json'));
  const hasOpenaiYaml =
    artifact.type === 'skill' && fs.existsSync(path.join(artifact.dir, 'agents', 'openai.yaml'));

  return {
    artifactId: artifact.id,
    ...validateArtifact({
      agent: artifact.agent,
      type: artifact.type,
      name: artifact.name,
      description: artifact.description,
      frontmatter: artifact.frontmatter,
      body: artifact.body,
      hasFrontmatter: artifact.hasFrontmatter,
      parseError: artifact.parseError,
      tools: artifact.tools,
      skills: artifact.skills,
      dirName: artifact.type === 'skill' ? artifact.dirName : undefined,
      path: artifact.path,
      icon: artifact.icon,
      hasLocales,
      hasOpenaiYaml,
      scope: artifact.scope,
    }),
  };
}

export function summarize(results: ValidationResult[]) {
  const byLevel: Record<IssueLevel, number> = { error: 0, warn: 0, info: 0 };
  for (const r of results) {
    for (const i of r.issues) byLevel[i.level] += 1;
  }
  return {
    total: results.length,
    passed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    issues: byLevel,
  };
}
