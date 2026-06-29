import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface Toast {
  id: number;
  msg: string;
  type: 'error' | 'success';
}

interface ToastContextValue {
  addToast: (msg: string, type?: 'error' | 'success') => void;
}

const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
});

export const useToast = () => useContext(ToastContext);

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());
  const DURATION = 3000;

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`pointer-events-auto flex flex-col gap-1.5 px-4 pt-3 pb-0 rounded-xl shadow-lg border backdrop-blur-lg text-sm animate-in slide-in-from-right ${
        toast.type === 'error'
          ? 'bg-red-500/10 border-red-500/20 text-red-300'
          : 'bg-green-500/10 border-green-500/20 text-green-300'
      }`}
    >
      <div className="flex items-start gap-2">
        {toast.type === 'error'
          ? <AlertCircle size={16} className="shrink-0 mt-0.5" />
          : <CheckCircle size={16} className="shrink-0 mt-0.5" />
        }
        <span className="flex-1 text-xs">{toast.msg}</span>
        <button onClick={() => onDismiss(toast.id)} className="text-white/30 hover:text-white/60">
          <XCircle size={14} />
        </button>
      </div>
      <div className="h-0.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-100 ${
            toast.type === 'error' ? 'bg-red-400/50' : 'bg-green-400/50'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((msg: string, type: 'error' | 'success' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-2), { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const dismissToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast notifications — render global at top-right */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
