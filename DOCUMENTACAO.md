# Gestao TJ - Documentacao Tecnica

## Visao Geral
Sistema completo de controle de estoque com leitura automatica de notas fiscais, controle de depositos com setores, relatorios avancados e auditoria completa.

## Arquitetura
```
Frontend (React 19)  -->  Backend (FastAPI)  -->  MongoDB
       |                        |
   Tailwind CSS           Motor (async)
   Shadcn UI              JWT Auth
   Recharts               GPT-4o OCR
                          SendGrid Email
                          ReportLab PDF
                          OpenPyXL Excel
```

## Estrutura de Pastas
```
/app
├── backend/
│   ├── server.py          # API principal FastAPI
│   ├── models.py          # Modelos Pydantic
│   ├── auth.py            # Autenticacao JWT + bcrypt
│   ├── audit.py           # Logger de auditoria
│   ├── email_service.py   # Servico de email SendGrid
│   ├── report_export.py   # Geracao de PDF e Excel
│   ├── nfe_parser.py      # Parser XML de NFe
│   ├── requirements.txt   # Dependencias Python
│   └── .env               # Variaveis de ambiente
├── frontend/
│   ├── src/
│   │   ├── App.js         # Rotas principais
│   │   ├── api.js         # Cliente API
│   │   ├── components/    # Componentes React
│   │   │   ├── LoginPage.js
│   │   │   ├── DashboardLayout.js
│   │   │   ├── DashboardHome.js
│   │   │   ├── ProductsPage.js
│   │   │   ├── WarehousesPage.js
│   │   │   ├── InventoryPage.js
│   │   │   ├── SuppliersPage.js
│   │   │   ├── InvoicesPage.js
│   │   │   ├── ReportsPage.js
│   │   │   ├── AuditPage.js
│   │   │   ├── UsersPage.js
│   │   │   ├── AlertsPage.js
│   │   │   └── GuidePage.js
│   │   └── components/ui/  # Componentes Shadcn
│   ├── .env
│   └── package.json
└── memory/
    └── PRD.md
```

## Endpoints da API

### Autenticacao
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registrar usuario (requer dev/master)
- `GET /api/auth/me` - Usuario atual
- `POST /api/seed` - Popular banco com usuarios iniciais

### Usuarios
- `GET /api/users` - Listar usuarios
- `PATCH /api/users/:id` - Atualizar usuario
- `DELETE /api/users/:id` - Excluir usuario

### Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `PATCH /api/products/:id` - Editar produto
- `DELETE /api/products/:id` - Excluir produto
- `POST /api/products/:id/transfer` - Transferir para deposito

### Depositos
- `GET /api/warehouses` - Listar depositos
- `POST /api/warehouses` - Criar deposito (com setores)
- `PATCH /api/warehouses/:id` - Editar deposito
- `DELETE /api/warehouses/:id` - Excluir deposito

### Estoque
- `GET /api/inventory` - Listar estoque
- `POST /api/inventory/adjust` - Ajustar quantidade

### Fornecedores
- `GET /api/suppliers` - Listar
- `POST /api/suppliers` - Criar
- `PATCH /api/suppliers/:id` - Editar
- `DELETE /api/suppliers/:id` - Excluir

### Notas Fiscais
- `GET /api/invoices` - Listar notas
- `POST /api/invoices` - Criar nota
- `POST /api/invoices/upload` - Upload PDF/XML
- `POST /api/invoices/ocr` - OCR de imagem
- `POST /api/invoices/:id/process-items` - Processar itens para estoque

### Relatorios
- `GET /api/reports/financial` - DRE
- `GET /api/reports/abc-curve` - Curva ABC
- `GET /api/reports/inventory-turnover` - Giro de Estoque
- `GET /api/reports/export/pdf` - Exportar PDF
- `GET /api/reports/export/excel` - Exportar Excel

### Alertas e Notificacoes
- `GET /api/alerts/config` - Configuracoes de alerta
- `POST /api/alerts/config` - Criar configuracao
- `PATCH /api/alerts/config/:id` - Editar configuracao
- `DELETE /api/alerts/config/:id` - Excluir configuracao
- `GET /api/notifications` - Listar notificacoes
- `GET /api/notifications/unread-count` - Contagem de nao lidas
- `PATCH /api/notifications/:id/read` - Marcar como lida
- `POST /api/notifications/read-all` - Marcar todas como lidas

### Auditoria
- `GET /api/audit` - Listar logs
- `GET /api/audit/export` - Exportar Excel

### Dashboard
- `GET /api/dashboard/stats` - Estatisticas
- `GET /api/dashboard/alerts` - Alertas de estoque

## Niveis de Acesso
| Funcionalidade | Dev | Master | Usuario |
|---|---|---|---|
| Dashboard | Sim | Sim | Sim |
| Produtos | Sim | Sim | Sim |
| Depositos | Sim | Sim | Sim |
| Estoque | Sim | Sim | Sim |
| Fornecedores | Sim | Sim | Sim |
| Notas Fiscais | Sim | Sim | Sim |
| Relatorios | Sim | Sim | Nao |
| Alertas | Sim | Sim | Sim |
| Auditoria | Sim | Sim | Nao |
| Usuarios | Sim | Sim | Nao |
| Guia | Sim | Sim | Sim |

## Variaveis de Ambiente

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=gestao_tj_db
JWT_SECRET=sua_chave_secreta_segura
EMERGENT_LLM_KEY=sua_chave_llm
CORS_ORIGINS=*
SENDGRID_API_KEY=sua_chave_sendgrid
SENDER_EMAIL=alertas@seudominio.com
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://seu-dominio.com
```

## Execucao Local

### Pre-requisitos
- Python 3.11+
- Node.js 18+
- MongoDB 6+
- yarn

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Configurar .env
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd frontend
yarn install
# Configurar .env com REACT_APP_BACKEND_URL=http://localhost:8001
yarn start
```

## Integracao Cloudflare
O sistema pode ser implantado atras do Cloudflare como proxy reverso:
1. Apontar o dominio para o servidor via DNS da Cloudflare
2. Configurar SSL/TLS como "Full (strict)"
3. Backend roda na porta 8001, frontend na 3000
4. Nginx como proxy reverso: rotas /api/* para backend:8001, demais para frontend:3000
