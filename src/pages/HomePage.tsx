import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { KpiCard } from '../components/KpiCard';
import { StatusBadge } from '../components/StatusBadge';
import { Loader, EmptyState, ErrorState } from '../components/States';
import { getCurrentUser } from '../lib/currentUser';
import { getEmployeeCount, getMyManager, getMyRemainingDays, getMyRequests, type RequestVM } from '../lib/hrData';
import { formatDate, formatDays } from '../lib/format';
import { loadOnboardingState, onboardingProgress } from '../lib/onboarding';

export function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [manager, setManager] = useState<string | undefined>();
  const [managerPhoto, setManagerPhoto] = useState<string | undefined>();
  const [remainingDays, setRemainingDays] = useState<number | undefined>();
  const [recent, setRecent] = useState<RequestVM[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const user = await getCurrentUser();
        const [count, mgr, remaining, requests] = await Promise.all([
          getEmployeeCount(),
          getMyManager(user.bookableResourceId, user.upn),
          getMyRemainingDays(user.bookableResourceId),
          getMyRequests(user.bookableResourceId),
        ]);
        if (!active) return;
        setEmployeeCount(count);
        setManager(mgr?.name);
        setManagerPhoto(mgr?.photoUrl);
        setRemainingDays(remaining);
        setRecent(requests.slice(0, 5));
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

  if (loading) return <main className="page"><Loader message="Loading your dashboard…" /></main>;
  if (error) return <main className="page"><ErrorState /></main>;

  const onboarding = onboardingProgress(loadOnboardingState());

  return (
    <main className="page">
      <div className="page__header">
        <h1>Welcome back</h1>
        <div className="page__subtitle">Your HR overview at a glance.</div>
      </div>

      <div className="kpi-grid">
        <KpiCard
          icon="👥"
          label="Total employees"
          value={employeeCount !== null ? String(employeeCount) : '—'}
          hint="Active employees in the organisation"
        />
        <KpiCard
          icon="👤"
          label="Your manager"
          value={manager ?? 'Not assigned'}
          hint="Approves your absence requests"
          imageUrl={managerPhoto}
        />
        <KpiCard
          icon="🌴"
          label="Remaining days"
          value={remainingDays !== undefined ? formatDays(remainingDays) : '—'}
          hint="Holiday days you can still request this year"
        />
      </div>

      <div className="card">
        <div className="card__title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Onboarding progress</span>
          <Link to="/onboarding" className="starter" style={{ textDecoration: 'none' }}>
            {onboarding.completed === onboarding.total ? 'Review →' : 'Continue →'}
          </Link>
        </div>
        <div className="progress">
          <div className="progress__bar" style={{ width: `${onboarding.percent}%` }} />
        </div>
        <div className="progress__caption">
          {onboarding.completed === onboarding.total
            ? '🎉 All onboarding tasks complete!'
            : `${onboarding.completed} of ${onboarding.total} tasks complete (${onboarding.percent}%)`}
        </div>
      </div>

      <div className="card">
        <div className="card__title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Recent absence requests</span>
          <Link to="/absences" className="starter" style={{ textDecoration: 'none' }}>View all →</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState message="You have no absence requests yet." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td>{r.type}</td>
                    <td>{formatDate(r.from)}</td>
                    <td>{formatDate(r.to)}</td>
                    <td>{formatDays(r.requestedDays)}</td>
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
