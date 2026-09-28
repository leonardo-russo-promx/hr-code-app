import { statusSemantic } from '../lib/format';

interface Props {
  statuscode?: number;
  label?: string;
}

export function StatusBadge({ statuscode, label }: Props) {
  const semantic = statusSemantic(statuscode);
  return <span className={`badge badge--${semantic}`}>{label ?? 'Unknown'}</span>;
}
