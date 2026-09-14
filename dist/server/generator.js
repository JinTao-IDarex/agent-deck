import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { AGENT_META, defaultOutDir } from './specs.js';
import { validateArtifact } from './validator.js';
function dumpFrontmatter(obj) {
    return yaml.dump(obj, { lineWidth: 100, noRefs: true }).trim();
}
export function generateArtifact(input) {
    const agent = input.agent;
    const type = input.type;
    const meta = AGENT_META[agent];
    if (!meta) {
        return { ok: false, error: `未知 Agent: ${agent}` };
    }
    if (type === 'subagent' && !meta.supports.subagent) {
        return { ok: false, error: `${meta.label} 不支持独立 subagent 文件生成` };
    }
    const projectRoot = input.projectRoot || process.cwd();
    const scope = input.scope || 'project';
    const name = (input.name || '').trim();
    const description = (input.description || '').trim();
    const body = (input.body || '').trim();
    const tools = (input.tools || []).map((t) => String(t).trim()).filter(Boolean);
    const skills = (input.skills || []).map((s) => String(s).trim()).filter(Boolean);
    const pre = validateArtifact({
        agent,
        type,
        name,
        description,
        frontmatter: {},
        body,
        hasFrontmatter: true,
        tools,
        skills,
        dirName: type === 'skill' ? name : undefined,
        path: type === 'skill' ? 'SKILL.md' : `${name}.md`,
        scope,
    });
    if (!name || !description || !body) {
        return { ok: false, error: 'name / description / body 不能为空', issues: pre.issues };
    }
    const outRoot = input.outDir || defaultOutDir(agent, type, scope, projectRoot);
    const files = [];
    let mainFm = {};
    let hasLocales = false;
    let hasOpenaiYaml = false;
    if (type === 'skill') {
        const skillDir = path.join(outRoot, name);
        const fm = { name, description };
        if (input.icon)
            fm.icon = input.icon;
        if (agent === 'codex' || agent === 'zcode') {
            fm.metadata = { 'short-description': (input.displayName || description).slice(0, 80) };
        }
        mainFm = fm;
        files.push({
            path: path.join(skillDir, 'SKILL.md'),
            content: `---\n${dumpFrontmatter(fm)}\n---\n\n${body}\n`,
        });
        if (agent === 'mimo') {
            const zh = {
                displayName: input.displayName || name,
                brief: input.brief || description.slice(0, 80),
            };
            const en = {
                displayName: input.displayName || name,
                brief: input.brief || description.slice(0, 80),
            };
            files.push({
                path: path.join(skillDir, 'locales', 'zh-CN.json'),
                content: JSON.stringify(zh, null, 2) + '\n',
            });
            files.push({
                path: path.join(skillDir, 'locales', 'en-US.json'),
                content: JSON.stringify(en, null, 2) + '\n',
            });
            hasLocales = true;
        }
        if (agent === 'codex' || agent === 'zcode') {
            const openai = {
                interface: {
                    display_name: input.displayName || name,
                    short_description: (input.brief || description).slice(0, 120),
                },
                policy: { allow_implicit_invocation: true },
            };
            files.push({
                path: path.join(skillDir, 'agents', 'openai.yaml'),
                content: yaml.dump(openai, { lineWidth: 100 }).trim() + '\n',
            });
            hasOpenaiYaml = true;
        }
    }
    else {
        const fm = { name, description };
        if (agent === 'qoder') {
            fm.tools = tools.join(', ');
        }
        else {
            fm.tools = tools;
            if (skills.length)
                fm.skills = skills;
            if (input.model)
                fm.model = input.model;
        }
        mainFm = fm;
        files.push({
            path: path.join(outRoot, `${name}.md`),
            content: `---\n${dumpFrontmatter(fm)}\n---\n\n${body}\n`,
        });
    }
    if (!input.dryRun) {
        for (const f of files) {
            fs.mkdirSync(path.dirname(f.path), { recursive: true });
            fs.writeFileSync(f.path, f.content, 'utf8');
        }
    }
    const generatedMain = files.find((f) => f.path.endsWith('.md'));
    const check = validateArtifact({
        agent,
        type,
        name,
        description,
        frontmatter: mainFm,
        body,
        hasFrontmatter: true,
        tools,
        skills,
        dirName: type === 'skill' ? name : undefined,
        path: generatedMain?.path,
        hasLocales,
        hasOpenaiYaml,
        scope,
    });
    return {
        ok: true,
        dryRun: !!input.dryRun,
        agent,
        type,
        name,
        outDir: outRoot,
        files: files.map((f) => ({ path: f.path, bytes: Buffer.byteLength(f.content, 'utf8') })),
        written: input.dryRun ? [] : files.map((f) => f.path),
        issues: check.issues,
    };
}
export function artifactToGenerateInput(artifact, targetAgent) {
    return {
        agent: targetAgent,
        type: artifact.type,
        scope: artifact.scope,
        name: artifact.name,
        description: artifact.description,
        body: artifact.body.trim(),
        tools: artifact.tools,
        skills: artifact.skills,
        model: artifact.model,
        icon: artifact.icon,
        displayName: artifact.displayName,
        brief: artifact.brief,
        projectRoot: artifact.projectRoot,
    };
}
//# sourceMappingURL=generator.js.map