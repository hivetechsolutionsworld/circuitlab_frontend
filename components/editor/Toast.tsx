'use client';

import React from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const toasts = useEditorStore((s) => s.toasts);
  const removeToast = useEditorStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-14 right-4 z-50 flex flex-col space-y-2 select-none pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start space-x-2 rounded-lg border border-panel-border bg-panel-bg p-3 shadow-xl backdrop-blur-md min-w-[260px] max-w-sm animate-in slide-in-from-bottom-2 duration-150"
        >
          {t.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />}
          {t.type === 'error' && <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />}
          {t.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />}
          {t.type === 'info' && <Info className="h-4 w-4 text-blue-400 mt-0.5" />}

          <div className="flex-1 text-xs">
            <h5 className="font-semibold text-gray-200">{t.title}</h5>
            {t.message && <p className="text-gray-400 text-[11px] mt-0.5">{t.message}</p>}
          </div>

          <button
            onClick={() => removeToast(t.id)}
            className="text-gray-500 hover:text-gray-300 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
