import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArtifactCard } from '@/components/artifact-card';
import { DetailDrawer } from '@/components/detail-drawer';
import { GenerateDialog } from '@/components/generate-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { AgentKind, ArtifactsResponse, MetaResponse } from '@/types';

type FilterKey = 'agent' | 'scope' | 'type';

const FILTER_PRESETS: Array<[FilterKey, string, string]> = [
  ['type', 'skill', 'Skill'],
  ['type', 'subagent', 'Subagent'],
  ['scope', 'global', '全局'],
  ['scope', 'project', '项目级'],
];

export default function App() {
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [data, setData] = useState<ArtifactsResponse | null>(null);
  const [project, setProject] = useState('');
  const [draftProject, setDraftProject] = useState('');
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState({ agent: '', scope: '', type: '' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (proj?: string) => {
    setLoading(true);
    setError(null);
    try {
      const [m, a] = await Promise.all([api.meta(proj), api.artifacts(proj)]);
      setMeta(m);
      setData(a);
      setProject(a.projectRoot);
      setDraftProject(a.projectRoot);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const agentMeta = meta?.agents ?? ({} as MetaResponse['agents']);
  const kinds = meta?.kinds ?? [];

  const filtered = useMemo(() => {
    const list = data?.artifacts ?? [];
    const query = q.trim().toLowerCase();
    return list.filter((a) => {
      if (filters.agent && a.agent !== filters.agent) return false;
      if (filters.scope && a.scope !== filters.scope) return false;
      if (filters.type && a.type !== filters.type) return false;
      if (query) {
        const hay = `${a.name} ${a.description} ${a.path} ${a.displayName || ''}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [data, filters, q]);

  const setFilter = (key: FilterKey, value: string) => {
    setFilters((f) => ({ ...f, [key]: f[key] === value ? '' : value }));
  };

  const summary = data?.summary;

  return (
    <div className="min-h-screen">
      {/* 顶栏：公司门禁条气质 */}
      <header className="sticky top-0 z-20 border-b border-[#E0D8C8] bg-[#F6F1E8]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#1C1917] text-[12px] font-bold tracking-wide text-[#F6F1E8] shadow-[0_2px_6px_rgba(40,32,20,0.18)]">
              AM
            </div>
            <div>
              <h1 className="text-[16px] font-bold tracking-tight text-[#1C1917]">AI Mange 工卡墙</h1>
              <p className="text-[12px] text-[#6B6560]">Subagent &amp; Skill · 横向工卡目录</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              className="h-9 w-[min(280px,60vw)] rounded-full border-[#E0D8C8] bg-white/70 text-[13px] placeholder:text-[#9A9188] focus-visible:ring-[#1C1917]/20"
              placeholder="搜索姓名、职责或工具…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button
              variant="ghost"
              className="h-9 rounded-full text-[13px] text-[#5C564E] hover:bg-[#EDE6D8] hover:text-[#1C1917]"
              onClick={() => setGenOpen(true)}
            >
              生成
            </Button>
            <Button
              className="h-9 rounded-full bg-[#1C1917] px-4 text-[13px] text-[#F6F1E8] hover:bg-[#2A2622]"
              onClick={() => void refresh(draftProject.trim() || undefined)}
              disabled={loading}
            >
              {loading ? '扫描中' : '扫描'}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20 pt-10">
        {/* 导语：员工名录而非展馆 */}
        <section className="mb-10 max-w-2xl">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-1 w-10 rounded-full bg-[#E07A5F]" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A8078]">
              Directory
            </p>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1C1917] sm:text-[36px] sm:leading-[1.15]">
            每位 Agent
            <br className="hidden sm:block" />
            一张 14:9 工卡
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#5C564E]">
            14:9 卡面比例，左侧肖像、右侧职责与工具。点击卡片打开完整档案。
          </p>
        </section>

        {/* 项目路径条 */}
        <section className="mb-8 flex flex-wrap items-center gap-3 rounded-[16px] border border-[#E4DDD0] bg-[#F6F1E8] px-4 py-3 shadow-[0_1px_3px_rgba(40,32,20,0.04)]">
          <span className="text-[12px] font-medium text-[#8A8078]">项目</span>
          <Input
            className="h-8 min-w-[200px] flex-1 border-0 bg-transparent px-0 font-mono text-[12px] text-[#3D3A34] shadow-none focus-visible:ring-0"
            value={draftProject}
            onChange={(e) => setDraftProject(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void refresh(draftProject.trim() || undefined);
            }}
            spellCheck={false}
          />
          {summary ? (
            <div className="flex items-center gap-3 text-[12px] text-[#6B6560]">
              <span>
                <strong className="font-semibold text-[#1C1917]">{summary.total}</strong> 件
              </span>
              <span className="h-3 w-px bg-[#E0D8C8]" />
              <span className="text-[#3E6B5A]">{summary.passed} 通过</span>
              <span className="text-[#C2410C]">{summary.failed} 异常</span>
            </div>
          ) : null}
        </section>

        {/* 筛选：职责标签样式 */}
        <section className="mb-8 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilters((f) => ({ ...f, agent: '' }))}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-[13px] transition-colors',
                !filters.agent
                  ? 'bg-[#1C1917] text-[#F6F1E8]'
                  : 'text-[#6B6560] hover:bg-[#EDE6D8] hover:text-[#1C1917]',
              )}
            >
              全部
            </button>
            {kinds.map((k) => {
              const active = filters.agent === k;
              const color = agentMeta[k]?.color;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFilter('agent', k)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] transition-colors',
                    active
                      ? 'bg-[#1C1917] text-[#F6F1E8]'
                      : 'text-[#6B6560] hover:bg-[#EDE6D8] hover:text-[#1C1917]',
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {agentMeta[k]?.label || k}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTER_PRESETS.map(([key, val, label]) => (
              <button
                key={`${key}-${val}`}
                type="button"
                onClick={() => setFilter(key, val)}
                className={cn(
                  'rounded-full border px-3 py-1 text-[12px] transition-colors',
                  filters[key] === val
                    ? 'border-[#D4CBBB] bg-[#EDE6D8] text-[#1C1917]'
                    : 'border-transparent text-[#8A8078] hover:border-[#E0D8C8] hover:text-[#1C1917]',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {error ? (
          <div className="mb-8 rounded-[12px] border border-[#F0C4B4] bg-[#FDF0EA] px-4 py-3 text-[13px] text-[#9A3412]">
            无法连接服务：{error}
          </div>
        ) : null}

        {/* 工卡墙 — 14:9 */}
        {loading && !data ? (
          <p className="py-16 text-center text-[14px] text-[#8A8078]">正在扫描工卡…</p>
        ) : filtered.length ? (
          <section className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 xl:gap-5">
            {filtered.map((a, i) => (
              <ArtifactCard
                key={a.id}
                artifact={a}
                agentMeta={agentMeta}
                index={i}
                onSelect={(id) => {
                  setSelectedId(id);
                  setDrawerOpen(true);
                }}
              />
            ))}
          </section>
        ) : (
          <section className="rounded-[20px] border border-dashed border-[#D4CBBB] bg-[#F6F1E8]/60 px-8 py-20 text-center">
            <p className="text-[28px] leading-none text-[#C4B8A8]">○</p>
            <h3 className="mt-4 text-[15px] font-semibold text-[#1C1917]">墙面上还没有工卡</h3>
            <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-[#6B6560]">
              调整筛选条件，或确认项目路径下存在对应的 skill / subagent 目录。
            </p>
          </section>
        )}
      </main>

      <footer className="border-t border-[#E0D8C8] py-8 text-center">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#9A9188]">
          —— ◈ AI MANGE · WORK BADGES ◈ ——
        </p>
      </footer>

      <DetailDrawer
        id={selectedId}
        project={project}
        agentMeta={agentMeta}
        kinds={kinds}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onGenerated={() => void refresh()}
      />

      <GenerateDialog
        open={genOpen}
        onOpenChange={setGenOpen}
        project={project}
        agentMeta={agentMeta}
        kinds={kinds}
        onGenerated={() => void refresh()}
      />
    </div>
  );
}
