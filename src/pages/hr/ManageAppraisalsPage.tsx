import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { hrService } from '@/services/hrService';
import {
  APPRAISAL_STATUS_LABELS,
  APPRAISAL_STATUS_ORDER,
  type Appraisal,
  type AppraisalStatus,
  type Cycle,
  type Department,
} from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { Icons } from '@/components/Icons';

export function ManageAppraisalsPage() {
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppraisalStatus | 'ALL'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [cycleFilter, setCycleFilter] = useState<string>('ALL');

  const [deleteTarget, setDeleteTarget] = useState<Appraisal | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Tracks which appraisal rows currently have an advance request in
  // flight, so the button can be disabled until it resolves. Without this,
  // rapid/double clicks could fire multiple real one-step advances before
  // the UI re-rendered, which looked like a single click skipping several
  // stages.
  const [advancingIds, setAdvancingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setIsLoading(true);
    Promise.all([hrService.getAppraisals(), hrService.getDepartments(), hrService.getCycles()])
      .then(([appraisalList, departmentList, cycleList]) => {
        setAppraisals(appraisalList);
        setDepartments(departmentList);
        setCycles(cycleList);
      })
      .finally(() => setIsLoading(false));
  }

  const filteredAppraisals = useMemo(() => {
    return appraisals.filter((a) => {
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (departmentFilter !== 'ALL' && String(a.departmentId) !== departmentFilter) return false;
if (cycleFilter !== 'ALL' && String(a.cycleId) !== cycleFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${a.employeeName} ${a.managerName} ${a.cycle}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [appraisals, search, statusFilter, departmentFilter, cycleFilter]);

  const hasActiveFilters =
    statusFilter !== 'ALL' || departmentFilter !== 'ALL' || cycleFilter !== 'ALL' || search.trim() !== '';

  function clearFilters() {
    setSearch('');
    setStatusFilter('ALL');
    setDepartmentFilter('ALL');
    setCycleFilter('ALL');
  }

  async function handleAdvance(appraisal: Appraisal) {
    if (advancingIds.has(appraisal.id)) return;

    setActionError(null);
    setAdvancingIds((prev) => new Set(prev).add(appraisal.id));
    try {
      await hrService.advanceAppraisalStatus(appraisal.id, appraisal.status);
      await loadData();
    } catch {
      setActionError(`Couldn't advance ${appraisal.employeeName}'s appraisal. It may already be complete.`);
    } finally {
      setAdvancingIds((prev) => {
        const next = new Set(prev);
        next.delete(appraisal.id);
        return next;
      });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await hrService.deleteAppraisal(deleteTarget.id);
    setDeleteTarget(null);
    loadData();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading appraisals…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
            Manage Appraisals
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
            View and manage all appraisal cycles
          </p>
        </div>
        <Link
          to="/hr/appraisals/create"
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-700"
        >
          <Icons.Plus className="h-4 w-4" />
          Create Appraisal
        </Link>
      </div>

      {actionError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {actionError}
        </p>
      )}

      <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-[rgb(var(--border-subtle))] p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Icons.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee, manager, cycle…"
              className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] py-2 pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AppraisalStatus | 'ALL')}
            className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All Statuses</option>
            {APPRAISAL_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {APPRAISAL_STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All Cycles</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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

        {filteredAppraisals.length === 0 ? (
          <div className="p-10 text-center text-sm text-[rgb(var(--text-muted))]">
            No appraisals match your filters.
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
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppraisals.map((a) => {
                  const isFinal = a.status === 'ACKNOWLEDGED';
                  const isAdvancing = advancingIds.has(a.id);
                  return (
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAdvance(a)}
                            disabled={isFinal || isAdvancing}
                            title={isFinal ? 'Already acknowledged' : 'Advance to next stage'}
                            className="rounded-lg border border-[rgb(var(--border-subtle))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text-primary))] hover:border-brand-400 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {isAdvancing ? 'Advancing…' : 'Advance'}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(a)}
                            aria-label={`Delete appraisal for ${a.employeeName}`}
                            className="rounded-lg p-1.5 text-[rgb(var(--text-secondary))] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          >
                            <Icons.Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete appraisal?"
        description={
          deleteTarget
            ? `This will permanently remove ${deleteTarget.employeeName}'s appraisal for ${deleteTarget.cycle}. This can't be undone.`
            : undefined
        }
      >
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setDeleteTarget(null)}
            className="rounded-lg border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-primary))] hover:bg-brand-50 dark:hover:bg-surface-800"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}