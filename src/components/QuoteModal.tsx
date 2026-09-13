import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, FileText, Check, DollarSign } from 'lucide-react';
import { Quote, QuoteItem, QuoteStatus } from '../types';
import { useApp } from '../context/AppContext';
import { getTodayDateString, formatCurrency } from '../utils/formatters';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Quote, 'id' | 'code' | 'createdAt'>) => void;
  quoteToEdit?: Quote | null;
  defaultCustomerId?: string;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  quoteToEdit,
  defaultCustomerId,
}) => {
  const { customers } = useApp();

  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [validDays, setValidDays] = useState('15');
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState<QuoteStatus>('aberto');
  const [paymentTerms, setPaymentTerms] = useState('À vista via Pix ou Boleto 30 dias');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: 'item-' + Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0,
    },
  ]);

  // Calculate validity date when date or validDays change
  useEffect(() => {
    if (date && validDays) {
      const d = new Date(date + 'T00:00:00');
      d.setDate(d.getDate() + parseInt(validDays || '15', 10));
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setValidUntil(`${year}-${month}-${day}`);
    }
  }, [date, validDays]);

  useEffect(() => {
    if (quoteToEdit) {
      setCustomerId(quoteToEdit.customerId);
      setDate(quoteToEdit.date);
      setValidUntil(quoteToEdit.validUntil);
      setStatus(quoteToEdit.status);
      setPaymentTerms(quoteToEdit.paymentTerms);
      setNotes(quoteToEdit.notes || '');
      setItems(quoteToEdit.items);
    } else {
      setCustomerId(defaultCustomerId || (customers.length > 0 ? customers[0].id : ''));
      setDate(getTodayDateString());
      setStatus('aberto');
      setPaymentTerms('À vista via Pix ou Boleto 30 dias');
      setNotes('Orçamento sujeito a confirmação de disponibilidade de estoque/agenda.');
      setItems([
        {
          id: 'item-' + Date.now(),
          description: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          total: 0,
        },
      ]);
    }
  }, [quoteToEdit, defaultCustomerId, isOpen, customers]);

  if (!isOpen) return null;

  // Item modifications
  const handleItemChange = (
    index: number,
    field: 'description' | 'quantity' | 'unitPrice' | 'discount',
    value: string | number
  ) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'description') {
      item.description = String(value);
    } else if (field === 'quantity') {
      item.quantity = Math.max(1, Number(value) || 1);
    } else if (field === 'unitPrice') {
      item.unitPrice = Math.max(0, Number(value) || 0);
    } else if (field === 'discount') {
      item.discount = Math.max(0, Number(value) || 0);
    }

    item.total = Math.max(0, item.quantity * item.unitPrice - item.discount);
    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: 'item-' + Date.now() + Math.random(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
  const totalDiscount = items.reduce((acc, it) => acc + (it.discount || 0), 0);
  const total = Math.max(0, subtotal - totalDiscount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert('Por favor, selecione um cliente.');
      return;
    }

    const validItems = items.filter(it => it.description.trim().length > 0);
    if (validItems.length === 0) {
      alert('Por favor, adicione pelo menos um item com descrição no orçamento.');
      return;
    }

    const selectedCustomer = customers.find(c => c.id === customerId);

    onSave({
      customerId,
      customerName: selectedCustomer ? selectedCustomer.name : 'Cliente Avulso',
      date,
      validUntil,
      items: validItems,
      subtotal,
      discount: totalDiscount,
      total,
      paymentTerms,
      notes,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {quoteToEdit ? `Editar Orçamento ${quoteToEdit.code}` : 'Novo Orçamento Comercial'}
              </h3>
              <p className="text-xs text-slate-400">
                Preencha os dados do cliente, itens e condições de pagamento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Top Config: Customer & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cliente <span className="text-rose-500">*</span>
              </label>
              {customers.length === 0 ? (
                <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">
                  Nenhum cliente cadastrado. Cadastre um cliente primeiro na aba "Clientes".
                </div>
              ) : (
                <select
                  required
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Selecione o Cliente...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.document ? `(${c.document})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status do Orçamento
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as QuoteStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="aberto">Em Aberto</option>
                <option value="aprovado">Aprovado</option>
                <option value="rascunho">Rascunho</option>
                <option value="convertido">Convertido em Venda</option>
                <option value="recusado">Recusado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data de Emissão
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Validade da Proposta (Dias)
              </label>
              <select
                value={validDays}
                onChange={e => setValidDays(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="5">5 dias</option>
                <option value="10">10 dias</option>
                <option value="15">15 dias</option>
                <option value="30">30 dias</option>
                <option value="60">60 dias</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Válido até
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Itens do Orçamento (Produtos ou Serviços)
              </h4>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                      Descrição do Produto/Serviço #{index + 1}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Peça X, Mão de Obra, Instalação..."
                      value={item.description}
                      onChange={e => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-center focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                      Preço Unit. (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={e => handleItemChange(index, 'unitPrice', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-right focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                      Desconto (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.discount}
                      onChange={e => handleItemChange(index, 'discount', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-right focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-1 flex items-center justify-end sm:justify-center pt-2 sm:pt-4">
                    <button
                      type="button"
                      disabled={items.length <= 1}
                      onClick={() => removeItem(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 disabled:opacity-30 rounded-lg hover:bg-slate-200 transition-colors"
                      title="Remover este item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="sm:col-span-12 text-right text-xs font-semibold text-slate-700 pr-2">
                    Subtotal do Item: <span className="text-emerald-700">{formatCurrency(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-slate-300 space-y-0.5 text-center sm:text-left">
              <div>Subtotal bruto: <span className="font-semibold text-white">{formatCurrency(subtotal)}</span></div>
              <div>Desconto concedido: <span className="font-semibold text-emerald-400">-{formatCurrency(totalDiscount)}</span></div>
            </div>
            <div className="text-center sm:text-right">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                Valor Total do Orçamento
              </span>
              <span className="text-2xl font-black text-emerald-400">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Payment & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Condições de Pagamento
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                placeholder="Ex: 50% entrada + 50% em 30 dias via Pix"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações / Detalhes de Entrega / Garantia
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Prazo de entrega de 5 dias úteis. Garantia de 90 dias."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {quoteToEdit ? 'Atualizar Orçamento' : 'Salvar Orçamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
