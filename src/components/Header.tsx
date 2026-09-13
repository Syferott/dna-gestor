import React, { useState } from 'react';
import {
  Users,
  FileText,
  DollarSign,
  BarChart3,
  LayoutDashboard,
  Building2,
  HardDrive,
  WifiOff,
  Wifi,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { LocalDataModal } from './LocalDataModal';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    customers,
    quotes,
    financialRecords,
    companyInfo,
  } = useApp();

  const isOnline = useOnlineStatus();
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);

  const pendingPayableCount = financialRecords.filter(
    r => r.type === 'pagar' && (r.status === 'pendente' || r.status === 'vencido')
  ).length;

  const pendingQuotesCount = quotes.filter(q => q.status === 'aberto').length;

  return (
    <>
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 no-print border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo / Company Identity */}
            <div
              className="flex items-center space-x-3 cursor-pointer select-none"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold text-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-base sm:text-lg tracking-tight leading-tight text-white flex items-center gap-2">
                  {companyInfo.commercialName}
                  <span className="text-[10px] uppercase font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    ERP Local
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
                  <span>Clientes • Orçamentos • Financeiro</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    {isOnline ? (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        100% Offline Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400">
                        <WifiOff className="w-3 h-3" />
                        Sem Internet (Modo Offline)
                      </span>
                    )}
                  </span>
                </p>
              </div>
            </div>

            {/* Actions on right */}
            <div className="flex items-center gap-2">
              {/* Install PWA as desktop/mobile native app */}
              <PWAInstallButton />

              {/* Local Storage & Backup Modal */}
              <button
                onClick={() => setIsLocalModalOpen(true)}
                title="Gerenciar Banco de Dados Local, Backup JSON e Dados da Empresa"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline font-medium">Backup / Banco Local</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none pt-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Visão Geral</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clientes</span>
              <span className="bg-slate-800 text-slate-300 text-xs px-1.5 py-0.5 rounded-full font-mono">
                {customers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('quotes')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'quotes'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Orçamentos</span>
              {pendingQuotesCount > 0 ? (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-1.5 py-0.5 rounded-full font-mono">
                  {pendingQuotesCount}
                </span>
              ) : (
                <span className="bg-slate-800 text-slate-300 text-xs px-1.5 py-0.5 rounded-full font-mono">
                  {quotes.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('financial')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'financial'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Contas a Pagar / Receber</span>
              {pendingPayableCount > 0 && (
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs px-1.5 py-0.5 rounded-full font-mono">
                  {pendingPayableCount} pend.
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Relatórios de Vendas</span>
              <span className="text-[10px] bg-emerald-700/80 text-emerald-200 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
                Imprimir
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* Local Storage & Backup Modal */}
      <LocalDataModal
        isOpen={isLocalModalOpen}
        onClose={() => setIsLocalModalOpen(false)}
      />
    </>
  );
};
