import { cn } from '@/lib/utils';

/** work-badge-portrait 规范生成的 35 张扁平肖像（512×640） */
const FACES = [
  'p01-crew-coral.jpg',
  'p02-beard-olive.jpg',
  'p03-buns-clay.jpg',
  'p04-vest-indigo.jpg',
  'p05-silver-purple.jpg',
  'p06-curly-mustard.jpg',
  'p07-bangs-terracotta.jpg',
  'p08-slick-teal.jpg',
  'p09-bun-brown.jpg',
  'p10-part-slate.jpg',
  'p11-locs-terracotta.jpg',
  'p12-crew-indigo.jpg',
  'p13-wave-sage.jpg',
  'p14-tache-brown.jpg',
  'p15-streak-clay.jpg',
  'p16-updo-coral.jpg',
  'p17-longbeard-mustard.jpg',
  'p18-straight-slate.jpg',
  'p19-glasses-hoodie.jpg',
  'p20-curly-mustard2.jpg',
  'p21-cans-purple.jpg',
  'p22-pony-coral.jpg',
  'p23-bald-brown.jpg',
  'p24-collarbone-purple.jpg',
  'p25-polo-teal.jpg',
  'p26-bun-clay.jpg',
  'p27-cap-indigo.jpg',
  'p28-bangs-mustard.jpg',
  'p29-suit-slate.jpg',
  'p30-shaved-terracotta.jpg',
  'portrait-01-knit-sage.jpg',
  'portrait-02-glasses-indigo.jpg',
  'portrait-03-hoodie-teal.jpg',
  'portrait-04-blazer-brown.jpg',
  'portrait-05-casual-purple.jpg',
];

function hash(str: string) {
  let h = 2166136261;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

export function AvatarImage({
  name,
  size = 84,
  className,
  fill = false,
}: {
  name: string;
  size?: number;
  className?: string;
  fill?: boolean;
}) {
  const file = FACES[hash(name) % FACES.length];
  if (fill) {
    return (
      <img
        src={`/avatars/${file}`}
        alt={name || 'avatar'}
        decoding="async"
        className={cn('block h-full w-full object-contain', className)}
      />
    );
  }
  return (
    <img
      src={`/avatars/${file}`}
      width={size}
      height={size}
      alt={name || 'avatar'}
      decoding="async"
      className={cn('rounded-xl object-cover', className)}
      style={{ width: size, height: size }}
    />
  );
}
