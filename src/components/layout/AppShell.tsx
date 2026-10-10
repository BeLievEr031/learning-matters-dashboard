import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.tsx';
import { Header } from './Header.tsx';
import { CommandMenu } from './CommandMenu.tsx';
import { LogoutDialog } from '../auth/LogoutDialog.tsx';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Dynamic Role-Filtered Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onOpenCommandMenu={() => setCommandMenuOpen(true)}
          onRequestLogout={() => setLogoutOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Interactive Modals */}
      <CommandMenu
        open={commandMenuOpen}
        onOpenChange={setCommandMenuOpen}
        onRequestLogout={() => setLogoutOpen(true)}
      />

      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </div>
  );
}
