import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Sparkles, BookOpen, Link as LinkIcon, FileText } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { learningApi } from '@/api/learningApi';
import { LearningResourceType, LearningResourceCategory } from '@/types/learning';
import toast from 'react-hot-toast';

interface ResourceSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RESOURCE_TYPES: Array<{ value: LearningResourceType; label: string }> = [
  { value: 'LECTURE_NOTE', label: 'Lecture Note' },
  { value: 'PDF', label: 'PDF Document' },
  { value: 'PAST_QUESTION', label: 'Past Question / Solution' },
  { value: 'VIDEO', label: 'Video Tutorial' },
  { value: 'ARTICLE', label: 'Article / Blog' },
  { value: 'TUTORIAL', label: 'Interactive Tutorial' },
  { value: 'COURSE', label: 'Complete Course' },
  { value: 'BOOK', label: 'Textbook / E-book' },
  { value: 'DOCUMENTATION', label: 'Official Documentation' },
  { value: 'CODE_REPOSITORY', label: 'GitHub / Code Repository' },
  { value: 'PROJECT', label: 'Project Guide' },
  { value: 'SLIDE', label: 'Presentation Slides' },
  { value: 'CHEATSHEET', label: 'Cheatsheet / Quick Reference' },
  { value: 'OTHER', label: 'Other' },
];

const CATEGORIES: Array<{ value: LearningResourceCategory; label: string }> = [
  { value: 'CYBERSECURITY', label: 'Cybersecurity' },
  { value: 'SOFTWARE_ENGINEERING', label: 'Software Engineering' },
  { value: 'ARTIFICIAL_INTELLIGENCE', label: 'Artificial Intelligence' },
  { value: 'DATA_SCIENCE', label: 'Data Science' },
  { value: 'NETWORKING', label: 'Networking' },
  { value: 'DATABASE_SYSTEMS', label: 'Database Systems' },
  { value: 'WEB_DEVELOPMENT', label: 'Web Development' },
  { value: 'MOBILE_DEVELOPMENT', label: 'Mobile Development' },
  { value: 'UI_UX', label: 'UI/UX Design' },
  { value: 'GRAPHIC_DESIGN', label: 'Graphic Design' },
  { value: 'PROGRAMMING', label: 'Programming Fundamentals' },
  { value: 'COMPUTER_SCIENCE', label: 'Computer Science Core' },
  { value: 'ACADEMIC', label: 'Academic General' },
  { value: 'CAREER', label: 'Career & Professional' },
  { value: 'OTHER', label: 'Other' },
];

const FCI_DEPARTMENTS = [
  { value: 'COMPUTER_SCIENCE', label: 'Computer Science' },
  { value: 'SOFTWARE_ENGINEERING', label: 'Software Engineering' },
  { value: 'CYBER_SECURITY', label: 'Cybersecurity' },
  { value: 'INFORMATION_TECHNOLOGY', label: 'Information Technology' },
];

export const ResourceSubmissionModal: React.FC<ResourceSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resourceType: 'LECTURE_NOTE' as LearningResourceType,
    category: 'COMPUTER_SCIENCE' as LearningResourceCategory,
    subject: '',
    courseCode: '',
    courseTitle: '',
    department: 'COMPUTER_SCIENCE',
    level: 200,
    semester: 1,
    url: '',
    fileUrl: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.url.trim() && !formData.fileUrl.trim()) {
      toast.error('Please provide an external URL or direct file link');
      return;
    }

    try {
      setSubmitting(true);
      await learningApi.submitResource({
        ...formData,
        url: formData.url.trim() || undefined,
        fileUrl: formData.fileUrl.trim() || undefined,
        subject: formData.subject.trim() || undefined,
        courseCode: formData.courseCode.trim() || undefined,
        courseTitle: formData.courseTitle.trim() || undefined,
        department: formData.department.trim() || undefined,
      });

      toast.success('Resource submitted successfully! Under review by moderators.');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit resource');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-raised/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-text">Contribute Learning Resource</h2>
                <p className="text-xs text-text-muted">
                  Share study materials, notes, tutorials, or question papers with FCI students
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Resource Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. CSC 301 Data Structures Complete Lecture Handout"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Description / Overview *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe key topics, prerequisites, or helpful study tips..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-accent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Resource Type *
                </label>
                <select
                  value={formData.resourceType}
                  onChange={(e) =>
                    setFormData({ ...formData, resourceType: e.target.value as LearningResourceType })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-accent"
                >
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Primary Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as LearningResourceCategory })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-accent"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Course Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                  placeholder="e.g. CSC 301"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Data Structures"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-accent"
                >
                  {FCI_DEPARTMENTS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Academic Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-accent"
                >
                  <option value={100}>100 Level</option>
                  <option value={200}>200 Level</option>
                  <option value={300}>300 Level</option>
                  <option value={400}>400 Level</option>
                  <option value={500}>500 Level</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Resource Web URL (Link to Video, Docs, or Repo)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-accent font-mono"
                />
                <LinkIcon className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Direct File URL (PDF, Drive, or Cloud Link)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-accent font-mono"
                />
                <FileText className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" size="sm" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Resource'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
