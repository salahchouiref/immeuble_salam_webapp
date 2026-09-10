import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useI18n } from '../i18n';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions({ ...opts, danger: opts.danger ?? true });
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
    setOptions(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => close(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl ${
              options.danger ? 'bg-red-100' : 'bg-primary-50'
            }`}>
              {options.danger ? '🗑️' : '❓'}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {options.title || t.common.confirm}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{options.message}</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => close(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                {options.cancelLabel || t.common.cancel}
              </button>
              <button
                onClick={() => close(true)}
                className={`flex-1 py-2.5 text-white font-medium rounded-lg transition-colors text-sm ${
                  options.danger
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {options.confirmLabel || t.common.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}