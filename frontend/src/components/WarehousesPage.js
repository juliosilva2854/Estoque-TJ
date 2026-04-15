import React, { useState, useEffect } from 'react';
import { warehousesAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Pencil, Trash2, Warehouse } from 'lucide-react';
import { toast } from 'sonner';

export const WarehousesPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', location: '', description: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await warehousesAPI.getAll();
      setWarehouses(res.data);
    } catch { toast.error('Erro ao carregar depositos'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await warehousesAPI.update(editingId, formData);
        toast.success('Deposito atualizado!');
      } else {
        await warehousesAPI.create(formData);
        toast.success('Deposito criado!');
      }
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar deposito');
    }
  };

  const handleEdit = (w) => {
    setFormData({ name: w.name, location: w.location, description: w.description || '' });
    setEditingId(w.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este deposito?')) return;
    try {
      await warehousesAPI.delete(id);
      toast.success('Deposito excluido!');
      loadData();
    } catch { toast.error('Erro ao excluir deposito'); }
  };

  const resetForm = () => {
    setFormData({ name: '', location: '', description: '' });
    setEditingId(null);
  };

  if (loading) return <div className="p-8"><div className="animate-pulse"><div className="h-8 bg-zinc-200 rounded w-64 mb-4" /><div className="h-64 bg-zinc-200 rounded" /></div></div>;

  return (
    <div className="p-8" data-testid="warehouses-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Depositos</h1>
          <p className="mt-2 text-zinc-600">Gerencie seus locais de armazenamento</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-warehouse-button" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />Novo Deposito
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Deposito' : 'Novo Deposito'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Nome</label>
                <Input data-testid="warehouse-name-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Localidade</label>
                <Input data-testid="warehouse-location-input" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Descricao</label>
                <Input data-testid="warehouse-description-input" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <Button data-testid="warehouse-submit-button" type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {editingId ? 'Atualizar' : 'Criar'} Deposito
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((w) => (
          <div key={w.id} data-testid={`warehouse-card-${w.id}`} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Warehouse className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(w)} data-testid={`edit-warehouse-${w.id}`} className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(w.id)} data-testid={`delete-warehouse-${w.id}`} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">{w.name}</h3>
            <p className="text-sm text-zinc-600 mt-1">{w.location}</p>
            {w.description && <p className="text-sm text-zinc-500 mt-2">{w.description}</p>}
            <div className="mt-4 pt-3 border-t border-zinc-100">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${w.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {w.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
