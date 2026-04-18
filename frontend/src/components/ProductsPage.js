import React, { useState, useEffect } from 'react';
import { productsAPI, warehousesAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Search, Pencil, Trash2, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', sku: '', description: '', category: '', unit: 'UN', cost_price: 0 });
  const [transferData, setTransferData] = useState({ productId: '', productName: '', warehouseId: '', quantity: 1 });

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    setFiltered(products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())));
  }, [search, products]);

  const loadData = async () => {
    try {
      const [pR, wR] = await Promise.all([productsAPI.getAll(), warehousesAPI.getAll()]);
      setProducts(pR.data); setFiltered(pR.data); setWarehouses(wR.data);
    } catch (err) { toast.error('Erro ao carregar dados'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, min_stock: 0, sale_price: formData.cost_price };
      if (editingId) { await productsAPI.update(editingId, data); toast.success('Produto atualizado!'); }
      else { await productsAPI.create(data); toast.success('Produto criado!'); }
      setDialogOpen(false); resetForm(); loadData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Erro ao salvar'); }
  };

  const handleEdit = (p) => {
    setFormData({ name: p.name, sku: p.sku, description: p.description || '', category: p.category || '', unit: p.unit, cost_price: p.cost_price });
    setEditingId(p.id); setDialogOpen(true);
  };

  const handleDelete = async (id) => { if (!window.confirm('Excluir este produto?')) return; try { await productsAPI.delete(id); toast.success('Excluido!'); loadData(); } catch (err) { toast.error('Erro'); } };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferData.warehouseId) { toast.error('Selecione o deposito'); return; }
    try {
      const res = await productsAPI.transfer(transferData.productId, transferData.warehouseId, transferData.quantity);
      toast.success(res.data.message); setTransferOpen(false); loadData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Erro na transferencia'); }
  };

  const openTransfer = (p) => { setTransferData({ productId: p.id, productName: p.name, warehouseId: '', quantity: 1 }); setTransferOpen(true); };
  const resetForm = () => { setFormData({ name: '', sku: '', description: '', category: '', unit: 'UN', cost_price: 0 }); setEditingId(null); };

  if (loading) return <div className="p-4 md:p-8"><div className="animate-pulse"><div className="h-8 bg-zinc-200 rounded w-64 mb-4" /><div className="h-64 bg-zinc-200 rounded" /></div></div>;

  return (
    <div className="p-4 md:p-8" data-testid="products-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Produtos</h1>
          <p className="mt-1 text-sm text-zinc-600">Gerencie o catalogo de produtos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button data-testid="add-product-button" className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-4 w-4 mr-2" />Novo Produto</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-zinc-700 mb-1">Nome</label><Input data-testid="product-name-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                <div><label className="block text-sm font-medium text-zinc-700 mb-1">SKU</label><Input data-testid="product-sku-input" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required disabled={!!editingId} /></div>
              </div>
              <div><label className="block text-sm font-medium text-zinc-700 mb-1">Descricao</label><Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-zinc-700 mb-1">Categoria</label><Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-zinc-700 mb-1">Unidade</label><Input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-zinc-700 mb-1">Custo (R$)</label><Input type="number" step="0.01" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: parseFloat(e.target.value) || 0})} /></div>
              </div>
              <Button data-testid="product-submit-button" type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">{editingId ? 'Atualizar' : 'Criar'} Produto</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transferencia Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Transferir para Deposito</DialogTitle></DialogHeader>
          <p className="text-sm text-zinc-600 mb-4">Produto: <strong>{transferData.productName}</strong></p>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Deposito</label>
              <Select value={transferData.warehouseId} onValueChange={v => setTransferData({...transferData, warehouseId: v})}>
                <SelectTrigger><SelectValue placeholder="Selecione o deposito" /></SelectTrigger>
                <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Quantidade</label>
              <Input type="number" min="1" value={transferData.quantity} onChange={e => setTransferData({...transferData, quantity: parseFloat(e.target.value) || 0})} required />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Transferir</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mb-4 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" /><Input placeholder="Buscar por nome ou SKU..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[550px]" data-testid="products-table">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Categoria</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Custo</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3 text-sm font-mono text-zinc-800">{p.sku}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-900">{p.name}</td>
                <td className="px-4 py-3 text-sm text-zinc-600">{p.category || '-'}</td>
                <td className="px-4 py-3 text-sm font-mono text-zinc-800 text-right">R$ {p.cost_price.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openTransfer(p)} title="Transferir para deposito" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><ArrowRightLeft className="h-4 w-4" /></button>
                    <button onClick={() => handleEdit(p)} title="Editar" className="p-1.5 text-zinc-600 hover:bg-zinc-100 rounded-lg"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(p.id)} title="Excluir" className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
