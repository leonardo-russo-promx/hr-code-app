import { useEffect, useMemo, useState } from 'react';
import {
  ONBOARDING_TASKS,
  loadOnboardingState,
  saveOnboardingState,
  onboardingProgress,
} from '../lib/onboarding';

export function OnboardingPage() {
  const [done, setDone] = useState<Record<string, boolean>>(loadOnboardingState);

  useEffect(() => {
    saveOnboardingState(done);
  }, [done]);

  const { completed, percent } = useMemo(() => onboardingProgress(done), [done]);

  function toggle(id: string) {
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <main className="page">
      <div className="page__header">
        <h1>Onboarding</h1>
        <div className="page__subtitle">Work through your onboarding checklist and mark each step complete.</div>
      </div>

      <div className="card">
        <div className="card__title" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Your progress</span>
          <span>{completed} / {ONBOARDING_TASKS.length} complete</span>
        </div>
        <div className="progress"><div className="progress__bar" style={{ width: `${percent}%` }} /></div>
      </div>

      <ul className="checklist">
        {ONBOARDING_TASKS.map((task) => {
          const isDone = !!done[task.id];
          return (
            <li key={task.id}>
              <label className={`check-item${isDone ? ' done' : ''}`}>
                <input type="checkbox" checked={isDone} onChange={() => toggle(task.id)} />
                <div>
                  <div className="check-item__title">{task.title}</div>
                  <div className="check-item__desc">{task.description}</div>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
