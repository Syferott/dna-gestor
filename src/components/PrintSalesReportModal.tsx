import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { Quote, FinancialRecord } from '../types';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, formatDocument } from '../utils/formatters';

interface PrintSalesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredQuotes: Quote[];
  periodLabel: string;
  totalRevenue: number;
  totalSalesCount: number;
  averageTicket: number;
}

export const PrintSalesReportModal: React.FC<PrintSalesReportModalProps> = ({
  isOpen,
  onClose,
  filteredQuotes,
  periodLabel,
  totalRevenue,
  totalSalesCount,
  averageTicket,
}) => {
  const { companyInfo, financialRecords } = useApp();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleString('pt-BR');

  // Calculate received vs pending for these sales
  const salesFinancialIds = filteredQuotes
    .map(q => q.financialRecordId)
    .filter(Boolean);

  const relatedFin = financialRecords.filter(f =>
    f.relatedQuoteId ? filteredQuotes.some(q => q.id === f.relatedQuoteId) : false
  );

  const totalRecebido = relatedFin
    .filter(f => f.status === 'pago')
    .reduce((acc, f) => acc + f.amount, 0);

  const totalPendente = relatedFin
    .filter(f => f.status !== 'pago')
    .reduce((acc, f) => acc + f.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-4">
        {/* Screen Action Bar (hidden in print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm sm:text-base">
              Visualização de Impressão • Relatório de Vendas
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Relatório / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable A4 Sheet */}
        <div
          id="printable-sales-report"
          className="p-8 sm:p-12 text-slate-900 bg-white font-sans printable-sheet max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-5 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                {companyInfo.name}
              </h1>
              <p className="text-sm font-semibold text-emerald-700">{companyInfo.commercialName}</p>
              <p className="text-xs text-slate-600 mt-1">
                CNPJ: {formatDocument(companyInfo.cnpj)} • Telefone: {companyInfo.phone}
              </p>
              <p className="text-xs text-slate-600">{companyInfo.address} - {companyInfo.cityState}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                Relatório Gerencial
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">VENDAS E FATURAMENTO</h2>
              <p className="text-xs text-slate-600 mt-1">
                <strong>Período:</strong> {periodLabel}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Emissão: {currentDateStr}
              </p>
            </div>
          </div>

          {/* Executive KPI Summary */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500">Total Faturado</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {formatCurrency(totalRevenue)}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500">Qtd. Vendas</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {totalSalesCount}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500">Ticket Médio</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {formatCurrency(averageTicket)}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500">Recebido Efetivo</div>
              <div className="text-lg font-black text-emerald-700 mt-0.5">
                {formatCurrency(totalRecebido || totalRevenue)}
              </div>
            </div>
          </div>

          {/* Analytical Sales Table */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Detalhamento Analítico das Vendas / Propostas Aprovadas
            </h3>
            <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-20">Código</th>
                  <th className="py-2.5 px-3 w-24">Data</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Produtos / Serviços</th>
                  <th className="py-2.5 px-3 w-28">Forma Pgto</th>
                  <th className="py-2.5 px-3 w-20 text-center">Status</th>
                  <th className="py-2.5 px-3 w-28 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredQuotes.map((q, idx) => (
                  <tr key={q.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{q.code}</td>
                    <td className="py-2.5 px-3 text-slate-600">{formatDate(q.date)}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{q.customerName}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {q.items.map(it => `${it.quantity}x ${it.description}`).join('; ')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{q.paymentTerms || 'A combinar'}</td>
                    <td className="py-2.5 px-3 text-center uppercase text-[10px] font-bold">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          q.status === 'convertido'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {q.status === 'convertido' ? 'Venda' : 'Aprovado'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(q.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={6} className="py-3 px-3 text-right text-slate-800 text-xs">
                    VALOR TOTAL GERAL FATURADO:
                  </td>
                  <td className="py-3 px-3 text-right text-sm text-slate-900 font-black">
                    {formatCurrency(totalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer note & signature */}
          <div className="pt-8 border-t border-slate-200 mt-12 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p>Relatório gerado automaticamente pelo ERP Comercial.</p>
              <p className="text-[11px]">Sistema comercial de orçamentos e controle financeiro.</p>
            </div>
            <div className="text-center w-64 border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-800">Diretoria / Responsável Financeiro</p>
              <p className="text-[10px] text-slate-400">Visto e Conferência</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
