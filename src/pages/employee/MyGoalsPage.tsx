import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { employeeService } from '@/services/employeeService';
import { GOAL_STATUS_LABELS, type Goal, type GoalStatus } from '@/types';
import { Modal } from '@/components/Modal';
import { Icons } from '@/components/Icons';

const GOAL_STATUS_STYLES: Record<GoalStatus, string> = {
  NOT_STARTED: 'bg-surface-200 text-[rgb(var(--text-secondary))] dark:bg-surface-800',
  IN_PROGRESS: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(iso: string): number {
  const due = new Date(iso).getTime();
  const now = Date.now();
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

export function MyGoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  function loadData() {
    if (!user) return;
    setIsLoading(true);
    employeeService
      .getMyGoals(user.id)
      .then(setGoals)
      .finally(() => setIsLoading(false));
  }

  function openGoalModal(goal: Goal) {
    setActiveGoal(goal);
    setCompleted(
      goal.employeeResponse === 'COMPLETED' ? true : goal.employeeResponse === 'NOT_COMPLETED' ? false : null
    );
    setNote(goal.employeeNote ?? '');
  }

  function closeModal() {
    setActiveGoal(null);
    setCompleted(null);
    setNote('');
  }

  async function handleSubmit() {
    if (!activeGoal || completed === null) return;
    setIsSaving(true);
    try {
      await employeeService.respondToGoal(activeGoal.id, { completed, note: note || undefined });
      closeModal();
      loadData();
    } finally {
      setIsSaving(false);
    }
  }

  const alreadyResponded = activeGoal?.employeeResponse !== 'PENDING';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading your goals…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">My Goals</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          Goals assigned to you by your manager
        </p>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-10 text-center text-sm text-[rgb(var(--text-muted))]">
          No goals assigned to you yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {goals.map((goal) => {
            const remaining = daysUntil(goal.dueDate);
            const isOverdue = remaining < 0 && goal.status !== 'COMPLETED';
            return (
              <button
                key={goal.id}
                onClick={() => openGoalModal(goal)}
                className="flex flex-col items-start rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-5 text-left shadow-card transition-colors hover:border-brand-300"
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <span className="font-semibold text-[rgb(var(--text-primary))]">{goal.title}</span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${GOAL_STATUS_STYLES[goal.status]}`}
                  >
                    {GOAL_STATUS_LABELS[goal.status]}
                  </span>
                </div>

                {goal.description && (
                  <p className="mt-1.5 text-sm text-[rgb(var(--text-secondary))]">{goal.description}</p>
                )}

                <div className="mt-3 flex items-center gap-1.5 text-xs text-[rgb(var(--text-muted))]">
                  <Icons.Clock className="h-3.5 w-3.5" />
                  Due {formatDate(goal.dueDate)}
                  {isOverdue ? (
                    <span className="font-medium text-red-600 dark:text-red-400">· Overdue</span>
                  ) : (
                    goal.status !== 'COMPLETED' && <span>· {remaining} days left</span>
                  )}
                </div>

                <div className="mt-2 text-xs text-[rgb(var(--text-muted))]">
                  {goal.employeeResponse === 'PENDING' && 'You haven\u2019t responded yet'}
                  {goal.employeeResponse === 'COMPLETED' && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ✓ You marked this as completed
                    </span>
                  )}
                  {goal.employeeResponse === 'NOT_COMPLETED' && (
                    <span className="text-amber-600 dark:text-amber-400">
                      You marked this as not done
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!activeGoal}
        onClose={closeModal}
        title={activeGoal?.title ?? ''}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">Did you complete this goal?</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCompleted(true)}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  completed === true
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                    : 'border-[rgb(var(--border-subtle))] text-[rgb(var(--text-secondary))] hover:border-emerald-300'
                }`}
              >
                <Icons.Check className="h-4 w-4" />
                Yes, completed
              </button>
              <button
                type="button"
                onClick={() => setCompleted(false)}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  completed === false
                    ? 'border-red-400 bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                    : 'border-[rgb(var(--border-subtle))] text-[rgb(var(--text-secondary))] hover:border-red-300'
                }`}
              >
                <Icons.Close className="h-4 w-4" />
                No, not done
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              Add a note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Any additional context..."
              className="w-full resize-none rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {alreadyResponded && (
            <p className="text-xs text-[rgb(var(--text-muted))]">
              You can update your response until your manager finalizes it.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={closeModal}
              className="rounded-lg border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-primary))] hover:bg-brand-50 dark:hover:bg-surface-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={completed === null || isSaving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}