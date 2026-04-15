import React, { useState, useEffect } from 'react';
import { auditAPI } from '../api';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';

export const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await auditAPI.getLogs();
      setLogs(res.data);
    } catch (error) {
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="p-8" data-testid="audit-page">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold font-primary text-zinc-900 tracking-tight">
          Auditoria
        </h1>
        <p className="mt-2 text-zinc-600">Histórico de ações no sistema</p>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full" data-testid="audit-table">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Data/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Ação
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Entidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-50 transition-colors" data-testid={`audit-log-${log.id}`}>
                <td className="px-6 py-4 text-sm text-zinc-600">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-900">{log.user_email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.action === 'CREATE'
                        ? 'bg-green-100 text-green-700'
                        : log.action === 'UPDATE'
                        ? 'bg-blue-100 text-blue-700'
                        : log.action === 'DELETE'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-600 capitalize">{log.entity_type}</td>
                <td className="px-6 py-4 text-sm font-mono text-zinc-800">{log.entity_id.substring(0, 8)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};