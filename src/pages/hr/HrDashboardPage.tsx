import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { hrService } from '../../services/hrService';
import type { Appraisal, AppraisalStatus, DashboardData } from '@/types';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';

const STATUS_OPTIONS: { value: AppraisalStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'EMPLOYEE_DRAFT', label: 'Employee Draft' },
  { value: 'SELF_SUBMITTED', label: 'Self Submitted' },
  { value: 'MANAGER_DRAFT', label: 'Manager Draft' },
  { value: 'MANAGER_REVIEWED', label: 'Manager Reviewed' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function HrDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AppraisalStatus | 'ALL'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [cycleFilter, setCycleFilter] = useState<string>('ALL');

  useEffect(() => {
    hrService
      .getDashboard()
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  const departments = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.appraisals.map((a) => a.department)));
  }, [data]);

  const cycles = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.appraisals.map((a) => a.cycle)));
  }, [data]);

  const filteredAppraisals: Appraisal[] = useMemo(() => {
    if (!data) return [];
    return data.appraisals.filter((a) => {
      if (a.employeeRole === 'MANAGER') return false;
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (departmentFilter !== 'ALL' && a.department !== departmentFilter) return false;
      if (cycleFilter !== 'ALL' && a.cycle !== cycleFilter) return false;
      return true;
    });
  }, [data, statusFilter, departmentFilter, cycleFilter]);

  const hasActiveFilters =
    statusFilter !== 'ALL' || departmentFilter !== 'ALL' || cycleFilter !== 'ALL';

  function clearFilters() {
    setStatusFilter('ALL');
    setDepartmentFilter('ALL');
    setCycleFilter('ALL');
  }

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
        <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">HR Dashboard</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          Overview of all appraisals and employees
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Employees" value={data.summary.activeEmployees} />
        <StatCard label="Total Appraisals" value={data.summary.totalAppraisals} />
        <StatCard label="Pending Approval" value={data.summary.pendingApproval} />
        <StatCard label="Completed" value={data.summary.completed} />
      </div>

      <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgb(var(--border-subtle))] p-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
              All Appraisals
            </h2>
            <span className="text-xs text-[rgb(var(--text-muted))]">
              {filteredAppraisals.length} of {data.appraisals.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AppraisalStatus | 'ALL')}
              className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-1.5 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-1.5 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="ALL">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={cycleFilter}
              onChange={(e) => setCycleFilter(e.target.value)}
              className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-1.5 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="ALL">All cycles</option>
              {cycles.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {filteredAppraisals.length === 0 ? (
          <div className="p-10 text-center text-sm text-[rgb(var(--text-muted))]">
            No appraisals found. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border-subtle))] text-xs uppercase tracking-wide text-[rgb(var(--text-muted))]">
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Manager</th>
                  <th className="px-4 py-3 font-medium">Cycle</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppraisals.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-[rgb(var(--border-subtle))] last:border-0 hover:bg-brand-50/50 dark:hover:bg-surface-800/50"
                  >
                    <td className="px-4 py-3 font-medium text-[rgb(var(--text-primary))]">
                      {a.employeeName}
                    </td>
                    <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">
                      {a.department}
                    </td>
                    <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">
                      {a.managerName}
                    </td>
                    <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{a.cycle}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">
                      {formatDate(a.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/hr/appraisals/${a.id}`}
                        className="rounded-lg border border-[rgb(var(--border-subtle))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text-primary))] hover:border-brand-400 hover:text-brand-600"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}