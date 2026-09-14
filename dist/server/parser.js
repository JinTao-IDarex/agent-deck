import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
export function parseFrontmatter(raw) {
    const text = raw.replace(/^﻿/, '');
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) {
        return { frontmatter: {}, body: text, hasFrontmatter: false };
    }
    let frontmatter = {};
    let parseError;
    try {
        const parsed = yaml.load(m[1]);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            frontmatter = parsed;
        }
    }
    catch (err) {
        parseError = err instanceof Error ? err.message : String(err);
    }
    return {
        frontmatter,
        body: m[2] ?? '',
        hasFrontmatter: true,
        parseError,
    };
}
export function normalizeTools(tools) {
    if (!tools)
        return [];
    if (Array.isArray(tools)) {
        return tools.map((t) => String(t).trim()).filter(Boolean);
    }
    if (typeof tools === 'string') {
        return tools
            .split(/[,，]/)
            .map((t) => t.trim())
            .filter(Boolean);
    }
    return [];
}
export function normalizeSkills(skills) {
    return normalizeTools(skills);
}
export function makeArtifactId(parts) {
    const raw = `${parts.agent}|${parts.scope}|${parts.type}|${parts.path}`;
    return Buffer.from(raw, 'utf8').toString('base64url');
}
export function readSkillDir(skillDir) {
    const skillMd = path.join(skillDir, 'SKILL.md');
    if (!fs.existsSync(skillMd))
        return null;
    const raw = fs.readFileSync(skillMd, 'utf8');
    const { frontmatter, body, hasFrontmatter, parseError } = parseFrontmatter(raw);
    const name = String(frontmatter.name ?? path.basename(skillDir));
    const description = String(frontmatter.description ?? '');
    let displayName;
    let brief;
    const zh = path.join(skillDir, 'locales', 'zh-CN.json');
    const en = path.join(skillDir, 'locales', 'en-US.json');
    if (fs.existsSync(zh)) {
        try {
            const j = JSON.parse(fs.readFileSync(zh, 'utf8'));
            displayName = j.displayName;
            brief = j.brief;
        }
        catch {
            /* ignore */
        }
    }
    else if (fs.existsSync(en)) {
        try {
            const j = JSON.parse(fs.readFileSync(en, 'utf8'));
            displayName = j.displayName;
            brief = j.brief;
        }
        catch {
            /* ignore */
        }
    }
    let openaiYaml = null;
    const openaiPath = path.join(skillDir, 'agents', 'openai.yaml');
    if (fs.existsSync(openaiPath)) {
        try {
            openaiYaml = yaml.load(fs.readFileSync(openaiPath, 'utf8'));
        }
        catch {
            /* ignore */
        }
    }
    const entries = fs.readdirSync(skillDir, { withFileTypes: true }).map((e) => e.name);
    return {
        name,
        description,
        path: skillMd,
        dir: skillDir,
        dirName: path.basename(skillDir),
        frontmatter,
        body,
        hasFrontmatter,
        parseError,
        icon: frontmatter.icon,
        displayName,
        brief,
        openaiYaml,
        entries,
    };
}
export function readSubagentFile(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { frontmatter, body, hasFrontmatter, parseError } = parseFrontmatter(raw);
    const base = path.basename(filePath, path.extname(filePath));
    return {
        name: String(frontmatter.name ?? base),
        description: String(frontmatter.description ?? ''),
        path: filePath,
        dir: path.dirname(filePath),
        dirName: base,
        frontmatter,
        body,
        hasFrontmatter,
        parseError,
        toolsRaw: frontmatter.tools,
        skillsRaw: frontmatter.skills,
        model: frontmatter.model,
    };
}
export function parseArtifactContent(content, type, nameHint = 'artifact') {
    const { frontmatter, body, hasFrontmatter, parseError } = parseFrontmatter(content);
    return {
        type,
        name: String(frontmatter.name ?? nameHint),
        description: String(frontmatter.description ?? ''),
        frontmatter,
        body,
        hasFrontmatter,
        parseError,
        tools: normalizeTools(frontmatter.tools),
        skills: normalizeSkills(frontmatter.skills),
        model: frontmatter.model,
        icon: frontmatter.icon,
    };
}
//# sourceMappingURL=parser.js.map