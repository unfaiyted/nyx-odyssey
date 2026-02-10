import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-ody-bg text-ody-text">
      <nav className="border-b border-ody-border bg-ody-surface px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-ody-accent">Odyssey</h1>
          <div className="flex gap-4 text-sm text-ody-text-muted">
            <a href="/" className="hover:text-ody-text transition-colors">Dashboard</a>
            <a href="/trips" className="hover:text-ody-text transition-colors">Trips</a>
            <a href="/map" className="hover:text-ody-text transition-colors">Map</a>
          </div>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
