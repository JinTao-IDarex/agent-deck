import express from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AGENT_KINDS, AGENT_META, defaultOutDir, getSpec } from './specs.js';
import { findArtifact, scanAll } from './scanner.js';
import { summarize, validateArtifact, validateScannedArtifact } from './validator.js';
import { artifactToGenerateInput, generateArtifact } from './generator.js';
import { parseArtifactContent } from './parser.js';
import type { AgentKind, Artifact, ItemType, Scope } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '2mb' }));

const PORT = Number(process.env.PORT || 3789);
const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, '../client/index.html'));

function resolveProjectRoot(req: express.Request): string {
  const fromQuery = typeof req.query.project === 'string' && req.query.project.trim();
  const fromBody =
    req.body && typeof req.body.projectRoot === 'string' && (req.body.projectRoot as string).trim();
  const raw = fromBody || fromQuery || process.env.AI_MANGE_PROJECT || process.cwd();
  return path.resolve(raw);
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    name: 'ai-mange',
    version: '0.2.0',
    home: os.homedir(),
    cwd: process.cwd(),
    time: new Date().toISOString(),
  });
});

app.get('/api/meta', (req, res) => {
  res.json({
    projectRoot: resolveProjectRoot(req),
    home: os.homedir(),
    agents: AGENT_META,
    kinds: AGENT_KINDS,
  });
});

app.get('/api/specs/:agent', (req, res) => {
  const agent = req.params.agent as AgentKind;
  if (!AGENT_KINDS.includes(agent)) {
    return res.status(404).json({ error: `未知 Agent: ${agent}` });
  }
  res.json(getSpec(agent));
});

app.get('/api/artifacts', (req, res) => {
  const projectRoot = resolveProjectRoot(req);
  const { artifacts, roots } = scanAll(projectRoot);

  let list = artifacts;
  if (req.query.agent) list = list.filter((a) => a.agent === req.query.agent);
  if (req.query.scope) list = list.filter((a) => a.scope === req.query.scope);
  if (req.query.type) list = list.filter((a) => a.type === req.query.type);
  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    const q = req.query.q.trim().toLowerCase();
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.path.toLowerCase().includes(q),
    );
  }

  const validated = list.map((a) => ({
    ...serializeArtifact(a),
    validation: validateScannedArtifact(a),
  }));

  res.json({
    projectRoot,
    total: validated.length,
    summary: summarize(validated.map((v) => v.validation)),
    roots,
    artifacts: validated,
  });
});

app.get('/api/artifacts/:id', (req, res) => {
  const projectRoot = resolveProjectRoot(req);
  const artifact = findArtifact(projectRoot, req.params.id);
  if (!artifact) return res.status(404).json({ error: '未找到该条目' });
  res.json({
    ...serializeArtifact(artifact, { includeBody: true }),
    validation: validateScannedArtifact(artifact),
    generateDefaults: artifactToGenerateInput(artifact, artifact.agent),
  });
});

app.post('/api/artifacts/:id/validate', (req, res) => {
  const projectRoot = resolveProjectRoot(req);
  const artifact = findArtifact(projectRoot, req.params.id);
  if (!artifact) return res.status(404).json({ error: '未找到该条目' });
  res.json(validateScannedArtifact(artifact));
});

app.post('/api/validate', (req, res) => {
  const { content, agent, type = 'skill', nameHint } = req.body || {};
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'content 必须为字符串' });
  }
  if (!AGENT_KINDS.includes(agent)) {
    return res.status(400).json({ error: `agent 须为 ${AGENT_KINDS.join('/')}` });
  }
  const parsed = parseArtifactContent(content, type as ItemType, nameHint);
  res.json(
    validateArtifact({
      agent,
      type: type as ItemType,
      name: parsed.name,
      description: parsed.description,
      frontmatter: parsed.frontmatter,
      body: parsed.body,
      hasFrontmatter: parsed.hasFrontmatter,
      parseError: parsed.parseError,
      tools: parsed.tools,
      skills: parsed.skills,
      dirName: parsed.name,
      path: type === 'skill' ? 'SKILL.md' : `${parsed.name}.md`,
    }),
  );
});

app.post('/api/generate', (req, res) => {
  const body = req.body || {};
  const result = generateArtifact({
    agent: body.agent,
    type: body.type || 'skill',
    scope: (body.scope || 'project') as Scope,
    name: body.name,
    description: body.description,
    body: body.body,
    tools: body.tools,
    skills: body.skills,
    model: body.model,
    icon: body.icon,
    displayName: body.displayName,
    brief: body.brief,
    projectRoot: body.projectRoot || resolveProjectRoot(req),
    outDir: body.outDir,
    dryRun: !!body.dryRun,
  });
  if (!result.ok) return res.status(400).json(result);
  res.json(result);
});

app.get('/api/outdir', (req, res) => {
  const projectRoot = resolveProjectRoot(req);
  const agent = String(req.query.agent || 'claude') as AgentKind;
  const type = String(req.query.type || 'skill') as ItemType;
  const scope = String(req.query.scope || 'project') as Scope;
  if (!AGENT_KINDS.includes(agent)) {
    return res.status(400).json({ error: 'invalid agent' });
  }
  res.json({ outDir: defaultOutDir(agent, type, scope, projectRoot) });
});

function serializeArtifact(a: Artifact, { includeBody = false } = {}) {
  const base: Record<string, unknown> = {
    id: a.id,
    type: a.type,
    agent: a.agent,
    scope: a.scope,
    name: a.name,
    description: a.description,
    displayName: a.displayName,
    brief: a.brief,
    path: a.path,
    dir: a.dir,
    dirName: a.dirName,
    tools: a.tools,
    skills: a.skills,
    model: a.model,
    icon: a.icon,
    hasFrontmatter: a.hasFrontmatter,
    parseError: a.parseError,
    entries: a.entries,
    root: a.root,
    projectRoot: a.projectRoot,
    frontmatterKeys: Object.keys(a.frontmatter || {}),
  };
  if (includeBody) {
    base.body = a.body;
    base.frontmatter = a.frontmatter;
    base.openaiYaml = a.openaiYaml;
  }
  return base;
}

if (isProd) {
  const clientDir = path.join(__dirname, '../client');
  if (fs.existsSync(clientDir)) {
    app.use(express.static(clientDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'));
    });
  }
}

app.listen(PORT, () => {
  console.log(`[ai-mange] http://127.0.0.1:${PORT}`);
  console.log(`[ai-mange] project: ${process.env.AI_MANGE_PROJECT || process.cwd()}`);
});
