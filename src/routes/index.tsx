import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-ody-text-muted mt-1">Welcome to Odyssey</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Metric A', 'Metric B', 'Metric C'].map((label) => (
          <div key={label} className="rounded-lg border border-ody-border bg-ody-surface p-6">
            <p className="text-sm text-ody-text-muted">{label}</p>
            <p className="text-3xl font-bold mt-2">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
