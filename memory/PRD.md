# Gestao TJ - PRD (Product Requirements Document)

## Original Problem Statement
Sistema de controle de estoque com integracao com sistema de vendas, leitura de notas e contabilizacao completa. Login, gerenciador de usuarios, menu de opcoes, visoes baseadas em acessos (dev, master, usuarios). Controle de historico e auditoria.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI + Recharts
- **Backend**: FastAPI + Motor (MongoDB async) + JWT Auth
- **Database**: MongoDB (gestao_tj_db)
- **AI/OCR**: OpenAI GPT-4o via Emergent LLM Key
- **Design**: Swiss High-Contrast Light Theme (Outfit + IBM Plex Sans + JetBrains Mono)

## User Personas
- **Dev**: Full system access, user management, audit logs, all CRUD
- **Master**: Management access, users, reports, audit
- **Usuario**: Basic access, products, inventory, sales, invoices

## Core Requirements (Static)
1. JWT Authentication with role-based access control
2. Product management (CRUD) with SKU, pricing, categories
3. Multi-warehouse inventory control with minimum stock alerts
4. Supplier management (CRUD) with CNPJ, contact info
5. Invoice management with OCR/AI extraction (GPT-4o)
6. Sales system (PDV) with cart, payment methods, discounts
7. Financial reports (DRE) with revenue, cost, profit margin
8. Complete audit trail for all actions
9. Alert configuration (email, internal, mobile channels)
10. Internal notification system with unread count

## What's Been Implemented (April 15, 2026)
- Login page with split-panel design and test credentials
- Dashboard with 6 stat cards (products, suppliers, warehouses, sales, alerts)
- Products page with CRUD, search, edit, delete
- Warehouses page with CRUD, card layout, edit, delete
- Inventory page with stock status indicators
- Suppliers page with CRUD, search, edit, delete
- Invoices page with manual entry + OCR tab (GPT-4o)
- Sales page with PDV (cart, products, payment, discounts)
- Reports page with DRE chart (Recharts bar chart)
- Users page with full management (create, edit, activate/deactivate, delete)
- Alerts page with notification center + alert config (email/internal/mobile)
- Audit page with action history table
- Sidebar with role-based menu, notification badge, user info

## Prioritized Backlog
### P0 (Critical)
- [DONE] All core CRUD operations
- [DONE] Authentication and authorization
- [DONE] Dashboard with real-time stats

### P1 (High)
- [ ] PDF/XML invoice file upload and parsing
- [ ] Inventory adjustment from invoice processing
- [ ] Order/Quote management (pedidos/orcamentos)
- [ ] Product barcode scanning support

### P2 (Medium)
- [ ] Cash flow report (fluxo de caixa)
- [ ] Export reports to PDF/Excel
- [ ] Email integration for real alert delivery (SendGrid/Resend)
- [ ] SMS integration for mobile alerts (Twilio)
- [ ] Customer management module

### P3 (Low)
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Mobile responsive optimization
- [ ] Data import/export (CSV)

## Next Tasks
1. Implement PDF/XML invoice upload with file parsing
2. Add order/quote management flow
3. Integrate real email sending for alerts
4. Add cash flow report
5. Export functionality for reports
