import React from 'react';
import { Home, Package, Warehouse, ClipboardList, UserCircle, FileText, BarChart3, Bell, TrendingUp, Users } from 'lucide-react';

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
      'Nesta aba ficam os produtos importados das notas fiscais que ainda nao foram enviados para um deposito.',
      'Cada produto mostra o SKU, nome, custo unitario e quantidade disponivel para transferencia.',
      'Clique no botao "Transferir" para enviar o produto para um deposito especifico.',
      'Ao transferir, selecione o deposito e o setor de destino, e informe a quantidade.',
      'Quando toda a quantidade for transferida, o produto desaparece desta aba e fica apenas no Estoque.',
      'Se transferir parcialmente, o restante continua aqui ate ser enviado.',
    ]
  },
  {
    icon: Warehouse, title: 'Depositos',
    items: [
      'Cadastre os locais fisicos onde seus produtos ficam armazenados.',
      'Cada deposito pode ter "Setores" - areas internas para organizar melhor (ex: Prateleira A, Geladeira, Corredor 3).',
      'Para adicionar setores, digite o nome e clique "Adicionar" ao criar ou editar o deposito.',
      'Voce pode ativar ou desativar depositos clicando no botao de status.',
      'Importante: cadastre os setores antes de fazer baixas no estoque, pois a baixa exige selecionar o setor.',
    ]
  },
  {
    icon: ClipboardList, title: 'Estoque',
    items: [
      'Aqui voce ve todos os produtos que estao nos depositos, com a quantidade atual.',
      'A coluna "Status" indica se o produto esta OK (verde) ou Baixo (vermelho) baseado no estoque minimo configurado nos Alertas.',
      'Use o botao "Baixa" para retirar unidades do estoque - voce deve selecionar o setor do deposito para onde o produto esta indo.',
      'A quantidade nunca fica negativa. Se tentar dar baixa de mais do que tem, o sistema zera o estoque.',
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
      'Clique em "Nova Nota Fiscal" e escolha como importar:',
      '  - PDF/XML: Faca upload de um arquivo. XML (NFe) e lido automaticamente. PDF e processado com inteligencia artificial.',
      '  - OCR: Tire uma foto ou escaneie a nota e faca upload. A IA extrai os dados automaticamente.',
      '  - Revisar: Confira os dados extraidos antes de salvar.',
      'Apos salvar a nota, clique no icone de caixa para enviar os itens para a aba "Produtos".',
      'De la, voce transfere cada produto para o deposito correto.',
    ]
  },
  {
    icon: BarChart3, title: 'Relatorios',
    items: [
      'DRE: Demonstrativo de Resultados mostrando receita, custo, lucro bruto e margem de lucro.',
      'Curva ABC: Classificacao dos produtos por faturamento. Classe A (80%), B (15%) e C (5%).',
      'Giro de Estoque: Mostra a rotatividade de cada produto, estoque atual, taxa de giro e dias de cobertura.',
      'Use os botoes PDF e Excel para exportar os relatorios.',
    ]
  },
  {
    icon: Bell, title: 'Alertas e Notificacoes',
    items: [
      'Caixa de Entrada: Veja todas as notificacoes do sistema. Marque como lida ou marque todas de uma vez.',
      'Estoque Minimo: Configure a quantidade minima de cada produto no estoque.',
      'Quando o estoque de um produto ficar igual ou abaixo do minimo configurado, voce recebera uma notificacao automatica.',
      'Para configurar, va na aba "Estoque Minimo", encontre o produto e clique em "Configurar".',
    ]
  },
  {
    icon: TrendingUp, title: 'Auditoria',
    items: [
      'Registra todas as acoes feitas no sistema: criacao, edicao, exclusao, transferencias e processamentos.',
      'Use os filtros para buscar por data, usuario, tipo de acao ou tipo de registro.',
      'O ID completo de cada registro e exibido para rastreabilidade.',
      'Exporte todo o historico para Excel clicando em "Exportar Excel".',
    ]
  },
  {
    icon: Users, title: 'Usuarios',
    items: [
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
        <p className="mt-1 text-sm text-zinc-600">Explicacao de cada funcionalidade do Gestao TJ</p>
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
    </div>
  );
};
