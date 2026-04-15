import React, { useState, useEffect } from 'react';
import { alertsAPI, notificationsAPI, usersAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Bell, Mail, Smartphone, Settings, Plus, Trash2, Send, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

export const AlertsPage = () => {
  const [configs, setConfigs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [configForm, setConfigForm] = useState({
    alert_type: 'stock_low',
    email_enabled: false,
    internal_enabled: true,
    mobile_enabled: false,
    email_address: '',
    phone_number: '',
    threshold: 0,
  });
  const [sendForm, setSendForm] = useState({ user_id: '', title: '', message: '', type: 'info' });
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [configsRes, notifsRes] = await Promise.all([
        alertsAPI.getConfigs(),
        notificationsAPI.getAll(),
      ]);
      setConfigs(configsRes.data);
      setNotifications(notifsRes.data);
      if (['dev', 'master'].includes(currentUser.role)) {
        const usersRes = await usersAPI.getAll();
        setUsers(usersRes.data);
      }
    } catch { toast.error('Erro ao carregar dados'); }
    finally { setLoading(false); }
  };

  const handleCreateConfig = async (e) => {
    e.preventDefault();
    try {
      await alertsAPI.createConfig(configForm);
      toast.success('Configuracao de alerta criada!');
      setConfigDialogOpen(false);
      setConfigForm({ alert_type: 'stock_low', email_enabled: false, internal_enabled: true, mobile_enabled: false, email_address: '', phone_number: '', threshold: 0 });
      loadData();
    } catch { toast.error('Erro ao criar configuracao'); }
  };

  const handleDeleteConfig = async (id) => {
    try {
      await alertsAPI.deleteConfig(id);
      toast.success('Configuracao removida!');
      loadData();
    } catch { toast.error('Erro ao remover'); }
  };

  const handleToggleConfig = async (id, field, value) => {
    try {
      await alertsAPI.updateConfig(id, { [field]: value });
      loadData();
    } catch { toast.error('Erro ao atualizar'); }
  };

  const handleCheckStock = async () => {
    try {
      const res = await alertsAPI.checkStock();
      toast.success(res.data.message);
      loadData();
    } catch { toast.error('Erro ao verificar estoque'); }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      await notificationsAPI.send(sendForm);
      toast.success('Notificacao enviada!');
      setSendDialogOpen(false);
      setSendForm({ user_id: '', title: '', message: '', type: 'info' });
      loadData();
    } catch { toast.error('Erro ao enviar notificacao'); }
  };

  const handleMarkRead = async (id) => {
    await notificationsAPI.markRead(id);
    loadData();
  };

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllRead();
    toast.success('Todas notificacoes marcadas como lidas');
    loadData();
  };

  const alertTypeLabels = { stock_low: 'Estoque Baixo', invoice_pending: 'Nota Pendente', sale_completed: 'Venda Concluida' };
  const notifTypeColors = { info: 'bg-blue-100 text-blue-700', warning: 'bg-yellow-100 text-yellow-700', error: 'bg-red-100 text-red-700', success: 'bg-green-100 text-green-700' };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8" data-testid="alerts-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Alertas e Notificacoes</h1>
          <p className="mt-2 text-zinc-600">Configure alertas e veja suas notificacoes</p>
        </div>
        <div className="flex gap-2">
          {['dev', 'master'].includes(currentUser.role) && (
            <>
              <Button data-testid="check-stock-button" onClick={handleCheckStock} variant="outline">
                <Bell className="h-4 w-4 mr-2" />Verificar Estoque
              </Button>
              <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="send-notification-button" variant="outline">
                    <Send className="h-4 w-4 mr-2" />Enviar Notificacao
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Enviar Notificacao</DialogTitle></DialogHeader>
                  <form onSubmit={handleSendNotification} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Usuario</label>
                      <Select value={sendForm.user_id} onValueChange={(val) => setSendForm({...sendForm, user_id: val})}>
                        <SelectTrigger data-testid="notif-user-select"><SelectValue placeholder="Selecione o usuario" /></SelectTrigger>
                        <SelectContent>
                          {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Titulo</label>
                      <Input data-testid="notif-title-input" value={sendForm.title} onChange={(e) => setSendForm({...sendForm, title: e.target.value})} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Mensagem</label>
                      <Input data-testid="notif-message-input" value={sendForm.message} onChange={(e) => setSendForm({...sendForm, message: e.target.value})} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Tipo</label>
                      <Select value={sendForm.type} onValueChange={(val) => setSendForm({...sendForm, type: val})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Aviso</SelectItem>
                          <SelectItem value="error">Erro</SelectItem>
                          <SelectItem value="success">Sucesso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button data-testid="send-notif-submit" type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Enviar</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="h-4 w-4 mr-2" />Notificacoes ({notifications.filter(n => !n.read).length})
          </TabsTrigger>
          <TabsTrigger value="config" data-testid="tab-config">
            <Settings className="h-4 w-4 mr-2" />Configuracoes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200">
              <h2 className="text-lg font-semibold text-zinc-900">Suas Notificacoes</h2>
              <Button data-testid="mark-all-read-button" variant="outline" size="sm" onClick={handleMarkAllRead}>
                <CheckCheck className="h-4 w-4 mr-1" />Marcar todas como lidas
              </Button>
            </div>
            <div className="divide-y divide-zinc-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">Nenhuma notificacao</div>
              ) : notifications.map(n => (
                <div key={n.id} data-testid={`notification-${n.id}`} className={`p-4 flex items-start gap-4 ${!n.read ? 'bg-blue-50/50' : ''} hover:bg-zinc-50 transition-colors`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${notifTypeColors[n.type]}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900">{n.title}</p>
                    <p className="text-sm text-zinc-600 mt-0.5">{n.message}</p>
                    <p className="text-xs text-zinc-400 mt-1">{new Date(n.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  {!n.read && (
                    <button onClick={() => handleMarkRead(n.id)} className="text-xs text-blue-600 hover:underline flex-shrink-0">Marcar lida</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="config">
          <div className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="add-alert-config-button" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />Nova Configuracao
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Nova Configuracao de Alerta</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreateConfig} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Tipo de Alerta</label>
                      <Select value={configForm.alert_type} onValueChange={(val) => setConfigForm({...configForm, alert_type: val})}>
                        <SelectTrigger data-testid="alert-type-select"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stock_low">Estoque Baixo</SelectItem>
                          <SelectItem value="invoice_pending">Nota Fiscal Pendente</SelectItem>
                          <SelectItem value="sale_completed">Venda Concluida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3 p-4 bg-zinc-50 rounded-lg">
                      <h4 className="text-sm font-medium text-zinc-900">Canais de Notificacao</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-zinc-600" /><span className="text-sm">Notificacao Interna</span></div>
                        <Switch checked={configForm.internal_enabled} onCheckedChange={(val) => setConfigForm({...configForm, internal_enabled: val})} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-zinc-600" /><span className="text-sm">Email</span></div>
                        <Switch checked={configForm.email_enabled} onCheckedChange={(val) => setConfigForm({...configForm, email_enabled: val})} />
                      </div>
                      {configForm.email_enabled && (
                        <Input placeholder="Email para alerta" value={configForm.email_address} onChange={(e) => setConfigForm({...configForm, email_address: e.target.value})} />
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-zinc-600" /><span className="text-sm">SMS/Mobile</span></div>
                        <Switch checked={configForm.mobile_enabled} onCheckedChange={(val) => setConfigForm({...configForm, mobile_enabled: val})} />
                      </div>
                      {configForm.mobile_enabled && (
                        <Input placeholder="Numero de telefone" value={configForm.phone_number} onChange={(e) => setConfigForm({...configForm, phone_number: e.target.value})} />
                      )}
                    </div>
                    <Button data-testid="alert-config-submit" type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Criar Configuracao</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {configs.length === 0 ? (
                <div className="col-span-2 bg-white rounded-xl border border-zinc-200 p-8 text-center text-zinc-500">
                  Nenhuma configuracao de alerta. Crie uma para comecar a receber notificacoes.
                </div>
              ) : configs.map(config => (
                <div key={config.id} data-testid={`alert-config-${config.id}`} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {alertTypeLabels[config.alert_type]}
                    </span>
                    <button onClick={() => handleDeleteConfig(config.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 flex items-center gap-2"><Bell className="h-3 w-3" />Interna</span>
                      <Switch checked={config.internal_enabled} onCheckedChange={(val) => handleToggleConfig(config.id, 'internal_enabled', val)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 flex items-center gap-2"><Mail className="h-3 w-3" />Email</span>
                      <Switch checked={config.email_enabled} onCheckedChange={(val) => handleToggleConfig(config.id, 'email_enabled', val)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 flex items-center gap-2"><Smartphone className="h-3 w-3" />Mobile</span>
                      <Switch checked={config.mobile_enabled} onCheckedChange={(val) => handleToggleConfig(config.id, 'mobile_enabled', val)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
