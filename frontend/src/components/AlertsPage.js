import React, { useState, useEffect } from 'react';
import { alertsAPI, notificationsAPI, productsAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Bell, Mail, Smartphone, Settings, Plus, Trash2, CheckCheck, Package } from 'lucide-react';
import { toast } from 'sonner';

export const AlertsPage = () => {
  const [configs, setConfigs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [configForm, setConfigForm] = useState({ alert_type: 'stock_low', email_enabled: false, internal_enabled: true, mobile_enabled: false, email_address: '', phone_number: '' });
  const [stockForm, setStockForm] = useState({ productId: '', minStock: 0 });
  const notifColors = { info: 'bg-blue-100 text-blue-700', warning: 'bg-yellow-100 text-yellow-700', error: 'bg-red-100 text-red-700', success: 'bg-green-100 text-green-700' };
  const alertLabels = { stock_low: 'Estoque Baixo', invoice_pending: 'Nota Pendente' };

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try {
      const [c, n, p] = await Promise.all([alertsAPI.getConfigs(), notificationsAPI.getAll(), productsAPI.getAll()]);
      setConfigs(c.data); setNotifications(n.data); setProducts(p.data);
    } catch (err) {} finally { setLoading(false); }
  };
  const handleCreateConfig = async (e) => { e.preventDefault(); try { await alertsAPI.createConfig(configForm); toast.success('Configuracao criada!'); setConfigDialogOpen(false); loadData(); } catch (err) { toast.error('Erro'); } };
  const handleDeleteConfig = async (id) => { try { await alertsAPI.deleteConfig(id); toast.success('Removida!'); loadData(); } catch (err) { toast.error('Erro'); } };
  const handleToggle = async (id, field, val) => { try { await alertsAPI.updateConfig(id, { [field]: val }); loadData(); } catch (err) {} };
  const handleMarkRead = async (id) => { await notificationsAPI.markRead(id); loadData(); };
  const handleMarkAllRead = async () => { await notificationsAPI.markAllRead(); toast.success('Todas marcadas como lidas'); loadData(); };
  const handleSetMinStock = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.update(stockForm.productId, { min_stock: stockForm.minStock });
      toast.success('Estoque minimo configurado!');
      setStockDialogOpen(false); loadData();
    } catch (err) { toast.error('Erro ao configurar'); }
  };

  if (loading) return <div className="p-4 md:p-8">Carregando...</div>;
  return (
    <div className="p-4 md:p-8" data-testid="alerts-page">
      <div className="mb-6">
        <h1 className="text-2xl md:text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Alertas e Notificacoes</h1>
        <p className="mt-1 text-sm text-zinc-600">Configure alertas automaticos e veja suas notificacoes</p>
      </div>
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1" />Caixa de Entrada ({notifications.filter(n => !n.read).length})</TabsTrigger>
          <TabsTrigger value="config"><Settings className="h-4 w-4 mr-1" />Configuracoes</TabsTrigger>
          <TabsTrigger value="products"><Package className="h-4 w-4 mr-1" />Estoque Minimo</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200">
              <h2 className="text-lg font-semibold text-zinc-900">Caixa de Entrada</h2>
              <Button variant="outline" size="sm" onClick={handleMarkAllRead}><CheckCheck className="h-4 w-4 mr-1" />Marcar todas lidas</Button>
            </div>
            <div className="divide-y divide-zinc-100">
              {notifications.length === 0 ? <div className="p-8 text-center text-zinc-500">Nenhuma notificacao</div> :
                notifications.map(n => (
                  <div key={n.id} className={`p-4 flex items-start gap-3 ${!n.read ? 'bg-blue-50/50' : ''} hover:bg-zinc-50`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${notifColors[n.type]}`}><Bell className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900">{n.title}</p>
                      <p className="text-sm text-zinc-600 mt-0.5">{n.message}</p>
                      <p className="text-xs text-zinc-400 mt-1">{new Date(n.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                    {!n.read && <button onClick={() => handleMarkRead(n.id)} className="text-xs text-blue-600 hover:underline">Lida</button>}
                  </div>
                ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="config">
          <div className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-4 w-4 mr-2" />Nova Configuracao</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Nova Configuracao de Alerta</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreateConfig} className="space-y-4">
                    <div><label className="block text-sm font-medium text-zinc-700 mb-1">Tipo de Alerta</label>
                      <Select value={configForm.alert_type} onValueChange={v => setConfigForm({...configForm, alert_type: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="stock_low">Estoque Baixo</SelectItem><SelectItem value="invoice_pending">Nota Pendente</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3 p-4 bg-zinc-50 rounded-lg">
                      <h4 className="text-sm font-medium text-zinc-900">Canais de notificacao</h4>
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Bell className="h-4 w-4 text-zinc-600" /><span className="text-sm">Interna</span></div><Switch checked={configForm.internal_enabled} onCheckedChange={v => setConfigForm({...configForm, internal_enabled: v})} /></div>
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-zinc-600" /><span className="text-sm">Email</span></div><Switch checked={configForm.email_enabled} onCheckedChange={v => setConfigForm({...configForm, email_enabled: v})} /></div>
                      {configForm.email_enabled && <Input placeholder="Email" value={configForm.email_address} onChange={e => setConfigForm({...configForm, email_address: e.target.value})} />}
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-zinc-600" /><span className="text-sm">SMS</span></div><Switch checked={configForm.mobile_enabled} onCheckedChange={v => setConfigForm({...configForm, mobile_enabled: v})} /></div>
                      {configForm.mobile_enabled && <Input placeholder="Telefone" value={configForm.phone_number} onChange={e => setConfigForm({...configForm, phone_number: e.target.value})} />}
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Criar</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {configs.length === 0 ? <div className="col-span-2 bg-white rounded-xl border border-zinc-200 p-8 text-center text-zinc-500">Nenhuma configuracao. Crie uma para receber alertas automaticos quando o estoque atingir o minimo.</div> :
                configs.map(c => (
                  <div key={c.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{alertLabels[c.alert_type]}</span>
                      <button onClick={() => handleDeleteConfig(c.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between"><span className="text-sm text-zinc-600">Interna</span><Switch checked={c.internal_enabled} onCheckedChange={v => handleToggle(c.id, 'internal_enabled', v)} /></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-zinc-600">Email</span><Switch checked={c.email_enabled} onCheckedChange={v => handleToggle(c.id, 'email_enabled', v)} /></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-zinc-600">SMS</span><Switch checked={c.mobile_enabled} onCheckedChange={v => handleToggle(c.id, 'mobile_enabled', v)} /></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">Configurar Estoque Minimo por Produto</h2>
            <p className="text-sm text-zinc-600">Defina a quantidade minima de cada produto. Quando o estoque atingir esse valor, voce recebera uma notificacao automatica.</p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Produto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">SKU</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">Estoque Minimo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">Acao</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900">{p.name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-zinc-800">{p.sku}</td>
                    <td className="px-4 py-3 text-sm font-mono text-right text-zinc-800">{p.min_stock || 0}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setStockForm({ productId: p.id, minStock: p.min_stock || 0 }); setStockDialogOpen(true); }} className="text-xs text-blue-600 hover:underline">Configurar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Configurar Estoque Minimo</DialogTitle></DialogHeader>
              <form onSubmit={handleSetMinStock} className="space-y-4">
                <div><label className="block text-sm font-medium text-zinc-700 mb-1">Quantidade minima para alerta</label>
                  <Input type="number" min="0" value={stockForm.minStock} onChange={e => setStockForm({...stockForm, minStock: parseFloat(e.target.value) || 0})} required />
                </div>
                <p className="text-xs text-zinc-500">Quando o estoque deste produto ficar igual ou abaixo deste valor, uma notificacao sera enviada.</p>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};
