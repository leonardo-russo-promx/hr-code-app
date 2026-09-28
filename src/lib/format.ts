export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDays(n?: number | null): string {
  if (n === null || n === undefined) return '—';
  const rounded = Math.round(n * 100) / 100;
  return `${rounded} ${rounded === 1 ? 'day' : 'days'}`;
}

export type Semantic = 'success' | 'warning' | 'error' | 'neutral';

const HOLIDAY_TYPE_LABELS: Record<number, string> = {
  596440000: 'Statutory Holiday',
  596440001: 'Other - Sickness',
  596440002: 'Other - Parental Leave',
  596440003: 'Other - Childcare',
  596440004: "Other - Doctor's Appointment",
  596440005: 'Other - Bereavement',
  596440019: 'Other - Remaining',
  596440099: 'Public Holiday',
};

const LENGTH_TYPE_LABELS: Record<number, string> = {
  596440000: 'Multiple days',
  596440001: 'One day',
  596440002: 'Morning',
  596440003: 'Afternoon',
};

const STATUS_LABELS: Record<number, string> = {
  596440003: 'Draft',
  1: 'Submitted',
  596440001: 'Approved',
  596440002: 'Rejected',
  796280001: 'Cancellation Requested',
  2: 'Cancelled',
};

export function holidayTypeLabel(code?: number): string {
  return (code !== undefined && HOLIDAY_TYPE_LABELS[code]) || '—';
}

export function lengthTypeLabel(code?: number): string {
  return (code !== undefined && LENGTH_TYPE_LABELS[code]) || '—';
}

export function statusLabel(code?: number): string {
  return (code !== undefined && STATUS_LABELS[code]) || 'Unknown';
}

/** Maps a holiday request statuscode to a semantic colour bucket. */
export function statusSemantic(statuscode?: number): Semantic {
  switch (statuscode) {
    case 596440001: // Approved
      return 'success';
    case 1: // Submitted
    case 796280001: // Cancellation Requested
      return 'warning';
    case 596440002: // Rejected
    case 2: // Cancelled
      return 'error';
    default: // Draft and anything else
      return 'neutral';
  }
}
