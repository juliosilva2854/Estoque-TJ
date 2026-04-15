import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../api';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Download, FileText, Table2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from 'sonner';

export const ReportsPage = () => {
  const [period, setPeriod] = useState('month');
  const [report, setReport] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReport(); }, [period]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const [finRes, cfRes] = await Promise.all([
        reportsAPI.getFinancial(period),
        reportsAPI.getCashFlow(period),
      ]);
      setReport(finRes.data);
      setCashFlow(cfRes.data);
    } catch { toast.error('Erro ao carregar relatorio'); }
    finally { setLoading(false); }
  };

  const handleExportPDF = async () => {
    try {
      const res = await reportsAPI.exportPDF(period);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_${period}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF exportado!');
    } catch { toast.error('Erro ao exportar PDF'); }
  };

  const handleExportExcel = async () => {
    try {
      const res = await reportsAPI.exportExcel(period);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_${period}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel exportado!');
    } catch { toast.error('Erro ao exportar Excel'); }
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  const chartData = [
    { name: 'Receita', value: report?.revenue || 0, fill: '#16A34A' },
    { name: 'Custo', value: report?.cost || 0, fill: '#DC2626' },
    { name: 'Lucro', value: report?.gross_profit || 0, fill: '#2563EB' },
  ];

  const cfChartData = [
    { name: 'Entradas', value: cashFlow?.inflows || 0, fill: '#16A34A' },
    { name: 'Saidas', value: cashFlow?.outflows || 0, fill: '#DC2626' },
  ];

  return (
    <div className="p-8" data-testid="reports-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Relatorios Financeiros</h1>
          <p className="mt-2 text-zinc-600">DRE, Fluxo de Caixa e Exportacao</p>
        </div>
        <div className="flex gap-2">
          <Button data-testid="period-month-button" variant={period === 'month' ? 'default' : 'outline'} onClick={() => setPeriod('month')} className={period === 'month' ? 'bg-blue-600 text-white' : ''}>Mes Atual</Button>
          <Button data-testid="period-year-button" variant={period === 'year' ? 'default' : 'outline'} onClick={() => setPeriod('year')} className={period === 'year' ? 'bg-blue-600 text-white' : ''}>Ano Atual</Button>
          <Button data-testid="export-pdf-button" variant="outline" onClick={handleExportPDF}><FileText className="h-4 w-4 mr-2" />PDF</Button>
          <Button data-testid="export-excel-button" variant="outline" onClick={handleExportExcel}><Table2 className="h-4 w-4 mr-2" />Excel</Button>
        </div>
      </div>

      <Tabs defaultValue="dre" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dre" data-testid="tab-dre">DRE - Demonstrativo de Resultados</TabsTrigger>
          <TabsTrigger value="cashflow" data-testid="tab-cashflow">Fluxo de Caixa</TabsTrigger>
        </TabsList>

        <TabsContent value="dre">
          {/* DRE Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6" data-testid="metric-revenue">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Receita</p>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-semibold font-mono text-green-600">R$ {(report?.revenue || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6" data-testid="metric-cost">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Custo</p>
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-3xl font-semibold font-mono text-red-600">R$ {(report?.cost || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6" data-testid="metric-profit">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Lucro Bruto</p>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-semibold font-mono text-zinc-900">R$ {(report?.gross_profit || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6" data-testid="metric-margin">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Margem</p>
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-semibold font-mono text-zinc-900">{(report?.profit_margin || 0).toFixed(1)}%</p>
            </div>
          </div>

          {/* DRE Chart */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold font-primary text-zinc-900 mb-6">Visao Geral - DRE</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(v) => `R$ ${v.toFixed(2)}`} /><Bar dataKey="value" radius={[8, 8, 0, 0]}>{chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}</Bar></BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="cashflow">
          {/* Cash Flow Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Entradas</p>
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-semibold font-mono text-green-600">R$ {(cashFlow?.inflows || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Saidas</p>
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-3xl font-semibold font-mono text-red-600">R$ {(cashFlow?.outflows || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Saldo</p>
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <p className={`text-3xl font-semibold font-mono ${(cashFlow?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {(cashFlow?.balance || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Cash Flow Chart */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold font-primary text-zinc-900 mb-6">Entradas vs Saidas</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cfChartData}><CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(v) => `R$ ${v.toFixed(2)}`} /><Bar dataKey="value" radius={[8, 8, 0, 0]}>{cfChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}</Bar></BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cash Flow Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-green-600" />Entradas Recentes
              </h3>
              <div className="space-y-2">
                {(cashFlow?.inflow_details || []).slice(0, 10).map((item, idx) => (
                  <div key={idx} className="flex justify-between p-2 bg-green-50 rounded text-sm">
                    <span className="text-zinc-700">{item.description}</span>
                    <span className="font-mono text-green-700">R$ {item.value.toFixed(2)}</span>
                  </div>
                ))}
                {(cashFlow?.inflow_details || []).length === 0 && <p className="text-sm text-zinc-500">Nenhuma entrada no periodo</p>}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5 text-red-600" />Saidas Recentes
              </h3>
              <div className="space-y-2">
                {(cashFlow?.outflow_details || []).slice(0, 10).map((item, idx) => (
                  <div key={idx} className="flex justify-between p-2 bg-red-50 rounded text-sm">
                    <span className="text-zinc-700">{item.description}</span>
                    <span className="font-mono text-red-700">R$ {item.value.toFixed(2)}</span>
                  </div>
                ))}
                {(cashFlow?.outflow_details || []).length === 0 && <p className="text-sm text-zinc-500">Nenhuma saida no periodo</p>}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
