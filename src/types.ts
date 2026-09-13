export interface Customer {
  id: string;
  name: string;
  document: string; // CPF or CNPJ
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  createdAt: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export type QuoteStatus = 'rascunho' | 'aberto' | 'aprovado' | 'recusado' | 'convertido';

export interface Quote {
  id: string;
  code: string; // e.g. "ORC-001"
  customerId: string;
  customerName: string;
  date: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentTerms: string; // e.g., "À vista via Pix", "30/60 dias", "Boleto bancário"
  notes?: string;
  status: QuoteStatus;
  createdAt: string;
  convertedAt?: string;
  financialRecordId?: string;
}

export type FinancialType = 'receber' | 'pagar';
export type FinancialStatus = 'pendente' | 'pago' | 'vencido';

export interface FinancialRecord {
  id: string;
  type: FinancialType;
  description: string;
  category: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paymentDate?: string; // YYYY-MM-DD when marked paid
  status: FinancialStatus;
  entityName: string; // Nome do cliente ou fornecedor
  paymentMethod?: string;
  relatedQuoteId?: string;
  notes?: string;
  createdAt: string;
}

export interface CompanyInfo {
  name: string;
  commercialName: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  cityState: string;
  website?: string;
}
