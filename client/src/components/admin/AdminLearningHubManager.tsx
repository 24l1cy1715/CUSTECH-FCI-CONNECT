import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trash2,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { learningApi } from '@/api/learningApi';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { LearningResource } from '@/types/learning';
import toast from 'react-hot-toast';

export const AdminLearningHubManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-learning-resources', search, selectedType],
    queryFn: () =>
      learningApi.getResources({
        search: search.trim() || undefined,
        resourceType: selectedType !== 'ALL' ? selectedType : undefined,
        limit: 30,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => learningApi.approveResource(id),
    onSuccess: () => {
      toast.success('Resource approved and published!');
      queryClient.invalidateQueries({ queryKey: ['admin-learning-resources'] });
    },
    onError: () => toast.error('Failed to approve resource'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      learningApi.rejectResource(id, reason),
    onSuccess: () => {
      toast.success('Resource rejected.');
      queryClient.invalidateQueries({ queryKey: ['admin-learning-resources'] });
    },
    onError: () => toast.error('Failed to reject resource'),
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: (id: string) => learningApi.toggleFeatureResource(id),
    onSuccess: (data) => {
      toast.success(data.isFeatured ? 'Resource featured on homepage!' : 'Feature status removed.');
      queryClient.invalidateQueries({ queryKey: ['admin-learning-resources'] });
    },
    onError: () => toast.error('Failed to toggle featured status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => learningApi.deleteResource(id),
    onSuccess: () => {
      toast.success('Resource permanently deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-learning-resources'] });
    },
    onError: () => toast.error('Failed to delete resource'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            Learning Hub Curricula & Submissions
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review student and faculty contributions, verify academic handouts, and feature curated roadmaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 rounded-2xl bg-white/[0.02] border border-white/10 animate-pulse" />
      ) : data?.resources && data.resources.length > 0 ? (
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/[0.05] text-slate-400 uppercase font-mono text-[10px] border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3">Type & Category</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data.resources.map((res) => (
                <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-bold text-white truncate">{res.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{res.description}</p>
                    {res.courseCode && (
                      <span className="text-[10px] font-mono text-accent">{res.courseCode}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/[0.08] text-slate-200">
                      {res.resourceType.replace(/_/g, ' ')}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      {res.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <p className="font-medium text-white">{res.author.fullName}</p>
                    <p className="text-[10px] text-slate-400">{res.author.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        res.submissionStatus === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : res.submissionStatus === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {res.submissionStatus}
                    </span>
                    {res.isFeatured && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold mt-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {res.submissionStatus !== 'APPROVED' && (
                        <button
                          onClick={() => approveMutation.mutate(res.id)}
                          disabled={approveMutation.isPending}
                          title="Approve"
                          className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {res.submissionStatus !== 'REJECTED' && (
                        <button
                          onClick={() => {
                            const reason = window.prompt('Optional rejection reason:');
                            rejectMutation.mutate({ id: res.id, reason: reason || undefined });
                          }}
                          disabled={rejectMutation.isPending}
                          title="Reject"
                          className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/30 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleFeatureMutation.mutate(res.id)}
                        disabled={toggleFeatureMutation.isPending}
                        title={res.isFeatured ? 'Unfeature' : 'Feature'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          res.isFeatured
                            ? 'bg-accent text-black font-bold'
                            : 'bg-white/[0.05] text-slate-400 hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this resource permanently?')) {
                            deleteMutation.mutate(res.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        title="Delete"
                        className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-slate-400">
          No resources found in current queue.
        </div>
      )}
    </div>
  );
};
