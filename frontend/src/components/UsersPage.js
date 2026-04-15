import React, { useState, useEffect } from 'react';
import { usersAPI, authAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Plus, Pencil, Trash2, Shield, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ email: '', name: '', password: '', role: 'usuario' });
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data);
    } catch { toast.error('Erro ao carregar usuarios'); }
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
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar usuario');
    }
  };

  const handleEdit = (u) => {
    setFormData({ email: u.email, name: u.name, password: '', role: u.role });
    setEditingId(u.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuario?')) return;
    try {
      await usersAPI.delete(id);
      toast.success('Usuario excluido!');
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao excluir');
    }
  };

  const handleToggleActive = async (id, active) => {
    try {
      await usersAPI.update(id, { active: !active });
      toast.success(`Usuario ${!active ? 'ativado' : 'desativado'}!`);
      loadUsers();
    } catch { toast.error('Erro ao atualizar status'); }
  };

  const resetForm = () => {
    setFormData({ email: '', name: '', password: '', role: 'usuario' });
    setEditingId(null);
  };

  const roleLabels = { dev: 'Dev (Acesso Total)', master: 'Master (Gerente)', usuario: 'Usuario' };
  const roleColors = { dev: 'bg-red-100 text-red-700', master: 'bg-blue-100 text-blue-700', usuario: 'bg-zinc-100 text-zinc-700' };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8" data-testid="users-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Gestao de Usuarios</h1>
          <p className="mt-2 text-zinc-600">Gerencie usuarios, permissoes e acessos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
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
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Senha {editingId && '(deixe vazio para nao alterar)'}</label>
                <Input data-testid="user-password-input" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!editingId} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Nivel de Acesso</label>
                <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                  <SelectTrigger data-testid="user-role-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">Dev (Acesso Total)</SelectItem>
                    <SelectItem value="master">Master (Gerente)</SelectItem>
                    <SelectItem value="usuario">Usuario</SelectItem>
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

      {/* Role Legend */}
      <div className="flex gap-4 mb-6">
        {Object.entries(roleLabels).map(([role, label]) => (
          <div key={role} className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-zinc-400" />
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role]}`}>{label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full" data-testid="users-table">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Nivel</th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Ativo</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-50 transition-colors" data-testid={`user-row-${user.id}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-zinc-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${roleColors[user.role]}`}>{user.role}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <Switch
                    checked={user.active}
                    onCheckedChange={() => handleToggleActive(user.id, user.active)}
                    disabled={user.id === currentUser.id}
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(user)} data-testid={`edit-user-${user.id}`} className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    {user.id !== currentUser.id && currentUser.role === 'dev' && (
                      <button onClick={() => handleDelete(user.id)} data-testid={`delete-user-${user.id}`} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
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
