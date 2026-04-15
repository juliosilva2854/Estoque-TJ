import React, { useState, useEffect } from 'react';
import { productsAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', sku: '', description: '', category: '', unit: 'UN', min_stock: 0, cost_price: 0, sale_price: 0,
  });

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const filtered = products.filter(
      (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const loadData = async () => {
    try {
      const res = await productsAPI.getAll();
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch { toast.error('Erro ao carregar produtos'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productsAPI.update(editingId, formData);
        toast.success('Produto atualizado!');
      } else {
        await productsAPI.create(formData);
        toast.success('Produto criado!');
      }
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar produto');
    }
  };

  const handleEdit = (p) => {
    setFormData({
      name: p.name, sku: p.sku, description: p.description || '', category: p.category || '',
      unit: p.unit, min_stock: p.min_stock, cost_price: p.cost_price, sale_price: p.sale_price,
    });
    setEditingId(p.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await productsAPI.delete(id);
      toast.success('Produto excluido!');
      loadData();
    } catch { toast.error('Erro ao excluir produto'); }
  };

  const resetForm = () => {
    setFormData({ name: '', sku: '', description: '', category: '', unit: 'UN', min_stock: 0, cost_price: 0, sale_price: 0 });
    setEditingId(null);
  };

  if (loading) return <div className="p-8"><div className="animate-pulse"><div className="h-8 bg-zinc-200 rounded w-64 mb-4" /><div className="h-64 bg-zinc-200 rounded" /></div></div>;

  return (
    <div className="p-8" data-testid="products-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Produtos</h1>
          <p className="mt-2 text-zinc-600">Gerencie seu catalogo de produtos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-product-button" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editingId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Nome</label>
                  <Input data-testid="product-name-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">SKU</label>
                  <Input data-testid="product-sku-input" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} required disabled={!!editingId} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Descricao</label>
                <Input data-testid="product-description-input" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Categoria</label>
                  <Input data-testid="product-category-input" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Unidade</label>
                  <Input data-testid="product-unit-input" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Estoque Minimo</label>
                  <Input data-testid="product-min-stock-input" type="number" value={formData.min_stock} onChange={(e) => setFormData({...formData, min_stock: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Preco de Custo</label>
                  <Input data-testid="product-cost-input" type="number" step="0.01" value={formData.cost_price} onChange={(e) => setFormData({...formData, cost_price: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Preco de Venda</label>
                  <Input data-testid="product-sale-input" type="number" step="0.01" value={formData.sale_price} onChange={(e) => setFormData({...formData, sale_price: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              <Button data-testid="product-submit-button" type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {editingId ? 'Atualizar' : 'Criar'} Produto
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input data-testid="product-search-input" placeholder="Buscar por nome ou SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full" data-testid="products-table">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Categoria</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Est. Min.</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Custo</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Venda</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-zinc-50 transition-colors" data-testid={`product-row-${product.id}`}>
                <td className="px-6 py-4 text-sm font-mono text-zinc-800">{product.sku}</td>
                <td className="px-6 py-4 text-sm font-medium text-zinc-900">{product.name}</td>
                <td className="px-6 py-4 text-sm text-zinc-600">{product.category || '-'}</td>
                <td className="px-6 py-4 text-sm font-mono text-zinc-800 text-right">{product.min_stock}</td>
                <td className="px-6 py-4 text-sm font-mono text-zinc-800 text-right">R$ {product.cost_price.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm font-mono text-zinc-800 text-right">R$ {product.sale_price.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(product)} data-testid={`edit-product-${product.id}`} className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(product.id)} data-testid={`delete-product-${product.id}`} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
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
