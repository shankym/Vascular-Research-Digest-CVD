import {
  PaperRecord,
  SystemStatusResponse,
  SystemSettings,
  AutomationLog,
  PaperFigure,
  JournalMetric,
  ReadingHistoryItem
} from './types';

export async function fetchSystemStatus(): Promise<SystemStatusResponse> {
  const res = await fetch('/api/status');
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function fetchPapers(params?: {
  search?: string;
  category?: string;
  journal?: string;
  articleType?: string;
  year?: string;
  savedOnly?: boolean;
  readOnly?: boolean;
  sort?: string;
}): Promise<{ papers: PaperRecord[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);
  if (params?.journal) query.set('journal', params.journal);
  if (params?.articleType) query.set('articleType', params.articleType);
  if (params?.year) query.set('year', params.year);
  if (params?.savedOnly) query.set('savedOnly', 'true');
  if (params?.readOnly) query.set('readOnly', 'true');
  if (params?.sort) query.set('sort', params.sort);

  const url = `/api/papers${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch papers');
  return res.json();
}

export async function fetchPaperById(id: string): Promise<PaperRecord> {
  const res = await fetch(`/api/papers/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to fetch paper details');
  return res.json();
}

export async function updatePaperNotes(id: string, notes: string): Promise<ReadingHistoryItem> {
  const res = await fetch(`/api/papers/${encodeURIComponent(id)}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes })
  });
  if (!res.ok) throw new Error('Failed to save paper notes');
  return res.json();
}

export async function toggleSavePaper(id: string): Promise<{ saved_status: boolean; history: ReadingHistoryItem }> {
  const res = await fetch(`/api/papers/${encodeURIComponent(id)}/toggle-save`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to toggle save');
  return res.json();
}

export async function toggleReadPaper(id: string): Promise<{ read_status: boolean; history: ReadingHistoryItem }> {
  const res = await fetch(`/api/papers/${encodeURIComponent(id)}/toggle-read`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to toggle read');
  return res.json();
}

export async function fetchAllFigures(): Promise<{
  figures: { figure: PaperFigure; paperTitle: string; paperId: string; journal: string; year: string }[];
  total: number;
}> {
  const res = await fetch('/api/figures');
  if (!res.ok) throw new Error('Failed to fetch figures');
  return res.json();
}

export async function fetchLogs(limit = 50): Promise<{ logs: AutomationLog[] }> {
  const res = await fetch(`/api/logs?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
}

export async function fetchSettings(): Promise<SystemSettings> {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function triggerManualCycle(): Promise<{
  success: boolean;
  message: string;
  paper?: PaperRecord;
}> {
  const res = await fetch('/api/automation/run', {
    method: 'POST'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to trigger radar cycle');
  }
  return res.json();
}

export async function fetchJournalMetrics(): Promise<{ journals: JournalMetric[] }> {
  const res = await fetch('/api/journal-metrics');
  if (!res.ok) throw new Error('Failed to fetch journal metrics');
  return res.json();
}
