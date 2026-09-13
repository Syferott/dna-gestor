@echo off
title Gestao Comercial e Financeira - ERP Local
echo ========================================================
echo   GESTAO COMERCIAL & FINANCEIRA - SISTEMA LOCAL
echo ========================================================
echo.
echo Verificando instalacao de dependencias...

IF NOT EXIST "node_modules" (
    echo Primeira execucao detectada! Instalando dependencias locais...
    call npm install
    echo.
)

echo Construindo arquivos locais de producao (Vite PWA)...
call npm run build

echo.
echo ========================================================
echo   SISTEMA INICIADO COM SUCESSO!
echo   Acesse no seu navegador: http://localhost:3000
echo   (Nao feche esta janela enquanto estiver usando)
echo ========================================================
echo.

start http://localhost:3000
call npm run preview -- --port 3000 --host 0.0.0.0

pause
