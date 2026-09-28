import { useEffect, useMemo, useState } from 'react';
import { KpiCard } from '../components/KpiCard';
import { SearchableSelect } from '../components/SearchableSelect';
import { Loader, EmptyState, ErrorState } from '../components/States';
import { getCurrentUser } from '../lib/currentUser';
import {
  getMyAllowances,
  getUpcomingLocalHolidays,
  getHolidayAreas,
  getMyHolidayAreaId,
  type AllowanceVM,
  type LocalHolidayVM,
  type HolidayAreaVM,
} from '../lib/hrData';
import { formatDate, formatDays } from '../lib/format';

export function HolidaysPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [allowances, setAllowances] = useState<AllowanceVM[]>([]);
  const [holidays, setHolidays] = useState<LocalHolidayVM[]>([]);
  const [areas, setAreas] = useState<HolidayAreaVM[]>([]);
  const [areaId, setAreaId] = useState<string>('');
  const [holidaysLoading, setHolidaysLoading] = useState(false);

  const areaOptions = useMemo(
    () => [{ id: '', name: 'All areas' }, ...areas.map((a) => ({ id: a.id, name: a.name }))],
    [areas],
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const user = await getCurrentUser();
        const [myAllowances, holidayAreas, myAreaId] = await Promise.all([
          getMyAllowances(user.bookableResourceId),
          getHolidayAreas(),
          getMyHolidayAreaId(user.bookableResourceId),
        ]);
        if (!active) return;
        setAllowances(myAllowances);
        setAreas(holidayAreas);
        const initialArea = myAreaId ?? '';
        setAreaId(initialArea);
        const localHolidays = await getUpcomingLocalHolidays(initialArea || undefined);
        if (!active) return;
        setHolidays(localHolidays);
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

  const onAreaChange = async (nextAreaId: string) => {
    setAreaId(nextAreaId);
    setHolidaysLoading(true);
    try {
      const localHolidays = await getUpcomingLocalHolidays(nextAreaId || undefined);
      setHolidays(localHolidays);
    } catch (err) {
      console.error(err);
    } finally {
      setHolidaysLoading(false);
    }
  };

  if (loading) return <main className="page"><Loader message="Loading holidays…" /></main>;
  if (error) return <main className="page"><ErrorState /></main>;

  const current = allowances[0];

  return (
    <main className="page">
      <div className="page__header">
        <h1>Holidays</h1>
        <div className="page__subtitle">Your holiday allowance and upcoming public holidays.</div>
      </div>

      {current ? (
        <div className="kpi-grid">
          <KpiCard icon="📅" label={`Allowance ${current.year}`} value={formatDays(current.allowed)} hint="Total allowed days" />
          <KpiCard icon="✅" label="Approved" value={formatDays(current.approved)} hint="Days approved this year" />
          <KpiCard icon="⏳" label="Remaining" value={formatDays(current.remaining)} hint="Days still available" />
        </div>
      ) : (
        <div className="card"><EmptyState message="No holiday allowance found for your account." /></div>
      )}

      <div className="two-col">
        <div className="card">
          <div className="card__title">Allowance history</div>
          {allowances.length === 0 ? (
            <EmptyState message="No allowance records." />
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Allowed</th>
                    <th>Approved</th>
                    <th>Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {allowances.map((a) => (
                    <tr key={a.id}>
                      <td>{a.year}</td>
                      <td>{formatDays(a.allowed)}</td>
                      <td>{formatDays(a.approved)}</td>
                      <td>{formatDays(a.remaining)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card__title card__title--with-action">
            <span>Upcoming public holidays</span>
            <div className="area-combo">
              <SearchableSelect
                options={areaOptions}
                value={areaId}
                onChange={onAreaChange}
                placeholder="Search an area…"
                ariaLabel="Holiday area"
              />
            </div>
          </div>
          {holidaysLoading ? (
            <Loader message="Loading holidays…" />
          ) : holidays.length === 0 ? (
            <EmptyState message="No upcoming public holidays." />
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Holiday</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((h, i) => (
                    <tr key={`${h.name}-${i}`}>
                      <td>{h.name}</td>
                      <td>{formatDate(h.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
