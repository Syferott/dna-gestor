import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FinancialRecord, FinancialType, FinancialStatus } from '../types';
import { FinancialModal } from './FinancialModal';
import { formatCurrency, formatDate } from '../utils/formatters';

export const FinancialView: React.FC = () => {
  const {
    financialRecords,
    addFinancialRecord,
    updateFinancialRecord,
    deleteFinancialRecord,
    togglePaymentStatus,
  } = useApp();

  const [typeTab, setTypeTab] = useState<'todos' | 'receber' | 'pagar'>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [modalDefaultType, setModalDefaultType] = useState<FinancialType>('receber');

  // Filtered records
  const filteredRecords = financialRecords.filter(record => {
    const matchesType = typeTab === 'todos' || record.type === typeTab;
    const matchesStatus = statusFilter === 'todos' || record.status === statusFilter;
    const matchesSearch =
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  // Calculate totals
  const totalReceberPendente = financialRecords
    .filter(r => r.type === 'receber' && (r.status === 'pendente' || r.status === 'vencido'))
    .reduce((acc, r) => acc + r.amount, 0);

  const totalReceberPago = financialRecords
    .filter(r => r.type === 'receber' && r.status === 'pago')
    .reduce((acc, r) => acc + r.amount, 0);

  const totalPagarPendente = financialRecords
    .filter(r => r.type === 'pagar' && (r.status === 'pendente' || r.status === 'vencido'))
    .reduce((acc, r) => acc + r.amount, 0);

  const totalPagarPago = financialRecords
    .filter(r => r.type === 'pagar' && r.status === 'pago')
    .reduce((acc, r) => acc + r.amount, 0);

  // Projected Balance (Receivables - Payables)
  const totalReceberGeral = totalReceberPendente + totalReceberPago;
  const totalPagarGeral = totalPagarPendente + totalPagarPago;
  const saldoPrevisto = totalReceberGeral - totalPagarGeral;
  const saldoRealizado = totalReceberPago - totalPagarPago;

  const handleEdit = (record: FinancialRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, desc: string) => {
    if (window.confirm(`Deseja remover o lançamento financeiro "${desc}"?`)) {
      deleteFinancialRecord(id);
    }
  };

  const handleSaveRecord = (data: Omit<FinancialRecord, 'id' | 'createdAt'>) => {
    if (editingRecord) {
      updateFinancialRecord(editingRecord.id, data);
    } else {
      addFinancialRecord(data);
    }
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Contas a Pagar e Receber
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
              {financialRecords.length} lançamentos
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Fluxo de caixa diário, controle de vencimentos, despesas operacionais e recebimentos de clientes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setEditingRecord(null);
              setModalDefaultType('receber');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Conta a Receber</span>
          </button>

          <button
            onClick={() => {
              setEditingRecord(null);
              setModalDefaultType('pagar');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>- Conta a Pagar</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receber Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1 text-emerald-700">
              <ArrowUpRight className="w-4 h-4" /> A Receber (Pendente)
            </span>
            <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px]">Entradas</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {formatCurrency(totalReceberPendente)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Já liquidado: <strong className="text-slate-700">{formatCurrency(totalReceberPago)}</strong>
          </div>
        </div>

        {/* Pagar Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1 text-rose-700">
              <ArrowDownRight className="w-4 h-4" /> A Pagar (Pendente)
            </span>
            <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-[10px]">Saídas</span>
          </div>
          <div className="text-2xl font-black text-rose-600">
            {formatCurrency(totalPagarPendente)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Já liquidado: <strong className="text-slate-700">{formatCurrency(totalPagarPago)}</strong>
          </div>
        </div>

        {/* Saldo Realizado */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Saldo Realizado em Caixa</span>
            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">Efetivo</span>
          </div>
          <div
            className={`text-2xl font-black ${
              saldoRealizado >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            {formatCurrency(saldoRealizado)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Entradas Pagas - Despesas Pagas
          </div>
        </div>

        {/* Saldo Previsto */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Resultado Previsto Total</span>
            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px]">Projeção</span>
          </div>
          <div
            className={`text-2xl font-black ${
              saldoPrevisto >= 0 ? 'text-teal-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(saldoPrevisto)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Considerando todos os pendentes
          </div>
        </div>
      </div>

      {/* Filter and Tab Navigation */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Tabs: Todos / Receber / Pagar */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTypeTab('todos')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                typeTab === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos os Lançamentos
            </button>
            <button
              onClick={() => setTypeTab('receber')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 justify-center ${
                typeTab === 'receber' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              Contas a Receber
            </button>
            <button
              onClick={() => setTypeTab('pagar')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 justify-center ${
                typeTab === 'pagar' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
              Contas a Pagar
            </button>
          </div>

          {/* Status buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'todos', label: 'Todas Situações' },
              { id: 'pendente', label: 'Pendentes' },
              { id: 'pago', label: 'Pagas / Liquidadas' },
              { id: 'vencido', label: 'Vencidas' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === s.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Field */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por descrição, cliente, fornecedor ou categoria..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Financial Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 p-8">
            <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">
              Nenhum lançamento financeiro encontrado
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Nenhum registro corresponde aos filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Descrição / Categoria</th>
                  <th className="py-3 px-4">Cliente / Fornecedor</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map(record => {
                  const isOverdue = record.status === 'vencido';
                  const isPaid = record.status === 'pago';

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Tipo */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {record.type === 'receber' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ArrowUpRight className="w-3.5 h-3.5" /> A Receber
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <ArrowDownRight className="w-3.5 h-3.5" /> A Pagar
                          </span>
                        )}
                      </td>

                      {/* Descrição & Categoria */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{record.description}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                            {record.category}
                          </span>
                          {record.paymentMethod && <span>• {record.paymentMethod}</span>}
                        </div>
                      </td>

                      {/* Entity */}
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {record.entityName}
                      </td>

                      {/* Vencimento */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">{formatDate(record.dueDate)}</div>
                        {isPaid && record.paymentDate && (
                          <div className="text-[10px] text-emerald-600">
                            Baixa em {formatDate(record.paymentDate)}
                          </div>
                        )}
                      </td>

                      {/* Valor */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div
                          className={`text-sm font-bold ${
                            record.type === 'receber' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {record.type === 'receber' ? '+' : '-'} {formatCurrency(record.amount)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" /> Liquidado
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            <AlertCircle className="w-3 h-3" /> Vencido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" /> Pendente
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Toggle Pay / Reopen */}
                          <button
                            onClick={() => togglePaymentStatus(record.id)}
                            title={
                              isPaid
                                ? 'Reabrir lançamento para pendente'
                                : record.type === 'receber'
                                ? 'Confirmar recebimento (Dar baixa)'
                                : 'Confirmar pagamento (Quitar conta)'
                            }
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                              isPaid
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                : record.type === 'receber'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-rose-600 hover:bg-rose-700 text-white'
                            }`}
                          >
                            {isPaid ? 'Reabrir' : 'Dar Baixa'}
                          </button>

                          <button
                            onClick={() => handleEdit(record)}
                            title="Editar lançamento"
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(record.id, record.description)}
                            title="Excluir lançamento"
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Financial Add/Edit Modal */}
      <FinancialModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        recordToEdit={editingRecord}
        defaultType={modalDefaultType}
      />
    </div>
  );
};
