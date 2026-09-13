import React from 'react';
import { X, Printer, CheckCircle, FileText } from 'lucide-react';
import { Quote } from '../types';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, formatDocument, formatPhone } from '../utils/formatters';

interface PrintQuoteModalProps {
  quote: Quote | null;
  onClose: () => void;
}

export const PrintQuoteModal: React.FC<PrintQuoteModalProps> = ({ quote, onClose }) => {
  const { companyInfo, customers } = useApp();

  if (!quote) return null;

  const customer = customers.find(c => c.id === quote.customerId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-4">
        {/* Screen Action Bar (hidden in print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm sm:text-base">
              Visualização de Impressão • Proposta {quote.code}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
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
          id="printable-quote"
          className="p-8 sm:p-12 text-slate-900 bg-white font-sans printable-sheet max-h-[85vh] overflow-y-auto"
        >
          {/* Company & Quote Header */}
          <div className="border-b-2 border-slate-800 pb-6 mb-6 flex flex-col sm:flex-row justify-between gap-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                {companyInfo.name}
              </h1>
              <p className="text-sm font-semibold text-emerald-700">{companyInfo.commercialName}</p>
              <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                <p>CNPJ: {formatDocument(companyInfo.cnpj)}</p>
                <p>{companyInfo.address} - {companyInfo.cityState}</p>
                <p>Telefone: {companyInfo.phone} | E-mail: {companyInfo.email}</p>
              </div>
            </div>

            <div className="sm:text-right bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Proposta Comercial
              </span>
              <div className="text-2xl font-mono font-black text-slate-900 mt-0.5">
                {quote.code}
              </div>
              <div className="text-xs text-slate-600 mt-2 space-y-1">
                <div>
                  <span className="font-semibold text-slate-700">Data de Emissão:</span> {formatDate(quote.date)}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Validade até:</span>{' '}
                  <span className="text-emerald-700 font-bold">{formatDate(quote.validUntil)}</span>
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800 mt-1">
                  Status: {quote.status.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Dados do Cliente / Solicitante
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-xs text-slate-700">
              <div>
                <span className="font-bold text-slate-900">Nome / Razão:</span> {quote.customerName}
              </div>
              {customer?.document && (
                <div>
                  <span className="font-bold text-slate-900">CPF/CNPJ:</span> {formatDocument(customer.document)}
                </div>
              )}
              {customer?.phone && (
                <div>
                  <span className="font-bold text-slate-900">Telefone:</span> {formatPhone(customer.phone)}
                </div>
              )}
              {customer?.email && (
                <div>
                  <span className="font-bold text-slate-900">E-mail:</span> {customer.email}
                </div>
              )}
              {customer?.address && (
                <div className="sm:col-span-2">
                  <span className="font-bold text-slate-900">Endereço:</span> {customer.address.street}
                  {customer.address.number ? `, ${customer.address.number}` : ''}
                  {customer.address.neighborhood ? ` - ${customer.address.neighborhood}` : ''}
                  {customer.address.city ? ` (${customer.address.city}/${customer.address.state})` : ''}
                  {customer.address.zipCode ? ` - CEP: ${customer.address.zipCode}` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Discriminação de Produtos e Serviços
            </h3>
            <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">Item</th>
                  <th className="py-2.5 px-3">Descrição do Produto / Serviço</th>
                  <th className="py-2.5 px-3 w-16 text-center">Qtd</th>
                  <th className="py-2.5 px-3 w-28 text-right">Preço Unit.</th>
                  <th className="py-2.5 px-3 w-24 text-right">Desc.</th>
                  <th className="py-2.5 px-3 w-28 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quote.items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{item.description}</td>
                    <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">
                      {item.discount > 0 ? `-${formatCurrency(item.discount)}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Financial summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
            <div className="w-full sm:w-1/2 space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 block mb-1">
                  Condições de Pagamento:
                </span>
                <p className="text-slate-700">{quote.paymentTerms || 'A combinar'}</p>
              </div>

              {quote.notes && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block mb-1">
                    Observações e Prazos:
                  </span>
                  <p className="text-slate-600 whitespace-pre-line">{quote.notes}</p>
                </div>
              )}
            </div>

            <div className="w-full sm:w-80 bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal dos Itens:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(quote.subtotal)}</span>
              </div>
              {quote.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Descontos Totais:</span>
                  <span>-{formatCurrency(quote.discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">VALOR TOTAL:</span>
                <span className="text-xl font-black text-emerald-700">
                  {formatCurrency(quote.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures section */}
          <div className="pt-10 border-t border-slate-200 mt-8 grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="border-t border-slate-400 mx-auto w-4/5 pt-2">
                <p className="font-bold text-slate-800">{companyInfo.commercialName}</p>
                <p className="text-slate-500 text-[11px]">Representante Comercial</p>
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 mx-auto w-4/5 pt-2">
                <p className="font-bold text-slate-800">{quote.customerName}</p>
                <p className="text-slate-500 text-[11px]">De Acordo / Aceite da Proposta em ____/____/________</p>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 mt-10 print-only">
            Documento emitido eletronicamente através do sistema {companyInfo.commercialName}.
          </div>
        </div>
      </div>
    </div>
  );
};
