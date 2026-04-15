import React, { useState, useEffect } from 'react';
import { invoicesAPI, suppliersAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, FileText, Upload, Image as ImageIcon, FileUp } from 'lucide-react';
import { toast } from 'sonner';

export const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('manual');
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: '', supplier_name: '', issue_date: '', total_value: 0, tax_value: 0, items: [],
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await invoicesAPI.getAll();
      setInvoices(res.data);
    } catch { toast.error('Erro ao carregar notas fiscais'); }
    finally { setLoading(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProcessing(true);

    const ext = file.name.toLowerCase();
    if (ext.endsWith('.xml') || ext.endsWith('.pdf')) {
      try {
        const res = await invoicesAPI.uploadFile(file);
        const data = res.data.data;
        setFormData({
          invoice_number: data.invoice_number || '',
          supplier_name: data.supplier_name || '',
          issue_date: data.issue_date || '',
          total_value: data.total_value || 0,
          tax_value: data.tax_value || 0,
          items: (data.items || []).map(it => ({
            product_name: it.product_name || '', product_sku: it.product_sku || '',
            quantity: it.quantity || 0, unit_price: it.unit_price || 0, total: it.total || 0, tax: it.tax || 0,
          })),
        });
        toast.success(`Arquivo ${res.data.source === 'xml' ? 'XML' : 'PDF'} processado!`);
        setActiveTab('manual');
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Erro ao processar arquivo');
      }
    } else {
      toast.error('Use arquivos PDF ou XML');
    }
    setProcessing(false);
    e.target.value = '';
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProcessing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1];
      try {
        const res = await invoicesAPI.processOCR(base64);
        setFormData({
          invoice_number: res.data.invoice_number || '', supplier_name: res.data.supplier_name || '',
          issue_date: res.data.issue_date || '', total_value: res.data.total_value || 0,
          tax_value: res.data.tax_value || 0,
          items: (res.data.items || []).map(it => ({
            product_name: it.product_name || '', product_sku: '', quantity: it.quantity || 0,
            unit_price: it.unit_price || 0, total: it.total || 0, tax: 0,
          })),
        });
        toast.success('Imagem processada com OCR!');
        setActiveTab('manual');
      } catch { toast.error('Erro ao processar imagem'); }
      setProcessing(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await invoicesAPI.create({ ...formData, status: 'processed', type: 'entrada' });
      toast.success('Nota fiscal criada!');
      setDialogOpen(false);
      setFormData({ invoice_number: '', supplier_name: '', issue_date: '', total_value: 0, tax_value: 0, items: [] });
      loadData();
    } catch { toast.error('Erro ao criar nota fiscal'); }
  };

  if (loading) return <div className="p-8"><div className="animate-pulse"><div className="h-8 bg-zinc-200 rounded w-64 mb-4" /><div className="h-64 bg-zinc-200 rounded" /></div></div>;

  return (
    <div className="p-8" data-testid="invoices-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Notas Fiscais</h1>
          <p className="mt-2 text-zinc-600">Upload PDF/XML, OCR de imagens ou entrada manual</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-invoice-button" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />Nova Nota Fiscal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nova Nota Fiscal</DialogTitle></DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="file" data-testid="file-tab"><FileUp className="h-4 w-4 mr-2" />PDF / XML</TabsTrigger>
                <TabsTrigger value="ocr" data-testid="ocr-tab"><ImageIcon className="h-4 w-4 mr-2" />OCR Imagem</TabsTrigger>
                <TabsTrigger value="manual" data-testid="manual-tab"><FileText className="h-4 w-4 mr-2" />Manual</TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="space-y-4">
                <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center">
                  <FileUp className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
                  <p className="text-sm text-zinc-600 mb-2">Upload de arquivo PDF ou XML (NFe)</p>
                  <p className="text-xs text-zinc-500 mb-4">XML sera parseado automaticamente. PDF sera processado com IA.</p>
                  <input type="file" accept=".pdf,.xml" onChange={handleFileUpload} className="hidden" id="file-upload" disabled={processing} />
                  <label htmlFor="file-upload">
                    <Button type="button" disabled={processing} onClick={() => document.getElementById('file-upload').click()} className="bg-blue-600 hover:bg-blue-700 text-white">
                      {processing ? 'Processando...' : 'Selecionar Arquivo'}
                    </Button>
                  </label>
                </div>
              </TabsContent>

              <TabsContent value="ocr" className="space-y-4">
                <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
                  <p className="text-sm text-zinc-600 mb-4">Upload de imagem da nota fiscal para extracao automatica com IA</p>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" disabled={processing} />
                  <label htmlFor="image-upload">
                    <Button type="button" disabled={processing} onClick={() => document.getElementById('image-upload').click()} className="bg-blue-600 hover:bg-blue-700 text-white">
                      {processing ? 'Processando...' : 'Selecionar Imagem'}
                    </Button>
                  </label>
                </div>
              </TabsContent>

              <TabsContent value="manual">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-zinc-700 mb-1.5">Numero da Nota</label>
                      <Input data-testid="invoice-number-input" value={formData.invoice_number} onChange={e => setFormData({...formData, invoice_number: e.target.value})} required /></div>
                    <div><label className="block text-sm font-medium text-zinc-700 mb-1.5">Fornecedor</label>
                      <Input data-testid="invoice-supplier-input" value={formData.supplier_name} onChange={e => setFormData({...formData, supplier_name: e.target.value})} required /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="block text-sm font-medium text-zinc-700 mb-1.5">Data</label>
                      <Input data-testid="invoice-date-input" type="date" value={formData.issue_date} onChange={e => setFormData({...formData, issue_date: e.target.value})} required /></div>
                    <div><label className="block text-sm font-medium text-zinc-700 mb-1.5">Valor Total</label>
                      <Input data-testid="invoice-total-input" type="number" step="0.01" value={formData.total_value} onChange={e => setFormData({...formData, total_value: parseFloat(e.target.value) || 0})} required /></div>
                    <div><label className="block text-sm font-medium text-zinc-700 mb-1.5">Impostos</label>
                      <Input data-testid="invoice-tax-input" type="number" step="0.01" value={formData.tax_value} onChange={e => setFormData({...formData, tax_value: parseFloat(e.target.value) || 0})} /></div>
                  </div>

                  {/* Items from OCR/XML */}
                  {formData.items.length > 0 && (
                    <div className="border border-zinc-200 rounded-lg p-4">
                      <h3 className="font-medium text-zinc-900 mb-3">Itens Extraidos ({formData.items.length})</h3>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {formData.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between p-2 bg-zinc-50 rounded text-sm">
                            <span className="flex-1 text-zinc-900">{item.product_name}</span>
                            <span className="text-zinc-600 mx-2">{item.quantity} x R$ {item.unit_price.toFixed(2)}</span>
                            <span className="font-mono text-zinc-800">R$ {item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button data-testid="invoice-submit-button" type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Salvar Nota Fiscal</Button>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full" data-testid="invoices-table">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Numero</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Fornecedor</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Data</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Valor Total</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Impostos</th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-zinc-800">{inv.invoice_number}</td>
                <td className="px-6 py-4 text-sm text-zinc-900">{inv.supplier_name}</td>
                <td className="px-6 py-4 text-sm text-zinc-600">{inv.issue_date}</td>
                <td className="px-6 py-4 text-sm font-mono text-zinc-800 text-right">R$ {inv.total_value.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm font-mono text-zinc-800 text-right">R$ {(inv.tax_value || 0).toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${inv.status === 'processed' ? 'bg-green-100 text-green-700' : inv.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {inv.status === 'processed' ? 'Processada' : inv.status === 'pending' ? 'Pendente' : 'Erro'}
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
