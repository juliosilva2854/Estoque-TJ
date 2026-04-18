import React, { useState, useEffect } from 'react';
import { inventoryAPI, warehousesAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Package, AlertTriangle, ArrowDownCircle } from 'lucide-react';
import { toast } from 'sonner';

export const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [baixaOpen, setBaixaOpen] = useState(false);
  const [baixaData, setBaixaData] = useState({ productId: '', productName: '', warehouseId: '', warehouseName: '', quantity: 1, sector: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try {
      const [iR, wR] = await Promise.all([inventoryAPI.getAll(), warehousesAPI.getAll()]);
      setInventory(iR.data); setWarehouses(wR.data);
    } catch (err) { toast.error('Erro ao carregar estoque'); }
    finally { setLoading(false); }
  };

  const handleBaixa = async (e) => {
    e.preventDefault();
    if (baixaData.quantity <= 0) { toast.error('Quantidade deve ser maior que zero'); return; }
    if (!baixaData.sector) { toast.error('Selecione o setor de destino'); return; }
    try {
      await inventoryAPI.adjust(baixaData.productId, baixaData.warehouseId, -baixaData.quantity);
      toast.success(`Baixa de ${baixaData.quantity} unidade(s) para setor "${baixaData.sector}" realizada!`);
      setBaixaOpen(false); loadData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Erro na baixa'); }
  };

  const openBaixa = (item) => {
    const wh = warehouses.find(w => w.id === item.warehouse_id);
    setBaixaData({
      productId: item.product_id, productName: item.product_name,
      warehouseId: item.warehouse_id, warehouseName: item.warehouse_name,
      quantity: 1, sector: ''
    });
    setBaixaOpen(true);
  };

  const getSectors = (warehouseId) => {
    const wh = warehouses.find(w => w.id === warehouseId);
    return wh?.sectors || [];
  };

  if (loading) return <div className="p-4 md:p-8"><div className="animate-pulse"><div className="h-8 bg-zinc-200 rounded w-64 mb-4" /><div className="h-64 bg-zinc-200 rounded" /></div></div>;

  return (
    <div className="p-4 md:p-8" data-testid="inventory-page">
      <div className="mb-6">
        <h1 className="text-2xl md:text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Controle de Estoque</h1>
        <p className="mt-1 text-sm text-zinc-600">Visualize e faca baixas transferindo para os setores do deposito</p>
      </div>

      <Dialog open={baixaOpen} onOpenChange={setBaixaOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Baixa de Estoque</DialogTitle></DialogHeader>
          <div className="space-y-1 mb-4">
            <p className="text-sm text-zinc-600">Produto: <strong>{baixaData.productName}</strong></p>
            <p className="text-sm text-zinc-600">Deposito: <strong>{baixaData.warehouseName}</strong></p>
          </div>
          <form onSubmit={handleBaixa} className="space-y-4">
            {getSectors(baixaData.warehouseId).length > 0 ? (
              <div><label className="block text-sm font-medium text-zinc-700 mb-1">Setor de destino (obrigatorio)</label>
                <Select value={baixaData.sector} onValueChange={v => setBaixaData({...baixaData, sector: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
                  <SelectContent>{getSectors(baixaData.warehouseId).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                Este deposito nao possui setores cadastrados. Cadastre setores na aba Depositos antes de fazer a baixa.
              </div>
            )}
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Quantidade para baixa</label>
              <Input type="number" min="1" value={baixaData.quantity} onChange={e => setBaixaData({...baixaData, quantity: parseFloat(e.target.value) || 0})} required />
            </div>
            <p className="text-xs text-zinc-500">A quantidade sera retirada do estoque e enviada para o setor selecionado.</p>
            <Button type="submit" disabled={getSectors(baixaData.warehouseId).length === 0} className="w-full bg-red-600 hover:bg-red-700 text-white">Confirmar Baixa</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[650px]" data-testid="inventory-table">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Produto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Deposito</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Quantidade</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Baixa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {inventory.map(item => {
              const isLow = item.min_stock > 0 && item.quantity <= item.min_stock;
              return (
                <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-zinc-900">{item.product_name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-zinc-800">{item.product_sku}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{item.warehouse_name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-zinc-800 text-right font-semibold">{item.quantity}</td>
                  <td className="px-4 py-3 text-center">
                    {isLow ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><AlertTriangle className="h-3 w-3" />Baixo</span>
                    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><Package className="h-3 w-3" />OK</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button onClick={() => openBaixa(item)} size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      <ArrowDownCircle className="h-4 w-4 mr-1" />Baixa
                    </Button>
                  </td>
                </tr>
              );
            })}
            {inventory.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500">Nenhum item no estoque. Importe notas fiscais, envie para Produtos e transfira para um deposito.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
