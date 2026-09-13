#!/bin/bash
echo "========================================================"
echo "  GESTAO COMERCIAL & FINANCEIRA - SISTEMA LOCAL"
echo "========================================================"
echo ""

if [ ! -d "node_modules" ]; then
    echo "Primeira execução detectada! Instalando dependências..."
    npm install
    echo ""
fi

echo "Compilando arquivos locais de produção..."
npm run build

echo ""
echo "========================================================"
echo "  SISTEMA INICIADO COM SUCESSO!"
echo "  Acesse no seu navegador: http://localhost:3000"
echo "========================================================"
echo ""

# Tenta abrir o navegador automaticamente
if which xdg-open > /dev/null; then
    xdg-open "http://localhost:3000" &
elif which open > /dev/null; then
    open "http://localhost:3000" &
fi

npm run preview -- --port 3000 --host 0.0.0.0
