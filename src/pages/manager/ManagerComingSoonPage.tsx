interface ComingSoonPageProps {
  title: string;
  description: string;
}

export function ManagerComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">{title}</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">{description}</p>
      </div>
      <div className="mt-6 flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))]">
        <p className="text-sm text-[rgb(var(--text-muted))]">
          This page is built next — Dashboard, My Team, and Goals are ready first.
        </p>
      </div>
    </div>
  );
}