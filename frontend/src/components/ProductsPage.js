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
  const [transferData, setTransferData] = useState({ 
    productId: '', 
    productName: '', 
    warehouseId: '', 
    quantity: 1, 
    sector: '', 
    maxQty: 0 
  });

  const loadData = async () => {
    try {
      const [pR, wR] = await Promise.all([productsAPI.getAll(), warehousesAPI.getAll()]);
      setProducts(pR.data || []); 
      setWarehouses(wR.data || []);
    } catch (err) { 
      toast.error('Erro ao conectar com o banco de dados'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    setFiltered(
      products
        .filter(p => (p.available_qty || 0) > 0)
        .filter(p => 
          p.name?.toLowerCase().includes(search.toLowerCase()) || 
          p.sku?.toLowerCase().includes(search.toLowerCase())
        )
    );
  }, [search, products]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferData.warehouseId) { toast.error('Selecione o depósito'); return; }
    try {
      const res = await productsAPI.transfer(transferData.productId, transferData.warehouseId, transferData.quantity, transferData.sector);
      toast.success(res.data.message || 'Transferência realizada');
      setTransferOpen(false);
      loadData();
    } catch (err) { 
      toast.error(err.response?.data?.detail || 'Erro na transferência'); 
    }
  };

  const openTransfer = (p) => {
    setTransferData({ 
      productId: p.id, productName: p.name, warehouseId: '', 
      quantity: p.available_qty || 0, sector: '', maxQty: p.available_qty || 0 
    });
    setTransferOpen(true);
  };

  const getSectors = (wid) => {
    const w = warehouses.find(x => x.id === wid);
    return w?.sectors || [];
  };

  if (loading) return <div className="p-8 text-center text-zinc-500">Carregando catálogo...</div>;

  return (
    <div className="p-4 md:p-8" data-testid="products-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold text-zinc-900 tracking-tight">Produtos</h1>
          <p className="mt-1 text-sm text-zinc-600">Importados das notas. Transfira para o estoque para dar entrada.</p>
        </div>
      </div>

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Transferir para Depósito</DialogTitle></DialogHeader>
          <form onSubmit={handleTransfer} className="space-y-4 pt-4">
            <div className="text-sm font-medium">Item: {transferData.productName}</div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Depósito Destino</label>
              <Select value={transferData.warehouseId} onValueChange={v => setTransferData({...transferData, warehouseId: v, sector: ''})}>
                <SelectTrigger><SelectValue placeholder="Selecione o depósito" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {transferData.warehouseId && getSectors(transferData.warehouseId).length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Setor</label>
                <Select value={transferData.sector} onValueChange={v => setTransferData({...transferData, sector: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
                  <SelectContent>
                    {getSectors(transferData.warehouseId).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantidade (Máx: {transferData.maxQty})</label>
              <Input type="number" value={transferData.quantity} onChange={e => setTransferData({...transferData, quantity: e.target.value})} required />
            </div>
            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">Confirmar Envio</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input placeholder="Buscar por SKU ou Nome..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 max-w-md" />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-zinc-500">SKU</th>
              <th className="p-4 font-semibold text-zinc-500">NOME</th>
              <th className="p-4 text-right font-semibold text-zinc-500">QTD</th>
              <th className="p-4 text-right font-semibold text-zinc-500">AÇÃO</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-zinc-50">
                <td className="p-4 font-mono">{p.sku}</td>
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-right">{p.available_qty}</td>
                <td className="p-4 text-right">
                  <Button onClick={() => openTransfer(p)} variant="outline" size="sm" className="text-blue-600 border-blue-200">
                    <ArrowRightLeft className="h-4 w-4 mr-2" /> Transferir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};