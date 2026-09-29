import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Settings,
  Network,
  Plus,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useUserSkills } from '@/api/skillsApi';
import { PROFICIENCY_LABELS, SKILL_CATEGORY_LABELS, StudentSkill, SkillCategory } from '@/types/skills';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SkillManagerModal } from './SkillManagerModal';
import { SkillDetailModal } from './SkillDetailModal';
import { SkillGraphVisualizer } from './SkillGraphVisualizer';

interface SkillsSectionProps {
  userId: string;
  isOwner?: boolean;
  studentName: string;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  userId,
  isOwner = false,
  studentName,
}) => {
  const { data: userSkillsData, isLoading, error } = useUserSkills(userId);
  const [managerOpen, setManagerOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(false);

  const skills: StudentSkill[] = userSkillsData?.skills || [];
  const primarySkills = skills.filter((s: StudentSkill) => s.isPrimary);
  const otherSkills = skills.filter((s: StudentSkill) => !s.isPrimary);

  return (
    <div className="space-y-6">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-xl text-primary dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Skills &amp; Expertise
          </h2>
          <p className="text-xs text-text-secondary">
            Verified competencies, technical specializations, and proficiency ratings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {skills.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGraph(!showGraph)}
              leftIcon={<Network className="w-4 h-4 text-accent" />}
            >
              {showGraph ? 'Hide Graph' : 'Skill Graph'}
            </Button>
          )}

          {isOwner && (
            <Button
              variant="accent"
              size="sm"
              onClick={() => setManagerOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Manage Skills
            </Button>
          )}
        </div>
      </div>

      {/* ── Interactive Skill Graph Drawer ─────────────────────────── */}
      <AnimatePresence>
        {showGraph && userSkillsData?.graph && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <SkillGraphVisualizer
              graphData={userSkillsData.graph}
              studentName={studentName}
              onSelectSkill={(skillId) => setSelectedSkillId(skillId)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Skills Roster ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 bg-surface-raised rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="p-8 text-center bg-surface-raised/30 rounded-2xl border border-dashed border-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-text">No skills added yet</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            {isOwner
              ? 'Add your first skills to help other students discover your expertise and invite you to projects.'
              : `${studentName} hasn't registered any skills yet.`}
          </p>
          {isOwner && (
            <Button
              size="sm"
              variant="accent"
              onClick={() => setManagerOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Skills Now
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Primary Skills Highlight */}
          {primarySkills.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                Featured Focus Areas
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {primarySkills.map((item) => (
                  <SkillCard
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedSkillId(item.skillId)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Skills */}
          {otherSkills.length > 0 && (
            <div className="space-y-2">
              {primarySkills.length > 0 && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Additional Proficiencies
                </span>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {otherSkills.map((item) => (
                  <SkillCard
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedSkillId(item.skillId)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────── */}
      {isOwner && (
        <SkillManagerModal
          userId={userId}
          isOpen={managerOpen}
          onClose={() => setManagerOpen(false)}
        />
      )}

      <SkillDetailModal
        skillId={selectedSkillId}
        onClose={() => setSelectedSkillId(null)}
        onSelectSkill={(id) => setSelectedSkillId(id)}
      />
    </div>
  );
};

// ── Accessible Skill Card Component ──────────────────────────────────────────

const SkillCard: React.FC<{ item: StudentSkill; onClick: () => void }> = ({
  item,
  onClick,
}) => {
  const prof = PROFICIENCY_LABELS[item.proficiency];

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={`p-4 rounded-2xl bg-surface border transition-all text-left cursor-pointer group hover:shadow-md ${
        item.isPrimary
          ? 'border-amber-400/30 hover:border-amber-400/60 bg-gradient-to-br from-surface to-amber-500/[0.03]'
          : 'border-border hover:border-accent/40'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-sm text-text group-hover:text-accent transition-colors truncate">
              {item.skill.name}
            </h3>
            {item.isPrimary && (
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-text-muted mt-0.5 truncate">
            {SKILL_CATEGORY_LABELS[item.skill.category as SkillCategory]}
          </p>
        </div>

        {/* Accessible Level Badge (Text + Bars) */}
        <div className="flex flex-col items-end shrink-0">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${prof.color}`}
          >
            {prof.label}
          </span>
          {/* Level bars indicator */}
          <div className="flex gap-0.5 mt-1.5" title={`Level ${prof.level} of 4`}>
            {[1, 2, 3, 4].map((bar) => (
              <span
                key={bar}
                className={`w-1.5 h-1.5 rounded-xs ${
                  bar <= prof.level ? 'bg-accent' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {item.yearsOfExperience && (
        <div className="mt-3 pt-2.5 border-t border-border/50 text-[11px] text-text-secondary flex items-center justify-between">
          <span>Experience:</span>
          <span className="font-medium text-text font-mono">
            {item.yearsOfExperience} {item.yearsOfExperience === 1 ? 'yr' : 'yrs'}
          </span>
        </div>
      )}
    </div>
  );
};
