import React, { useState, useEffect } from 'react';
import { alertsAPI, notificationsAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Bell, Mail, Smartphone, Settings, Plus, Trash2, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

export const AlertsPage = () => {
  const [configs, setConfigs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configForm, setConfigForm] = useState({ alert_type: 'stock_low', email_enabled: false, internal_enabled: true, mobile_enabled: false, email_address: '', phone_number: '', threshold: 0 });
  const notifTypeColors = { info: 'bg-blue-100 text-blue-700', warning: 'bg-yellow-100 text-yellow-700', error: 'bg-red-100 text-red-700', success: 'bg-green-100 text-green-700' };
  const alertTypeLabels = { stock_low: 'Estoque Baixo', invoice_pending: 'Nota Pendente', sale_completed: 'Venda Concluida' };

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try { const [c, n] = await Promise.all([alertsAPI.getConfigs(), notificationsAPI.getAll()]); setConfigs(c.data); setNotifications(n.data); }
    catch {} finally { setLoading(false); }
  };
  const handleCreateConfig = async (e) => { e.preventDefault(); try { await alertsAPI.createConfig(configForm); toast.success('Configuracao criada!'); setConfigDialogOpen(false); loadData(); } catch { toast.error('Erro'); } };
  const handleDeleteConfig = async (id) => { try { await alertsAPI.deleteConfig(id); toast.success('Removida!'); loadData(); } catch { toast.error('Erro'); } };
  const handleToggleConfig = async (id, field, value) => { try { await alertsAPI.updateConfig(id, { [field]: value }); loadData(); } catch {} };
  const handleMarkRead = async (id) => { await notificationsAPI.markRead(id); loadData(); };
  const handleMarkAllRead = async () => { await notificationsAPI.markAllRead(); toast.success('Todas marcadas como lidas'); loadData(); };

  if (loading) return <div className="p-4 md:p-8">Carregando...</div>;
  return (
    <div className="p-4 md:p-8" data-testid="alerts-page">
      <div className="mb-6">
        <h1 className="text-2xl md:text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Alertas e Notificacoes</h1>
        <p className="mt-1 text-sm text-zinc-600">Configure alertas e veja suas notificacoes</p>
      </div>
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" data-testid="tab-notifications"><Bell className="h-4 w-4 mr-2" />Caixa de Entrada ({notifications.filter(n => !n.read).length})</TabsTrigger>
          <TabsTrigger value="config" data-testid="tab-config"><Settings className="h-4 w-4 mr-2" />Configuracoes</TabsTrigger>
        </TabsList>
        <TabsContent value="notifications">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200">
              <h2 className="text-lg font-semibold text-zinc-900">Caixa de Entrada</h2>
              <Button data-testid="mark-all-read-button" variant="outline" size="sm" onClick={handleMarkAllRead}><CheckCheck className="h-4 w-4 mr-1" />Marcar todas como lidas</Button>
            </div>
            <div className="divide-y divide-zinc-100">
              {notifications.length === 0 ? <div className="p-8 text-center text-zinc-500">Nenhuma notificacao</div> :
                notifications.map(n => (
                  <div key={n.id} data-testid={`notification-${n.id}`} className={`p-4 flex items-start gap-3 ${!n.read ? 'bg-blue-50/50' : ''} hover:bg-zinc-50 transition-colors`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${notifTypeColors[n.type]}`}><Bell className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900">{n.title}</p>
                      <p className="text-sm text-zinc-600 mt-0.5">{n.message}</p>
                      <p className="text-xs text-zinc-400 mt-1">{new Date(n.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                    {!n.read && <button onClick={() => handleMarkRead(n.id)} className="text-xs text-blue-600 hover:underline flex-shrink-0">Lida</button>}
                  </div>
                ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="config">
          <div className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                <DialogTrigger asChild><Button data-testid="add-alert-config-button" className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-4 w-4 mr-2" />Nova Configuracao</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Nova Configuracao de Alerta</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreateConfig} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Tipo de Alerta</label>
                      <Select value={configForm.alert_type} onValueChange={v => setConfigForm({...configForm, alert_type: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="stock_low">Estoque Baixo</SelectItem><SelectItem value="invoice_pending">Nota Fiscal Pendente</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3 p-4 bg-zinc-50 rounded-lg">
                      <h4 className="text-sm font-medium text-zinc-900">Canais</h4>
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Bell className="h-4 w-4 text-zinc-600" /><span className="text-sm">Interna</span></div><Switch checked={configForm.internal_enabled} onCheckedChange={v => setConfigForm({...configForm, internal_enabled: v})} /></div>
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-zinc-600" /><span className="text-sm">Email</span></div><Switch checked={configForm.email_enabled} onCheckedChange={v => setConfigForm({...configForm, email_enabled: v})} /></div>
                      {configForm.email_enabled && <Input placeholder="Email" value={configForm.email_address} onChange={e => setConfigForm({...configForm, email_address: e.target.value})} />}
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-zinc-600" /><span className="text-sm">SMS</span></div><Switch checked={configForm.mobile_enabled} onCheckedChange={v => setConfigForm({...configForm, mobile_enabled: v})} /></div>
                      {configForm.mobile_enabled && <Input placeholder="Telefone" value={configForm.phone_number} onChange={e => setConfigForm({...configForm, phone_number: e.target.value})} />}
                    </div>
                    <Button data-testid="alert-config-submit" type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Criar Configuracao</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {configs.length === 0 ? <div className="col-span-2 bg-white rounded-xl border border-zinc-200 p-8 text-center text-zinc-500">Nenhuma configuracao. Crie uma para receber alertas automaticos.</div> :
                configs.map(c => (
                  <div key={c.id} data-testid={`alert-config-${c.id}`} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{alertTypeLabels[c.alert_type]}</span>
                      <button onClick={() => handleDeleteConfig(c.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between"><span className="text-sm text-zinc-600 flex items-center gap-2"><Bell className="h-3 w-3" />Interna</span><Switch checked={c.internal_enabled} onCheckedChange={v => handleToggleConfig(c.id, 'internal_enabled', v)} /></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-zinc-600 flex items-center gap-2"><Mail className="h-3 w-3" />Email</span><Switch checked={c.email_enabled} onCheckedChange={v => handleToggleConfig(c.id, 'email_enabled', v)} /></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-zinc-600 flex items-center gap-2"><Smartphone className="h-3 w-3" />SMS</span><Switch checked={c.mobile_enabled} onCheckedChange={v => handleToggleConfig(c.id, 'mobile_enabled', v)} /></div>
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
