import React, { useState, useEffect } from 'react';
import { suppliersAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', cnpj: '', contact: '', email: '', phone: '', address: '' });

  useEffect(() => { loadSuppliers(); }, []);

  useEffect(() => {
    const f = suppliers.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.cnpj.includes(searchTerm)
    );
    setFiltered(f);
  }, [searchTerm, suppliers]);

  const loadSuppliers = async () => {
    try {
      const res = await suppliersAPI.getAll();
      setSuppliers(res.data);
      setFiltered(res.data);
    } catch { toast.error('Erro ao carregar fornecedores'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await suppliersAPI.update(editingId, formData);
        toast.success('Fornecedor atualizado!');
      } else {
        await suppliersAPI.create(formData);
        toast.success('Fornecedor criado!');
      }
      setDialogOpen(false);
      resetForm();
      loadSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar fornecedor');
    }
  };

  const handleEdit = (s) => {
    setFormData({ name: s.name, cnpj: s.cnpj, contact: s.contact || '', email: s.email || '', phone: s.phone || '', address: s.address || '' });
    setEditingId(s.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este fornecedor?')) return;
    try {
      await suppliersAPI.delete(id);
      toast.success('Fornecedor excluido!');
      loadSuppliers();
    } catch { toast.error('Erro ao excluir fornecedor'); }
  };

  const resetForm = () => {
    setFormData({ name: '', cnpj: '', contact: '', email: '', phone: '', address: '' });
    setEditingId(null);
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8" data-testid="suppliers-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Fornecedores</h1>
          <p className="mt-2 text-zinc-600">Gerencie seus fornecedores</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-supplier-button" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Nome</label>
                  <Input data-testid="supplier-name-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">CNPJ</label>
                  <Input data-testid="supplier-cnpj-input" value={formData.cnpj} onChange={(e) => setFormData({...formData, cnpj: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
                  <Input data-testid="supplier-email-input" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Telefone</label>
                  <Input data-testid="supplier-phone-input" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Contato</label>
                <Input data-testid="supplier-contact-input" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Endereco</label>
                <Input data-testid="supplier-address-input" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
              <Button data-testid="supplier-submit-button" type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {editingId ? 'Atualizar' : 'Criar'} Fornecedor
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input data-testid="supplier-search-input" placeholder="Buscar por nome ou CNPJ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full" data-testid="suppliers-table">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">CNPJ</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Telefone</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-zinc-50 transition-colors" data-testid={`supplier-row-${supplier.id}`}>
                <td className="px-6 py-4 text-sm font-medium text-zinc-900">{supplier.name}</td>
                <td className="px-6 py-4 text-sm font-mono text-zinc-800">{supplier.cnpj}</td>
                <td className="px-6 py-4 text-sm text-zinc-600">{supplier.email || '-'}</td>
                <td className="px-6 py-4 text-sm text-zinc-600">{supplier.phone || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(supplier)} data-testid={`edit-supplier-${supplier.id}`} className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(supplier.id)} data-testid={`delete-supplier-${supplier.id}`} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
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
