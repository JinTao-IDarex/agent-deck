import os from 'node:os';
import path from 'node:path';
import type { AgentKind, AgentMeta, ItemType, PathRule, Scope } from './types.js';

const home = os.homedir();

export const AGENT_META: Record<AgentKind, AgentMeta> = {
  claude: {
    label: 'Claude Code',
    color: '#D97706',
    brand: 'claude',
    supports: { subagent: true, skill: true },
    notes: 'Skill: SKILL.md + name/description; Agent: agents/*.md with YAML tools list',
  },
  codex: {
    label: 'Codex',
    color: '#10A37F',
    brand: 'codex',
    supports: { subagent: false, skill: true },
    notes: 'Skills under ~/.codex/skills; UI metadata via agents/openai.yaml',
  },
  trae: {
    label: 'Trae',
    color: '#6366F1',
    brand: 'trae',
    supports: { subagent: false, skill: true },
    notes: 'builtin_skills/<id>/SKILL.md; name often TRAE- prefixed',
  },
  qoder: {
    label: 'Qoder',
    color: '#0EA5E9',
    brand: 'qoder',
    supports: { subagent: true, skill: true },
    notes: 'Agent tools is comma-separated string; AGENT.md folder form supported',
  },
  mimo: {
    label: 'MiMo',
    color: '#FF6900',
    brand: 'mimo',
    supports: { subagent: true, skill: true },
    notes: 'Same roots as Claude + locales/zh-CN.json & en-US.json (displayName, brief)',
  },
  zcode: {
    label: 'ZCode',
    color: '#8B5CF6',
    brand: 'zcode',
    supports: { subagent: false, skill: true },
    notes: 'Skills under ~/.zcode/skills; Codex-like layout with agents/openai.yaml',
  },
};

export const AGENT_KINDS = Object.keys(AGENT_META) as AgentKind[];

export const PATH_RULES: PathRule[] = [
  { agent: 'claude', type: 'skill', scope: 'global', resolve: () => path.join(home, '.claude', 'skills') },
  { agent: 'claude', type: 'skill', scope: 'project', resolve: (p) => path.join(p, '.claude', 'skills') },
  {
    agent: 'claude',
    type: 'subagent',
    scope: 'global',
    resolve: () => path.join(home, '.claude', 'agents'),
    filename: '*.md',
  },
  {
    agent: 'claude',
    type: 'subagent',
    scope: 'project',
    resolve: (p) => path.join(p, '.claude', 'agents'),
    filename: '*.md',
  },

  { agent: 'codex', type: 'skill', scope: 'global', resolve: () => path.join(home, '.codex', 'skills') },
  { agent: 'codex', type: 'skill', scope: 'project', resolve: (p) => path.join(p, '.codex', 'skills') },

  { agent: 'trae', type: 'skill', scope: 'global', resolve: () => path.join(home, '.trae', 'builtin_skills') },
  { agent: 'trae', type: 'skill', scope: 'global', resolve: () => path.join(home, '.trae', 'plugins') },
  { agent: 'trae', type: 'skill', scope: 'project', resolve: (p) => path.join(p, '.trae', 'skills') },

  { agent: 'qoder', type: 'skill', scope: 'global', resolve: () => path.join(home, '.qoder', 'skills') },
  { agent: 'qoder', type: 'skill', scope: 'project', resolve: (p) => path.join(p, '.qoder', 'skills') },
  {
    agent: 'qoder',
    type: 'subagent',
    scope: 'global',
    resolve: () => path.join(home, '.qoder', 'agents'),
    filename: '*.md',
  },
  {
    agent: 'qoder',
    type: 'subagent',
    scope: 'project',
    resolve: (p) => path.join(p, '.qoder', 'agents'),
    filename: '*.md',
  },

  { agent: 'mimo', type: 'skill', scope: 'global', resolve: () => path.join(home, '.claude', 'skills') },
  {
    agent: 'mimo',
    type: 'skill',
    scope: 'global',
    resolve: () => path.join(home, 'AppData', 'Roaming', 'Xiaomi MiMo', 'engine-config', 'skills'),
  },
  { agent: 'mimo', type: 'skill', scope: 'project', resolve: (p) => path.join(p, '.claude', 'skills') },
  {
    agent: 'mimo',
    type: 'subagent',
    scope: 'global',
    resolve: () => path.join(home, '.claude', 'agents'),
    filename: '*.md',
  },
  {
    agent: 'mimo',
    type: 'subagent',
    scope: 'project',
    resolve: (p) => path.join(p, '.claude', 'agents'),
    filename: '*.md',
  },

  { agent: 'zcode', type: 'skill', scope: 'global', resolve: () => path.join(home, '.zcode', 'skills') },
  { agent: 'zcode', type: 'skill', scope: 'project', resolve: (p) => path.join(p, '.zcode', 'skills') },
];

export function defaultOutDir(
  agent: AgentKind,
  type: ItemType,
  scope: Scope,
  projectRoot: string,
): string {
  if (type === 'skill') {
    switch (agent) {
      case 'claude':
      case 'mimo':
        return scope === 'project'
          ? path.join(projectRoot, '.claude', 'skills')
          : path.join(home, '.claude', 'skills');
      case 'codex':
        return scope === 'project'
          ? path.join(projectRoot, '.codex', 'skills')
          : path.join(home, '.codex', 'skills');
      case 'trae':
        return scope === 'project'
          ? path.join(projectRoot, '.trae', 'skills')
          : path.join(home, '.trae', 'builtin_skills');
      case 'qoder':
        return scope === 'project'
          ? path.join(projectRoot, '.qoder', 'skills')
          : path.join(home, '.qoder', 'skills');
      case 'zcode':
        return scope === 'project'
          ? path.join(projectRoot, '.zcode', 'skills')
          : path.join(home, '.zcode', 'skills');
      default:
        return path.join(projectRoot, '.claude', 'skills');
    }
  }
  switch (agent) {
    case 'claude':
    case 'mimo':
      return scope === 'project'
        ? path.join(projectRoot, '.claude', 'agents')
        : path.join(home, '.claude', 'agents');
    case 'qoder':
      return scope === 'project'
        ? path.join(projectRoot, '.qoder', 'agents')
        : path.join(home, '.qoder', 'agents');
    default:
      return path.join(projectRoot, '.claude', 'agents');
  }
}

export function getSpec(agent: AgentKind) {
  const meta = AGENT_META[agent];
  return {
    agent,
    label: meta.label,
    color: meta.color,
    supports: meta.supports,
    notes: meta.notes,
    skill: {
      requiredFrontmatter: ['name', 'description'],
      optionalFrontmatter:
        agent === 'mimo' || agent === 'claude'
          ? ['icon']
          : agent === 'codex' || agent === 'zcode'
            ? ['metadata']
            : [],
      namePattern: '^[a-z0-9]+(-[a-z0-9]+)*$',
      dirNameMustMatchName: true,
      entryFile: 'SKILL.md',
      extras:
        agent === 'mimo'
          ? ['locales/zh-CN.json', 'locales/en-US.json']
          : agent === 'codex' || agent === 'zcode'
            ? ['agents/openai.yaml']
            : agent === 'trae'
              ? ['guides/', 'examples/', 'scripts/ (optional)']
              : [],
    },
    subagent: meta.supports.subagent
      ? {
          requiredFrontmatter: ['name', 'description', 'tools'],
          optionalFrontmatter: agent === 'claude' || agent === 'mimo' ? ['model', 'skills'] : [],
          namePattern: '^[a-z0-9]+(-[a-z0-9]+)*$',
          toolsFormat: agent === 'qoder' ? 'comma-separated-string' : 'yaml-list',
          fileGlob: '*.md',
          folderForm: agent === 'qoder' ? '<name>/AGENT.md also valid' : null,
        }
      : null,
  };
}
