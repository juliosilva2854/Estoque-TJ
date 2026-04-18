import React, { useState, useEffect } from 'react';
import { auditAPI } from '../api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Download, Search } from 'lucide-react';
import { toast } from 'sonner';

export const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');

  useEffect(() => { loadLogs(); }, []);

  useEffect(() => {
    let f = logs;
    if (search) { const s = search.toLowerCase(); f = f.filter(l => l.user_email?.toLowerCase().includes(s) || l.entity_id?.toLowerCase().includes(s) || l.entity_type?.toLowerCase().includes(s)); }
    if (filterAction !== 'all') f = f.filter(l => l.action === filterAction);
    if (filterEntity !== 'all') f = f.filter(l => l.entity_type === filterEntity);
    setFiltered(f);
  }, [search, filterAction, filterEntity, logs]);

  const loadLogs = async () => {
    try { const res = await auditAPI.getLogs(); setLogs(res.data); setFiltered(res.data); }
    catch { toast.error('Erro ao carregar logs de auditoria'); }
    finally { setLoading(false); }
  };

  const handleExport = async () => {
    try {
      const res = await auditAPI.exportExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a'); link.href = url; link.setAttribute('download', 'auditoria.xlsx');
      document.body.appendChild(link); link.click(); link.remove();
      toast.success('Exportado com sucesso!');
    } catch { toast.error('Erro ao exportar'); }
  };

  const actions = [...new Set(logs.map(l => l.action))];
  const entities = [...new Set(logs.map(l => l.entity_type))];
  const actionColors = { CREATE: 'bg-green-100 text-green-700', UPDATE: 'bg-blue-100 text-blue-700', DELETE: 'bg-red-100 text-red-700', ADJUST: 'bg-yellow-100 text-yellow-700', TRANSFER: 'bg-purple-100 text-purple-700', PROCESS: 'bg-cyan-100 text-cyan-700', CONVERT: 'bg-indigo-100 text-indigo-700' };

  if (loading) return <div className="p-4 md:p-8">Carregando...</div>;

  return (
    <div className="p-4 md:p-8" data-testid="audit-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold font-primary text-zinc-900 tracking-tight">Auditoria</h1>
          <p className="mt-1 text-sm text-zinc-600">Historico completo de acoes no sistema</p>
        </div>
        <Button data-testid="export-audit-button" onClick={handleExport} variant="outline"><Download className="h-4 w-4 mr-2" />Exportar Excel</Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input data-testid="audit-search" placeholder="Buscar por usuario, entidade ou ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger data-testid="audit-filter-action"><SelectValue placeholder="Acao" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as acoes</SelectItem>
            {actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterEntity} onValueChange={setFilterEntity}>
          <SelectTrigger data-testid="audit-filter-entity"><SelectValue placeholder="Entidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as entidades</SelectItem>
            {entities.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-zinc-500 mb-3">{filtered.length} registros encontrados</p>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[700px]" data-testid="audit-table">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Data/Hora</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Acao</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Entidade</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map(log => (
              <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3 text-sm text-zinc-600 whitespace-nowrap">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3 text-sm text-zinc-900">{log.user_email}</td>
                <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${actionColors[log.action] || 'bg-zinc-100 text-zinc-700'}`}>{log.action}</span></td>
                <td className="px-4 py-3 text-sm text-zinc-600 capitalize">{log.entity_type}</td>
                <td className="px-4 py-3 text-xs font-mono text-zinc-800 break-all max-w-[200px]">{log.entity_id}</td>
                <td className="px-4 py-3 text-xs text-zinc-500 max-w-[200px] truncate">{log.changes ? JSON.stringify(log.changes) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
