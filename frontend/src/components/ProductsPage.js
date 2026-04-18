import React, { useState, useEffect } from 'react';
import { productsAPI, warehousesAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [transferOpen, setTransferOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transferData, setTransferData] = useState({ productId: '', productName: '', warehouseId: '', quantity: 1, sector: '', maxQty: 0 });

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    setFiltered(products.filter(p => (p.available_qty || 0) > 0).filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())));
  }, [search, products]);

  const loadData = async () => {
    try {
      const [pR, wR] = await Promise.all([productsAPI.getAll(), warehousesAPI.getAll()]);
      setProducts(pR.data); setWarehouses(wR.data);
    } catch (err) { toast.error('Erro ao carregar'); } finally { setLoading(false); }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferData.warehouseId) { toast.error('Selecione o deposito'); return; }
    if (transferData.quantity <= 0 || transferData.quantity > transferData.maxQty) { toast.error(`Quantidade deve ser entre 1 e ${transferData.maxQty}`); return; }
    try {
      const res = await productsAPI.transfer(transferData.productId, transferData.warehouseId, transferData.quantity, transferData.sector);
      toast.success(res.data.message);
      setTransferOpen(false);
      loadData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Erro na transferencia'); }
  };

  const openTransfer = (p) => {
    setTransferData({ productId: p.id, productName: p.name, warehouseId: '', quantity: p.available_qty || 0, sector: '', maxQty: p.available_qty || 0 });
    setTransferOpen(true);
  };

  const getSectors = (wid) => {
    const w = warehouses.find(x => x.id === wid);
    return w?.sectors || [];
  };

  if (loading) return <div className="p-4 md:p-8"><div className="animate-pulse"><div className="h-8 bg-zinc-200 rounded w-64 mb-4" /><div className="h-64 bg-zinc-200 rounded" /></div></div>;

  return (
    <div className="p-4 md:p-8" data-testid="products-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Produtos</h1>
          <p className="mt-1 text-sm text-zinc-600">Produtos importados das notas fiscais. Transfira para o deposito desejado.</p>
        </div>
      </div>

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Transferir para Deposito</DialogTitle></DialogHeader>
          <p className="text-sm text-zinc-600 mb-2">Produto: <strong>{transferData.productName}</strong></p>
          <p className="text-sm text-zinc-500 mb-4">Disponivel: {transferData.maxQty} unidades</p>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Deposito</label>
              <Select value={transferData.warehouseId} onValueChange={v => setTransferData({...transferData, warehouseId: v, sector: ''})}>
                <SelectTrigger><SelectValue placeholder="Selecione o deposito" /></SelectTrigger>
                <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {transferData.warehouseId && getSectors(transferData.warehouseId).length > 0 && (
              <div><label className="block text-sm font-medium text-zinc-700 mb-1">Setor</label>
                <Select value={transferData.sector} onValueChange={v => setTransferData({...transferData, sector: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
                  <SelectContent>{getSectors(transferData.warehouseId).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Quantidade</label>
              <Input type="number" min="1" max={transferData.maxQty} value={transferData.quantity} onChange={e => setTransferData({...transferData, quantity: parseFloat(e.target.value) || 0})} required />
            </div>
            <p className="text-xs text-zinc-500">Ao transferir toda a quantidade, o produto sera removido desta aba e ficara apenas no estoque.</p>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Transferir para Deposito</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mb-4 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" /><Input placeholder="Buscar por nome ou SKU..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8 text-center text-zinc-500">
          Nenhum produto pendente de transferencia. Importe uma nota fiscal e processe os itens para ver os produtos aqui.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[500px]" data-testid="products-table">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Nome</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Custo Unit.</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Qtd Disponivel</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Acao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-zinc-800">{p.sku}</td>
                  <td className="px-4 py-3 text-sm font-medium text-zinc-900">{p.name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-zinc-800 text-right">R$ {p.cost_price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-mono text-zinc-800 text-right font-semibold">{p.available_qty || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <Button onClick={() => openTransfer(p)} size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                      <ArrowRightLeft className="h-4 w-4 mr-1" />Transferir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
