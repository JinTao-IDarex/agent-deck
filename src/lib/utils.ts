import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncate(s: string | undefined | null, n = 120) {
  const t = String(s ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

export function splitList(s: string) {
  return String(s || '')
    .split(/[,，]/)
    .map((x) => x.trim())
    .filter(Boolean);
}
