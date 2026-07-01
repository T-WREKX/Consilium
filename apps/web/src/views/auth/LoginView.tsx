// apps/web/src/views/auth/LoginView.tsx
import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { seedPersonalNotes } from '../../lib/seedPersonal';
import { Logo } from '../../components/Logo';
import { motion } from 'motion/react';
import './login.css';

export function LoginView() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await loginRequest(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (result.data) {
      login(result.data.token, result.data.user);

      // Seed personal notes for the Lawyer demo account on first login (PRD §2.8)
      // seedPersonalNotes() is idempotent — skips if notes already exist
      if (result.data.user.role === 'lawyer') {
        seedPersonalNotes().catch(console.error);
      }

      navigate('/capture', { replace: true });
    }
  }

  // Stagger choreography: logo → wordmark → subtitle → title → fields → button → footer
  const stagger = {
    hidden: { opacity: 0, y: 10 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, duration: 0.4, ease: [0, 0, 0.2, 1] as const },
    }),
  };

  return (
    <div className="login-root">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
      >
        <motion.div className="login-logo-wrap" custom={0} variants={stagger} initial="hidden" animate="show">
          <Logo size={56} />
        </motion.div>
        <motion.span className="login-wordmark" custom={1} variants={stagger} initial="hidden" animate="show">
          Consilium
        </motion.span>
        <motion.span className="login-subtitle" custom={2} variants={stagger} initial="hidden" animate="show">
          Legal Knowledge Management
        </motion.span>
        <motion.h1 className="login-title" custom={3} variants={stagger} initial="hidden" animate="show">
          Sign in
        </motion.h1>

        <motion.form onSubmit={handleSubmit} custom={4} variants={stagger} initial="hidden" animate="show">
          <div className="login-field">
            <label className="login-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={`login-input${error ? ' error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={`login-input${error ? ' error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="login-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </p>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Continue'}
          </button>
        </motion.form>

        <motion.div className="login-footer" custom={5} variants={stagger} initial="hidden" animate="show">
          Powered by Consilium — Knowledge lives here.
        </motion.div>
      </motion.div>
    </div>
  );
}
