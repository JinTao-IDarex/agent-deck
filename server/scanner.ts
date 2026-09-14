import fs from 'node:fs';
import path from 'node:path';
import { PATH_RULES } from './specs.js';
import {
  makeArtifactId,
  normalizeSkills,
  normalizeTools,
  readSkillDir,
  readSubagentFile,
} from './parser.js';
import type { AgentKind, Artifact, ItemType, ScanRootInfo, Scope } from './types.js';

function isDir(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function listDirs(root: string): string[] {
  if (!isDir(root)) return [];
  try {
    return fs
      .readdirSync(root, { withFileTypes: true })
      .filter((e) => {
        if (e.name.startsWith('.')) return false;
        if (e.isDirectory()) return true;
        if (e.isSymbolicLink()) return isDir(path.join(root, e.name));
        return false;
      })
      .map((e) => path.join(root, e.name));
  } catch {
    return [];
  }
}

function collectSkillDirs(root: string): string[] {
  const out: string[] = [];
  for (const dir of listDirs(root)) {
    if (fs.existsSync(path.join(dir, 'SKILL.md'))) out.push(dir);
    for (const sub of listDirs(dir)) {
      if (fs.existsSync(path.join(sub, 'SKILL.md'))) out.push(sub);
    }
  }
  return out;
}

function listMdFiles(root: string): string[] {
  if (!isDir(root)) return [];
  try {
    return fs
      .readdirSync(root, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.md'))
      .map((e) => path.join(root, e.name));
  } catch {
    return [];
  }
}

function scanTraePluginsSkills(pluginsRoot: string): string[] {
  const out: string[] = [];
  if (!isDir(pluginsRoot)) return out;
  const walk = (dir: string, depth: number) => {
    if (depth > 6) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name);
      if (e.name === 'skills') {
        out.push(...listDirs(full));
        continue;
      }
      walk(full, depth + 1);
    }
  };
  walk(pluginsRoot, 0);
  return out;
}

function scanQoderAgents(agentsRoot: string): string[] {
  const out: string[] = [];
  if (!isDir(agentsRoot)) return out;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(agentsRoot, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
      out.push(path.join(agentsRoot, e.name));
    } else if (e.isDirectory()) {
      const agentMd = path.join(agentsRoot, e.name, 'AGENT.md');
      if (fs.existsSync(agentMd)) out.push(agentMd);
    }
  }
  return out;
}

export function scanAll(projectRoot: string): { artifacts: Artifact[]; roots: ScanRootInfo[] } {
  const artifacts: Artifact[] = [];
  const dedupe = new Map<string, Artifact>();
  const roots: ScanRootInfo[] = [];

  const pushSkill = (skillDir: string, agent: AgentKind, scope: Scope, root: string) => {
    const parsed = readSkillDir(skillDir);
    if (!parsed) return;
    const artifact: Artifact = {
      id: makeArtifactId({ agent, scope, type: 'skill', path: parsed.path }),
      type: 'skill',
      agent,
      scope,
      name: parsed.name,
      description: parsed.description,
      path: parsed.path,
      dir: parsed.dir,
      dirName: parsed.dirName,
      frontmatter: parsed.frontmatter,
      body: parsed.body,
      hasFrontmatter: parsed.hasFrontmatter,
      parseError: parsed.parseError,
      tools: normalizeTools(parsed.frontmatter.tools),
      skills: normalizeSkills(parsed.frontmatter.skills),
      model: parsed.frontmatter.model as string | undefined,
      icon: parsed.icon,
      displayName: parsed.displayName,
      brief: parsed.brief,
      openaiYaml: parsed.openaiYaml,
      entries: parsed.entries ?? [],
      projectRoot,
      root,
    };
    const key = `${agent}|skill|${artifact.path}`;
    if (!dedupe.has(key)) {
      dedupe.set(key, artifact);
      artifacts.push(artifact);
    }
  };

  const pushSubagent = (file: string, agent: AgentKind, scope: Scope, root: string) => {
    const parsed = readSubagentFile(file);
    const artifact: Artifact = {
      id: makeArtifactId({ agent, scope, type: 'subagent', path: parsed.path }),
      type: 'subagent',
      agent,
      scope,
      name: parsed.name,
      description: parsed.description,
      path: parsed.path,
      dir: parsed.dir,
      dirName: parsed.dirName,
      frontmatter: parsed.frontmatter,
      body: parsed.body,
      hasFrontmatter: parsed.hasFrontmatter,
      parseError: parsed.parseError,
      tools: normalizeTools(parsed.toolsRaw),
      skills: normalizeSkills(parsed.skillsRaw),
      model: parsed.model,
      entries: [],
      projectRoot,
      root,
    };
    const key = `${agent}|subagent|${artifact.path}`;
    if (!dedupe.has(key)) {
      dedupe.set(key, artifact);
      artifacts.push(artifact);
    }
  };

  for (const rule of PATH_RULES) {
    const root = rule.resolve(projectRoot);
    const exists = isDir(root);
    let count = 0;

    if (rule.type === 'skill') {
      if (rule.agent === 'trae' && root.includes('plugins')) {
        const dirs = scanTraePluginsSkills(root);
        count = dirs.length;
        for (const d of dirs) pushSkill(d, 'trae', rule.scope, root);
      } else if (exists) {
        const dirs = collectSkillDirs(root);
        count = dirs.length;
        for (const d of dirs) pushSkill(d, rule.agent, rule.scope, root);
      }
    } else if (rule.type === 'subagent' && exists) {
      if (rule.agent === 'qoder') {
        const files = scanQoderAgents(root);
        count = files.length;
        for (const f of files) pushSubagent(f, 'qoder', rule.scope, root);
      } else {
        const files = listMdFiles(root);
        count = files.length;
        for (const f of files) pushSubagent(f, rule.agent, rule.scope, root);
      }
    }

    roots.push({
      agent: rule.agent,
      type: rule.type,
      scope: rule.scope,
      root,
      exists,
      count,
    });
  }

  return { artifacts, roots };
}

export function findArtifact(projectRoot: string, id: string): Artifact | null {
  const { artifacts } = scanAll(projectRoot);
  return artifacts.find((a) => a.id === id) ?? null;
}
