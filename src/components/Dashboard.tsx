import React from 'react';
import {
  Users,
  FileText,
  DollarSign,
  BarChart3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  HardDrive,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export const Dashboard: React.FC = () => {
  const {
    customers,
    quotes,
    financialRecords,
    setActiveTab,
    setViewQuoteForPrint,
    togglePaymentStatus,
    exportBackupData,
  } = useApp();

  // Calculations
  const activeCustomersCount = customers.length;
  const pendingQuotes = quotes.filter(q => q.status === 'aberto');
  const convertedSales = quotes.filter(q => q.status === 'convertido' || q.status === 'aprovado');
  const totalRevenue = convertedSales.reduce((acc, q) => acc + q.total, 0);

  const pendingReceivables = financialRecords
    .filter(r => r.type === 'receber' && (r.status === 'pendente' || r.status === 'vencido'))
    .reduce((acc, r) => acc + r.amount, 0);

  const pendingPayables = financialRecords
    .filter(r => r.type === 'pagar' && (r.status === 'pendente' || r.status === 'vencido'))
    .reduce((acc, r) => acc + r.amount, 0);

  const upcomingFinancial = [...financialRecords]
    .filter(r => r.status === 'pendente' || r.status === 'vencido')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const recentQuotes = [...quotes].slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Painel de Controle
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              Gestão Comercial & Financeira
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Acompanhe seus clientes, elabore propostas e orçamentos, controle entradas e saídas de caixa e emita relatórios de vendas.
            </p>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('customers')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clientes</span>
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Orçamento</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-teal-400" />
              <span>Imprimir Relatório</span>
            </button>
          </div>
        </div>
      </div>

      {/* Offline & Local Guarantee Strip */}
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-emerald-950 flex items-center gap-1.5">
              <span>Sistema 100% Local e Offline</span>
              <span className="text-[10px] bg-emerald-200/70 text-emerald-800 px-2 py-0.2 rounded-full font-semibold">
                Sem Internet
              </span>
            </p>
            <p className="text-emerald-800 text-[11px] mt-0.5">
              Todos os seus clientes, orçamentos e contas a pagar/receber ficam armazenados no seu computador.
            </p>
          </div>
        </div>

        <button
          onClick={exportBackupData}
          title="Baixar cópia de segurança em arquivo JSON para guardar no seu computador"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-900 rounded-xl font-bold border border-emerald-300 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fazer Backup (.json)</span>
        </button>
      </div>

      {/* Main KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Faturado */}
        <div
          onClick={() => setActiveTab('reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Faturamento Vendas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {convertedSales.length} {convertedSales.length === 1 ? 'venda aprovada' : 'vendas aprovadas'}
          </div>
        </div>

        {/* Orçamentos em Aberto */}
        <div
          onClick={() => setActiveTab('quotes')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Orçamentos em Aberto</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">
            {pendingQuotes.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Totalizando {formatCurrency(pendingQuotes.reduce((acc, q) => acc + q.total, 0))}
          </div>
        </div>

        {/* Contas a Receber Pendentes */}
        <div
          onClick={() => setActiveTab('financial')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>A Receber (Pendente)</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {formatCurrency(pendingReceivables)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Recebimentos programados
          </div>
        </div>

        {/* Contas a Pagar Pendentes */}
        <div
          onClick={() => setActiveTab('financial')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>A Pagar (Pendente)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">
            {formatCurrency(pendingPayables)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Despesas e contas a quitar
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Quotes & Upcoming Financial Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Últimos Orçamentos Cadastrados
            </h3>
            <button
              onClick={() => setActiveTab('quotes')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              Ver todos ({quotes.length}) &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {recentQuotes.map(q => (
              <div
                key={q.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-slate-900">
                      {q.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        q.status === 'convertido'
                          ? 'bg-teal-100 text-teal-800'
                          : q.status === 'aprovado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{q.customerName}</p>
                  <p className="text-[11px] text-slate-500">
                    {q.items.length} {q.items.length === 1 ? 'item' : 'itens'} • Emissão: {formatDate(q.date)}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-sm font-black text-slate-900 block">
                    {formatCurrency(q.total)}
                  </span>
                  <button
                    onClick={() => setViewQuoteForPrint(q)}
                    title="Visualizar e Imprimir Proposta"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md transition-colors cursor-pointer"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Financial Obligations */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Próximos Vencimentos Financeiros
            </h3>
            <button
              onClick={() => setActiveTab('financial')}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold cursor-pointer"
            >
              Ver financeiro completo &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {upcomingFinancial.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Nenhum título pendente de pagamento ou recebimento no momento.
              </p>
            ) : (
              upcomingFinancial.map(rec => {
                const isOverdue = rec.status === 'vencido';
                return (
                  <div
                    key={rec.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {rec.type === 'receber' ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                            <ArrowUpRight className="w-3 h-3" /> Receita
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded">
                            <ArrowDownRight className="w-3 h-3" /> Despesa
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-semibold ${
                            isOverdue ? 'text-rose-600' : 'text-slate-500'
                          }`}
                        >
                          Vencimento: {formatDate(rec.dueDate)} {isOverdue && '(Vencido)'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">{rec.description}</p>
                      <p className="text-[11px] text-slate-500">{rec.entityName}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <span
                        className={`text-sm font-black block ${
                          rec.type === 'receber' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {rec.type === 'receber' ? '+' : '-'} {formatCurrency(rec.amount)}
                      </span>
                      <button
                        onClick={() => togglePaymentStatus(rec.id)}
                        className="text-[11px] font-semibold px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md transition-colors cursor-pointer"
                      >
                        Dar Baixa
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
