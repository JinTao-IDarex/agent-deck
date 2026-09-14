import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { splitList } from '@/lib/utils';
import type { AgentKind, AgentMeta, GenerateResult, ItemType, Scope } from '@/types';

export function GenerateDialog({
  open,
  onOpenChange,
  project,
  agentMeta,
  kinds,
  onGenerated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: string;
  agentMeta: Record<AgentKind, AgentMeta>;
  kinds: AgentKind[];
  onGenerated: () => void;
}) {
  const [agent, setAgent] = useState<AgentKind>('claude');
  const [type, setType] = useState<ItemType>('skill');
  const [scope, setScope] = useState<Scope>('project');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tools, setTools] = useState('');
  const [skills, setSkills] = useState('');
  const [body, setBody] = useState('');
  const [outDir, setOutDir] = useState('');
  const [dryRun, setDryRun] = useState(true);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setResult(null);
  }, [open]);

  useEffect(() => {
    const supports = agentMeta[agent]?.supports;
    if (type === 'subagent' && supports && !supports.subagent) setType('skill');
  }, [agent, type, agentMeta]);

  const run = async () => {
    setBusy(true);
    try {
      const res = await api.generate({
        agent,
        type,
        scope,
        name: name.trim(),
        description: description.trim(),
        body,
        tools: splitList(tools),
        skills: splitList(skills),
        projectRoot: project,
        outDir: outDir.trim() || undefined,
        dryRun,
      });
      setResult(res);
      if (!dryRun) onGenerated();
    } catch (err) {
      const e = err as Error & { data?: GenerateResult };
      setResult(e.data || { ok: false, error: e.message });
    } finally {
      setBusy(false);
    }
  };

  const supports = agentMeta[agent]?.supports;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>生成 Subagent / Skill</DialogTitle>
          <DialogDescription>按目标 Agent 规范写入对应目录。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>目标 Agent</Label>
            <Select value={agent} onValueChange={(v) => setAgent(v as AgentKind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {kinds.map((k) => (
                  <SelectItem key={k} value={k}>
                    {agentMeta[k]?.label || k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>类型</Label>
            <Select value={type} onValueChange={(v) => setType(v as ItemType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skill">Skill</SelectItem>
                <SelectItem value="subagent" disabled={!supports?.subagent}>
                  Subagent
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>范围</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as Scope)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project">项目级</SelectItem>
                <SelectItem value="global">全局</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Name（kebab-case）</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-agent"
              spellCheck={false}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="何时使用这个 agent / skill…"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tools（逗号分隔）</Label>
            <Input
              value={tools}
              onChange={(e) => setTools(e.target.value)}
              placeholder="Read, Write, Edit, Grep"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Skills（逗号分隔，可选）</Label>
            <Input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="skill-a, skill-b"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Body（Markdown）</Label>
            <Textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={'# 角色定义\n\n你是…'}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>输出目录（可空 = 使用默认规则）</Label>
            <Input value={outDir} onChange={(e) => setOutDir(e.target.value)} placeholder="留空使用默认" />
          </div>
        </div>
        <DialogFooter className="items-center gap-3 sm:justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={dryRun} onCheckedChange={(c) => setDryRun(c === true)} />
            仅预览（不写盘）
          </label>
          <Button onClick={run} disabled={busy}>
            {busy ? '生成中…' : '生成'}
          </Button>
        </DialogFooter>
        {result ? (
          <pre className="max-h-64 overflow-auto rounded-sm border border-border bg-[hsl(var(--secondary))] p-3 font-mono text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
