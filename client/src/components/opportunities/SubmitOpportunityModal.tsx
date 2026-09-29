import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Sparkles, Building, MapPin, Globe, Calendar, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { createOpportunity } from '@/api/opportunities';
import { skillsApi } from '@/api/skillsApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { OpportunityCategory } from '@/types/opportunity';

const submitSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  organization: z.string().min(2, 'Organization name is required').max(255),
  category: z.enum([
    'INTERNSHIP',
    'JOB',
    'HACKATHON',
    'COMPETITION',
    'SCHOLARSHIP',
    'FELLOWSHIP',
    'CERTIFICATION',
    'WORKSHOP',
    'VOLUNTEERING',
    'FREELANCE',
    'OTHER',
  ]),
  location: z.string().optional(),
  isRemote: z.boolean(),
  applicationUrl: z
    .string()
    .trim()
    .refine((url) => /^https:\/\/[^\s$.?#].[^\s]*$/i.test(url), {
      message: 'Application URL must start with https://',
    }),
  deadline: z.string().optional().nullable(),
  description: z.string().min(20, 'Please provide at least 20 characters of description'),
  eligibility: z.string().optional(),
});

type SubmitFormData = z.infer<typeof submitSchema>;

interface SubmitOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubmitOpportunityModal: React.FC<SubmitOpportunityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  const { data: skillsData } = useQuery({
    queryKey: ['skills-list'],
    queryFn: () => skillsApi.getSkills({ limit: 100 }),
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      category: 'INTERNSHIP',
      isRemote: true,
      location: 'Remote',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: any) => createOpportunity(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Opportunity submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      reset();
      setSelectedSkillIds([]);
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit opportunity');
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: SubmitFormData) => {
    mutation.mutate({
      ...data,
      deadline: data.deadline || null,
      requiredSkills: selectedSkillIds.map((id) => ({
        skillId: id,
        priority: 'REQUIRED',
      })),
    });
  };

  const toggleSkill = (id: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const availableSkills = skillsData?.skills || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Student &amp; Partner Submissions
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-primary dark:text-white">
            Post an FCI Opportunity
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary">
            Share scholarships, internships, hackathons, or jobs with computing students.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-text">Opportunity Title *</label>
              <input
                {...register('title')}
                placeholder="e.g. Cloud Security Analyst Internship"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent"
              />
              {errors.title && <p className="text-[11px] text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-text">Organization / Company *</label>
              <input
                {...register('organization')}
                placeholder="e.g. Google Africa / SecureTech NG"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent"
              />
              {errors.organization && (
                <p className="text-[11px] text-red-500">{errors.organization.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-text">Category *</label>
              <select
                {...register('category')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent"
              >
                <option value="INTERNSHIP">Internship</option>
                <option value="JOB">Job / Full-Time</option>
                <option value="HACKATHON">Hackathon</option>
                <option value="COMPETITION">Competition</option>
                <option value="SCHOLARSHIP">Scholarship</option>
                <option value="FELLOWSHIP">Fellowship</option>
                <option value="CERTIFICATION">Certification</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="VOLUNTEERING">Volunteering</option>
                <option value="FREELANCE">Freelance</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-text">Location</label>
              <input
                {...register('location')}
                placeholder="e.g. Lagos / Osara / Remote"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-text">Application Deadline</label>
              <input
                type="date"
                {...register('deadline')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 text-left">
            <input
              type="checkbox"
              id="isRemote"
              {...register('isRemote')}
              className="rounded text-accent"
            />
            <label htmlFor="isRemote" className="text-xs text-text font-medium cursor-pointer">
              This opportunity is 100% Remote / Online
            </label>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-text">
              Official Application URL * (Must start with https://)
            </label>
            <input
              {...register('applicationUrl')}
              placeholder="https://company.com/apply"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent font-mono"
            />
            {errors.applicationUrl && (
              <p className="text-[11px] text-red-500">{errors.applicationUrl.message}</p>
            )}
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-text">Eligibility / Student Level</label>
            <input
              {...register('eligibility')}
              placeholder="e.g. Open to 300L & 400L Software Engineering & Computer Science students"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-text">Full Description &amp; Requirements *</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Outline role responsibilities, deliverables, benefits, and perks..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent resize-none"
            />
            {errors.description && (
              <p className="text-[11px] text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Skill Tagging */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-semibold text-text">
              Related Skills (Used for Student Skill Matching)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl border border-border bg-surface-raised">
              {availableSkills.map((sk: any) => {
                const selected = selectedSkillIds.includes(sk.id);
                return (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => toggleSkill(sk.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selected
                        ? 'bg-accent text-black font-semibold'
                        : 'bg-surface border border-border text-text hover:border-accent'
                    }`}
                  >
                    {sk.name}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-text-muted">
              Select key technical skills to help qualified FCI students discover this opportunity.
            </p>
          </div>

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
              <Plus className="w-4 h-4" />
              {mutation.isPending ? 'Publishing...' : 'Submit Opportunity'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
