import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, Lock, Globe, Shield, Eye, Layers } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { PortfolioSettingsData, UpdatePortfolioPayload } from '@/types/portfolio';
import { updateMyPortfolioSettings } from '@/api/portfolio';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const editorSchema = z.object({
  headline: z.string().max(255).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  portfolioBio: z.string().max(3000).optional().nullable(),
  visibility: z.enum(['PUBLIC', 'FCI_ONLY', 'PRIVATE']),
  githubUrl: z
    .string()
    .trim()
    .refine((url) => !url || /^https:\/\/[^\s$.?#].[^\s]*$/i.test(url), {
      message: 'GitHub URL must start with https://',
    })
    .optional()
    .nullable(),
  linkedinUrl: z
    .string()
    .trim()
    .refine((url) => !url || /^https:\/\/[^\s$.?#].[^\s]*$/i.test(url), {
      message: 'LinkedIn URL must start with https://',
    })
    .optional()
    .nullable(),
  portfolioUrl: z
    .string()
    .trim()
    .refine((url) => !url || /^https:\/\/[^\s$.?#].[^\s]*$/i.test(url), {
      message: 'Personal Website URL must start with https://',
    })
    .optional()
    .nullable(),
  showSkills: z.boolean(),
  showProjects: z.boolean(),
  showAchievements: z.boolean(),
  showContact: z.boolean(),
});

type EditorFormData = z.infer<typeof editorSchema>;

interface PortfolioEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PortfolioSettingsData;
  onSuccess?: () => void;
}

export const PortfolioEditorModal: React.FC<PortfolioEditorModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditorFormData>({
    resolver: zodResolver(editorSchema),
    defaultValues: {
      headline: initialData?.headline || '',
      location: initialData?.location || 'Osara, Kogi State, Nigeria',
      portfolioBio: initialData?.portfolioBio || '',
      visibility: initialData?.visibility || 'PUBLIC',
      githubUrl: initialData?.githubUrl || '',
      linkedinUrl: initialData?.linkedinUrl || '',
      portfolioUrl: initialData?.portfolioUrl || '',
      showSkills: initialData?.customSections?.showSkills !== false,
      showProjects: initialData?.customSections?.showProjects !== false,
      showAchievements: initialData?.customSections?.showAchievements !== false,
      showContact: initialData?.customSections?.showContact !== false,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        headline: initialData.headline || '',
        location: initialData.location || 'Osara, Kogi State, Nigeria',
        portfolioBio: initialData.portfolioBio || '',
        visibility: initialData.visibility || 'PUBLIC',
        githubUrl: initialData.githubUrl || '',
        linkedinUrl: initialData.linkedinUrl || '',
        portfolioUrl: initialData.portfolioUrl || '',
        showSkills: initialData.customSections?.showSkills !== false,
        showProjects: initialData.customSections?.showProjects !== false,
        showAchievements: initialData.customSections?.showAchievements !== false,
        showContact: initialData.customSections?.showContact !== false,
      });
    }
  }, [initialData, reset]);

  const mutation = useMutation({
    mutationFn: (payload: UpdatePortfolioPayload) => updateMyPortfolioSettings(payload),
    onSuccess: () => {
      toast.success('Portfolio updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-settings'] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update portfolio');
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: EditorFormData) => {
    mutation.mutate({
      headline: data.headline || null,
      location: data.location || null,
      portfolioBio: data.portfolioBio || null,
      visibility: data.visibility,
      githubUrl: data.githubUrl || null,
      linkedinUrl: data.linkedinUrl || null,
      portfolioUrl: data.portfolioUrl || null,
      customSections: {
        showSkills: data.showSkills,
        showProjects: data.showProjects,
        showAchievements: data.showAchievements,
        showContact: data.showContact,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            Portfolio Studio
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-primary dark:text-white">
            Customize Public Portfolio
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary">
            Control your professional headline, public bio, social presence, and visibility.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Privacy & Visibility */}
          <div className="p-4 rounded-2xl bg-surface-raised border border-border space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-text">
              <Shield className="w-4 h-4 text-accent" />
              Portfolio Visibility Control
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-surface cursor-pointer hover:border-accent transition-colors">
                <input
                  type="radio"
                  value="PUBLIC"
                  {...register('visibility')}
                  className="mt-0.5 text-accent"
                />
                <div>
                  <div className="text-xs font-semibold text-text flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-emerald-500" /> Public
                  </div>
                  <div className="text-[11px] text-text-muted">Anyone with your link or QR code can view.</div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-surface cursor-pointer hover:border-accent transition-colors">
                <input
                  type="radio"
                  value="FCI_ONLY"
                  {...register('visibility')}
                  className="mt-0.5 text-accent"
                />
                <div>
                  <div className="text-xs font-semibold text-text flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-blue-500" /> FCI Only
                  </div>
                  <div className="text-[11px] text-text-muted">Requires signed-in CUSTECH student account.</div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-surface cursor-pointer hover:border-accent transition-colors">
                <input
                  type="radio"
                  value="PRIVATE"
                  {...register('visibility')}
                  className="mt-0.5 text-accent"
                />
                <div>
                  <div className="text-xs font-semibold text-text flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-500" /> Private
                  </div>
                  <div className="text-[11px] text-text-muted">Hidden from public and peer directory.</div>
                </div>
              </label>
            </div>
          </div>

          {/* Headline & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-text">Professional Headline</label>
              <input
                {...register('headline')}
                placeholder="e.g. Aspiring Cybersecurity Analyst & Ethical Hacker"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent"
              />
              {errors.headline && <p className="text-[11px] text-red-500">{errors.headline.message}</p>}
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-text">Location (Public)</label>
              <input
                {...register('location')}
                placeholder="e.g. Osara / Lokoja, Kogi State"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Public Bio */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-text">Public Portfolio Bio</label>
            <textarea
              {...register('portfolioBio')}
              rows={4}
              placeholder="Highlight your engineering passions, ongoing research, and what drives you at CUSTECH FCI..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent resize-none"
            />
            {errors.portfolioBio && (
              <p className="text-[11px] text-red-500">{errors.portfolioBio.message}</p>
            )}
          </div>

          {/* Verified Social Links */}
          <div className="space-y-3 text-left">
            <label className="text-xs font-semibold text-text">External Profiles & Social Links (Must start with https://)</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  {...register('githubUrl')}
                  placeholder="https://github.com/yourhandle"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none focus:border-accent font-mono"
                />
                {errors.githubUrl && <p className="text-[10px] text-red-500 mt-1">{errors.githubUrl.message}</p>}
              </div>

              <div>
                <input
                  {...register('linkedinUrl')}
                  placeholder="https://linkedin.com/in/yourhandle"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none focus:border-accent font-mono"
                />
                {errors.linkedinUrl && <p className="text-[10px] text-red-500 mt-1">{errors.linkedinUrl.message}</p>}
              </div>

              <div>
                <input
                  {...register('portfolioUrl')}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none focus:border-accent font-mono"
                />
                {errors.portfolioUrl && <p className="text-[10px] text-red-500 mt-1">{errors.portfolioUrl.message}</p>}
              </div>
            </div>
          </div>

          {/* Section Visibility Toggles */}
          <div className="p-4 rounded-2xl bg-surface-raised border border-border space-y-3 text-left">
            <div className="text-xs font-semibold text-text">Public Portfolio Sections</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 text-xs text-text cursor-pointer">
                <input type="checkbox" {...register('showSkills')} className="rounded text-accent" />
                <span>Show Skills</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-text cursor-pointer">
                <input type="checkbox" {...register('showProjects')} className="rounded text-accent" />
                <span>Show Projects</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-text cursor-pointer">
                <input type="checkbox" {...register('showAchievements')} className="rounded text-accent" />
                <span>Show Badges</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-text cursor-pointer">
                <input type="checkbox" {...register('showContact')} className="rounded text-accent" />
                <span>Enable Connect</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
