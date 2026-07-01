// apps/web/src/components/Layout.tsx
import React, { useState } from 'react';
import { TopNav } from './TopNav';
import { SideNav } from './SideNav';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem('sidebar-collapsed') === 'true'
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleCollapsed() {
    setCollapsed((c) => {
      localStorage.setItem('sidebar-collapsed', String(!c));
      return !c;
    });
  }

  return (
    <>
      <TopNav onMenuClick={() => setMobileOpen((o) => !o)} />
      <div className="app-body">
        {mobileOpen && (
          <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} />
        )}
        <SideNav
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggleCollapsed={toggleCollapsed}
          onMobileClose={() => setMobileOpen(false)}
        />
        <main className="content-area">{children}</main>
      </div>
    </>
  );
}
