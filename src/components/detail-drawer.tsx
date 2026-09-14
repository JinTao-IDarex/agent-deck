import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { splitList } from '@/lib/utils';
import { AvatarImage } from '@/components/avatar-image';
import type {
  AgentKind,
  AgentMeta,
  ArtifactDetail,
  GenerateResult,
  Scope,
} from '@/types';

function frontmatterText(fm: Record<string, unknown>, body: string) {
  const fmText = Object.keys(fm)
    .map((k) => {
      const val = fm[k];
      if (Array.isArray(val)) return `${k}:\n${val.map((v) => `  - ${v}`).join('\n')}`;
      if (val && typeof val === 'object') return `${k}: ${JSON.stringify(val)}`;
      return `${k}: ${val}`;
    })
    .join('\n');
  return `---\n${fmText}\n---\n\n${body || ''}`;
}

export function DetailDrawer({
  id,
  project,
  agentMeta,
  kinds,
  open,
  onOpenChange,
  onGenerated,
}: {
  id: string | null;
  project: string;
  agentMeta: Record<AgentKind, AgentMeta>;
  kinds: AgentKind[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: () => void;
}) {
  const [detail, setDetail] = useState<ArtifactDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [xAgent, setXAgent] = useState<AgentKind>('claude');
  const [xScope, setXScope] = useState<Scope>('project');
  const [xName, setXName] = useState('');
  const [xDesc, setXDesc] = useState('');
  const [xTools, setXTools] = useState('');
  const [xSkills, setXSkills] = useState('');
  const [xBody, setXBody] = useState('');
  const [xDry, setXDry] = useState(true);
  const [xResult, setXResult] = useState<GenerateResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !id) return;
    let cancelled = false;
    setDetail(null);
    setError(null);
    setXResult(null);
    api
      .artifact(id, project)
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        setXAgent(d.agent);
        setXScope(d.scope);
        setXName(d.name);
        setXDesc(d.description || '');
        setXTools((d.tools || []).join(', '));
        setXSkills((d.skills || []).join(', '));
        setXBody(d.body || '');
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [open, id, project]);

  const meta = detail ? agentMeta[detail.agent] : null;
  const v = detail?.validation;

  const runGenerate = async () => {
    if (!detail) return;
    if (detail.type === 'subagent' && !agentMeta[xAgent]?.supports?.subagent) {
      setXResult({ ok: false, error: `${agentMeta[xAgent]?.label} 不支持独立 subagent 格式` });
      return;
    }
    setBusy(true);
    try {
      const result = await api.generate({
        agent: xAgent,
        type: detail.type,
        scope: xScope,
        name: xName.trim(),
        description: xDesc.trim(),
        body: xBody,
        tools: splitList(xTools),
        skills: splitList(xSkills),
        projectRoot: project,
        dryRun: xDry,
      });
      setXResult(result);
      if (!xDry) onGenerated();
    } catch (err) {
      const e = err as Error & { data?: GenerateResult };
      setXResult(e.data || { ok: false, error: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        {detail ? (
          <>
            <SheetHeader>
              <div className="flex items-start gap-3">
                <AvatarImage name={detail.name} size={56} />
                <div className="min-w-0 flex-1">
                  <SheetTitle>{detail.displayName || detail.name}</SheetTitle>
                  <SheetDescription>
                    {meta?.label} · {detail.type} · {detail.scope}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="overview">概览</TabsTrigger>
                  <TabsTrigger value="source">原文</TabsTrigger>
                  <TabsTrigger value="validate">校验</TabsTrigger>
                  <TabsTrigger value="generate">跨 Agent 生成</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-3">
                  {v ? (
                    <div className="h-1.5 w-full overflow-hidden rounded-sm bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${v.score}%` }}
                        title={`规范分 ${v.score}`}
                      />
                    </div>
                  ) : null}
                  <dl className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-1.5 text-sm">
                    <dt className="text-muted-foreground">Name</dt>
                    <dd className="font-mono">{detail.name}</dd>
                    <dt className="text-muted-foreground">Agent</dt>
                    <dd>
                      {detail.agent} · {meta?.label}
                    </dd>
                    <dt className="text-muted-foreground">Path</dt>
                    <dd className="break-all font-mono text-xs">{detail.path}</dd>
                    <dt className="text-muted-foreground">Tools</dt>
                    <dd>{detail.tools.join(', ') || '—'}</dd>
                    <dt className="text-muted-foreground">Skills</dt>
                    <dd>{detail.skills.join(', ') || '—'}</dd>
                    {detail.model ? (
                      <>
                        <dt className="text-muted-foreground">Model</dt>
                        <dd>{detail.model}</dd>
                      </>
                    ) : null}
                    <dt className="text-muted-foreground">Frontmatter</dt>
                    <dd className="font-mono text-xs">
                      {detail.frontmatterKeys.join(', ') || '—'}
                    </dd>
                    <dt className="text-muted-foreground">Entries</dt>
                    <dd className="font-mono text-xs">{detail.entries.join(', ') || '—'}</dd>
                  </dl>
                  {meta ? (
                    <p
                      className="border-l-2 pl-3 text-xs text-muted-foreground"
                      style={{ borderColor: meta.color }}
                    >
                      {meta.notes}
                    </p>
                  ) : null}
                </TabsContent>

                <TabsContent value="source">
                  <pre className="max-h-[60vh] overflow-auto rounded-sm border border-border bg-[hsl(var(--secondary))] p-3 font-mono text-xs leading-relaxed">
                    {frontmatterText(detail.frontmatter || {}, detail.body || '')}
                  </pre>
                </TabsContent>

                <TabsContent value="validate" className="space-y-3">
                  {v ? (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant={v.ok ? 'ok' : 'err'}>{v.ok ? '通过' : '未通过'}</Badge>
                        <span className="text-muted-foreground">规范分 {v.score}</span>
                      </div>
                      {v.issues.length ? (
                        <ul className="space-y-2">
                          {v.issues.map((issue, idx) => (
                            <li
                              key={`${issue.code}-${idx}`}
                              className="rounded-sm border border-border p-2 text-sm"
                            >
                              <Badge
                                variant={
                                  issue.level === 'error'
                                    ? 'err'
                                    : issue.level === 'warn'
                                      ? 'warn'
                                      : 'outline'
                                }
                                className="mb-1"
                              >
                                {issue.level}
                              </Badge>
                              <p>{issue.message}</p>
                              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                                {issue.code}
                                {issue.field ? ` · ${issue.field}` : ''}
                              </p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">没有发现问题。</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">无校验结果</p>
                  )}
                </TabsContent>

                <TabsContent value="generate" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    把当前条目转换成其他 Agent 的规范格式并写入对应目录。
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>目标 Agent</Label>
                      <Select value={xAgent} onValueChange={(val) => setXAgent(val as AgentKind)}>
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
                      <Label>范围</Label>
                      <Select value={xScope} onValueChange={(val) => setXScope(val as Scope)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="project">项目级</SelectItem>
                          <SelectItem value="global">全局</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Name</Label>
                      <Input value={xName} onChange={(e) => setXName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Description</Label>
                      <Textarea rows={2} value={xDesc} onChange={(e) => setXDesc(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tools（逗号分隔）</Label>
                      <Input value={xTools} onChange={(e) => setXTools(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Skills（逗号分隔）</Label>
                      <Input value={xSkills} onChange={(e) => setXSkills(e.target.value)} />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Body</Label>
                      <Textarea rows={10} value={xBody} onChange={(e) => setXBody(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox checked={xDry} onCheckedChange={(c) => setXDry(c === true)} />
                      仅预览
                    </label>
                    <Button onClick={runGenerate} disabled={busy}>
                      {busy ? '生成中…' : '按目标 Agent 生成'}
                    </Button>
                  </div>
                  {xResult ? (
                    <pre className="max-h-64 overflow-auto rounded-sm border border-border bg-[hsl(var(--secondary))] p-3 font-mono text-xs">
                      {JSON.stringify(xResult, null, 2)}
                    </pre>
                  ) : null}
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">{error}</div>
        ) : (
          <div className="p-6 text-sm text-muted-foreground">加载中…</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
