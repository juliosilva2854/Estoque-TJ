import React from 'react';
import { FileText, Package, Warehouse, ClipboardList, UserCircle, BarChart3, Bell, Users, TrendingUp, HelpCircle } from 'lucide-react';

const steps = [
  { icon: HelpCircle, title: '1. Acesse o Sistema', desc: 'Faca login com seu email e senha. Existem 3 niveis de acesso: Dev (acesso total), Master (gerente) e Usuario (operacional).' },
  { icon: Warehouse, title: '2. Cadastre Depositos', desc: 'Va em "Depositos" e cadastre os locais de armazenamento. Voce pode criar setores dentro de cada deposito para organizar melhor os produtos.' },
  { icon: UserCircle, title: '3. Cadastre Fornecedores', desc: 'Va em "Fornecedores" e registre seus parceiros com nome, CNPJ, contato e endereco.' },
  { icon: FileText, title: '4. Importe Notas Fiscais', desc: 'Va em "Notas Fiscais" e faca upload de arquivos PDF ou XML (NFe). O sistema extrai automaticamente os dados. Voce tambem pode escanear imagens com OCR/IA.' },
  { icon: Package, title: '5. Processe os Itens da Nota', desc: 'Apos salvar a nota fiscal, clique em "Processar Itens" e selecione o deposito. Os produtos serao criados automaticamente e o estoque sera atualizado.' },
  { icon: ClipboardList, title: '6. Controle o Estoque', desc: 'A aba "Estoque" mostra todos os produtos por deposito com status (OK ou Baixo). Use "Transferir para Deposito" na aba Produtos para mover mercadorias.' },
  { icon: Bell, title: '7. Configure Alertas', desc: 'Va em "Alertas" > "Configuracoes" e crie alertas para estoque baixo. Voce pode receber por notificacao interna, email ou SMS.' },
  { icon: BarChart3, title: '8. Acompanhe Relatorios', desc: 'A aba "Relatorios" mostra o DRE (receita, custo, lucro), Curva ABC (produtos mais vendidos) e Giro de Estoque. Exporte para PDF ou Excel.' },
  { icon: TrendingUp, title: '9. Monitore a Auditoria', desc: 'Todas as acoes sao registradas. Use filtros por data, usuario, acao e entidade. Exporte o historico completo para Excel.' },
  { icon: Users, title: '10. Gerencie Usuarios', desc: 'Administradores podem criar, editar, ativar/desativar e excluir usuarios. Cada nivel de acesso tem permissoes diferentes no sistema.' },
];

export const GuidePage = () => {
  return (
    <div className="p-4 md:p-8" data-testid="guide-page">
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Guia do Sistema</h1>
        <p className="mt-1 text-sm text-zinc-600">Passo a passo para utilizar o Gestao TJ</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 md:p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold text-zinc-900">{step.title}</h3>
                <p className="text-sm text-zinc-600 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5 md:p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Niveis de Acesso</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 mb-2">DEV</span>
            <p className="text-sm text-zinc-700">Acesso total: todas as funcionalidades, gerenciamento de usuarios, auditoria, exclusao de registros.</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mb-2">MASTER</span>
            <p className="text-sm text-zinc-700">Gerencial: pode criar usuarios, ver relatorios e auditoria, gerenciar estoque e notas fiscais.</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 mb-2">USUARIO</span>
            <p className="text-sm text-zinc-700">Operacional: cadastro de produtos, fornecedores, depositos, entrada de notas e controle de estoque.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-zinc-100 border border-zinc-200 rounded-xl p-5 md:p-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">Documentacao Tecnica</h2>
        <div className="space-y-2 text-sm text-zinc-700">
          <p><strong>Frontend:</strong> React 19 + Tailwind CSS + Shadcn UI + Recharts</p>
          <p><strong>Backend:</strong> FastAPI + Motor (MongoDB async) + JWT Auth</p>
          <p><strong>Banco de Dados:</strong> MongoDB</p>
          <p><strong>IA/OCR:</strong> OpenAI GPT-4o (via Emergent LLM Key) para leitura de notas fiscais</p>
          <p><strong>Email:</strong> SendGrid (configuravel via variaveis de ambiente)</p>
          <p><strong>Relatorios:</strong> ReportLab (PDF) + OpenPyXL (Excel)</p>
          <p><strong>XML:</strong> lxml para parsing nativo de NFe</p>
        </div>
        <div className="mt-4 p-4 bg-white rounded-lg border border-zinc-200">
          <h3 className="text-sm font-semibold text-zinc-900 mb-2">Variaveis de Ambiente (Backend)</h3>
          <pre className="text-xs font-mono text-zinc-700 whitespace-pre-wrap">
{`MONGO_URL=mongodb://localhost:27017
DB_NAME=gestao_tj_db
JWT_SECRET=sua_chave_secreta
EMERGENT_LLM_KEY=sua_chave_llm
SENDGRID_API_KEY=sua_chave_sendgrid (opcional)
SENDER_EMAIL=alertas@seudominio.com (opcional)`}
          </pre>
        </div>
      </div>
    </div>
  );
};
