import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { hrService } from '@/services/hrService';
import { GOAL_STATUS_LABELS, type Appraisal, type Goal, type GoalRequest, type GoalStatus } from '@/types';
import { Modal } from '@/components/Modal';
import { Icons } from '@/components/Icons';

const GOAL_STATUS_STYLES: Record<GoalStatus, string> = {
  NOT_STARTED: 'bg-surface-200 text-[rgb(var(--text-secondary))] dark:bg-surface-800',
  IN_PROGRESS: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const EMPTY_FORM: GoalRequest = { appraisalId: '', title: '', description: '', dueDate: '' };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<GoalRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [confirmTarget, setConfirmTarget] = useState<Goal | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  function loadData() {
    if (!user) return;
    setIsLoading(true);
    Promise.all([hrService.getGoals(), hrService.getAssignableAppraisals()])
      .then(([goalList, appraisalList]) => {
        setGoals(goalList);
        setAppraisals(appraisalList);
      })
      .finally(() => setIsLoading(false));
  }

  function openCreateModal() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setFormError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.appraisalId) {
      setFormError('Please select an appraisal.');
      return;
    }
    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!form.dueDate) {
      setFormError('Due date is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (!user) return;
      await hrService.createGoal(form, user.id);
      closeModal();
      setSuccessMessage('Goal assigned');
      loadData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setFormError('Something went wrong saving this goal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || !user) return;
    await hrService.deleteGoal(deleteTarget.id, user.id);
    setDeleteTarget(null);
    loadData();
  }

  function needsConfirmation(goal: Goal): boolean {
    return goal.employeeResponse !== 'PENDING' && goal.status !== 'COMPLETED';
  }

  function openConfirmModal(goal: Goal) {
    setConfirmTarget(goal);
    setConfirmError(null);
  }

  function closeConfirmModal() {
    setConfirmTarget(null);
    setConfirmError(null);
  }

  async function handleConfirm(completed: boolean) {
    if (!confirmTarget || !user) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      await hrService.confirmGoalStatus(confirmTarget.id, completed, user.id);
      closeConfirmModal();
      loadData();
    } catch (err) {
      setConfirmError(
        err instanceof Error ? err.message : 'Could not confirm this goal. Please try again.'
      );
    } finally {
      setIsConfirming(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading goals…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Goals</h1>
          <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
            Assign goals to managers and track their progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          {successMessage && (
            <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
              <Icons.Check className="h-4 w-4" />
              {successMessage}
            </span>
          )}
          <button
            onClick={openCreateModal}
            disabled={appraisals.length === 0}
            title={appraisals.length === 0 ? 'No manager appraisals available yet' : undefined}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icons.Plus className="h-4 w-4" />
            Assign Goal
          </button>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-10 text-center text-sm text-[rgb(var(--text-muted))]">
          No goals assigned yet.
        </div>
      ) : (
        <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border-subtle))] text-xs uppercase tracking-wide text-[rgb(var(--text-muted))]">
                  <th className="px-4 py-3 font-medium">Manager / Cycle</th>
                  <th className="px-4 py-3 font-medium">Goal</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Response</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {goals.map((goal) => (
                  <tr
                    key={goal.id}
                    className="border-b border-[rgb(var(--border-subtle))] last:border-0 hover:bg-brand-50/50 dark:hover:bg-surface-800/50"
                  >
                    <td className="px-4 py-3 font-medium text-[rgb(var(--text-primary))]">
                      {goal.employeeName} — {goal.cycle}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[rgb(var(--text-primary))]">{goal.title}</div>
                      {goal.description && (
                        <div className="text-xs text-[rgb(var(--text-muted))]">{goal.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">{formatDate(goal.dueDate)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${GOAL_STATUS_STYLES[goal.status]}`}
                      >
                        {GOAL_STATUS_LABELS[goal.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[rgb(var(--text-secondary))]">
                      {goal.employeeResponse === 'PENDING' && 'Not responded'}
                      {goal.employeeResponse === 'IN_PROGRESS' && 'In progress'}
                      {goal.employeeResponse === 'COMPLETED' && 'Marked as completed'}
                      {goal.employeeResponse === 'NOT_COMPLETED' && 'Marked as not done'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {needsConfirmation(goal) && (
                          <button
                            onClick={() => openConfirmModal(goal)}
                            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                          >
                            Confirm
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(goal)}
                          aria-label={`Delete goal ${goal.title}`}
                          className="rounded-lg p-1.5 text-[rgb(var(--text-secondary))] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                        >
                          <Icons.Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Assign Goal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              Appraisal <span className="text-red-500">*</span>
            </label>
            <select
              value={form.appraisalId}
              onChange={(e) => setForm({ ...form, appraisalId: e.target.value })}
              className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Select appraisal</option>
              {appraisals.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.employeeName} — {a.cycle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Lead the Q3 delivery roadmap"
              className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Describe the goal..."
              className="w-full resize-none rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-primary))] hover:bg-brand-50 dark:hover:bg-surface-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Save Goal'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete goal?"
        description={
          deleteTarget
            ? `This will permanently remove "${deleteTarget.title}" for ${deleteTarget.employeeName}.`
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

      <Modal
        isOpen={!!confirmTarget}
        onClose={closeConfirmModal}
        title="Confirm goal status"
        description={
          confirmTarget
            ? `${confirmTarget.employeeName} claims "${confirmTarget.title}" is ${
                confirmTarget.employeeResponse === 'COMPLETED' ? 'completed' : 'not done'
              }. Do you agree?`
            : undefined
        }
      >
        <div className="space-y-4">
          {confirmError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {confirmError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={closeConfirmModal}
              className="rounded-lg border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-primary))] hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-surface-800"
            >
              Cancel
            </button>
            <button
              onClick={() => handleConfirm(false)}
              disabled={isConfirming}
              className="rounded-lg border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-primary))] hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-surface-800"
            >
              Mark Not Started
            </button>
            <button
              onClick={() => handleConfirm(true)}
              disabled={isConfirming}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isConfirming ? 'Confirming…' : 'Confirm Completed'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
