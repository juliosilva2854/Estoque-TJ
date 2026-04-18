import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../api';
import { Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadInventory(); }, []);
  const loadInventory = async () => { try { const r = await inventoryAPI.getAll(); setInventory(r.data); } catch { toast.error('Erro ao carregar'); } finally { setLoading(false); } };

  if (loading) return <div className="p-4 md:p-8"><div className="animate-pulse"><div className="h-8 bg-zinc-200 rounded w-64 mb-4" /><div className="h-64 bg-zinc-200 rounded" /></div></div>;

  return (
    <div className="p-4 md:p-8" data-testid="inventory-page">
      <div className="mb-6">
        <h1 className="text-2xl md:text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Controle de Estoque</h1>
        <p className="mt-1 text-sm text-zinc-600">Visualize o estoque por deposito</p>
      </div>
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[600px]" data-testid="inventory-table">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Produto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Deposito</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Quantidade</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Minimo</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {inventory.map(item => {
              const isLow = item.quantity <= item.min_stock;
              return (
                <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-zinc-900">{item.product_name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-zinc-800">{item.product_sku}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{item.warehouse_name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-zinc-800 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm font-mono text-zinc-800 text-right">{item.min_stock}</td>
                  <td className="px-4 py-3 text-center">
                    {isLow ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><AlertTriangle className="h-3 w-3" />Baixo</span>
                    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><Package className="h-3 w-3" />OK</span>}
                  </td>
                </tr>
              );
            })}
            {inventory.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500">Nenhum item no estoque. Importe notas fiscais e processe os itens.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
