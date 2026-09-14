export type AgentKind = 'claude' | 'codex' | 'trae' | 'qoder' | 'mimo' | 'zcode';
export type ItemType = 'subagent' | 'skill';
export type Scope = 'global' | 'project';

export interface PathRule {
  agent: AgentKind;
  type: ItemType;
  scope: Scope;
  resolve: (projectRoot: string) => string;
  filename?: string;
}

export interface AgentSupports {
  subagent: boolean;
  skill: boolean;
}

export interface AgentMeta {
  label: string;
  color: string;
  brand: string;
  supports: AgentSupports;
  notes: string;
}

export interface Artifact {
  id: string;
  type: ItemType;
  agent: AgentKind;
  scope: Scope;
  name: string;
  description: string;
  path: string;
  dir: string;
  dirName: string;
  frontmatter: Record<string, unknown>;
  body: string;
  hasFrontmatter: boolean;
  parseError?: string;
  tools: string[];
  skills: string[];
  model?: string;
  icon?: string;
  displayName?: string;
  brief?: string;
  openaiYaml?: unknown;
  entries: string[];
  projectRoot: string;
  root: string;
}

export interface ScanRootInfo {
  agent: AgentKind;
  type: ItemType;
  scope: Scope;
  root: string;
  exists: boolean;
  count: number;
}

export type IssueLevel = 'error' | 'warn' | 'info';

export interface ValidationIssue {
  level: IssueLevel;
  code: string;
  message: string;
  field?: string;
}

export interface ValidationResult {
  artifactId?: string;
  agent: string;
  type: string;
  ok: boolean;
  issues: ValidationIssue[];
  score: number;
}

export interface Summary {
  total: number;
  passed: number;
  failed: number;
  issues: Record<IssueLevel, number>;
}

export interface GenerateInput {
  agent: AgentKind;
  type: ItemType;
  scope?: Scope;
  name: string;
  description: string;
  body: string;
  tools?: string[];
  skills?: string[];
  model?: string;
  icon?: string;
  displayName?: string;
  brief?: string;
  projectRoot?: string;
  outDir?: string;
  dryRun?: boolean;
}

export interface GenerateResult {
  ok: boolean;
  error?: string;
  dryRun?: boolean;
  agent?: AgentKind;
  type?: ItemType;
  name?: string;
  outDir?: string;
  files?: Array<{ path: string; bytes: number }>;
  written?: string[];
  issues?: ValidationIssue[];
}
