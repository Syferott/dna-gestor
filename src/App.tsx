import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CustomersView } from './components/CustomersView';
import { QuotesView } from './components/QuotesView';
import { FinancialView } from './components/FinancialView';
import { SalesReportView } from './components/SalesReportView';
import { PrintQuoteModal } from './components/PrintQuoteModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Customer } from './types';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, viewQuoteForPrint, setViewQuoteForPrint, companyInfo } = useApp();
  const [selectedCustomerForQuote, setSelectedCustomerForQuote] = useState<string | undefined>(undefined);

  const handleNewQuoteForCustomer = (customer: Customer) => {
    setSelectedCustomerForQuote(customer.id);
    setActiveTab('quotes');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <Header />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <Dashboard />}

        {activeTab === 'customers' && (
          <CustomersView onNewQuoteForCustomer={handleNewQuoteForCustomer} />
        )}

        {activeTab === 'quotes' && (
          <QuotesView initialCustomerId={selectedCustomerForQuote} />
        )}

        {activeTab === 'financial' && <FinancialView />}

        {activeTab === 'reports' && <SalesReportView />}
      </main>

      {/* Footer (hidden when printing) */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            &copy; {new Date().getFullYear()} <strong>{companyInfo.commercialName}</strong> • Sistema de Gestão Comercial e Financeira.
          </p>
          <p className="text-slate-400">
            Cadastro de Clientes • Orçamentos Comerciais • Contas a Pagar e Receber • Relatórios Impressos
          </p>
        </div>
      </footer>

      {/* Global Printable Quote Modal */}
      {viewQuoteForPrint && (
        <PrintQuoteModal
          quote={viewQuoteForPrint}
          onClose={() => setViewQuoteForPrint(null)}
        />
      )}

      {/* Offline Connectivity Status Toast */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
