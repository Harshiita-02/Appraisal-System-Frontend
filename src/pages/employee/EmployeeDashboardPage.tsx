import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { employeeService } from '@/services/employeeService';
import type { Appraisal } from '@/types';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';

interface DashboardData {
  activeAppraisals: number;
  goalsInProgress: number;
  unreadNotifications: number;
  appraisals: Appraisal[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    employeeService
      .getDashboard(user.id)
      .then((result) => setData(result as DashboardData))
      .finally(() => setIsLoading(false));
  }, [user]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
          Welcome, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          {user?.jobTitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active Appraisals" value={data.activeAppraisals} />
        <StatCard label="Goals In Progress" value={data.goalsInProgress} />
        <StatCard label="Unread Notifications" value={data.unreadNotifications} />
      </div>

      <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card">
        <h2 className="border-b border-[rgb(var(--border-subtle))] p-5 text-sm font-semibold text-[rgb(var(--text-primary))]">
          My Appraisals
        </h2>

        {data.appraisals.length === 0 ? (
          <div className="p-10 text-center text-sm text-[rgb(var(--text-muted))]">
            No appraisals yet.
          </div>
        ) : (
          <div className="divide-y divide-[rgb(var(--border-subtle))]">
            {data.appraisals.map((a) => {
              const canFill = a.status === 'PENDING' || a.status === 'EMPLOYEE_DRAFT';
              return (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-5"
                >
                  <div>
                    <div className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                      {a.cycle}
                    </div>
                    <div className="mt-0.5 text-xs text-[rgb(var(--text-muted))]">
                      Manager: {a.managerName}
                      {a.startDate && a.endDate && (
                        <> · {formatDate(a.startDate)} — {formatDate(a.endDate)}</>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.status} />
                    {canFill ? (
                      <Link
                        to="/employee/appraisals"
                        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                      >
                        {a.status === 'EMPLOYEE_DRAFT' ? 'Continue Self Assessment' : 'Fill Self Assessment'}
                      </Link>
                    ) : (
                      <Link
                        to="/employee/appraisals"
                        className="rounded-lg border border-[rgb(var(--border-subtle))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text-primary))] hover:border-brand-400 hover:text-brand-600"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}