import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Icons } from '@/components/Icons';

const NAV_ITEMS = [
  { to: '/hr/dashboard', label: 'Dashboard', icon: Icons.Dashboard },
  { to: '/hr/users', label: 'Employees', icon: Icons.Users },
  { to: '/hr/departments', label: 'Departments', icon: Icons.Department },
  { to: '/hr/appraisals', label: 'Appraisals', icon: Icons.Clipboard },
  { to: '/hr/appraisals/create', label: 'Create Appraisal', icon: Icons.Plus },
  { to: '/hr/goals', label: 'Goals', icon: Icons.Target },
  { to: '/hr/reports', label: 'Reports', icon: Icons.Chart },
];

export function HrLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'HA';

  return (
    <div className="flex min-h-screen bg-[rgb(var(--bg-page))]">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-sidebar))]">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-semibold text-white">
            A
          </div>
          <span className="text-[15px] font-semibold text-[rgb(var(--text-primary))]">
            Appraisal System
          </span>
        </div>

        <div className="flex items-center gap-3 border-y border-[rgb(var(--border-subtle))] px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium text-[rgb(var(--text-primary))]">
              {user?.name ?? 'HR Admin'}
            </div>
            <div className="text-xs text-[rgb(var(--text-muted))]">
              {user?.jobTitle ?? 'Human Resources'}
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">
            Navigation
          </p>
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-[rgb(var(--text-secondary))] hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-surface-800 dark:hover:text-brand-300'
                    }`
                  }
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-[rgb(var(--border-subtle))] px-3 py-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[rgb(var(--text-secondary))] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <Icons.Logout className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-6 py-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[rgb(var(--text-secondary))] hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-surface-800"
          >
            {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
          </button>
          <button
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[rgb(var(--text-secondary))] hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-surface-800"
          >
            <Icons.Bell />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-600" />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-brand-50 dark:hover:bg-surface-800"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                {initials}
              </div>
              <div className="text-left leading-tight">
                <div className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                  {user?.name ?? 'HR Admin'}
                </div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-brand-600 dark:text-brand-300">
                  {user?.role ?? 'HR'}
                </div>
              </div>
              <Icons.ChevronDown className="ml-1 h-4 w-4 text-[rgb(var(--text-muted))]" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-36 rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] py-1 shadow-card">
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <Icons.Logout className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
