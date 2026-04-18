# Gestao TJ - Como Rodar Localmente

## 1. Pre-requisitos
- Python 3.11+ (python.org)
- Node.js 18+ (nodejs.org)
- Yarn: `npm install -g yarn`
- MongoDB (escolha uma opcao abaixo)

## 2. Banco de Dados - MongoDB Atlas (Gratuito)
O jeito mais facil e usar o MongoDB Atlas, que e gratuito:

1. Acesse https://cloud.mongodb.com e crie uma conta
2. Clique em "Build a Database" > "FREE" (M0 Sandbox)
3. Escolha o provedor (AWS/GCP/Azure) e regiao mais proxima
4. Clique "Create Cluster"
5. Em "Database Access", crie um usuario com senha
6. Em "Network Access", clique "Allow Access from Anywhere" (0.0.0.0/0)
7. Volte em "Database", clique "Connect" > "Drivers"
8. Copie a URL de conexao (algo como: mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net)

## 3. Configurar o Backend
```bash
cd backend
python -m venv venv

# Ativar ambiente virtual:
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
```

Crie o arquivo `backend/.env`:
```
MONGO_URL=mongodb+srv://SEU_USUARIO:SUA_SENHA@cluster0.xxxxx.mongodb.net
DB_NAME=gestao_tj_db
JWT_SECRET=coloque_uma_chave_secreta_longa_aqui_com_32_chars
CORS_ORIGINS=http://localhost:3000
EMERGENT_LLM_KEY=sua_chave_openai_para_ocr
```

Iniciar o backend:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

## 4. Configurar o Frontend
```bash
cd frontend
yarn install
```

Crie o arquivo `frontend/.env`:
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

Iniciar o frontend:
```bash
yarn start
```

## 5. Acessar o Sistema
Abra http://localhost:3000 no navegador.

Credenciais iniciais (criadas automaticamente):
- admin@gestaotj.com / Admin@123456 (Desenvolvedor)
- gerente@gestaotj.com / Gerente@123 (Gerente)
- usuario@gestaotj.com / Usuario@123 (Operacional)

## 6. Estrutura de Pastas
```
backend/
  server.py          - API principal
  models.py          - Modelos de dados
  auth.py            - Autenticacao
  audit.py           - Logs de auditoria
  email_service.py   - Envio de emails (SendGrid)
  report_export.py   - Exportacao PDF/Excel
  nfe_parser.py      - Leitor de XML (NFe)
  .env               - Variaveis de ambiente

frontend/
  src/App.js         - Rotas
  src/api.js         - Conexao com backend
  src/components/    - Paginas do sistema
  .env               - URL do backend
```

## 7. Opcional - Email (SendGrid)
Para receber alertas por email:
1. Crie conta em sendgrid.com
2. Gere uma API Key em Settings > API Keys
3. Verifique um email remetente em Settings > Sender Authentication
4. Adicione no backend/.env:
```
SENDGRID_API_KEY=sua_chave
SENDER_EMAIL=alertas@seudominio.com
```
