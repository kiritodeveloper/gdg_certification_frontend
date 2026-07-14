import { useState, useEffect, useCallback } from 'react';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

let toastId = 0;

const colors = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-primary-50 border-primary-200 text-primary-800',
};

const icons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

// Singleton: solo una instancia del callback registrada globalmente
let globalAdd: ((t: Toast) => void) | null = null;

export function toast(type: Toast['type'], message: string) {
  const t: Toast = { id: ++toastId, type, message };
  globalAdd?.(t);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback(
    (t: Toast) => setToasts((prev) => [...prev, t]),
    []
  );

  // Registrar una sola vez el callback global
  useEffect(() => {
    globalAdd = addToast;
    return () => {
      if (globalAdd === addToast) globalAdd = null;
    };
  }, [addToast]);

  // Auto-remover toasts después de 4 segundos
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 4000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const remove = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
            ${colors[t.type]} animate-in slide-in-from-right`}
        >
          <span className="text-base font-bold">{icons[t.type]}</span>
          <p className="text-sm flex-1">{t.message}</p>
          <button
            onClick={() => remove(t.id)}
            className="opacity-50 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}