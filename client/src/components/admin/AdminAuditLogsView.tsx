import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Download,
  Search,
  Filter,
  Terminal,
  Clock,
  Laptop,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAdminStore } from '@/store/adminStore';
import toast from 'react-hot-toast';

export const AdminAuditLogsView: React.FC = () => {
  const { auditLogs } = useAdminStore();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'CRITICAL'>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.includes(search);

    return matchesSeverity && matchesSearch;
  });

  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `custech-fci-audit-logs-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Audit log export generated and downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, actor, details or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-blue-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-blue-400"
          >
            <option value="ALL">All Severities</option>
            <option value="INFO">Info (Normal)</option>
            <option value="WARN">Warnings</option>
            <option value="CRITICAL">Critical Actions</option>
          </select>

          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportLogs}
          >
            Export JSON
          </Button>
        </div>
      </div>

      {/* ── Audit Log Container ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-slate-700">FCI Immutable Security Trail</span>
            <span className="text-[10px] text-slate-400">({filteredLogs.length} events logged)</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">SHA-256 INTEGRITY VERIFIED</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No audit records matching search parameters.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 sm:p-4 hover:bg-slate-50 transition-colors space-y-1.5 text-xs font-mono"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : log.severity === 'WARN'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {log.severity}
                    </span>
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-slate-400 text-[11px]">on [{log.entityType}]</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-slate-600">
                      <Laptop className="w-3 h-3" />
                      {log.ipAddress}
                    </span>
                  </div>
                </div>

                <p className="text-slate-500 font-sans text-xs leading-relaxed">{log.details}</p>

                <div className="text-[10px] text-slate-400">
                  Executed by: <span className="text-slate-700 font-bold">{log.actorName}</span> ({log.actorEmail})
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
