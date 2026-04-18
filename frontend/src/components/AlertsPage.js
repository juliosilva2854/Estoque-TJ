import React, { useState, useEffect } from 'react';
import { alertsAPI, notificationsAPI, productsAPI, inventoryAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Bell, Settings, CheckCheck, Package } from 'lucide-react';
import { toast } from 'sonner';

export const AlertsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [stockForm, setStockForm] = useState({ productId: '', minStock: 0, productName: '' });
  const notifColors = { info: 'bg-blue-100 text-blue-700', warning: 'bg-yellow-100 text-yellow-700', error: 'bg-red-100 text-red-700', success: 'bg-green-100 text-green-700' };

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try {
      const [n, i] = await Promise.all([notificationsAPI.getAll(), inventoryAPI.getAll()]);
      setNotifications(n.data); setInventory(i.data);
      // Collect unique products from inventory
      const productMap = {};
      i.data.forEach(item => { if (!productMap[item.product_id]) productMap[item.product_id] = { id: item.product_id, name: item.product_name, min_stock: item.min_stock || 0, warehouses: [] }; productMap[item.product_id].warehouses.push({ warehouse: item.warehouse_name, qty: item.quantity }); });
      setProducts(Object.values(productMap));
    } catch (err) {} finally { setLoading(false); }
  };
  const handleMarkRead = async (id) => { await notificationsAPI.markRead(id); loadData(); };
  const handleMarkAllRead = async () => { await notificationsAPI.markAllRead(); toast.success('Todas marcadas como lidas'); loadData(); };
  const handleSetMinStock = async (e) => {
    e.preventDefault();
    try {
      // Update min_stock directly in all inventory entries for this product
      const items = inventory.filter(i => i.product_id === stockForm.productId);
      for (const item of items) {
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/inventory/adjust?product_id=${stockForm.productId}&warehouse_id=${item.warehouse_id}&quantity=0`, {
          method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      }
      // Use products API to update min_stock on product level
      const allProds = await (await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })).json();
      // Find by name match in products collection
      const prodMatch = allProds.find(p => p.id === stockForm.productId);
      // For inventory items, we update min_stock via the product
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products/${stockForm.productId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ min_stock: stockForm.minStock })
      });
      toast.success(`Estoque minimo de "${stockForm.productName}" configurado para ${stockForm.minStock}`);
      setStockDialogOpen(false); loadData();
    } catch (err) { toast.error('Erro ao configurar'); }
  };

  if (loading) return <div className="p-4 md:p-8">Carregando...</div>;
  return (
    <div className="p-4 md:p-8" data-testid="alerts-page">
      <div className="mb-6">
        <h1 className="text-2xl md:text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Alertas e Notificacoes</h1>
        <p className="mt-1 text-sm text-zinc-600">Notificacoes do sistema e configuracao de estoque minimo</p>
      </div>
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1" />Caixa de Entrada ({notifications.filter(n => !n.read).length})</TabsTrigger>
          <TabsTrigger value="stock"><Package className="h-4 w-4 mr-1" />Estoque Minimo</TabsTrigger>
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

        <TabsContent value="stock">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">Configurar Estoque Minimo</h2>
            <p className="text-sm text-zinc-600">Selecione um produto do estoque e defina a quantidade minima. Quando atingir esse valor, voce recebera uma notificacao automatica.</p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Produto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Depositos</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">Estoque Min.</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">Acao</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.length === 0 ? <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-500">Nenhum produto no estoque. Transfira produtos da aba Produtos primeiro.</td></tr> :
                  products.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-sm font-medium text-zinc-900">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{p.warehouses.map(w => `${w.warehouse} (${w.qty})`).join(', ')}</td>
                      <td className="px-4 py-3 text-sm font-mono text-right">{p.min_stock || 0}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setStockForm({ productId: p.id, minStock: p.min_stock || 0, productName: p.name }); setStockDialogOpen(true); }} className="text-xs text-blue-600 hover:underline font-medium">Configurar</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Configurar Estoque Minimo</DialogTitle></DialogHeader>
              <p className="text-sm text-zinc-600 mb-2">Produto: <strong>{stockForm.productName}</strong></p>
              <form onSubmit={handleSetMinStock} className="space-y-4">
                <div><label className="block text-sm font-medium text-zinc-700 mb-1">Quantidade minima para alerta</label>
                  <Input type="number" min="0" value={stockForm.minStock} onChange={e => setStockForm({...stockForm, minStock: parseFloat(e.target.value) || 0})} required />
                </div>
                <p className="text-xs text-zinc-500">Quando o estoque ficar igual ou abaixo deste valor, uma notificacao sera enviada.</p>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};
