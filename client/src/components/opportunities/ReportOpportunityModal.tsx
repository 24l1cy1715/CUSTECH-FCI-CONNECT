import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { reportOpportunity } from '@/api/opportunities';
import toast from 'react-hot-toast';

const reportSchema = z.object({
  reason: z.enum(['SPAM', 'HARASSMENT', 'FRAUD', 'INAPPROPRIATE', 'MISLEADING', 'OTHER']),
  description: z.string().max(1000).optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string;
  opportunityTitle: string;
}

export const ReportOpportunityModal: React.FC<ReportOpportunityModalProps> = ({
  isOpen,
  onClose,
  opportunityId,
  opportunityTitle,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: { reason: 'MISLEADING' },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: ReportFormData) => {
    try {
      setIsSubmitting(true);
      const res = await reportOpportunity(opportunityId, data as any);
      toast.success(res.message || 'Report submitted to moderators.');
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            Report Content
          </div>
          <h3 className="font-display font-bold text-xl text-primary dark:text-white">
            Report Opportunity
          </h3>
          <p className="text-xs text-text-secondary line-clamp-1">
            "{opportunityTitle}"
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-text">Reason for Reporting *</label>
            <select
              {...register('reason')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent"
            >
              <option value="MISLEADING">Misleading Information or Broken Link</option>
              <option value="FRAUD">Suspected Scam or Fee Required</option>
              <option value="SPAM">Expired or Duplicate Listing</option>
              <option value="INAPPROPRIATE">Inappropriate Content</option>
              <option value="OTHER">Other Reason</option>
            </select>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-text">Additional Details (Optional)</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Please provide any extra context to assist our moderators..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
