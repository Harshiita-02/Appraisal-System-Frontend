import { APPRAISAL_STATUS_LABELS, type AppraisalStatus } from '@/types';

const STATUS_STYLES: Record<AppraisalStatus, string> = {
  PENDING: 'bg-surface-200 text-text-secondary dark:bg-surface-800 dark:text-text-secondary',
  EMPLOYEE_DRAFT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  SELF_SUBMITTED: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  MANAGER_DRAFT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  MANAGER_REVIEWED: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  ACKNOWLEDGED: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
};

export function StatusBadge({ status }: { status: AppraisalStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {APPRAISAL_STATUS_LABELS[status]}
    </span>
  );
}