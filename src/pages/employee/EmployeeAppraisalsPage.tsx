import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { employeeService } from '@/services/employeeService';
import { APPRAISAL_STATUS_LABELS, type Appraisal, type AppraisalStatus } from '@/types';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { StarRating } from '@/components/StarRating';
import { Icons } from '@/components/Icons';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function EmployeeAppraisalsPage() {
  const { user } = useAuth();
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<AppraisalStatus | 'ALL'>('ALL');

  const [activeAppraisal, setActiveAppraisal] = useState<Appraisal | null>(null);
  const [selfRating, setSelfRating] = useState(0);
  const [achievements, setAchievements] = useState('');
  const [comments, setComments] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  function loadData() {
    if (!user) return;
    setIsLoading(true);
    employeeService
      .getMyAppraisals(user.id)
      .then(setAppraisals)
      .finally(() => setIsLoading(false));
  }

  const filteredAppraisals = useMemo(() => {
    return appraisals.filter((a) => {
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      return true;
    });
  }, [appraisals, statusFilter]);

  function openAssessmentModal(appraisal: Appraisal) {
    setActiveAppraisal(appraisal);
    setSelfRating(appraisal.selfRating ?? 0);
    setAchievements(appraisal.achievements ?? '');
    setComments(appraisal.comments ?? '');
    setFormError(null);
  }

  function closeModal() {
    setActiveAppraisal(null);
    setFormError(null);
  }

  const isEditable =
    activeAppraisal?.status === 'PENDING' || activeAppraisal?.status === 'EMPLOYEE_DRAFT';

  async function handleSaveDraft() {
    if (!activeAppraisal) return;
    setIsSaving(true);
    try {
      await employeeService.saveSelfAssessmentDraft(activeAppraisal.id, {
        selfRating: selfRating || 1,
        achievements,
        comments,
      });
      closeModal();
      loadData();
    } catch {
      setFormError('Could not save your draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit() {
    if (!activeAppraisal) return;
    setFormError(null);

    if (selfRating < 1) {
      setFormError('Please select a self rating before submitting.');
      return;
    }

    setIsSaving(true);
    try {
      await employeeService.submitSelfAssessment(activeAppraisal.id, {
        selfRating,
        achievements,
        comments,
      });
      closeModal();
      loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not submit. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[rgb(var(--text-muted))]">
        Loading your appraisals…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">My Appraisals</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          Fill and submit your self appraisals for each cycle
        </p>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AppraisalStatus | 'ALL')}
          className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="ALL">All statuses</option>
          {Object.entries(APPRAISAL_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {filteredAppraisals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] p-10 text-center text-sm text-[rgb(var(--text-muted))]">
          No appraisals to display.
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
                  </div>
                  {a.selfRating != null && (
                    <div className="mt-2">
                      <StarRating value={a.selfRating} />
                    </div>
                  )}
                </div>

                {canFill ? (
                  <button
                    onClick={() => openAssessmentModal(a)}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    {a.status === 'EMPLOYEE_DRAFT' ? 'Continue' : 'Fill'} Self Assessment
                  </button>
                ) : (
                  <button
                    onClick={() => openAssessmentModal(a)}
                    className="rounded-lg border border-[rgb(var(--border-subtle))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text-primary))] hover:border-brand-400 hover:text-brand-600"
                  >
                    View
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!activeAppraisal}
        onClose={closeModal}
        title={isEditable ? 'Fill Self Assessment' : 'Self Assessment'}
        description={activeAppraisal ? `${activeAppraisal.cycle} · Manager: ${activeAppraisal.managerName}` : undefined}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              Self Rating {isEditable && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={!isEditable}
                  onClick={() => setSelfRating(value)}
                  aria-label={`Rate ${value} out of 5`}
                  className="disabled:cursor-not-allowed"
                >
                  <Icons.Star
                    filled={value <= selfRating}
                    className={`h-6 w-6 ${
                      value <= selfRating
                        ? 'text-amber-400'
                        : 'text-surface-300 dark:text-surface-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              Achievements
            </label>
            <textarea
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              disabled={!isEditable}
              rows={3}
              placeholder="What did you accomplish this cycle?"
              className="w-full resize-none rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              Comments
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={!isEditable}
              rows={3}
              placeholder="Anything else you'd like your manager to know?"
              className="w-full resize-none rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
            />
          </div>

          {activeAppraisal && activeAppraisal.managerRating != null && (
            <div className="rounded-lg bg-brand-50 px-3 py-2.5 text-sm dark:bg-brand-900/20">
              <span className="font-medium text-brand-700 dark:text-brand-300">Manager rating: </span>
              <StarRating value={activeAppraisal.managerRating} />
            </div>
          )}

          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={closeModal}
              className="rounded-lg border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-primary))] hover:bg-brand-50 dark:hover:bg-surface-800"
            >
              {isEditable ? 'Cancel' : 'Close'}
            </button>
            {isEditable && (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-brand-300 dark:hover:bg-surface-800"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? 'Submitting…' : 'Submit'}
                </button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
