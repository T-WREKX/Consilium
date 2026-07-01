// apps/web/src/components/Toast.tsx
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import './toast.css';

interface ToastItem {
  id: number;
  message: string;
  variant: 'success' | 'error' | 'warning';
}

let nextId = 0;
const listeners: Array<(items: ToastItem[]) => void> = [];
let items: ToastItem[] = [];

function notify(state: ToastItem[]) {
  items = state;
  listeners.forEach((fn) => fn(state));
}

export function showToast(message: string, variant: ToastItem['variant'] = 'success') {
  const id = ++nextId;
  notify([...items, { id, message, variant }]);
  setTimeout(() => notify(items.filter((t) => t.id !== id)), 3000);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const idx = listeners.indexOf(setToasts);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  return (
    <div className="toast-container" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={`toast ${t.variant}`}
            role="status"
            layout
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
