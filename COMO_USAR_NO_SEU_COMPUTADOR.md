# Como Rodar o Sistema Localmente no seu Computador (100% Offline)

Este sistema foi projetado para funcionar sem depender de internet. Seus dados (clientes, orçamentos, financeiro) ficam salvos no seu próprio computador.

---

## Método 1: Instalar como Programa pelo Navegador (Mais Rápido e Simples)

Se você já estiver com o sistema aberto no **Google Chrome** ou **Microsoft Edge**:

1. No canto superior direito da barra de endereço do navegador, clique no ícone de **Instalar Aplicativo** (ícone de computador com uma seta para baixo ou um sinal de `+`).
2. Clique no botão **"Instalar"**.
3. O sistema criará um atalho na sua **Área de Trabalho** e no **Menu Iniciar**.
4. Pronto! Você pode abrir o programa diretamente pelo atalho na Área de Trabalho a qualquer momento, mesmo com o computador sem internet (Wi-Fi desligado).

---

## Método 2: Baixar e Rodar na sua Máquina com Node.js

Se você baixou os arquivos em formato `.zip`:

### Pré-requisito:
- Ter o **Node.js** instalado no seu computador. Se ainda não tiver, baixe gratuitamente no site oficial: [https://nodejs.org/](https://nodejs.org/) (escolha a versão recomendada LTS e faça a instalação padrão "Avançar, Avançar, Concluir").

### No Windows:
1. Extraia o arquivo `.zip` em uma pasta de sua preferência (ex: `C:\Sistemas\GestaoComercial`).
2. Dê **dois cliques** no arquivo `iniciar.bat`.
3. Na primeira vez, ele baixará as bibliotecas automaticamente, compilará o sistema e abrirá seu navegador padrão em `http://localhost:3000`.
4. Nas próximas vezes, basta dar dois cliques em `iniciar.bat` e ele abrirá instantaneamente sem precisar de internet.

### No Linux ou Mac:
1. Abra o Terminal na pasta descompactada.
2. Dê permissão e execute:
   ```bash
   chmod +x iniciar.sh
   ./iniciar.sh
   ```
3. O sistema estará rodando em `http://localhost:3000`.

---

## Dica Importante: Cópia de Segurança (Backup)

- No menu do sistema, clique no botão **"Backup / Banco Local"** ou **"Fazer Backup (.json)"**.
- Isso baixa um arquivo `.json` leve contendo todo o seu histórico.
- Você pode guardar esse arquivo em um pen drive ou nuvem para restaurar a qualquer momento se trocar de computador.
