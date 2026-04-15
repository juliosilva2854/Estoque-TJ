import React, { useState, useEffect } from 'react';
import { invoicesAPI, suppliersAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, FileText, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('manual');
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [formData, setFormData] = useState({
    invoice_number: '',
    supplier_name: '',
    issue_date: '',
    total_value: 0,
    tax_value: 0,
    items: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesRes, suppliersRes] = await Promise.all([
        invoicesAPI.getAll(),
        suppliersAPI.getAll(),
      ]);
      setInvoices(invoicesRes.data);
      setSuppliers(suppliersRes.data);
    } catch (error) {
      toast.error('Erro ao carregar notas fiscais');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOcrProcessing(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1];
      try {
        const res = await invoicesAPI.processOCR(base64);
        setOcrData(res.data);
        setFormData({
          invoice_number: res.data.invoice_number || '',
          supplier_name: res.data.supplier_name || '',
          issue_date: res.data.issue_date || '',
          total_value: res.data.total_value || 0,
          tax_value: res.data.tax_value || 0,
          items: res.data.items || [],
        });
        toast.success('Nota fiscal processada com sucesso!');
        setActiveTab('manual');
      } catch (error) {
        toast.error('Erro ao processar imagem');
      } finally {
        setOcrProcessing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await invoicesAPI.create({
        ...formData,
        status: 'processed',
        type: 'entrada',
      });
      toast.success('Nota fiscal criada com sucesso!');
      setDialogOpen(false);
      setFormData({
        invoice_number: '',
        supplier_name: '',
        issue_date: '',
        total_value: 0,
        tax_value: 0,
        items: [],
      });
      setOcrData(null);
      loadData();
    } catch (error) {
      toast.error('Erro ao criar nota fiscal');
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

  return (
    <div className="p-8" data-testid="invoices-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold font-primary text-zinc-900 tracking-tight">
            Notas Fiscais
          </h1>
          <p className="mt-2 text-zinc-600">Gerencie suas notas fiscais de entrada</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-invoice-button" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nova Nota Fiscal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Nota Fiscal</DialogTitle>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ocr" data-testid="ocr-tab">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  OCR / Imagem
                </TabsTrigger>
                <TabsTrigger value="manual" data-testid="manual-tab">
                  <FileText className="h-4 w-4 mr-2" />
                  Entrada Manual
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ocr" className="space-y-4">
                <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
                  <p className="text-sm text-zinc-600 mb-4">
                    Faça upload de uma imagem da nota fiscal para extração automática
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    data-testid="invoice-image-upload"
                    className="hidden"
                    id="invoice-upload"
                    disabled={ocrProcessing}
                  />
                  <label htmlFor="invoice-upload">
                    <Button
                      type="button"
                      disabled={ocrProcessing}
                      onClick={() => document.getElementById('invoice-upload').click()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {ocrProcessing ? 'Processando...' : 'Selecionar Imagem'}
                    </Button>
                  </label>
                </div>
                {ocrData && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Dados extraídos! Vá para "Entrada Manual" para revisar e salvar.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="manual">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Número da Nota</label>
                      <Input
                        data-testid="invoice-number-input"
                        value={formData.invoice_number}
                        onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Nome do Fornecedor</label>
                      <Input
                        data-testid="invoice-supplier-input"
                        value={formData.supplier_name}
                        onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Data de Emissão</label>
                      <Input
                        data-testid="invoice-date-input"
                        type="date"
                        value={formData.issue_date}
                        onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Valor Total</label>
                      <Input
                        data-testid="invoice-total-input"
                        type="number"
                        step="0.01"
                        value={formData.total_value}
                        onChange={(e) => setFormData({ ...formData, total_value: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Impostos</label>
                      <Input
                        data-testid="invoice-tax-input"
                        type="number"
                        step="0.01"
                        value={formData.tax_value}
                        onChange={(e) => setFormData({ ...formData, tax_value: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                  <Button data-testid="invoice-submit-button" type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Salvar Nota Fiscal
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full" data-testid="invoices-table">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Fornecedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Data
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Valor Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-zinc-50 transition-colors" data-testid={`invoice-row-${invoice.id}`}>
                <td className="px-6 py-4 text-sm font-mono text-zinc-800">{invoice.invoice_number}</td>
                <td className="px-6 py-4 text-sm text-zinc-900">{invoice.supplier_name}</td>
                <td className="px-6 py-4 text-sm text-zinc-600">{invoice.issue_date}</td>
                <td className="px-6 py-4 text-sm font-mono text-zinc-800 text-right">
                  R$ {invoice.total_value.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    invoice.status === 'processed'
                      ? 'bg-green-100 text-green-700'
                      : invoice.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {invoice.status === 'processed' ? 'Processada' : invoice.status === 'pending' ? 'Pendente' : 'Erro'}
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