import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  Check,
  Edit2,
  Trash2,
  ArrowRightCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Quote, QuoteStatus } from '../types';
import { QuoteModal } from './QuoteModal';
import { formatCurrency, formatDate } from '../utils/formatters';

interface QuotesViewProps {
  initialCustomerId?: string;
}

export const QuotesView: React.FC<QuotesViewProps> = ({ initialCustomerId }) => {
  const {
    quotes,
    addQuote,
    updateQuote,
    deleteQuote,
    convertQuoteToSale,
    updateQuoteStatus,
    setViewQuoteForPrint,
    customers,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch =
      q.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.items.some(it => it.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'todos' || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, code: string) => {
    if (window.confirm(`Deseja realmente excluir o orçamento ${code}?`)) {
      deleteQuote(id);
    }
  };

  const handleSaveQuote = (data: Omit<Quote, 'id' | 'code' | 'createdAt'>) => {
    if (editingQuote) {
      updateQuote(editingQuote.id, data);
    } else {
      addQuote(data);
    }
    setEditingQuote(null);
  };

  const handleConvertToSale = (quote: Quote) => {
    if (
      window.confirm(
        `Converter o orçamento ${quote.code} em VENDA?\nIsso irá gerar automaticamente um título de R$ ${formatCurrency(
          quote.total
        )} em "Contas a Receber" no financeiro.`
      )
    ) {
      convertQuoteToSale(quote.id);
    }
  };

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'aprovado':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Check className="w-3 h-3" /> Aprovado
          </span>
        );
      case 'convertido':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
            <CheckCircle2 className="w-3 h-3" /> Venda Concretizada
          </span>
        );
      case 'aberto':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> Em Aberto
          </span>
        );
      case 'recusado':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3" /> Recusado
          </span>
        );
      case 'rascunho':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Rascunho
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Orçamentos & Propostas
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
              {quotes.length} total
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Crie propostas comerciais detalhadas, converta em vendas e imprima em formato A4.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingQuote(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Orçamento</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por código (ORC-...), cliente ou descrição de item..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'aberto', label: 'Em Aberto' },
            { id: 'aprovado', label: 'Aprovados' },
            { id: 'convertido', label: 'Vendas' },
            { id: 'recusado', label: 'Recusados' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quotes Cards List */}
      {filteredQuotes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            Nenhum orçamento encontrado
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchTerm || statusFilter !== 'todos'
              ? 'Tente remover os filtros de busca para encontrar os orçamentos.'
              : 'Comece elaborando sua primeira proposta comercial para um cliente cadastrado.'}
          </p>
          <button
            onClick={() => {
              setEditingQuote(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Criar Orçamento
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map(quote => (
            <div
              key={quote.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              {/* Left Column: Code, Client & Items */}
              <div className="space-y-2.5 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-base font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {quote.code}
                  </span>
                  {getStatusBadge(quote.status)}
                  <span className="text-xs text-slate-500">
                    Emissão: {formatDate(quote.date)} • Validade: {formatDate(quote.validUntil)}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {quote.customerName}
                  </h3>
                  <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      <strong>Itens:</strong> {quote.items.length} (
                      {quote.items.map(it => `${it.quantity}x ${it.description}`).join(', ')}
                      )
                    </span>
                  </div>
                </div>

                {quote.paymentTerms && (
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Pagamento:</span> {quote.paymentTerms}
                  </p>
                )}
              </div>

              {/* Right Column: Values & Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-end justify-between lg:justify-center border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 gap-3">
                <div className="text-left sm:text-right">
                  <div className="text-xs text-slate-400 font-medium">Valor Total</div>
                  <div className="text-2xl font-black text-slate-900">
                    {formatCurrency(quote.total)}
                  </div>
                  {quote.discount > 0 && (
                    <div className="text-[11px] text-emerald-600 font-semibold">
                      Desconto de {formatCurrency(quote.discount)}
                    </div>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Convert to sale button */}
                  {quote.status !== 'convertido' && (
                    <button
                      onClick={() => handleConvertToSale(quote)}
                      title="Converter este orçamento em venda confirmada e registrar no Contas a Receber"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <ArrowRightCircle className="w-3.5 h-3.5" />
                      <span>Gerar Venda</span>
                    </button>
                  )}

                  {/* Print Quote */}
                  <button
                    onClick={() => setViewQuoteForPrint(quote)}
                    title="Visualizar e Imprimir Proposta em formato A4"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Proposta</span>
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleEdit(quote)}
                    title="Editar orçamento"
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(quote.id, quote.code)}
                    title="Excluir orçamento"
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Add/Edit Modal */}
      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuote(null);
        }}
        onSave={handleSaveQuote}
        quoteToEdit={editingQuote}
        defaultCustomerId={initialCustomerId}
      />
    </div>
  );
};
