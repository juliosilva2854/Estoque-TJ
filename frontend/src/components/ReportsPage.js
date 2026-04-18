import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../api';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, FileText, Table2 } from 'lucide-react';
import { toast } from 'sonner';

export const ReportsPage = () => {
  const [period, setPeriod] = useState('month');
  const [report, setReport] = useState(null);
  const [abc, setAbc] = useState(null);
  const [turnover, setTurnover] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, [period]);
  const loadAll = async () => {
    setLoading(true);
    try {
      const [finR, abcR, toR] = await Promise.all([reportsAPI.getFinancial(period), reportsAPI.getABCCurve(), reportsAPI.getInventoryTurnover()]);
      setReport(finR.data); setAbc(abcR.data); setTurnover(toR.data);
    } catch { toast.error('Erro ao carregar'); } finally { setLoading(false); }
  };

  const handleExportPDF = async () => { try { const r = await reportsAPI.exportPDF(period); const u = window.URL.createObjectURL(new Blob([r.data])); const a = document.createElement('a'); a.href = u; a.download = `relatorio_${period}.pdf`; a.click(); toast.success('PDF exportado!'); } catch { toast.error('Erro'); } };
  const handleExportExcel = async () => { try { const r = await reportsAPI.exportExcel(period); const u = window.URL.createObjectURL(new Blob([r.data])); const a = document.createElement('a'); a.href = u; a.download = `relatorio_${period}.xlsx`; a.click(); toast.success('Excel exportado!'); } catch { toast.error('Erro'); } };

  const classColors = { A: '#16A34A', B: '#EAB308', C: '#DC2626' };
  const statusColors = { critico: 'bg-red-100 text-red-700', baixo: 'bg-yellow-100 text-yellow-700', normal: 'bg-green-100 text-green-700', excesso: 'bg-blue-100 text-blue-700' };
  const statusLabels = { critico: 'Critico', baixo: 'Baixo', normal: 'Normal', excesso: 'Excesso' };

  if (loading) return <div className="p-4 md:p-8">Carregando...</div>;

  const chartData = [
    { name: 'Receita', value: report?.revenue || 0, fill: '#16A34A' },
    { name: 'Custo', value: report?.cost || 0, fill: '#DC2626' },
    { name: 'Lucro', value: report?.gross_profit || 0, fill: '#2563EB' },
  ];

  return (
    <div className="p-4 md:p-8" data-testid="reports-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Relatorios</h1>
          <p className="mt-1 text-sm text-zinc-600">DRE, Curva ABC e Giro de Estoque</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={period === 'month' ? 'default' : 'outline'} onClick={() => setPeriod('month')} className={period === 'month' ? 'bg-blue-600 text-white' : ''}>Mes</Button>
          <Button variant={period === 'year' ? 'default' : 'outline'} onClick={() => setPeriod('year')} className={period === 'year' ? 'bg-blue-600 text-white' : ''}>Ano</Button>
          <Button variant="outline" onClick={handleExportPDF}><FileText className="h-4 w-4 mr-1" />PDF</Button>
          <Button variant="outline" onClick={handleExportExcel}><Table2 className="h-4 w-4 mr-1" />Excel</Button>
        </div>
      </div>

      <Tabs defaultValue="dre" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dre">DRE</TabsTrigger>
          <TabsTrigger value="abc">Curva ABC</TabsTrigger>
          <TabsTrigger value="turnover">Giro de Estoque</TabsTrigger>
        </TabsList>

        <TabsContent value="dre">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 md:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Receita</p>
              <p className="text-xl md:text-3xl font-semibold font-mono text-green-600">R$ {(report?.revenue || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 md:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Custo</p>
              <p className="text-xl md:text-3xl font-semibold font-mono text-red-600">R$ {(report?.cost || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 md:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Lucro</p>
              <p className="text-xl md:text-3xl font-semibold font-mono text-zinc-900">R$ {(report?.gross_profit || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 md:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Margem</p>
              <p className="text-xl md:text-3xl font-semibold font-mono text-zinc-900">{(report?.profit_margin || 0).toFixed(1)}%</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 md:p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Visao Geral</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={v => `R$ ${v.toFixed(2)}`} /><Bar dataKey="value" radius={[8,8,0,0]}>{chartData.map((e,i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="abc">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 md:p-6 mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">Curva ABC de Produtos</h2>
            <p className="text-sm text-zinc-600 mb-4">Classificacao por faturamento: A (80%), B (15%), C (5%)</p>
            <div className="flex gap-4 mb-4">
              {['A', 'B', 'C'].map(c => { const count = (abc?.items || []).filter(i => i.class === c).length; return (
                <div key={c} className="flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{backgroundColor: classColors[c]}} /><span className="text-sm">Classe {c}: {count} produtos</span></div>
              ); })}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Produto</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">Faturamento</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">%</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">Acumulado</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-zinc-500">Classe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {(abc?.items || []).map((item, i) => (
                  <tr key={i} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900">{item.product_name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-right">R$ {item.revenue.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-mono text-right">{item.percentage}%</td>
                    <td className="px-4 py-3 text-sm font-mono text-right">{item.cumulative}%</td>
                    <td className="px-4 py-3 text-center"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{backgroundColor: classColors[item.class]}}>{item.class}</span></td>
                  </tr>
                ))}
                {(abc?.items || []).length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">Nenhum dado de vendas disponivel</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="turnover">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 md:p-6 mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">Giro de Estoque</h2>
            <p className="text-sm text-zinc-600">Analise de rotatividade e cobertura de estoque por produto</p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Produto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">SKU</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">Vendidos</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">Estoque</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">Giro</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">Cobertura</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {(turnover?.items || []).map((item, i) => (
                  <tr key={i} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900">{item.product_name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-zinc-800">{item.sku}</td>
                    <td className="px-4 py-3 text-sm font-mono text-right">{item.total_sold}</td>
                    <td className="px-4 py-3 text-sm font-mono text-right">{item.current_stock}</td>
                    <td className="px-4 py-3 text-sm font-mono text-right">{item.turnover_rate}x</td>
                    <td className="px-4 py-3 text-sm font-mono text-right">{item.days_of_coverage >= 999 ? '---' : `${item.days_of_coverage}d`}</td>
                    <td className="px-4 py-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>{statusLabels[item.status]}</span></td>
                  </tr>
                ))}
                {(turnover?.items || []).length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">Nenhum produto cadastrado</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
