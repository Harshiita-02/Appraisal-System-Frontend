import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { employeeService } from '@/services/employeeService';
import { APPRAISAL_STATUS_LABELS, type Appraisal, type AppraisalStatus, type Cycle } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { StarRating } from '@/components/StarRating';

// Statuses meaningful to filter by from the employee's own point of view.
// MANAGER_DRAFT and MANAGER_REVIEWED are purely internal manager-side
// states — an appraisal can technically sit there, but an employee never
// causes that transition and rarely thinks to filter for it by that name.
const EMPLOYEE_FILTERABLE_STATUSES: AppraisalStatus[] = [
  'PENDING',
  'EMPLOYEE_DRAFT',
  'SELF_SUBMITTED',
  'APPROVED',
  'ACKNOWLEDGED',
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function MyAppraisalsPage() {
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<AppraisalStatus | 'ALL'>('ALL');
  const [cycleFilter, setCycleFilter] = useState<string>('ALL');

  useEffect(() => {
    employeeService
      .getMyAppraisals()
      .then(setAppraisals)
      .finally(() => setIsLoading(false));
  }, []);

  const cycles: Cycle[] = useMemo(() => {
    const seen = new Map<string, Cycle>();
    appraisals.forEach((a) => seen.set(a.cycleId, { id: a.cycleId, name: a.cycle }));
    return Array.from(seen.values());
  }, [appraisals]);

  const filteredAppraisals = useMemo(() => {
    return appraisals.filter((a) => {
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (cycleFilter !== 'ALL' && a.cycleId !== cycleFilter) return false;
      return true;
    });
  }, [appraisals, statusFilter, cycleFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading your appraisals…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">My Appraisals</h1>
          <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
            All your appraisal cycles across every period
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AppraisalStatus | 'ALL')}
            className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All statuses</option>
            {EMPLOYEE_FILTERABLE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {APPRAISAL_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All cycles</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredAppraisals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-10 text-center text-sm text-[rgb(var(--text-muted))]">
          No appraisals match your filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppraisals.map((a) => {
            const canFill = a.status === 'PENDING' || a.status === 'EMPLOYEE_DRAFT';
            return (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-4 shadow-card"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                      {a.cycle}
                    </span>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="mt-0.5 text-xs text-[rgb(var(--text-muted))]">
                    Manager: {a.managerName}
                    {a.startDate && a.endDate && (
                      <> · {formatDate(a.startDate)} — {formatDate(a.endDate)}</>
                    )}
                    {a.status !== 'PENDING' && (
                      <> · Submitted: {formatDate(a.createdAt)}</>
                    )}
                  </div>
                  {(a.selfRating != null || a.managerRating != null) && (
                    <div className="mt-2 flex items-center gap-4 text-xs text-[rgb(var(--text-muted))]">
                      <span className="flex items-center gap-1.5">
                        Self <StarRating value={a.selfRating} />
                      </span>
                      <span className="flex items-center gap-1.5">
                        Manager <StarRating value={a.managerRating} />
                      </span>
                    </div>
                  )}
                </div>

                {canFill ? (
                  <Link
                    to={`/employee/appraisals/${a.id}/self-assessment`}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    Fill Self Assessment
                  </Link>
                ) : (
                  <Link
                    to={`/employee/appraisals/${a.id}/self-assessment`}
                    className="rounded-lg border border-[rgb(var(--border-subtle))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text-primary))] hover:border-brand-400 hover:text-brand-600"
                  >
                    View
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}