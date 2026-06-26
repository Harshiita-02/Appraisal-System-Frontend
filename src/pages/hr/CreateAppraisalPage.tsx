import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrService } from '@/services/hrService';
import type { CreateAppraisalRequest, Cycle, Department, User } from '@/types';
import { Icons } from '@/components/Icons';

type Mode = 'single' | 'department' | 'all';
type CycleMode = 'existing' | 'new';

const TABS: { mode: Mode; label: string; description: string; icon: keyof typeof Icons }[] = [
  { mode: 'single', label: 'Single Employee', description: 'One specific employee', icon: 'Users' },
  { mode: 'department', label: 'By Department', description: 'All employees in a dept', icon: 'Department' },
  { mode: 'all', label: 'All Employees', description: 'Every active employee', icon: 'Users' },
];

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: unknown } }).response;
    const data = response?.data;
    if (data && typeof data === 'object') {
      const body = data as Record<string, unknown>;
      const candidate = body.message ?? body.error ?? body.detail;
      if (typeof candidate === 'string' && candidate.trim()) return candidate;
    }
    if (typeof data === 'string' && data.trim()) return data;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function CreateAppraisalPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [mode, setMode] = useState<Mode>('single');
  const [employeeId, setEmployeeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [cycleId, setCycleId] = useState('');

  // Inline cycle creation state
  const [cycleMode, setCycleMode] = useState<CycleMode>('new');
  const [cycleName, setCycleName] = useState('');
  const [cycleStartDate, setCycleStartDate] = useState('');
  const [cycleEndDate, setCycleEndDate] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([hrService.getUsers(), hrService.getDepartments(), hrService.getCycles()])
      .then(([userList, departmentList, cycleList]) => {
        setUsers(userList.filter((u) => u.role !== 'HR' && u.role !== 'MANAGER' && u.status === 'ACTIVE'));
        setDepartments(departmentList);
        setCycles(cycleList);
        // If no cycles exist, default to creating a new one
        if (cycleList.length === 0) setCycleMode('new');
      })
      .finally(() => setIsLoading(false));
  }, []);

  function switchMode(newMode: Mode) {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
  }

  async function handleSubmit() {
    setError(null);
    setSuccessMessage(null);

    // Validate cycle fields
    if (cycleMode === 'new') {
      if (!cycleName.trim()) { setError('Please enter a cycle name.'); return; }
      if (!cycleStartDate) { setError('Please select a start date.'); return; }
      if (!cycleEndDate) { setError('Please select an end date.'); return; }
      if (cycleEndDate <= cycleStartDate) { setError('End date must be after start date.'); return; }
    } else {
      if (!cycleId) { setError('Please select a cycle.'); return; }
    }

    if (mode === 'single' && !employeeId) { setError('Please select an employee.'); return; }
    if (mode === 'department' && !departmentId) { setError('Please select a department.'); return; }

    setIsSubmitting(true);
    try {
      // Step 1: Create cycle if new
      let resolvedCycleId = cycleId;
      if (cycleMode === 'new') {
        const newCycle = await hrService.createCycle({
          name: cycleName.trim(),
          startDate: cycleStartDate,
          endDate: cycleEndDate,
        });
        resolvedCycleId = String(newCycle.id);
        setCycles((prev) => [...prev, newCycle]);
        setCycleId(resolvedCycleId);
      }

      // Step 2: Create appraisal(s)
      let payload: CreateAppraisalRequest;
      if (mode === 'single') {
        payload = { mode: 'single', employeeId, cycleId: resolvedCycleId };
      } else if (mode === 'department') {
        payload = { mode: 'department', departmentId, cycleId: resolvedCycleId };
      } else {
        payload = { mode: 'all', cycleId: resolvedCycleId };
      }

      const created = await hrService.createAppraisals(payload);
      setSuccessMessage(
        created.length === 1
          ? `Created appraisal for ${created[0].employeeName}.`
          : `Created ${created.length} appraisal${created.length === 1 ? '' : 's'}.`
      );
      setEmployeeId('');
      setDepartmentId('');
      setCycleName('');
      setCycleStartDate('');
      setCycleEndDate('');
      setTimeout(() => navigate('/hr/appraisals'), 900);
    } catch (err) {
      setError(extractErrorMessage(err, 'Something went wrong. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading…
      </div>
    );
  }

  const inputClass =
    'w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Create Appraisal</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">Start a new appraisal cycle</p>
      </div>

      {/* Mode tabs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TABS.map((tab) => {
          const Icon = Icons[tab.icon];
          const isActive = mode === tab.mode;
          return (
            <button
              key={tab.mode}
              onClick={() => switchMode(tab.mode)}
              className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors ${
                isActive
                  ? 'border-brand-600 bg-brand-600 text-white shadow-card'
                  : 'border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] hover:border-brand-300'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-brand-500'}`} />
              <span className="text-sm font-semibold">{tab.label}</span>
              <span className={`text-xs ${isActive ? 'text-brand-100' : 'text-[rgb(var(--text-muted))]'}`}>
                {tab.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="max-w-lg rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-6 shadow-card">
        <div className="space-y-4">

          {/* Employee selector */}
          {mode === 'single' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">Employee</label>
              <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={inputClass}>
                <option value="">Select employee</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} — {u.jobTitle}</option>
                ))}
              </select>
            </div>
          )}

          {/* Department selector */}
          {mode === 'department' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">Department</label>
              <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={inputClass}>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.employeeCount} {d.employeeCount === 1 ? 'employee' : 'employees'})
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-[rgb(var(--text-muted))]">
                Creates one appraisal per active employee in this department. Employees who already have one for this cycle are skipped.
              </p>
            </div>
          )}

          {mode === 'all' && (
            <p className="rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-700 dark:bg-brand-900/20 dark:text-brand-300">
              This creates one appraisal for every active employee company-wide. Anyone who already has an appraisal for the selected cycle is skipped automatically.
            </p>
          )}

          {/* ── Cycle section ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[rgb(var(--text-primary))]">Cycle</label>
              {/* Toggle only shown when existing cycles exist */}
              {cycles.length > 0 && (
                <div className="flex rounded-lg border border-[rgb(var(--border-subtle))] text-xs overflow-hidden">
                  <button
                    onClick={() => setCycleMode('new')}
                    className={`px-3 py-1.5 transition-colors ${
                      cycleMode === 'new'
                        ? 'bg-brand-600 text-white'
                        : 'bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:bg-brand-50'
                    }`}
                  >
                    + New
                  </button>
                  <button
                    onClick={() => setCycleMode('existing')}
                    className={`px-3 py-1.5 transition-colors ${
                      cycleMode === 'existing'
                        ? 'bg-brand-600 text-white'
                        : 'bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:bg-brand-50'
                    }`}
                  >
                    Existing
                  </button>
                </div>
              )}
            </div>

            {/* New cycle fields */}
            {cycleMode === 'new' && (
              <div className="space-y-3 rounded-lg border border-brand-200 bg-brand-50/40 p-3 dark:border-brand-800 dark:bg-brand-900/10">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-secondary))]">
                    Cycle Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Q3 2026 Performance Review"
                    value={cycleName}
                    onChange={(e) => setCycleName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-secondary))]">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={cycleStartDate}
                      onChange={(e) => setCycleStartDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[rgb(var(--text-secondary))]">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={cycleEndDate}
                      onChange={(e) => setCycleEndDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Existing cycle dropdown */}
            {cycleMode === 'existing' && (
              <select value={cycleId} onChange={(e) => setCycleId(e.target.value)} className={inputClass}>
                <option value="">Select cycle</option>
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
              {successMessage}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'Creating…'
              : mode === 'single'
                ? 'Create Appraisal'
                : mode === 'department'
                  ? 'Create for Department'
                  : 'Create for All Employees'}
          </button>
        </div>
      </div>
    </div>
  );
}