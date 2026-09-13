import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Quote, FinancialRecord, CompanyInfo, QuoteStatus } from '../types';
import {
  initialCustomers,
  initialQuotes,
  initialFinancialRecords,
  initialCompanyInfo,
} from '../data/initialData';
import { getTodayDateString } from '../utils/formatters';

interface AppContextType {
  customers: Customer[];
  quotes: Quote[];
  financialRecords: FinancialRecord[];
  companyInfo: CompanyInfo;
  activeTab: 'dashboard' | 'customers' | 'quotes' | 'financial' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'customers' | 'quotes' | 'financial' | 'reports') => void;

  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Quote actions
  addQuote: (quote: Omit<Quote, 'id' | 'code' | 'createdAt'>) => Quote;
  updateQuote: (id: string, quote: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  convertQuoteToSale: (quoteId: string, paymentMethod?: string) => void;
  updateQuoteStatus: (quoteId: string, status: QuoteStatus) => void;

  // Financial actions
  addFinancialRecord: (record: Omit<FinancialRecord, 'id' | 'createdAt'>) => FinancialRecord;
  updateFinancialRecord: (id: string, record: Partial<FinancialRecord>) => void;
  deleteFinancialRecord: (id: string) => void;
  togglePaymentStatus: (id: string) => void;

  // Company info
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;

  // Print modals
  viewQuoteForPrint: Quote | null;
  setViewQuoteForPrint: (quote: Quote | null) => void;

  // Reset & Backup data (100% offline database handling)
  resetAllData: () => void;
  clearAllData: () => void;
  exportBackupData: () => void;
  importBackupData: (imported: {
    customers?: Customer[];
    quotes?: Quote[];
    financialRecords?: FinancialRecord[];
    companyInfo?: CompanyInfo;
  }) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CUSTOMERS: 'gestao_customers_v1',
  QUOTES: 'gestao_quotes_v1',
  FINANCIAL: 'gestao_financial_v1',
  COMPANY: 'gestao_company_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'quotes' | 'financial' | 'reports'>('dashboard');
  const [viewQuoteForPrint, setViewQuoteForPrint] = useState<Quote | null>(null);

  // Load from localStorage or defaults
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : initialCustomers;
    } catch {
      return initialCustomers;
    }
  });

  const [quotes, setQuotes] = useState<Quote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUOTES);
      return saved ? JSON.parse(saved) : initialQuotes;
    } catch {
      return initialQuotes;
    }
  });

  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FINANCIAL);
      return saved ? JSON.parse(saved) : initialFinancialRecords;
    } catch {
      return initialFinancialRecords;
    }
  });

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPANY);
      return saved ? JSON.parse(saved) : initialCompanyInfo;
    } catch {
      return initialCompanyInfo;
    }
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(financialRecords));
  }, [financialRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(companyInfo));
  }, [companyInfo]);

  // Customer methods
  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCustomer: Customer = {
      ...data,
      id: 'cli-' + Date.now(),
      createdAt: getTodayDateString(),
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, ...data } : c))
    );
    // Also update customer name on quotes if name changed
    if (data.name) {
      setQuotes(prev =>
        prev.map(q => (q.customerId === id ? { ...q, customerName: data.name! } : q))
      );
    }
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Quote methods
  const addQuote = (data: Omit<Quote, 'id' | 'code' | 'createdAt'>): Quote => {
    const nextNumber = 1000 + quotes.length + 1;
    const newQuote: Quote = {
      ...data,
      id: 'orc-' + Date.now(),
      code: `ORC-${nextNumber}`,
      createdAt: getTodayDateString(),
    };
    setQuotes(prev => [newQuote, ...prev]);
    return newQuote;
  };

  const updateQuote = (id: string, data: Partial<Quote>) => {
    setQuotes(prev =>
      prev.map(q => (q.id === id ? { ...q, ...data } : q))
    );
  };

  const updateQuoteStatus = (quoteId: string, status: QuoteStatus) => {
    setQuotes(prev =>
      prev.map(q => (q.id === quoteId ? { ...q, status } : q))
    );
  };

  const deleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
  };

  const convertQuoteToSale = (quoteId: string, paymentMethod?: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    const recordId = 'fin-rec-' + Date.now();
    const today = getTodayDateString();

    // Create accounts receivable record
    const newFinancialRecord: FinancialRecord = {
      id: recordId,
      type: 'receber',
      description: `Venda do Orçamento ${quote.code} - ${quote.customerName}`,
      category: 'Vendas de Produtos/Serviços',
      amount: quote.total,
      dueDate: today,
      status: 'pendente',
      entityName: quote.customerName,
      paymentMethod: paymentMethod || quote.paymentTerms || 'Pix',
      relatedQuoteId: quote.id,
      notes: `Gerado automaticamente da aprovação do orçamento ${quote.code}`,
      createdAt: today,
    };

    setFinancialRecords(prev => [newFinancialRecord, ...prev]);

    // Update quote status to 'convertido'
    setQuotes(prev =>
      prev.map(q =>
        q.id === quoteId
          ? {
              ...q,
              status: 'convertido',
              convertedAt: today,
              financialRecordId: recordId,
            }
          : q
      )
    );
  };

  // Financial methods
  const addFinancialRecord = (data: Omit<FinancialRecord, 'id' | 'createdAt'>): FinancialRecord => {
    const newRecord: FinancialRecord = {
      ...data,
      id: 'fin-' + Date.now(),
      createdAt: getTodayDateString(),
    };
    setFinancialRecords(prev => [newRecord, ...prev]);
    return newRecord;
  };

  const updateFinancialRecord = (id: string, data: Partial<FinancialRecord>) => {
    setFinancialRecords(prev =>
      prev.map(r => (r.id === id ? { ...r, ...data } : r))
    );
  };

  const deleteFinancialRecord = (id: string) => {
    setFinancialRecords(prev => prev.filter(r => r.id !== id));
  };

  const togglePaymentStatus = (id: string) => {
    const today = getTodayDateString();
    setFinancialRecords(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        if (r.status === 'pago') {
          return { ...r, status: 'pendente', paymentDate: undefined };
        } else {
          return { ...r, status: 'pago', paymentDate: today };
        }
      })
    );
  };

  const updateCompanyInfo = (info: Partial<CompanyInfo>) => {
    setCompanyInfo(prev => ({ ...prev, ...info }));
  };

  const resetAllData = () => {
    if (window.confirm('Tem certeza que deseja restaurar os dados de demonstração originais? Suas alterações serão substituídas.')) {
      setCustomers(initialCustomers);
      setQuotes(initialQuotes);
      setFinancialRecords(initialFinancialRecords);
      setCompanyInfo(initialCompanyInfo);
      localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
      localStorage.removeItem(STORAGE_KEYS.QUOTES);
      localStorage.removeItem(STORAGE_KEYS.FINANCIAL);
      localStorage.removeItem(STORAGE_KEYS.COMPANY);
    }
  };

  const clearAllData = () => {
    if (window.confirm('Atenção: Isso limpará TODOS os clientes, orçamentos e lançamentos para você começar com o sistema completamente limpo e zerado. Deseja continuar?')) {
      setCustomers([]);
      setQuotes([]);
      setFinancialRecords([]);
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify([]));
    }
  };

  const exportBackupData = () => {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      appName: 'GestaoComercialFinanceira',
      companyInfo,
      customers,
      quotes,
      financialRecords,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup-gestao-comercial-${dateStamp}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importBackupData = (imported: {
    customers?: Customer[];
    quotes?: Quote[];
    financialRecords?: FinancialRecord[];
    companyInfo?: CompanyInfo;
  }): boolean => {
    try {
      if (imported.customers && Array.isArray(imported.customers)) {
        setCustomers(imported.customers);
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(imported.customers));
      }
      if (imported.quotes && Array.isArray(imported.quotes)) {
        setQuotes(imported.quotes);
        localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(imported.quotes));
      }
      if (imported.financialRecords && Array.isArray(imported.financialRecords)) {
        setFinancialRecords(imported.financialRecords);
        localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(imported.financialRecords));
      }
      if (imported.companyInfo && typeof imported.companyInfo === 'object') {
        setCompanyInfo(prev => ({ ...prev, ...imported.companyInfo }));
        localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify({ ...companyInfo, ...imported.companyInfo }));
      }
      return true;
    } catch (err) {
      console.error('Falha ao importar backup:', err);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        customers,
        quotes,
        financialRecords,
        companyInfo,
        activeTab,
        setActiveTab,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addQuote,
        updateQuote,
        deleteQuote,
        convertQuoteToSale,
        updateQuoteStatus,
        addFinancialRecord,
        updateFinancialRecord,
        deleteFinancialRecord,
        togglePaymentStatus,
        updateCompanyInfo,
        viewQuoteForPrint,
        setViewQuoteForPrint,
        resetAllData,
        clearAllData,
        exportBackupData,
        importBackupData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
