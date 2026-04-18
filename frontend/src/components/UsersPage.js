import React, { useState, useEffect } from 'react';
import { usersAPI, authAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Plus, Pencil, Trash2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ email: '', name: '', password: '', role: 'usuario' });

  const getCurrentUser = () => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  };

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try { const res = await usersAPI.getAll(); setUsers(res.data); }
    catch (err) { toast.error('Erro ao carregar usuarios'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updateData = { name: formData.name, role: formData.role };
        if (formData.password) updateData.password = formData.password;
        await usersAPI.update(editingId, updateData);
        toast.success('Usuario atualizado!');
      } else {
        await authAPI.register(formData);
        toast.success('Usuario criado!');
      }
      setDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao salvar usuario');
    }
  };

  const handleEdit = (u) => {
    setFormData({ email: u.email, name: u.name, password: '', role: u.role });
    setEditingId(u.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este usuario?')) return;
    try { await usersAPI.delete(id); toast.success('Usuario excluido!'); loadUsers(); }
    catch (err) { toast.error(err.response?.data?.detail || 'Erro ao excluir'); }
  };

  const handleToggleActive = async (id, active) => {
    try { await usersAPI.update(id, { active: !active }); toast.success('Status atualizado!'); loadUsers(); }
    catch (err) { toast.error('Erro ao atualizar status'); }
  };

  const resetForm = () => { setFormData({ email: '', name: '', password: '', role: 'usuario' }); setEditingId(null); };

  const roleLabels = { dev: 'Desenvolvedor', master: 'Gerente', usuario: 'Operacional' };
  const roleColors = { dev: 'bg-red-100 text-red-700', master: 'bg-blue-100 text-blue-700', usuario: 'bg-zinc-100 text-zinc-700' };
  const cu = getCurrentUser();

  if (loading) return <div className="p-4 md:p-8">Carregando...</div>;

  return (
    <div className="p-4 md:p-8" data-testid="users-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Usuarios</h1>
          <p className="mt-1 text-sm text-zinc-600">Gerencie usuarios e permissoes do sistema</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-user-button" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />Novo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Editar Usuario' : 'Novo Usuario'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Nome</label>
                <Input data-testid="user-name-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
                <Input data-testid="user-email-input" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required disabled={!!editingId} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Senha {editingId ? '(vazio = nao alterar)' : ''}</label>
                <Input data-testid="user-password-input" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!editingId} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Nivel de Acesso</label>
                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                  <SelectTrigger data-testid="user-role-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">Desenvolvedor (Acesso Total)</SelectItem>
                    <SelectItem value="master">Gerente</SelectItem>
                    <SelectItem value="usuario">Operacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button data-testid="user-submit-button" type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {editingId ? 'Atualizar' : 'Criar'} Usuario
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[600px]" data-testid="users-table">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Nivel</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Ativo</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-50 transition-colors" data-testid={`user-row-${user.id}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <UserCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-zinc-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>{roleLabels[user.role]}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Switch checked={user.active} onCheckedChange={() => handleToggleActive(user.id, user.active)} disabled={user.id === cu.id} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(user)} className="p-1.5 text-zinc-600 hover:bg-zinc-100 rounded-lg"><Pencil className="h-4 w-4" /></button>
                    {user.id !== cu.id && cu.role === 'dev' && (
                      <button onClick={() => handleDelete(user.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                    )}
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
