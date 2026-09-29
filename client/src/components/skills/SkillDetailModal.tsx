import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, FolderKanban, Star, ExternalLink, Tag } from 'lucide-react';
import { useSkillDetail } from '@/api/skillsApi';
import { SKILL_CATEGORY_LABELS, PROFICIENCY_LABELS, SkillCategory, SkillProficiency } from '@/types/skills';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Link } from 'react-router-dom';

interface SkillDetailModalProps {
  skillId: string | null;
  onClose: () => void;
  onSelectSkill?: (skillId: string) => void;
}

export const SkillDetailModal: React.FC<SkillDetailModalProps> = ({
  skillId,
  onClose,
  onSelectSkill,
}) => {
  const { data: skill, isLoading, error } = useSkillDetail(skillId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (skillId) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [skillId, onClose]);

  if (!skillId) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-detail-title"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-start justify-between gap-4 bg-surface-raised/40">
            <div>
              {isLoading ? (
                <div className="h-7 w-48 bg-border/50 animate-pulse rounded-lg" />
              ) : (
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2
                    id="skill-detail-title"
                    className="font-display font-extrabold text-2xl text-primary dark:text-white"
                  >
                    {skill?.name}
                  </h2>
                  {skill?.category && (
                    <Badge variant="accent" size="sm">
                      {SKILL_CATEGORY_LABELS[skill.category as SkillCategory] || skill.category}
                    </Badge>
                  )}
                </div>
              )}
              {skill?.description && (
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  {skill.description}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-raised transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {isLoading && (
              <div className="space-y-4">
                <div className="h-16 bg-surface-raised rounded-xl animate-pulse" />
                <div className="h-24 bg-surface-raised rounded-xl animate-pulse" />
                <div className="h-24 bg-surface-raised rounded-xl animate-pulse" />
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                Failed to load skill details. Please try again.
              </div>
            )}

            {skill && (
              <>
                {/* Stats Bar */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-surface-raised border border-border flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-display text-text">
                        {skill.studentCount}
                      </div>
                      <div className="text-xs text-text-muted">Enrolled Students</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-raised border border-border flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-display text-text">
                        {skill.projectCount}
                      </div>
                      <div className="text-xs text-text-muted">Featured Projects</div>
                    </div>
                  </div>
                </div>

                {/* Related Skills */}
                {skill.relatedSkills && skill.relatedSkills.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-accent" />
                      Related Skills in {SKILL_CATEGORY_LABELS[skill.category as SkillCategory]}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skill.relatedSkills.map((rel: { id: string; name: string }) => (
                        <button
                          key={rel.id}
                          onClick={() => onSelectSkill && onSelectSkill(rel.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-raised border border-border text-text hover:border-accent hover:text-accent transition-all cursor-pointer"
                        >
                          {rel.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Students with Skill */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-accent" />
                    Students with this Skill ({skill.students.length})
                  </h3>

                  {skill.students.length === 0 ? (
                    <p className="text-xs text-text-muted italic bg-surface-raised/40 p-4 rounded-xl border border-border/50 text-center">
                      No students have registered this skill yet. Be the first to add it!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {skill.students.map((st: any) => {
                        const prof = PROFICIENCY_LABELS[st.proficiency as SkillProficiency];
                        return (
                          <div
                            key={st.user.id}
                            className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between gap-3 hover:border-border/80 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={
                                  st.user.avatarUrl ||
                                  `https://api.dicebear.com/7.x/bottts/svg?seed=${st.user.fullName}`
                                }
                                alt={st.user.fullName}
                                className="w-8 h-8 rounded-full object-cover shrink-0 border border-border"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-text truncate flex items-center gap-1">
                                  {st.user.fullName}
                                  {st.isPrimary && (
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                                  )}
                                </div>
                                <div className="text-[11px] text-text-muted truncate">
                                  {st.user.department} {st.user.level ? `• ${st.user.level}L` : ''}
                                </div>
                              </div>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${prof.color}`}
                            >
                              {prof.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Related Projects */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-accent" />
                    Projects built with {skill.name} ({skill.projects.length})
                  </h3>

                  {skill.projects.length === 0 ? (
                    <p className="text-xs text-text-muted italic bg-surface-raised/40 p-4 rounded-xl border border-border/50 text-center">
                      No public projects tagged with this skill yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {skill.projects.map((proj: any) => (
                        <div
                          key={proj.id}
                          className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between gap-3 hover:border-accent/40 transition-colors"
                        >
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-text truncate">
                              {proj.title}
                            </h4>
                            {proj.description && (
                              <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">
                                {proj.description}
                              </p>
                            )}
                          </div>
                          <Link
                            to={`/projects/${proj.slug}`}
                            onClick={onClose}
                            className="p-1.5 rounded-lg bg-surface border border-border text-accent hover:bg-accent hover:text-white transition-colors shrink-0"
                            title="View project"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-surface-raised/30 flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
