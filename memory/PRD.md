# Gestao TJ - PRD (Product Requirements Document)

## Original Problem Statement
Sistema de controle de estoque com integracao com sistema de vendas, leitura de notas e contabilizacao completa. Login, gerenciador de usuarios, menu de opcoes, visoes baseadas em acessos (dev, master, usuarios). Controle de historico e auditoria.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI + Recharts + Framer Motion
- **Backend**: FastAPI + Motor (MongoDB async) + JWT Auth
- **Database**: MongoDB (gestao_tj_db)
- **AI/OCR**: OpenAI GPT-4o via Emergent LLM Key
- **Email**: SendGrid (prepared, needs API key)
- **Reports**: ReportLab (PDF) + OpenPyXL (Excel)
- **XML Parsing**: lxml (NFe XML native parser)
- **Design**: Swiss High-Contrast Light Theme (Outfit + IBM Plex Sans + JetBrains Mono)

## What's Been Implemented (April 15, 2026)
### Phase 1 - MVP
- Login, Dashboard, Products CRUD, Warehouses CRUD, Suppliers CRUD
- Inventory control, Sales (PDV), Invoices (manual + OCR)
- Financial Reports (DRE), Audit logs, User management
- Alert configs (internal, email, mobile), Notification center

### Phase 2 - Feature Expansion
- **PDF/XML Upload**: Native XML parsing for NFe + GPT-4o for PDF documents
- **Email Alerts (SendGrid)**: Fully integrated, templates built, needs API key
- **Cash Flow Report**: Entradas (vendas) vs Saidas (NFs), saldo do periodo
- **Export PDF/Excel**: DRE + Fluxo de Caixa in both formats
- **Orders/Quotes**: Full CRUD with pedidos/orcamentos, status management, convert-to-sale flow
- **SMS Alerts**: Simulated (logged to DB)

## Prioritized Backlog
### P1 (Next)
- [ ] Add SendGrid API key for real email delivery
- [ ] Barcode scanner for PDV
- [ ] Customer management module

### P2 (Medium)
- [ ] Advanced inventory reports (ABC curve, turnover)
- [ ] Multi-period financial comparison
- [ ] Dashboard charts and trends
- [ ] Mobile responsive optimization

### P3 (Low)
- [ ] Dark mode toggle
- [ ] Data import/export (CSV bulk)
- [ ] Multi-language support
- [ ] Real SMS integration (Twilio)
