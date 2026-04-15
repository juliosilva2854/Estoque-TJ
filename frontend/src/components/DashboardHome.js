import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../api';
import { Package, Users, Warehouse, DollarSign, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getAlerts(),
      ]);
      setStats(statsRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-zinc-200 rounded-xl" />
          <div className="h-32 bg-zinc-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: Package,
      label: 'Total de Produtos',
      value: stats?.total_products || 0,
      color: 'blue',
      testId: 'stat-products'
    },
    {
      icon: Users,
      label: 'Fornecedores',
      value: stats?.total_suppliers || 0,
      color: 'green',
      testId: 'stat-suppliers'
    },
    {
      icon: Warehouse,
      label: 'Depósitos',
      value: stats?.total_warehouses || 0,
      color: 'purple',
      testId: 'stat-warehouses'
    },
    {
      icon: DollarSign,
      label: 'Vendas Hoje',
      value: `R$ ${(stats?.total_sales_today || 0).toFixed(2)}`,
      color: 'emerald',
      testId: 'stat-sales-today'
    },
    {
      icon: DollarSign,
      label: 'Vendas do Mês',
      value: `R$ ${(stats?.total_sales_month || 0).toFixed(2)}`,
      color: 'cyan',
      testId: 'stat-sales-month'
    },
    {
      icon: AlertTriangle,
      label: 'Alertas de Estoque',
      value: stats?.low_stock_alerts || 0,
      color: 'red',
      testId: 'stat-alerts'
    },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="p-8" data-testid="dashboard-home">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold font-primary text-zinc-900 tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 text-zinc-600">Visão geral do sistema de gestão</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              data-testid={card.testId}
              className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                    {card.label}
                  </p>
                  <p className="text-3xl font-semibold font-mono text-zinc-900">
                    {card.value}
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-lg ${colorMap[card.color]} flex items-center justify-center`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-semibold font-primary text-zinc-900">
              Alertas de Estoque Baixo
            </h2>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                data-testid={`alert-${idx}`}
                className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-zinc-900">{alert.product_name}</p>
                  <p className="text-sm text-zinc-600">{alert.warehouse_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-600">Quantidade atual</p>
                  <p className="text-lg font-mono font-semibold text-red-600">
                    {alert.current_quantity} / {alert.min_stock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
