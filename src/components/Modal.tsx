import type { ReactNode } from 'react';
import { Icons } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[rgb(var(--bg-card))] p-6 shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-[rgb(var(--text-primary))]">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-[rgb(var(--text-muted))] hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-surface-800"
          >
            <Icons.Close className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}