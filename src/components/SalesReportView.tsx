import React, { useState } from 'react';
import {
  BarChart3,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Users,
  Award,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Quote } from '../types';
import { PrintSalesReportModal } from './PrintSalesReportModal';
import { formatCurrency, formatDate } from '../utils/formatters';

export const SalesReportView: React.FC = () => {
  const { quotes, customers, setViewQuoteForPrint } = useApp();

  const [period, setPeriod] = useState<'mes' | 'todos' | 'hoje' | '7dias'>('todos');
  const [customerFilter, setCustomerFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('vendas_e_aprovados'); // vendas_e_aprovados | apenas_convertidos | todos
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Filter quotes based on selection
  const filteredSales = quotes.filter(q => {
    // Status filter
    if (statusFilter === 'vendas_e_aprovados') {
      if (q.status !== 'convertido' && q.status !== 'aprovado') return false;
    } else if (statusFilter === 'apenas_convertidos') {
      if (q.status !== 'convertido') return false;
    }

    // Customer filter
    if (customerFilter !== 'todos' && q.customerId !== customerFilter) {
      return false;
    }

    // Date/Period filter
    if (period === 'todos') return true;

    const today = new Date();
    const quoteDate = new Date(q.date + 'T00:00:00');

    if (period === 'hoje') {
      return quoteDate.toDateString() === today.toDateString();
    }

    if (period === '7dias') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      return quoteDate >= sevenDaysAgo && quoteDate <= today;
    }

    if (period === 'mes') {
      return (
        quoteDate.getMonth() === today.getMonth() &&
        quoteDate.getFullYear() === today.getFullYear()
      );
    }

    return true;
  });

  // Calculate Metrics
  const totalRevenue = filteredSales.reduce((acc, q) => acc + q.total, 0);
  const totalSalesCount = filteredSales.length;
  const averageTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

  // Breakdown by Customer
  const customerSalesMap: { [name: string]: { total: number; count: number } } = {};
  filteredSales.forEach(q => {
    if (!customerSalesMap[q.customerName]) {
      customerSalesMap[q.customerName] = { total: 0, count: 0 };
    }
    customerSalesMap[q.customerName].total += q.total;
    customerSalesMap[q.customerName].count += 1;
  });

  const topCustomers = Object.entries(customerSalesMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total);

  // Breakdown by Item / Services
  const itemMap: { [desc: string]: { qty: number; total: number } } = {};
  filteredSales.forEach(q => {
    q.items.forEach(it => {
      if (!itemMap[it.description]) {
        itemMap[it.description] = { qty: 0, total: 0 };
      }
      itemMap[it.description].qty += it.quantity;
      itemMap[it.description].total += it.total;
    });
  });

  const topItems = Object.entries(itemMap)
    .map(([description, data]) => ({ description, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const getPeriodLabel = () => {
    switch (period) {
      case 'hoje':
        return 'Vendas de Hoje';
      case '7dias':
        return 'Últimos 7 Dias';
      case 'mes':
        return 'Mês Atual';
      case 'todos':
      default:
        return 'Todo o Período Histórico';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Print Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Relatório Gerencial de Vendas
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Demonstrativo de faturamento comercial, ticket médio, clientes mais ativos e emissão para impressão.
          </p>
        </div>

        <button
          onClick={() => setIsPrintModalOpen(true)}
          disabled={filteredSales.length === 0}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Relatório de Vendas</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Period Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Período das Vendas
          </label>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="todos">Todo o Período</option>
            <option value="hoje">Hoje</option>
            <option value="7dias">Últimos 7 dias</option>
            <option value="mes">Mês Atual</option>
          </select>
        </div>

        {/* Customer Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            Filtrar por Cliente
          </label>
          <select
            value={customerFilter}
            onChange={e => setCustomerFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="todos">Todos os Clientes</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Status das Vendas
          </label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="vendas_e_aprovados">Vendas Fechadas e Aprovadas</option>
            <option value="apenas_convertidos">Apenas Vendas Convertidas</option>
            <option value="todos">Todos os Orçamentos</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Faturamento Total
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              {getPeriodLabel()}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Quantidade de Vendas
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {totalSalesCount} {totalSalesCount === 1 ? 'venda' : 'vendas'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Propostas comerciais faturadas
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ticket Médio por Venda
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {formatCurrency(averageTicket)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Média faturada por cliente
            </p>
          </div>
        </div>
      </div>

      {/* Two-Column Analytics: Top Clientes & Top Produtos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Clientes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Top Clientes em Faturamento
          </h3>
          {topCustomers.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Nenhum dado no período.</p>
          ) : (
            <div className="space-y-3">
              {topCustomers.map((c, i) => {
                const percentage = totalRevenue > 0 ? (c.total / totalRevenue) * 100 : 0;
                return (
                  <div key={c.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-800">
                        {i + 1}. {c.name} ({c.count} {c.count === 1 ? 'venda' : 'vendas'})
                      </span>
                      <span className="font-bold text-slate-900">{formatCurrency(c.total)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Itens / Serviços */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-600" />
            Produtos e Serviços Mais Vendidos
          </h3>
          {topItems.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Nenhum dado no período.</p>
          ) : (
            <div className="space-y-2.5">
              {topItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs"
                >
                  <div className="max-w-[70%]">
                    <p className="font-semibold text-slate-800 truncate">{item.description}</p>
                    <p className="text-[11px] text-slate-500">{item.qty} unidades comercializadas</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analytical Table of Sales */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900">
            Listagem Analítica das Vendas ({filteredSales.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {getPeriodLabel()}
          </span>
        </div>

        {filteredSales.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            Nenhuma venda localizada com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Código</th>
                  <th className="py-2.5 px-4">Data</th>
                  <th className="py-2.5 px-4">Cliente</th>
                  <th className="py-2.5 px-4">Itens</th>
                  <th className="py-2.5 px-4">Pagamento</th>
                  <th className="py-2.5 px-4 text-right">Valor Total</th>
                  <th className="py-2.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{q.code}</td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(q.date)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{q.customerName}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {q.items.map(it => `${it.quantity}x ${it.description}`).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{q.paymentTerms || '-'}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(q.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setViewQuoteForPrint(q)}
                        title="Visualizar e Imprimir Proposta Individual"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print Sales Report Modal */}
      <PrintSalesReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        filteredQuotes={filteredSales}
        periodLabel={getPeriodLabel()}
        totalRevenue={totalRevenue}
        totalSalesCount={totalSalesCount}
        averageTicket={averageTicket}
      />
    </div>
  );
};
