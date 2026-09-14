export type AgentKind = 'claude' | 'codex' | 'trae' | 'qoder' | 'mimo' | 'zcode';
export type ItemType = 'skill' | 'subagent';
export type Scope = 'global' | 'project';

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

export interface ValidationIssue {
  level: 'error' | 'warn' | 'info';
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
  issues: { error: number; warn: number; info: number };
}

export interface ArtifactSummary {
  id: string;
  type: ItemType;
  agent: AgentKind;
  scope: Scope;
  name: string;
  description: string;
  displayName?: string;
  brief?: string;
  path: string;
  dir: string;
  dirName: string;
  tools: string[];
  skills: string[];
  model?: string;
  icon?: string;
  hasFrontmatter: boolean;
  parseError?: string;
  entries: string[];
  root: string;
  projectRoot: string;
  frontmatterKeys: string[];
  validation: ValidationResult;
}

export interface ArtifactDetail extends ArtifactSummary {
  body: string;
  frontmatter: Record<string, unknown>;
  openaiYaml?: unknown;
  generateDefaults: GenerateInput;
}

export interface ScanRootInfo {
  agent: AgentKind;
  type: ItemType;
  scope: Scope;
  root: string;
  exists: boolean;
  count: number;
}

export interface ArtifactsResponse {
  projectRoot: string;
  total: number;
  summary: Summary;
  roots: ScanRootInfo[];
  artifacts: ArtifactSummary[];
}

export interface MetaResponse {
  projectRoot: string;
  home: string;
  agents: Record<AgentKind, AgentMeta>;
  kinds: AgentKind[];
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
