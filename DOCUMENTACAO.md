# Gestao TJ - Como Rodar Localmente

---

## 1. PRE-REQUISITOS

- **Python 3.11+** → python.org/downloads
- **Node.js 18+** → nodejs.org
- **Yarn** → Apos instalar Node, rode: `npm install -g yarn`
- **Chave OpenAI** (opcional, para OCR de notas) → platform.openai.com/api-keys

---

## 2. BANCO DE DADOS (MongoDB Atlas - Gratuito)

Sua URL de conexao:
```
mongodb+srv://juliosilva2854_db_user:VV65GcZX3fB7AfAA@sistema-tj.zgll1uu.mongodb.net/?retryWrites=true&w=majority&appName=Sistema-Tj
```

Se precisar criar outro cluster:
1. Acesse cloud.mongodb.com → Crie conta gratuita
2. "Build Database" → FREE (M0)
3. Crie usuario e senha
4. Network Access → "Allow Access from Anywhere"
5. Connect → Drivers → Copie a URL

---

## 3. CONFIGURAR BACKEND

```bash
cd backend
python -m venv venv

# Ativar:
# Windows CMD:        venv\Scripts\activate
# Windows PowerShell: venv\Scripts\Activate.ps1
# Mac/Linux:          source venv/bin/activate

pip install -r requirements.txt
```

Crie o arquivo **backend/.env**:
```
MONGO_URL=mongodb+srv://juliosilva2854_db_user:VV65GcZX3fB7AfAA@sistema-tj.zgll1uu.mongodb.net/?retryWrites=true&w=majority&appName=Sistema-Tj
DB_NAME=gestao_tj_db
JWT_SECRET=gestao_tj_secret_key_2024_secure_long_key_for_hmac256
CORS_ORIGINS=http://localhost:3000
OPENAI_API_KEY=sk-sua-chave-openai-aqui
```

Iniciar:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

---

## 4. CONFIGURAR FRONTEND

```bash
cd frontend
yarn install
```

Crie o arquivo **frontend/.env**:
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

Iniciar:
```bash
yarn start
```

---

## 5. ACESSAR

Abra **http://localhost:3000**

Credenciais (criadas automaticamente):
- admin@gestaotj.com / Admin@123456
- gerente@gestaotj.com / Gerente@123
- usuario@gestaotj.com / Usuario@123

---

## 6. PUBLICAR COM CLOUDFLARE TUNNEL

### Instalar cloudflared
```bash
# Mac
brew install cloudflared

# Windows
winget install --id Cloudflare.cloudflared

# Linux
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared && sudo mv cloudflared /usr/local/bin/
```

### Configurar
```bash
cloudflared tunnel login
cloudflared tunnel create gestao-tj
```

Crie **~/.cloudflared/config.yml**:
```yaml
tunnel: gestao-tj
credentials-file: ~/.cloudflared/<ID-DO-TUNNEL>.json

ingress:
  - hostname: gestaotj.seudominio.com
    service: http://localhost:3000
  - hostname: api-gestaotj.seudominio.com
    service: http://localhost:8001
  - service: http_status:404
```

```bash
cloudflared tunnel route dns gestao-tj gestaotj.seudominio.com
cloudflared tunnel route dns gestao-tj api-gestaotj.seudominio.com
```

Atualize **frontend/.env**:
```
REACT_APP_BACKEND_URL=https://api-gestaotj.seudominio.com
```

Rebuild e inicie:
```bash
cd frontend && yarn build
cloudflared tunnel run gestao-tj
```

---

## 7. EMAILS (Opcional)

Para alertas por email com SendGrid:
1. sendgrid.com → Crie conta gratuita
2. Settings → API Keys → Create
3. Settings → Sender Authentication → Verificar email
4. Adicione no backend/.env:
```
SENDGRID_API_KEY=SG.xxxxx
SENDER_EMAIL=alertas@seudominio.com
```
