import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Send, Lock, ShieldCheck, Mail } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { sendPortfolioConnectRequest } from '@/api/portfolio';
import toast from 'react-hot-toast';

const connectSchema = z.object({
  senderName: z.string().min(2, 'Name must be at least 2 characters'),
  senderEmail: z.string().email('Please enter a valid email address'),
  subject: z.string().max(100).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

type ConnectFormData = z.infer<typeof connectSchema>;

interface PortfolioConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  fullName: string;
}

export const PortfolioConnectModal: React.FC<PortfolioConnectModalProps> = ({
  isOpen,
  onClose,
  username,
  fullName,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConnectFormData>({
    resolver: zodResolver(connectSchema),
  });

  if (!isOpen) return null;

  const onSubmit = async (data: ConnectFormData) => {
    try {
      setIsSubmitting(true);
      const res = await sendPortfolioConnectRequest(username, data);
      toast.success(res.message || 'Message forwarded successfully!');
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send connection request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-accent text-xs font-semibold uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5" />
            Direct Contact
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-primary dark:text-white">
            Connect with {fullName}
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary">
            Send a private inquiry or collaboration opportunity. The student's private contact details remain protected.
          </p>
        </div>

        {/* Privacy Shield Notice */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-accent/5 border border-accent/20 text-xs text-text-secondary">
          <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
          <span>Your message is delivered directly through the secure FCI notification relay.</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-text">Your Name *</label>
              <input
                {...register('senderName')}
                placeholder="e.g. John Doe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent"
              />
              {errors.senderName && (
                <p className="text-[11px] text-red-500">{errors.senderName.message}</p>
              )}
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-text">Your Email Address *</label>
              <input
                {...register('senderEmail')}
                type="email"
                placeholder="e.g. you@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent"
              />
              {errors.senderEmail && (
                <p className="text-[11px] text-red-500">{errors.senderEmail.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-text">Subject (Optional)</label>
            <input
              {...register('subject')}
              placeholder="e.g. Internship inquiry / Project collaboration"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-text">Message *</label>
            <textarea
              {...register('message')}
              rows={4}
              placeholder="Describe your project, role, or reason for connecting..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent resize-none"
            />
            {errors.message && (
              <p className="text-[11px] text-red-500">{errors.message.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting} className="flex items-center gap-1.5">
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
