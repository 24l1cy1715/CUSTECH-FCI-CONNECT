import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  ExternalLink,
  Phone,
  Search,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAdminStore } from '@/store/adminStore';
import toast from 'react-hot-toast';

export const AdminBusinessesManager: React.FC = () => {
  const { businesses, approveBusiness, rejectBusiness, toggleBusinessVerification } =
    useAdminStore();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [search, setSearch] = useState('');

  const filtered = businesses.filter((b) => {
    const matchesFilter = filter === 'ALL' || b.status === filter;
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleApprove = (id: string, name: string) => {
    approveBusiness(id);
    toast.success(`Business "${name}" verified with official campus certification checkmark!`);
  };

  const handleReject = (id: string, name: string) => {
    rejectBusiness(id);
    toast.error(`Business "${name}" rejected.`);
  };

  const handleToggleBadge = (id: string, current: boolean, name: string) => {
    toggleBusinessVerification(id);
    toast.success(
      `Campus Verification Badge ${!current ? 'granted to' : 'revoked from'} ${name}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Top Filters ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border">
          {[
            { id: 'ALL', label: 'All Businesses', count: businesses.length },
            {
              id: 'PENDING',
              label: 'Verification Pending',
              count: businesses.filter((b) => b.status === 'PENDING').length,
            },
            {
              id: 'APPROVED',
              label: 'Certified Ventures',
              count: businesses.filter((b) => b.status === 'APPROVED').length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filter === tab.id
                  ? 'bg-surface-raised shadow-sm text-text border border-border'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-bg text-accent">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* ── Business Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((biz) => (
          <Card
            key={biz.id}
            className={`p-5 space-y-4 border-l-4 transition-all hover:shadow-md ${
              biz.status === 'PENDING'
                ? 'border-l-accent'
                : biz.status === 'APPROVED'
                ? 'border-l-emerald-500'
                : 'border-l-rose-500'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base text-text">{biz.name}</h3>
                  {biz.isVerified && (
                    <span title="Verified CUSTECH Business">
                      <BadgeCheck className="w-4 h-4 text-sky-500 shrink-0" />
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-accent">{biz.category}</span>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  biz.status === 'PENDING'
                    ? 'bg-accent/15 text-accent animate-pulse'
                    : biz.status === 'APPROVED'
                    ? 'bg-emerald-500/15 text-emerald-500'
                    : 'bg-rose-500/15 text-rose-500'
                }`}
              >
                {biz.status}
              </span>
            </div>

            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
              {biz.description}
            </p>

            <div className="p-2.5 rounded-xl bg-surface-raised border border-border text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Proprietor:</span>
                <span className="font-bold text-text">{biz.ownerName}</span>
              </div>
              {biz.phone && (
                <div className="flex items-center justify-between text-text-muted">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone:
                  </span>
                  <span className="font-mono">{biz.phone}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
              {biz.websiteUrl && (
                <a
                  href={biz.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-accent flex items-center gap-1 text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono">Website</span>
                </a>
              )}

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={() => handleToggleBadge(biz.id, biz.isVerified, biz.name)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                    biz.isVerified
                      ? 'bg-sky-500/15 border-sky-500 text-sky-400'
                      : 'border-border text-text-muted hover:text-text'
                  }`}
                  title="Toggle official campus verification checkmark"
                >
                  <BadgeCheck className="w-3 h-3" />
                  {biz.isVerified ? 'Verified' : 'Verify'}
                </button>

                {biz.status === 'PENDING' && (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleApprove(biz.id, biz.name)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-500 hover:bg-rose-500/10"
                      onClick={() => handleReject(biz.id, biz.name)}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
