import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../api';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export const ReportsPage = () => {
  const [period, setPeriod] = useState('month');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [period]);

  const loadReport = async () => {
    try {
      const res = await reportsAPI.getFinancial(period);
      setReport(res.data);
    } catch (error) {
      toast.error('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  const chartData = [
    { name: 'Receita', value: report?.revenue || 0 },
    { name: 'Custo', value: report?.cost || 0 },
    { name: 'Lucro Bruto', value: report?.gross_profit || 0 },
  ];

  return (
    <div className="p-8" data-testid="reports-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold font-primary text-zinc-900 tracking-tight">
            Relatórios Financeiros
          </h1>
          <p className="mt-2 text-zinc-600">Demonstrativo de Resultados do Exercício (DRE)</p>
        </div>
        <div className="flex gap-2">
          <Button
            data-testid="period-month-button"
            variant={period === 'month' ? 'default' : 'outline'}
            onClick={() => setPeriod('month')}
            className={period === 'month' ? 'bg-blue-600 text-white' : ''}
          >
            Mês Atual
          </Button>
          <Button
            data-testid="period-year-button"
            variant={period === 'year' ? 'default' : 'outline'}
            onClick={() => setPeriod('year')}
            className={period === 'year' ? 'bg-blue-600 text-white' : ''}
          >
            Ano Atual
          </Button>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6" data-testid="metric-revenue">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Receita</p>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-semibold font-mono text-zinc-900">
            R$ {(report?.revenue || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6" data-testid="metric-cost">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Custo</p>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-3xl font-semibold font-mono text-red-600">
            R$ {(report?.cost || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6" data-testid="metric-profit">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Lucro Bruto</p>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-semibold font-mono text-zinc-900">
            R$ {(report?.gross_profit || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6" data-testid="metric-margin">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Margem</p>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-semibold font-mono text-zinc-900">
            {(report?.profit_margin || 0).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold font-primary text-zinc-900 mb-6">Visão Geral</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};