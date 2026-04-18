# Gestao TJ - Documentacao Completa

---

## 1. RODAR LOCALMENTE

### Pre-requisitos
- Python 3.11+ → python.org/downloads
- Node.js 18+ → nodejs.org
- Yarn → Apos instalar Node: `npm install -g yarn`

### Banco de Dados (MongoDB Atlas - Gratuito)
Voce ja tem o cluster configurado! Use a URL:
```
mongodb+srv://juliosilva2854_db_user:VV65GcZX3fB7AfAA@sistema-tj.zgll1uu.mongodb.net/?retryWrites=true&w=majority&appName=Sistema-Tj
```

### Passo 1: Baixar o codigo
Baixe o codigo do Emergent (botao "Download Code") e extraia.

### Passo 2: Backend
```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar (escolha seu sistema):
# Windows CMD: venv\Scripts\activate
# Windows PowerShell: venv\Scripts\Activate.ps1
# Mac/Linux: source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

Criar arquivo `backend/.env`:
```
MONGO_URL=mongodb+srv://juliosilva2854_db_user:VV65GcZX3fB7AfAA@sistema-tj.zgll1uu.mongodb.net/?retryWrites=true&w=majority&appName=Sistema-Tj
DB_NAME=gestao_tj_db
JWT_SECRET=gestao_tj_secret_key_2024_secure_long_key_for_hmac256
CORS_ORIGINS=http://localhost:3000
EMERGENT_LLM_KEY=sk-emergent-e09Fe5b29Ad66E432E
```

Iniciar:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```
O backend roda em http://localhost:8001

### Passo 3: Frontend
```bash
cd frontend
yarn install
```

Criar arquivo `frontend/.env`:
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

Iniciar:
```bash
yarn start
```
O frontend roda em http://localhost:3000

### Passo 4: Acessar
Abra http://localhost:3000 no navegador.
Credenciais (criadas automaticamente no primeiro acesso):
- admin@gestaotj.com / Admin@123456
- gerente@gestaotj.com / Gerente@123
- usuario@gestaotj.com / Usuario@123

---

## 2. PUBLICAR COM CLOUDFLARE

### Opcao A: Cloudflare Tunnel (mais facil)

1. Instale o cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
```bash
# Mac
brew install cloudflared

# Windows
winget install --id Cloudflare.cloudflared

# Linux
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/
```

2. Autentique:
```bash
cloudflared tunnel login
```

3. Crie um tunnel:
```bash
cloudflared tunnel create gestao-tj
```

4. Configure `~/.cloudflared/config.yml`:
```yaml
tunnel: gestao-tj
credentials-file: ~/.cloudflared/<ID>.json

ingress:
  - hostname: gestaotj.seudominio.com
    service: http://localhost:3000
  - hostname: api.gestaotj.seudominio.com
    service: http://localhost:8001
  - service: http_status:404
```

5. Crie o DNS no Cloudflare:
```bash
cloudflared tunnel route dns gestao-tj gestaotj.seudominio.com
cloudflared tunnel route dns gestao-tj api.gestaotj.seudominio.com
```

6. Atualize o `frontend/.env`:
```
REACT_APP_BACKEND_URL=https://api.gestaotj.seudominio.com
```

7. Rebuild o frontend:
```bash
cd frontend && yarn build
```

8. Inicie o tunnel:
```bash
cloudflared tunnel run gestao-tj
```

### Opcao B: VPS + Cloudflare DNS

1. Alugue um VPS (DigitalOcean, Hetzner, etc.)
2. Instale Docker e Docker Compose no VPS
3. Aponte o dominio para o IP do VPS no DNS da Cloudflare
4. Configure SSL como "Full (strict)" na Cloudflare
5. Use Nginx como proxy reverso:

```nginx
server {
    listen 80;
    server_name gestaotj.seudominio.com;

    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

### Opcao C: Deploy Estatico (Frontend) + API separada

1. Build do frontend: `cd frontend && yarn build`
2. Suba a pasta `build/` no Cloudflare Pages
3. Hospede o backend em Railway, Render ou Fly.io (gratuitos)
4. Atualize REACT_APP_BACKEND_URL para a URL do backend hospedado

---

## 3. ESTRUTURA DO PROJETO

```
backend/
  server.py          - API FastAPI (todas as rotas)
  models.py          - Modelos de dados
  auth.py            - JWT + bcrypt
  audit.py           - Logs de auditoria
  email_service.py   - Emails (SendGrid)
  report_export.py   - PDF + Excel
  nfe_parser.py      - Leitor de XML NFe
  .env               - Configuracoes

frontend/
  src/App.js         - Rotas
  src/api.js         - Comunicacao com backend
  src/components/    - Paginas
  .env               - URL do backend
```

---

## 4. OPCIONAL: EMAILS COM SENDGRID

1. Crie conta em sendgrid.com (gratuito ate 100 emails/dia)
2. Settings > API Keys > Create API Key
3. Settings > Sender Authentication > verificar email
4. Adicione no `backend/.env`:
```
SENDGRID_API_KEY=SG.xxxxx
SENDER_EMAIL=alertas@seudominio.com
```
