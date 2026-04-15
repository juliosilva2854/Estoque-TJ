import React, { useState, useEffect } from 'react';
import { ordersAPI, productsAPI, warehousesAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Trash2, ShoppingCart, FileText, ArrowRightCircle } from 'lucide-react';
import { toast } from 'sonner';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pedido');
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: '', customer_document: '', customer_email: '', customer_phone: '',
    payment_method: '', notes: '', valid_until: '', warehouse_id: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [ordersRes, productsRes, warehousesRes] = await Promise.all([
        ordersAPI.getAll(), productsAPI.getAll(), warehousesAPI.getAll()
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setWarehouses(warehousesRes.data);
    } catch { toast.error('Erro ao carregar dados'); }
    finally { setLoading(false); }
  };

  const addToCart = (product) => {
    const existing = cart.find(i => i.product_id === product.id);
    if (existing) {
      setCart(cart.map(i => i.product_id === product.id
        ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unit_price } : i));
    } else {
      setCart([...cart, { product_id: product.id, product_name: product.name, quantity: 1, unit_price: product.sale_price, total: product.sale_price }]);
    }
  };

  const removeFromCart = (pid) => setCart(cart.filter(i => i.product_id !== pid));

  const updateQty = (pid, qty) => {
    if (qty <= 0) { removeFromCart(pid); return; }
    setCart(cart.map(i => i.product_id === pid ? { ...i, quantity: qty, total: qty * i.unit_price } : i));
  };

  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const total = subtotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { toast.error('Adicione produtos'); return; }
    try {
      await ordersAPI.create({
        ...formData, items: cart, subtotal, discount: 0, total,
        type: activeTab, status: 'draft',
      });
      toast.success(`${activeTab === 'pedido' ? 'Pedido' : 'Orcamento'} criado!`);
      setDialogOpen(false);
      setCart([]);
      setFormData({ customer_name: '', customer_document: '', customer_email: '', customer_phone: '', payment_method: '', notes: '', valid_until: '', warehouse_id: '' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Erro ao criar'); }
  };

  const handleConvert = async (id) => {
    try {
      const res = await ordersAPI.convertToSale(id);
      toast.success(res.data.message);
      loadData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Erro ao converter'); }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await ordersAPI.update(id, { status });
      toast.success('Status atualizado!');
      loadData();
    } catch { toast.error('Erro ao atualizar'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este registro?')) return;
    try { await ordersAPI.delete(id); toast.success('Excluido!'); loadData(); }
    catch { toast.error('Erro ao excluir'); }
  };

  const statusColors = {
    draft: 'bg-zinc-100 text-zinc-700', confirmed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700', converted: 'bg-green-100 text-green-700',
  };
  const statusLabels = { draft: 'Rascunho', confirmed: 'Confirmado', cancelled: 'Cancelado', converted: 'Convertido' };

  const filteredOrders = (type) => orders.filter(o => o.type === type);

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8" data-testid="orders-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Pedidos e Orcamentos</h1>
          <p className="mt-2 text-zinc-600">Gerencie pedidos e orcamentos de clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-order-button" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Novo {activeTab === 'pedido' ? 'Pedido' : 'Orcamento'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button type="button" variant={activeTab === 'pedido' ? 'default' : 'outline'} onClick={() => setActiveTab('pedido')} className={activeTab === 'pedido' ? 'bg-blue-600 text-white' : ''}>
                  <ShoppingCart className="h-4 w-4 mr-2" />Pedido
                </Button>
                <Button type="button" variant={activeTab === 'orcamento' ? 'default' : 'outline'} onClick={() => setActiveTab('orcamento')} className={activeTab === 'orcamento' ? 'bg-blue-600 text-white' : ''}>
                  <FileText className="h-4 w-4 mr-2" />Orcamento
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-zinc-700 mb-1.5">Cliente</label>
                  <Input data-testid="order-customer-name" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} required /></div>
                <div><label className="block text-sm font-medium text-zinc-700 mb-1.5">CPF/CNPJ</label>
                  <Input value={formData.customer_document} onChange={e => setFormData({...formData, customer_document: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
                  <Input type="email" value={formData.customer_email} onChange={e => setFormData({...formData, customer_email: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-zinc-700 mb-1.5">Telefone</label>
                  <Input value={formData.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-zinc-700 mb-1.5">Deposito</label>
                  <Select value={formData.warehouse_id} onValueChange={v => setFormData({...formData, warehouse_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                  </Select></div>
                {activeTab === 'orcamento' && (
                  <div><label className="block text-sm font-medium text-zinc-700 mb-1.5">Valido ate</label>
                    <Input type="date" value={formData.valid_until} onChange={e => setFormData({...formData, valid_until: e.target.value})} /></div>
                )}
              </div>
              <div><label className="block text-sm font-medium text-zinc-700 mb-2">Adicionar Produtos</label>
                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 border border-zinc-200 rounded-lg">
                  {products.map(p => (
                    <button key={p.id} type="button" onClick={() => addToCart(p)} className="p-2 text-left border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
                      <p className="text-sm font-medium text-zinc-900 truncate">{p.name}</p>
                      <p className="text-xs text-zinc-600">R$ {p.sale_price.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              </div>
              {cart.length > 0 && (
                <div className="border border-zinc-200 rounded-lg p-4">
                  <h3 className="font-medium text-zinc-900 mb-3">Itens</h3>
                  {cart.map(item => (
                    <div key={item.product_id} className="flex items-center justify-between p-2 bg-zinc-50 rounded mb-1">
                      <div className="flex-1"><p className="text-sm font-medium">{item.product_name}</p></div>
                      <Input type="number" min="1" value={item.quantity} onChange={e => updateQty(item.product_id, parseInt(e.target.value) || 0)} className="w-20 mx-2" />
                      <p className="text-sm font-mono w-24 text-right">R$ {item.total.toFixed(2)}</p>
                      <button type="button" onClick={() => removeFromCart(item.product_id)} className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t flex justify-between text-lg font-semibold">
                    <span>Total:</span><span className="font-mono">R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              )}
              <div><label className="block text-sm font-medium text-zinc-700 mb-1.5">Observacoes</label>
                <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
              <Button data-testid="order-submit-button" type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Criar {activeTab === 'pedido' ? 'Pedido' : 'Orcamento'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pedido" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pedido" data-testid="tab-pedidos"><ShoppingCart className="h-4 w-4 mr-2" />Pedidos ({filteredOrders('pedido').length})</TabsTrigger>
          <TabsTrigger value="orcamento" data-testid="tab-orcamentos"><FileText className="h-4 w-4 mr-2" />Orcamentos ({filteredOrders('orcamento').length})</TabsTrigger>
        </TabsList>

        {['pedido', 'orcamento'].map(type => (
          <TabsContent key={type} value={type}>
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Numero</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Data</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Total</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredOrders(type).map(order => (
                    <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-zinc-800">{order.order_number}</td>
                      <td className="px-6 py-4 text-sm text-zinc-900">{order.customer_name}</td>
                      <td className="px-6 py-4 text-sm text-zinc-600">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 text-sm font-mono text-zinc-800 text-right">R$ {order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {order.status === 'draft' && (
                            <button onClick={() => handleUpdateStatus(order.id, 'confirmed')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium">Confirmar</button>
                          )}
                          {(order.status === 'draft' || order.status === 'confirmed') && (
                            <button onClick={() => handleConvert(order.id)} data-testid={`convert-order-${order.id}`} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Converter em venda">
                              <ArrowRightCircle className="h-4 w-4" />
                            </button>
                          )}
                          {order.status !== 'converted' && (
                            <button onClick={() => handleDelete(order.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
