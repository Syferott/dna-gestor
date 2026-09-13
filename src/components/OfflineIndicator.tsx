import React, { useState } from 'react';
import { WifiOff, ShieldCheck, HardDrive, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  if (isOnline && dismissed) return null;

  return (
    <div className="no-print">
      {!isOnline ? (
        <div className="fixed bottom-4 left-4 z-40 max-w-md bg-slate-900 text-white rounded-2xl p-3.5 shadow-2xl border border-emerald-500/40 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <WifiOff className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-100">Modo Offline Ativo</p>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/30">
                100% Funcional
              </span>
            </div>
            <p className="text-slate-400 mt-0.5 leading-relaxed">
              Você está sem internet, mas o sistema continua operando normalmente. Todos os clientes, orçamentos e contas são salvos direto no seu computador.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
