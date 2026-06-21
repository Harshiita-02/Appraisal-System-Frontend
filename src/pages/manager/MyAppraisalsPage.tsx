import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { managerService } from '@/services/managerService';
import { APPRAISAL_STATUS_LABELS, type Appraisal, type AppraisalStatus, type Cycle } from '@/types';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { StarRating } from '@/components/StarRating';
import { Icons } from '@/components/Icons';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function MyAppraisalsPage() {
  const { user } = useAuth();
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<AppraisalStatus | 'ALL'>('ALL');
  const [cycleFilter, setCycleFilter] = useState<string>('ALL');

  const [activeAppraisal, setActiveAppraisal] = useState<Appraisal | null>(null);
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatToImprove, setWhatToImprove] = useState('');
  const [keyAchievements, setKeyAchievements] = useState('');
  const [selfRating, setSelfRating] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  function loadData() {
    if (!user) return;
    setIsLoading(true);
    Promise.all([managerService.getMyAppraisals(user.id), managerService.getCycles()])
      .then(([appraisalList, cycleList]) => {
        setAppraisals(appraisalList);
        setCycles(cycleList);
      })
      .finally(() => setIsLoading(false));
  }

  const filteredAppraisals = useMemo(() => {
    return appraisals.filter((a) => {
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (cycleFilter !== 'ALL' && a.cycleId !== cycleFilter) return false;
      return true;
    });
  }, [appraisals, statusFilter, cycleFilter]);

  function openAssessmentModal(appraisal: Appraisal) {
    setActiveAppraisal(appraisal);
    setWhatWentWell(appraisal.whatWentWell ?? '');
    setWhatToImprove(appraisal.whatToImprove ?? '');
    setKeyAchievements(appraisal.keyAchievements ?? '');
    setSelfRating(appraisal.selfRating ?? 0);
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
      await managerService.saveSelfAssessmentDraft(activeAppraisal.id, {
        whatWentWell,
        whatToImprove,
        keyAchievements,
        selfRating: selfRating || 1,
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

    if (!whatWentWell.trim() || !whatToImprove.trim() || !keyAchievements.trim()) {
      setFormError('Please fill in all required fields before submitting.');
      return;
    }
    if (selfRating < 1) {
      setFormError('Please select a self rating before submitting.');
      return;
    }

    setIsSaving(true);
    try {
      await managerService.submitSelfAssessment(activeAppraisal.id, {
        whatWentWell,
        whatToImprove,
        keyAchievements,
        selfRating,
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">My Appraisals</h1>
          <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
            Your own appraisal cycles — as an employee reporting to your manager
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
                    Reviewed by: {a.managerName}
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
                    Fill Self Assessment
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
        description={activeAppraisal ? `${activeAppraisal.cycle} · Reviewed by ${activeAppraisal.managerName}` : undefined}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              What Went Well {isEditable && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              disabled={!isEditable}
              rows={3}
              placeholder="Describe your key contributions and successes..."
              className="w-full resize-none rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              What Could I Improve {isEditable && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={whatToImprove}
              onChange={(e) => setWhatToImprove(e.target.value)}
              disabled={!isEditable}
              rows={3}
              placeholder="Be honest about areas where you could have done better..."
              className="w-full resize-none rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--text-primary))]">
              Key Achievements {isEditable && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={keyAchievements}
              onChange={(e) => setKeyAchievements(e.target.value)}
              disabled={!isEditable}
              rows={3}
              placeholder="List specific achievements, metrics, projects completed..."
              className="w-full resize-none rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
            />
          </div>

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
            {isEditable && (
              <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">Click a star to rate yourself</p>
            )}
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
                  {isSaving ? 'Submitting…' : 'Submit to Manager'}
                </button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}