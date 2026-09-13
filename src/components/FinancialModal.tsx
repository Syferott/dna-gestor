import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, User, Check, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { FinancialRecord, FinancialType, FinancialStatus } from '../types';
import { getTodayDateString } from '../utils/formatters';
import { useApp } from '../context/AppContext';

interface FinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<FinancialRecord, 'id' | 'createdAt'>) => void;
  recordToEdit?: FinancialRecord | null;
  defaultType?: FinancialType;
}

const COMMON_CATEGORIES = {
  receber: [
    'Vendas de Produtos',
    'Prestação de Serviços',
    'Contrato Mensal',
    'Consultoria',
    'Rendimentos',
    'Outras Receitas',
  ],
  pagar: [
    'Fornecedores de Mercadorias',
    'Aluguel e Condomínio',
    'Salários e Pró-labore',
    'Energia e Água',
    'Internet e Telefonia',
    'Contabilidade e Jurídico',
    'Impostos e Tributos',
    'Marketing e Anúncios',
    'Outras Despesas',
  ],
};

export const FinancialModal: React.FC<FinancialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  recordToEdit,
  defaultType = 'receber',
}) => {
  const { customers } = useApp();

  const [type, setType] = useState<FinancialType>(defaultType);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [paymentDate, setPaymentDate] = useState('');
  const [status, setStatus] = useState<FinancialStatus>('pendente');
  const [entityName, setEntityName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (recordToEdit) {
      setType(recordToEdit.type);
      setDescription(recordToEdit.description);
      setCategory(recordToEdit.category);
      setAmount(String(recordToEdit.amount));
      setDueDate(recordToEdit.dueDate);
      setPaymentDate(recordToEdit.paymentDate || '');
      setStatus(recordToEdit.status);
      setEntityName(recordToEdit.entityName);
      setPaymentMethod(recordToEdit.paymentMethod || 'Pix');
      setNotes(recordToEdit.notes || '');
    } else {
      setType(defaultType);
      setDescription('');
      setCategory(COMMON_CATEGORIES[defaultType][0]);
      setAmount('');
      setDueDate(getTodayDateString());
      setPaymentDate('');
      setStatus('pendente');
      setEntityName('');
      setPaymentMethod('Pix');
      setNotes('');
    }
  }, [recordToEdit, defaultType, isOpen]);

  // When type changes, adjust default category
  const handleTypeChange = (newType: FinancialType) => {
    setType(newType);
    if (!category || COMMON_CATEGORIES[type].includes(category)) {
      setCategory(COMMON_CATEGORIES[newType][0]);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor, informe um valor financeiro válido maior que zero.');
      return;
    }
    if (!description.trim()) {
      alert('Por favor, informe a descrição do lançamento.');
      return;
    }

    onSave({
      type,
      description: description.trim(),
      category: category.trim() || 'Geral',
      amount: parsedAmount,
      dueDate,
      paymentDate: status === 'pago' ? (paymentDate || dueDate) : undefined,
      status,
      entityName: entityName.trim() || (type === 'receber' ? 'Cliente Diverso' : 'Fornecedor Diverso'),
      paymentMethod,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                type === 'receber' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {type === 'receber' ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {recordToEdit
                  ? `Editar ${recordToEdit.type === 'receber' ? 'Conta a Receber' : 'Conta a Pagar'}`
                  : `Novo Lançamento Financeiro`}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Type Selector (A Receber / A Pagar) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipo de Operação
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('receber')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  type === 'receber'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/30'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span>Conta a Receber (+)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('pagar')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  type === 'pagar'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/30'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
                <span>Conta a Pagar (-)</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição do Lançamento <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={
                type === 'receber'
                  ? 'Ex: Venda de mercadorias, Contrato de serviços...'
                  : 'Ex: Aluguel mensal, Pagamento de fornecedor...'
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Entity Name (Cliente ou Fornecedor) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>{type === 'receber' ? 'Cliente / Pagador' : 'Fornecedor / Beneficiário'}</span>
              {type === 'receber' && customers.length > 0 && (
                <span className="text-[11px] text-slate-500 font-normal">
                  (ou escolha na lista abaixo)
                </span>
              )}
            </label>
            <div className="space-y-1.5">
              <input
                type="text"
                value={entityName}
                onChange={e => setEntityName(e.target.value)}
                placeholder={type === 'receber' ? 'Nome do Cliente' : 'Nome do Fornecedor / Empresa'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              {type === 'receber' && customers.length > 0 && (
                <select
                  onChange={e => {
                    if (e.target.value) setEntityName(e.target.value);
                  }}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-600"
                >
                  <option value="">Preencher com cliente cadastrado...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Amount & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Valor (R$) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data de Vencimento <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Categoria
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {COMMON_CATEGORIES[type].map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Pix">Pix</option>
                <option value="Boleto Bancário">Boleto Bancário</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Transferência Bancária">Transferência / TED</option>
                <option value="Dinheiro">Dinheiro em Espécie</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          {/* Status and Payment Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Situação / Status
              </label>
              <select
                value={status}
                onChange={e => {
                  const s = e.target.value as FinancialStatus;
                  setStatus(s);
                  if (s === 'pago' && !paymentDate) {
                    setPaymentDate(getTodayDateString());
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="pendente">Pendente</option>
                <option value="pago">{type === 'receber' ? 'Recebido / Liquidado' : 'Pago / Quitado'}</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>

            {status === 'pago' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Liquidação
                </label>
                <input
                  type="date"
                  value={paymentDate || dueDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Número de nota fiscal, comprovante, detalhes..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Action Buttons */}
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
              className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors cursor-pointer ${
                type === 'receber'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <Check className="w-4 h-4" />
              {recordToEdit ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
