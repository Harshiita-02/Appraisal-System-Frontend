import type { Role } from '@/types';

const ROLE_STYLES: Record<Role, string> = {
  HR: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  MANAGER: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  EMPLOYEE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_STYLES[role]}`}
    >
      {role}
    </span>
  );
}