import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../lib/currentUser';

const NAV = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/absences', label: 'Absence Requests', icon: '🗓️' },
  { to: '/holidays', label: 'Holidays', icon: '🌴' },
  { to: '/skills', label: 'My Skills', icon: '⭐' },
  { to: '/faq', label: 'FAQ', icon: '💬' },
  { to: '/onboarding', label: 'Onboarding', icon: '✅' },
];

const TITLES: Record<string, string> = {
  '/': 'Home',
  '/absences': 'Absence Requests',
  '/holidays': 'Holidays',
  '/skills': 'My Skills',
  '/faq': 'HR FAQ Assistant',
  '/onboarding': 'Onboarding',
};

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Layout() {
  const location = useLocation();
  const [name, setName] = useState('User');

  useEffect(() => {
    getCurrentUser().then((u) => setName(u.fullName)).catch(() => undefined);
  }, []);

  const title = TITLES[location.pathname] ?? 'proMX HR Portal';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__logo">HR</span>
          <span>proMX HR</span>
        </div>
        <nav className="sidebar__nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-link__icon" aria-hidden>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">proMX HR Portal</div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar__title">{title}</div>
          <div className="topbar__user">
            <span>{name}</span>
            <span className="avatar" aria-hidden>{initials(name)}</span>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
