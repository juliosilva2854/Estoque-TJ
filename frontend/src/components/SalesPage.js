import React, { useState, useEffect } from 'react';
import { salesAPI, productsAPI, warehousesAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_document: '',
    payment_method: 'dinheiro',
    discount: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [salesRes, productsRes, warehousesRes] = await Promise.all([
        salesAPI.getAll(),
        productsAPI.getAll(),
        warehousesAPI.getAll(),
      ]);
      setSales(salesRes.data);
      setProducts(productsRes.data);
      setWarehouses(warehousesRes.data);
      if (warehousesRes.data.length > 0) {
        setSelectedWarehouse(warehousesRes.data[0].id);
      }
    } catch (error) {
      toast.error('Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.product_id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_price }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.sale_price,
          total: product.sale_price,
        },
      ]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.product_id === productId
          ? { ...item, quantity, total: quantity * item.unit_price }
          : item
      )
    );
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal - formData.discount;
    return { subtotal, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Adicione produtos à venda');
      return;
    }
    if (!selectedWarehouse) {
      toast.error('Selecione um depósito');
      return;
    }

    const { subtotal, total } = calculateTotal();

    try {
      await salesAPI.create({
        ...formData,
        warehouse_id: selectedWarehouse,
        items: cart,
        subtotal,
        total,
        status: 'completed',
        type: 'venda',
      });
      toast.success('Venda realizada com sucesso!');
      setDialogOpen(false);
      setCart([]);
      setFormData({
        customer_name: '',
        customer_document: '',
        payment_method: 'dinheiro',
        discount: 0,
      });
      loadData();
    } catch (error) {
      toast.error('Erro ao criar venda');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-200 rounded w-64 mb-4" />
          <div className="h-64 bg-zinc-200 rounded" />
        </div>
      </div>
    );
  }

  const { subtotal, total } = calculateTotal();

  return (
    <div className="p-8" data-testid="sales-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Vendas</h1>
          <p className="mt-2 text-zinc-600">Registre e gerencie suas vendas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-sale-button" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Venda</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Nome do Cliente</label>
                  <Input
                    data-testid="sale-customer-name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">CPF/CNPJ</label>
                  <Input
                    data-testid="sale-customer-doc"
                    value={formData.customer_document}
                    onChange={(e) => setFormData({ ...formData, customer_document: e.target.value })}
                  />
                </div>
              </div>

              {/* Warehouse */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Depósito</label>
                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                  <SelectTrigger data-testid="sale-warehouse-select">
                    <SelectValue placeholder="Selecione o depósito" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Products */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Adicionar Produtos</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-zinc-200 rounded-lg">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addToCart(product)}
                      className="p-3 text-left border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-zinc-900">{product.name}</p>
                      <p className="text-xs text-zinc-600">R$ {product.sale_price.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cart */}
              {cart.length > 0 && (
                <div className="border border-zinc-200 rounded-lg p-4">
                  <h3 className="font-medium text-zinc-900 mb-3">Itens da Venda</h3>
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.product_id} className="flex items-center justify-between p-2 bg-zinc-50 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-zinc-900">{item.product_name}</p>
                          <p className="text-xs text-zinc-600">R$ {item.unit_price.toFixed(2)} x {item.quantity}</p>
                        </div>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value))}
                          className="w-20 mx-2"
                        />
                        <p className="text-sm font-mono font-medium text-zinc-900 w-24 text-right">
                          R$ {item.total.toFixed(2)}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product_id)}
                          className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">Subtotal:</span>
                      <span className="font-mono font-medium text-zinc-900">R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-600">Desconto:</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                        className="w-32"
                      />
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-zinc-900">Total:</span>
                      <span className="font-mono text-zinc-900">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Forma de Pagamento</label>
                <Select value={formData.payment_method} onValueChange={(val) => setFormData({ ...formData, payment_method: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button data-testid="sale-submit-button" type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Finalizar Venda
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full" data-testid="sales-table">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Data
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Pagamento
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-zinc-50 transition-colors" data-testid={`sale-row-${sale.id}`}>
                <td className="px-6 py-4 text-sm font-mono text-zinc-800">{sale.sale_number}</td>
                <td className="px-6 py-4 text-sm text-zinc-900">{sale.customer_name || '-'}</td>
                <td className="px-6 py-4 text-sm text-zinc-600">
                  {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-sm font-mono text-zinc-800 text-right">R$ {sale.total.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-zinc-600 capitalize">{sale.payment_method.replace('_', ' ')}</td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sale.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : sale.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {sale.status === 'completed' ? 'Concluída' : sale.status === 'pending' ? 'Pendente' : 'Cancelada'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};