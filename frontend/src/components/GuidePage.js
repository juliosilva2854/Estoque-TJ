import React from 'react';
import { Home, Package, Warehouse, ClipboardList, UserCircle, FileText, BarChart3, Bell, TrendingUp, Users, HelpCircle } from 'lucide-react';

const sections = [
  {
    icon: Home, title: 'Dashboard',
    items: [
      'Ao acessar o sistema, voce vera o painel principal com as informacoes resumidas.',
      'Os cards mostram: total de produtos cadastrados, fornecedores, depositos, notas fiscais pendentes e alertas de estoque.',
      'Se houver produtos com estoque abaixo do minimo configurado, eles aparecerao na secao de alertas vermelhos.',
    ]
  },
  {
    icon: Package, title: 'Produtos',
    items: [
      'Nesta aba voce cadastra todos os produtos que serao controlados no sistema.',
      'Clique em "Novo Produto" para adicionar. Preencha: nome, SKU (codigo unico), descricao, categoria, unidade e custo de compra.',
      'Use a busca para encontrar produtos por nome ou SKU.',
      'O botao de setas (Transferir) envia o produto para um deposito especifico, adicionando ao estoque.',
      'Voce pode editar e excluir produtos a qualquer momento.',
      'Quando uma nota fiscal e processada, os produtos sao criados automaticamente aqui.',
    ]
  },
  {
    icon: Warehouse, title: 'Depositos',
    items: [
      'Cadastre os locais fisicos onde seus produtos ficam armazenados.',
      'Cada deposito pode ter "Setores" - areas internas para organizar melhor (ex: Prateleira A, Geladeira, Corredor 3).',
      'Para adicionar setores, digite o nome e clique "Adicionar" ao criar ou editar o deposito.',
      'Voce pode ativar ou desativar depositos clicando no botao de status.',
    ]
  },
  {
    icon: ClipboardList, title: 'Estoque',
    items: [
      'Aqui voce ve todos os produtos que estao nos depositos, com a quantidade atual.',
      'A coluna "Status" indica se o produto esta OK (verde) ou Baixo (vermelho) baseado no estoque minimo configurado.',
      'Use o botao de seta para baixo para dar baixa - retirar unidades do estoque.',
      'Na baixa, voce pode selecionar o setor do deposito para onde o produto esta indo.',
      'O produto continua cadastrado mesmo apos a baixa total - apenas a quantidade e reduzida.',
    ]
  },
  {
    icon: UserCircle, title: 'Fornecedores',
    items: [
      'Cadastre todos os seus fornecedores com nome, CNPJ, email, telefone e endereco.',
      'Use a busca para encontrar rapidamente por nome ou CNPJ.',
      'Voce pode editar e excluir fornecedores a qualquer momento.',
    ]
  },
  {
    icon: FileText, title: 'Notas Fiscais',
    items: [
      'Esta e a aba principal para entrada de mercadorias no sistema.',
      'Clique em "Nova Nota Fiscal" e escolha uma das 3 formas:',
      '  - PDF/XML: Faca upload de um arquivo. XML (NFe) e parseado automaticamente. PDF e processado com inteligencia artificial.',
      '  - OCR: Tire uma foto da nota e faca upload. A IA extrai os dados automaticamente.',
      '  - Revisar: Confira os dados extraidos antes de salvar.',
      'Apos salvar a nota, clique no icone de caixa (Processar Itens) para criar os produtos automaticamente e adicionar ao estoque.',
      'Selecione o deposito de destino ao processar. Os produtos serao criados se nao existirem, e o estoque sera atualizado.',
    ]
  },
  {
    icon: BarChart3, title: 'Relatorios',
    items: [
      'Acesso exclusivo para Desenvolvedores e Gerentes.',
      'DRE: Demonstrativo de Resultados mostrando receita, custo, lucro bruto e margem de lucro. Inclui grafico de barras.',
      'Curva ABC: Classificacao dos produtos por faturamento. Classe A (80% do faturamento), B (15%) e C (5%).',
      'Giro de Estoque: Mostra a rotatividade de cada produto - quantos foram vendidos, estoque atual, taxa de giro e dias de cobertura.',
      'Use os botoes PDF e Excel para exportar os relatorios.',
    ]
  },
  {
    icon: Bell, title: 'Alertas e Notificacoes',
    items: [
      'Caixa de Entrada: Veja todas as notificacoes do sistema. Marque como lida ou marque todas de uma vez.',
      'Configuracoes: Crie regras de alerta. Escolha o tipo (estoque baixo, nota pendente) e os canais (interna, email, SMS).',
      'Estoque Minimo: Configure o estoque minimo de cada produto. Quando atingir esse valor, voce recebera uma notificacao automatica.',
      'O alerta de estoque baixo e disparado quando a quantidade no deposito ficar igual ou menor que o minimo configurado.',
    ]
  },
  {
    icon: TrendingUp, title: 'Auditoria',
    items: [
      'Acesso exclusivo para Desenvolvedores e Gerentes.',
      'Registra todas as acoes feitas no sistema: criacao, edicao, exclusao, transferencias, processamentos.',
      'Use os filtros para buscar por data, usuario, tipo de acao ou entidade.',
      'O ID completo e exibido para rastreabilidade.',
      'Exporte todo o historico para Excel clicando em "Exportar Excel".',
    ]
  },
  {
    icon: Users, title: 'Usuarios',
    items: [
      'Acesso exclusivo para Desenvolvedores e Gerentes.',
      'Crie novos usuarios com nome, email, senha e nivel de acesso.',
      'Desenvolvedor: acesso total a todas as funcionalidades.',
      'Gerente: acesso a relatorios, auditoria e gerenciamento de usuarios.',
      'Operacional: acesso basico a produtos, estoque, notas fiscais e alertas.',
      'Voce pode editar dados, alterar nivel de acesso, ativar/desativar e excluir usuarios.',
    ]
  },
];

export const GuidePage = () => {
  return (
    <div className="p-4 md:p-8" data-testid="guide-page">
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Guia do Sistema</h1>
        <p className="mt-1 text-sm text-zinc-600">Explicacao detalhada de cada funcionalidade do Gestao TJ</p>
      </div>

      <div className="space-y-6">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div key={idx} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 p-5 bg-zinc-50 border-b border-zinc-200">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-zinc-900">{section.title}</h2>
              </div>
              <div className="p-5">
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className={`text-sm text-zinc-700 leading-relaxed ${item.startsWith('  -') ? 'ml-4 text-zinc-600' : ''}`}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Como rodar localmente */}
      <div className="mt-8 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 p-5 bg-zinc-50 border-b border-zinc-200">
          <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900">Como Rodar Localmente</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-2">1. Pre-requisitos</h3>
            <ul className="text-sm text-zinc-700 space-y-1 ml-4">
              <li>- Python 3.11 ou superior</li>
              <li>- Node.js 18 ou superior</li>
              <li>- MongoDB 6 ou superior (ou MongoDB Atlas gratuito)</li>
              <li>- Yarn (instalador de pacotes): npm install -g yarn</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-2">2. Backend</h3>
            <div className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-xs font-mono overflow-x-auto space-y-0.5">
              <p>cd backend</p>
              <p>python -m venv venv</p>
              <p># Windows: venv\Scripts\activate</p>
              <p># Mac/Linux: source venv/bin/activate</p>
              <p>pip install -r requirements.txt</p>
            </div>
            <p className="text-sm text-zinc-600 mt-2">Crie <strong>backend/.env</strong>:</p>
            <div className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-xs font-mono overflow-x-auto space-y-0.5">
              <p>MONGO_URL=mongodb://localhost:27017</p>
              <p>DB_NAME=gestao_tj_db</p>
              <p>JWT_SECRET=chave_secreta_com_32_caracteres_minimo</p>
              <p>CORS_ORIGINS=http://localhost:3000</p>
              <p>EMERGENT_LLM_KEY=sua_chave_openai</p>
            </div>
            <p className="text-sm text-zinc-600 mt-2">Iniciar:</p>
            <div className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-xs font-mono">uvicorn server:app --host 0.0.0.0 --port 8001 --reload</div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-2">3. Frontend</h3>
            <div className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-xs font-mono overflow-x-auto space-y-0.5">
              <p>cd frontend</p>
              <p>yarn install</p>
            </div>
            <p className="text-sm text-zinc-600 mt-2">Crie <strong>frontend/.env</strong>:</p>
            <div className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-xs font-mono">REACT_APP_BACKEND_URL=http://localhost:8001</div>
            <p className="text-sm text-zinc-600 mt-2">Iniciar:</p>
            <div className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-xs font-mono">yarn start</div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-2">4. Primeiro Acesso</h3>
            <p className="text-sm text-zinc-700">Abra http://localhost:3000. O sistema cria 3 usuarios automaticamente:</p>
            <ul className="text-sm text-zinc-700 space-y-1 ml-4 mt-1">
              <li>- admin@gestaotj.com / Admin@123456</li>
              <li>- gerente@gestaotj.com / Gerente@123</li>
              <li>- usuario@gestaotj.com / Usuario@123</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800"><strong>MongoDB Atlas:</strong> Se nao quiser instalar MongoDB local, use atlas.mongodb.com (gratuito). Crie um cluster e use a URL de conexao no MONGO_URL.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
