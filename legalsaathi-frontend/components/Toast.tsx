'use client';

import { useEffect, useState } from 'react';
import { Toast as ToastType, ToastType as TType } from '@/hooks/useToast';

const STYLES: Record<TType, {
  bg: string; border: string; icon: string; text: string; bar: string;
}> = {
  success: { bg: 'bg-green-950', border: 'border-green-700', icon: '✅', text: 'text-green-200', bar: 'bg-green-500' },
  error:   { bg: 'bg-red-950',   border: 'border-red-700',   icon: '❌', text: 'text-red-200',   bar: 'bg-red-500'   },
  warning: { bg: 'bg-yellow-950',border: 'border-yellow-700',icon: '⚠️', text: 'text-yellow-200',bar: 'bg-yellow-500'},
  info:    { bg: 'bg-blue-950',  border: 'border-blue-700',  icon: 'ℹ️', text: 'text-blue-200',  bar: 'bg-blue-500'  },
};

function ToastItem({ toast, onRemove }: { toast: ToastType; onRemove: (id: string) => void }) {
  const [show, setShow] = useState(false);
  const s = STYLES[toast.type];

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), toast.duration - 350);
    return () => clearTimeout(t);
  }, [toast.duration]);

  const dismiss = () => {
    setShow(false);
    setTimeout(() => onRemove(toast.id), 350);
  };

  return (
    <div
      onClick={dismiss}
      role="alert"
      aria-live="assertive"
      className={`
        relative overflow-hidden flex items-start gap-3 px-4 py-3
        rounded-xl border shadow-xl cursor-pointer select-none
        transition-all duration-300 ease-out
        ${s.bg} ${s.border}
        ${show ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
    >
      <span className="text-base flex-shrink-0 mt-0.5" aria-hidden="true">{s.icon}</span>
      <p className={`text-sm font-medium leading-snug flex-1 ${s.text}`}>{toast.message}</p>
      <button
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors text-xl leading-none -mt-0.5 ml-1"
      >×</button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gray-800">
        <div
          className={`h-full ${s.bar} transition-none`}
          style={{
            animation: `toastProgress ${toast.duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }: {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}) {
  if (!toasts.length) return null;
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]"
      aria-label="Notifications"
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}