import React, { useState } from 'react';
import { Download, Monitor, CheckCircle, X, HelpCircle, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'banner' | 'settings' }> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);

  // If already installed as native standalone app, show a discreet status badge or nothing
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <CheckCircle className="w-4 h-4" />
          <span>Aplicativo Instalado no Computador</span>
        </div>
      );
    }
    return null;
  }

  // Chromium / Edge / Windows / Mac Desktop or Android flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        title="Instalar no computador para usar offline como programa"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App Local</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium border border-slate-700 transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Instalar no Celular</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  Instalar no iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>Para usar o programa direto na tela de início sem precisar de internet:</p>
                <ol className="list-decimal list-inside space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <li>
                    Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) na barra do Safari.
                  </li>
                  <li>
                    Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.
                  </li>
                  <li>
                    Toque em <strong>Adicionar</strong> no canto superior direito.
                  </li>
                </ol>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback info button for desktop browsers that don't trigger beforeinstallprompt directly in iframe
  return (
    <>
      <button
        onClick={() => setShowDesktopGuide(true)}
        title="Como rodar localmente sem internet"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
      >
        <Monitor className="w-3.5 h-3.5 text-emerald-400" />
        <span>Uso Offline / Local</span>
      </button>

      {showDesktopGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Execução 100% Local & Offline
                  </h3>
                  <p className="text-xs text-slate-500">Sem dependência de servidores ou internet</p>
                </div>
              </div>
              <button
                onClick={() => setShowDesktopGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-600">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <p className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Seus dados já estão salvos localmente
                </p>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Todas as alterações em clientes, orçamentos e financeiro são salvas diretamente no armazenamento local (LocalStorage) do seu navegador.
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-800">
                  Como instalar como programa de computador:
                </p>
                <ul className="space-y-1.5 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">1.</span>
                    <span>No Google Chrome ou Edge, clique no ícone de <strong>Instalar</strong> na barra de endereços (à direita da URL).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">2.</span>
                    <span>O sistema abrirá como um aplicativo desktop independente na sua área de trabalho.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">3.</span>
                    <span>Mesmo se você desligar o Wi-Fi ou desconectar o cabo de rede, ele abrirá e funcionará perfeitamente.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100">
                <p className="font-semibold text-slate-800">
                  Como rodar em sua própria máquina via terminal:
                </p>
                <p className="text-[11px] text-slate-500">
                  Você também pode baixar os arquivos via menu de exportação, e no terminal do seu computador executar:
                </p>
                <div className="bg-slate-900 text-emerald-400 font-mono p-2.5 rounded-lg text-[11px]">
                  npm install<br />
                  npm run build<br />
                  npm run preview
                </div>
                <p className="text-[11px] text-slate-500">
                  O sistema roda localmente em <code>http://localhost:3000</code> totalmente offline.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDesktopGuide(false)}
              className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
