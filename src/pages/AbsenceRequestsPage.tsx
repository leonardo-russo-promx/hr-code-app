import { useEffect, useMemo, useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { Loader, EmptyState, ErrorState } from '../components/States';
import { getCurrentUser } from '../lib/currentUser';
import { getMyRequests, type RequestVM } from '../lib/hrData';
import { formatDate, formatDays } from '../lib/format';

export function AbsenceRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [rows, setRows] = useState<RequestVM[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const user = await getCurrentUser();
        const requests = await getMyRequests(user.bookableResourceId);
        if (active) setRows(requests);
      } catch (err) {
        console.error(err);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const statuses = useMemo(
    () => Array.from(new Set(rows.map((r) => r.status))).sort(),
    [rows],
  );
  const types = useMemo(
    () => Array.from(new Set(rows.map((r) => r.type))).sort(),
    [rows],
  );

  const filtered = rows.filter(
    (r) =>
      (statusFilter === 'all' || r.status === statusFilter) &&
      (typeFilter === 'all' || r.type === typeFilter),
  );

  if (loading) return <main className="page"><Loader message="Loading absence requests…" /></main>;
  if (error) return <main className="page"><ErrorState /></main>;

  return (
    <main className="page">
      <div className="page__header">
        <h1>Absence Requests</h1>
        <div className="page__subtitle">A read-only view of your absence and holiday requests.</div>
      </div>

      <div className="card">
        <div className="filters" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="field">
            <label htmlFor="type">Type</label>
            <select id="type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
            <span className="page__subtitle">{filtered.length} of {rows.length} requests</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="No requests match the selected filters." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Length</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Requested</th>
                  <th>Approved</th>
                  <th>Approver</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>{r.type}</td>
                    <td>{r.length}</td>
                    <td>{formatDate(r.from)}</td>
                    <td>{formatDate(r.to)}</td>
                    <td>{formatDays(r.requestedDays)}</td>
                    <td>{formatDays(r.approvedDays)}</td>
                    <td>{r.approverName ?? '—'}</td>
                    <td><StatusBadge statuscode={r.statuscode} label={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
