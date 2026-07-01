// apps/web/src/components/TopNav.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { logoutRequest } from '../api/auth';
import { Logo } from './Logo';
import './shell.css';

const ROLE_LABELS: Record<string, string> = {
  lawyer: 'Lawyer',
  practice_group_lead: 'Lead',
  knowledge_admin: 'Admin',
};

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();

  async function handleLogout() {
    if (token) await logoutRequest(token);
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <nav className="top-nav">
      <div className="top-nav-brand">
        <button className="top-nav-menu-btn" onClick={onMenuClick} aria-label="Open navigation menu">
          <Menu size={20} aria-hidden />
        </button>
        <Logo size={22} />
        <span className="top-nav-wordmark">Consilium</span>
      </div>
      <div className="top-nav-right">
        {user && (
          <>
            <span className="top-nav-user">{user.displayName}</span>
            <span className="top-nav-role">{ROLE_LABELS[user.role] ?? user.role}</span>
          </>
        )}
        <button className="top-nav-logout" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
