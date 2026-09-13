import React, { useState, useRef } from 'react';
import {
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  X,
  CheckCircle2,
  Building2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LocalDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalDataModal: React.FC<LocalDataModalProps> = ({ isOpen, onClose }) => {
  const {
    customers,
    quotes,
    financialRecords,
    companyInfo,
    updateCompanyInfo,
    exportBackupData,
    importBackupData,
    resetAllData,
    clearAllData,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSubTab, setActiveSubTab] = useState<'backup' | 'empresa'>('backup');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Editable company state
  const [companyForm, setCompanyForm] = useState(companyInfo);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        const success = importBackupData(parsed);
        if (success) {
          setImportStatus('Backup restaurado com sucesso!');
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus('Erro: O arquivo de backup selecionado é inválido.');
        }
      } catch (err) {
        setImportStatus('Erro ao ler o arquivo JSON selecionado.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyInfo(companyForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Armazenamento Local & Dados da Empresa
              </h2>
              <p className="text-xs text-slate-400">
                100% Offline • Sem dependência de nuvem ou internet
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2">
          <button
            onClick={() => setActiveSubTab('backup')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'backup'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Backup & Banco Local</span>
          </button>
          <button
            onClick={() => setActiveSubTab('empresa')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'empresa'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Dados da Sua Empresa</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {activeSubTab === 'backup' && (
            <div className="space-y-6">
              {/* Security & Offline Notice */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-emerald-900">
                    Operação Totalmente Segura e Local
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    Nenhum dado é enviado para servidores na nuvem. Todos os seus clientes, orçamentos e financeiro ficam gravados diretamente no seu dispositivo. Você pode exportar backups em arquivo JSON a qualquer momento para levar para outro computador ou guardar com segurança.
                  </p>
                </div>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                    Clientes
                  </span>
                  <span className="text-lg font-black text-slate-900">{customers.length}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                    Orçamentos
                  </span>
                  <span className="text-lg font-black text-slate-900">{quotes.length}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                    Lançamentos Fin.
                  </span>
                  <span className="text-lg font-black text-slate-900">{financialRecords.length}</span>
                </div>
              </div>

              {importStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    importStatus.includes('sucesso')
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{importStatus}</span>
                </div>
              )}

              {/* Export & Import actions */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Ações de Cópia de Segurança (Backup)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Export */}
                  <button
                    onClick={exportBackupData}
                    className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-start gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">Exportar Backup (.json)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Baixe um arquivo seguro com todos os seus dados para o seu computador.
                      </p>
                    </div>
                  </button>

                  {/* Import */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-start gap-3 transition-colors cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">Restaurar Backup (.json)</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Selecione um arquivo de backup salvo anteriormente para restaurar os dados.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Reset / Clean slate actions */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Gerenciamento de Dados
                </h3>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      clearAllData();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Limpar Tudo (Iniciar Banco Zerado)</span>
                  </button>

                  <button
                    onClick={() => {
                      resetAllData();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Carregar Dados de Exemplo</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'empresa' && (
            <form onSubmit={handleSaveCompany} className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Estes dados serão impressos automaticamente no cabeçalho das <strong>Propostas Comerciais</strong> e dos <strong>Relatórios de Vendas</strong>:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Fantasia
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.commercialName}
                    onChange={e => setCompanyForm({ ...companyForm, commercialName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Razão Social
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.name}
                    onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CNPJ / CPF
                  </label>
                  <input
                    type="text"
                    value={companyForm.cnpj}
                    onChange={e => setCompanyForm({ ...companyForm, cnpj: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={companyForm.phone}
                    onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail Comercial
                  </label>
                  <input
                    type="email"
                    value={companyForm.email}
                    onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cidade / UF
                  </label>
                  <input
                    type="text"
                    value={companyForm.cityState}
                    onChange={e => setCompanyForm({ ...companyForm, cityState: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={companyForm.address}
                    onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                {saveSuccess ? (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Dados da empresa salvos localmente!
                  </span>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
