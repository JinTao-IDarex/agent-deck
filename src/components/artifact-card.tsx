import { AvatarImage } from '@/components/avatar-image';
import { cn, truncate } from '@/lib/utils';
import type { AgentKind, AgentMeta, ArtifactSummary } from '@/types';

/** 一卡一色 */
const AGENT_ACCENT: Record<string, string> = {
  claude: '#E07A5F',
  codex: '#2A9D8F',
  trae: '#3D5A80',
  qoder: '#D4A373',
  mimo: '#E76F51',
  zcode: '#6D597A',
};

function scoreMeta(score: number, ok: boolean) {
  if (!ok) return { color: '#C2410C', label: '待修复' };
  if (score >= 100) return { color: '#3E6B5A', label: '完美' };
  if (score >= 90) return { color: '#2A9D8F', label: '良好' };
  if (score >= 75) return { color: '#BC6C25', label: '一般' };
  return { color: '#C2410C', label: '偏弱' };
}

/**
 * 卡面比例 14:9。用 padding-bottom 锁高，避免 grid/flex 拉伸。
 */
const CARD_RATIO_PAD = `${(9 / 14) * 100}%`; // 64.2857%

export function ArtifactCard({
  artifact,
  agentMeta,
  onSelect,
}: {
  artifact: ArtifactSummary;
  agentMeta: Record<AgentKind, AgentMeta>;
  index?: number;
  onSelect: (id: string) => void;
}) {
  const meta = agentMeta[artifact.agent];
  const v = artifact.validation;
  const name = artifact.displayName || artifact.name;
  const accent = AGENT_ACCENT[artifact.agent] || meta?.color || '#3F3F46';
  const score = scoreMeta(v.score, v.ok);
  const tools = artifact.tools.slice(0, 3);
  const roleLabel = meta?.label || artifact.agent;
  const kindLabel = artifact.type === 'skill' ? 'Skill' : 'Subagent';
  const tags =
    artifact.skills.length > 0
      ? artifact.skills.slice(0, 3)
      : [kindLabel, artifact.scope === 'global' ? '全局' : '项目级'];

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`打开 ${name}`}
      onClick={() => onSelect(artifact.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(artifact.id);
        }
      }}
      className="group relative w-full cursor-pointer"
      style={{ paddingBottom: CARD_RATIO_PAD }}
    >
      <div className="absolute inset-0 flex overflow-hidden rounded-[18px] border border-[#E4DDD0] bg-[#F6F1E8] shadow-[0_4px_16px_rgba(40,32,20,0.08)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-[#D4CBBB] group-hover:shadow-[0_14px_32px_rgba(40,32,20,0.12)] group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-[#3F3F46]/30">
        {/* 实体卡内细边 */}
        <div
          className="pointer-events-none absolute inset-[5px] rounded-[13px] border border-[#E8E0D2]/70"
          aria-hidden
        />

        {/* 左：肖像 */}
        <div className="relative h-full w-[42%] shrink-0 px-[3%] py-[6%]">
          <div className="relative h-full w-full overflow-hidden rounded-[12px] bg-[#F0EBE1] shadow-[0_4px_12px_rgba(40,32,20,0.08)]">
            <AvatarImage
              name={artifact.name}
              fill
              className="object-contain object-center"
            />
          </div>
        </div>

        {/* 右：信息 */}
        <div className="flex h-full min-w-0 flex-1 flex-col justify-center overflow-hidden py-[5%] pr-[5%]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[clamp(14px,1.5vw,20px)] font-bold leading-tight tracking-tight text-[#1C1917]">
                {truncate(name, 14)}
              </h3>
              <div
                className="mt-1.5 h-[3px] w-8 rounded-full"
                style={{ background: accent }}
                aria-hidden
              />
            </div>
            <span
              className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold tabular-nums"
              style={{ borderColor: accent, color: score.color }}
              title={score.label}
            >
              {v.score}
            </span>
          </div>

          <p className="mt-2 truncate text-[clamp(12px,1.1vw,15px)] font-medium text-[#2A2622]">
            {roleLabel}
          </p>

          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <li
                key={t}
                className="rounded-[8px] border px-2 py-0.5 text-[clamp(10px,0.95vw,12px)] font-medium leading-tight"
                style={{ borderColor: accent, color: accent }}
              >
                {truncate(t, 8)}
              </li>
            ))}
          </ul>

          <p className="mt-2.5 truncate border-t border-[#E0D8C8] pt-2 font-mono text-[clamp(10px,0.9vw,12px)] text-[#3D3A34]">
            {tools.length ? tools.join(' · ') : kindLabel}
          </p>

          <div className="mt-auto flex items-center justify-between gap-2 pt-1.5 text-[10px] text-[#8A8078]">
            <span className="truncate" style={{ color: score.color }}>
              {score.label}
            </span>
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity',
                'group-hover:opacity-100 group-focus-visible:opacity-100',
              )}
              style={{ background: accent }}
            >
              详情
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
