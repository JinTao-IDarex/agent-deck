import type {
  ArtifactDetail,
  ArtifactsResponse,
  GenerateInput,
  GenerateResult,
  MetaResponse,
  ValidationResult,
} from '@/types';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    const err = new Error(data.error || res.statusText) as Error & {
      data?: unknown;
      status?: number;
    };
    err.data = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  meta: (project?: string) =>
    request<MetaResponse>(`/api/meta${project ? `?project=${encodeURIComponent(project)}` : ''}`),
  artifacts: (project?: string) =>
    request<ArtifactsResponse>(
      `/api/artifacts${project ? `?project=${encodeURIComponent(project)}` : ''}`,
    ),
  artifact: (id: string, project?: string) =>
    request<ArtifactDetail>(
      `/api/artifacts/${encodeURIComponent(id)}${project ? `?project=${encodeURIComponent(project)}` : ''}`,
    ),
  generate: (payload: GenerateInput) =>
    request<GenerateResult>('/api/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  validate: (payload: { content: string; agent: string; type: string; nameHint?: string }) =>
    request<ValidationResult>('/api/validate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
