// apps/web/src/App.tsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { LoginView } from './views/auth/LoginView';
import { ToastContainer } from './components/Toast';

const CaptureView = lazy(() => import('./views/capture/CaptureView'));
const PersonalGraphView = lazy(() => import('./views/graph/PersonalGraphView'));
const TeamGraphView = lazy(() => import('./views/team/TeamGraphView').then((m) => ({ default: m.TeamGraphView })));
const ChatView = lazy(() => import('./views/chat/ChatView').then((m) => ({ default: m.ChatView })));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: 14 }}>
      Loading...
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/capture" element={<ProtectedRoute><CaptureView /></ProtectedRoute>} />
          <Route path="/graph" element={<ProtectedRoute><PersonalGraphView /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><TeamGraphView /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatView /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/capture" replace />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </BrowserRouter>
  );
}
