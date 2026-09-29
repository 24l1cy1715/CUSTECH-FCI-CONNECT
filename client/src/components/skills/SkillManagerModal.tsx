import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  Star,
  Search,
  Check,
  AlertCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  useSkills,
  useUserSkills,
  useAddUserSkill,
  useUpdateUserSkill,
  useDeleteUserSkill,
} from '@/api/skillsApi';
import {
  SkillCategory,
  SkillProficiency,
  SKILL_CATEGORY_LABELS,
  PROFICIENCY_LABELS,
  StudentSkill,
} from '@/types/skills';
import { Button } from '@/components/common/Button';
import toast from 'react-hot-toast';

interface SkillManagerModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PROFICIENCIES: Array<{ id: SkillProficiency; label: string; desc: string; level: number }> = [
  { id: 'BEGINNER', label: 'Beginner', desc: 'Basic knowledge, learning fundamentals', level: 1 },
  { id: 'INTERMEDIATE', label: 'Intermediate', desc: 'Can build real features independently', level: 2 },
  { id: 'ADVANCED', label: 'Advanced', desc: 'Deep technical mastery, optimizes & architectures', level: 3 },
  { id: 'EXPERT', label: 'Expert', desc: 'Subject matter expert, mentors & solves complex edge cases', level: 4 },
];

const CATEGORIES: SkillCategory[] = [
  'PROGRAMMING',
  'WEB_DEVELOPMENT',
  'MOBILE_DEVELOPMENT',
  'CYBERSECURITY',
  'NETWORKING',
  'CLOUD',
  'AI_MACHINE_LEARNING',
  'DATA_SCIENCE',
  'DATABASE',
  'UI_UX',
  'GRAPHIC_DESIGN',
  'DEVOPS',
  'HARDWARE',
  'LEADERSHIP',
  'COMMUNICATION',
  'ENTREPRENEURSHIP',
  'OTHER',
];

export const SkillManagerModal: React.FC<SkillManagerModalProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const { data: userSkillsData, isLoading: loadingUserSkills } = useUserSkills(userId);
  const { data: allSkillsData } = useSkills({ limit: 100 });

  const addSkillMutation = useAddUserSkill(userId);
  const updateSkillMutation = useUpdateUserSkill(userId);
  const deleteSkillMutation = useDeleteUserSkill(userId);

  // Form State
  const [activeTab, setActiveTab] = useState<'MY_SKILLS' | 'ADD_NEW'>('MY_SKILLS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'ALL'>('ALL');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [customSkillName, setCustomSkillName] = useState<string>('');
  const [proficiency, setProficiency] = useState<SkillProficiency>('INTERMEDIATE');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const existingSkillIds = useMemo(() => {
    return new Set(userSkillsData?.skills?.map((s: StudentSkill) => s.skillId) || []);
  }, [userSkillsData]);

  // Filter available skills
  const filteredAvailableSkills = useMemo(() => {
    if (!allSkillsData?.skills) return [];
    return allSkillsData.skills.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [allSkillsData, searchTerm, selectedCategory]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedSkillId && !customSkillName.trim()) {
      setErrorMsg('Please select a skill or enter a new skill name.');
      return;
    }

    // Check if user already has this skill
    if (selectedSkillId && existingSkillIds.has(selectedSkillId)) {
      setErrorMsg('You already have this skill added to your profile.');
      return;
    }

    try {
      await addSkillMutation.mutateAsync({
        skillId: selectedSkillId || undefined,
        skillName: !selectedSkillId ? customSkillName.trim() : undefined,
        category: !selectedSkillId && selectedCategory !== 'ALL' ? selectedCategory : undefined,
        proficiency,
        yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
        isPrimary,
      });

      toast.success('Skill added to your profile! (+20 Community Points)');
      // Reset
      setSelectedSkillId('');
      setCustomSkillName('');
      setSearchTerm('');
      setYearsOfExperience('');
      setIsPrimary(false);
      setActiveTab('MY_SKILLS');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add skill. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const handleTogglePrimary = async (skill: StudentSkill) => {
    try {
      await updateSkillMutation.mutateAsync({
        skillId: skill.skillId,
        payload: { isPrimary: !skill.isPrimary },
      });
      toast.success(skill.isPrimary ? 'Removed primary badge' : 'Set as primary skill!');
    } catch (err: any) {
      toast.error('Failed to update primary status');
    }
  };

  const handleChangeProficiency = async (skill: StudentSkill, newProf: SkillProficiency) => {
    try {
      await updateSkillMutation.mutateAsync({
        skillId: skill.skillId,
        payload: { proficiency: newProf },
      });
      toast.success(`Updated ${skill.skill.name} to ${PROFICIENCY_LABELS[newProf].label}`);
    } catch (err: any) {
      toast.error('Failed to update proficiency');
    }
  };

  const handleDeleteSkill = async (skill: StudentSkill) => {
    if (!window.confirm(`Are you sure you want to remove ${skill.skill.name} from your profile?`)) {
      return;
    }
    try {
      await deleteSkillMutation.mutateAsync(skill.skillId);
      toast.success(`Removed ${skill.skill.name}`);
    } catch (err: any) {
      toast.error('Failed to delete skill');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="skill-manager-title"
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
        <div className="p-6 border-b border-border flex items-center justify-between bg-surface-raised/40">
          <div>
            <h2
              id="skill-manager-title"
              className="font-display font-extrabold text-xl text-primary dark:text-white flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-accent" />
              Manage Skills &amp; Expertise
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Showcase your technical and professional abilities to peers and project leaders.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-raised transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border px-6 bg-surface-raised/20">
          <button
            onClick={() => setActiveTab('MY_SKILLS')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'MY_SKILLS'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            My Skills ({userSkillsData?.skills?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('ADD_NEW')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'ADD_NEW'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add New Skill
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'MY_SKILLS' && (
            <div className="space-y-4">
              {loadingUserSkills ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-surface-raised rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : !userSkillsData?.skills || userSkillsData.skills.length === 0 ? (
                <div className="text-center py-10 space-y-3 bg-surface-raised/30 rounded-2xl border border-dashed border-border p-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent mx-auto flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-text">No skills added yet</h3>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                    Add your first skills to help other students discover your expertise and invite you to collaborative projects.
                  </p>
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={() => setActiveTab('ADD_NEW')}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Your First Skill
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userSkillsData.skills.map((item: StudentSkill) => {
                    const prof = PROFICIENCY_LABELS[item.proficiency as SkillProficiency];
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-surface-raised border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-border/80 transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                          <button
                            onClick={() => handleTogglePrimary(item)}
                            title={item.isPrimary ? 'Primary skill (click to remove)' : 'Click to mark as primary skill'}
                            className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                              item.isPrimary
                                ? 'bg-amber-400/15 border-amber-400/30 text-amber-400'
                                : 'bg-surface border-border text-text-muted hover:text-text'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${item.isPrimary ? 'fill-amber-400' : ''}`} />
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-text">
                                {item.skill.name}
                              </span>
                              {item.isPrimary && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/15 border border-amber-400/30 text-amber-400">
                                  PRIMARY
                                </span>
                              )}
                              <span className="text-[11px] text-text-muted">
                                {SKILL_CATEGORY_LABELS[item.skill.category as SkillCategory]}
                              </span>
                            </div>
                            {item.yearsOfExperience && (
                              <p className="text-xs text-text-secondary mt-0.5">
                                {item.yearsOfExperience} {item.yearsOfExperience === 1 ? 'year' : 'years'} experience
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {/* Proficiency Selector */}
                          <select
                            value={item.proficiency}
                            onChange={(e) => handleChangeProficiency(item, e.target.value as SkillProficiency)}
                            aria-label={`Select proficiency for ${item.skill.name}`}
                            className="text-xs py-1.5 px-2.5 rounded-lg bg-surface border border-border text-text font-medium focus:outline-none focus:border-accent"
                          >
                            {PROFICIENCIES.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.label} (Lvl {p.level})
                              </option>
                            ))}
                          </select>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteSkill(item)}
                            title="Remove skill"
                            className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ADD_NEW' && (
            <form onSubmit={handleAddSkill} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: Select or Search Skill */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  1. Choose or Type a Skill
                </label>

                {/* Category filter pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === 'ALL'
                        ? 'bg-accent text-white font-semibold'
                        : 'bg-surface-raised border border-border text-text-muted hover:text-text'
                    }`}
                  >
                    All Categories
                  </button>
                  {CATEGORIES.slice(0, 8).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-accent text-white font-semibold'
                          : 'bg-surface-raised border border-border text-text-muted hover:text-text'
                      }`}
                    >
                      {SKILL_CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search existing skills or enter a new one..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSelectedSkillId('');
                      setCustomSkillName(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Suggestions List */}
                <div className="max-h-40 overflow-y-auto space-y-1 p-1 bg-surface-raised/40 rounded-xl border border-border">
                  {filteredAvailableSkills.length === 0 ? (
                    <div className="p-3 text-xs text-text-muted text-center">
                      No matching skill in catalog.{' '}
                      {searchTerm.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSkillId('');
                            setCustomSkillName(searchTerm.trim());
                          }}
                          className="text-accent underline font-semibold ml-1"
                        >
                          Add &quot;{searchTerm}&quot; as a new skill
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredAvailableSkills.map((sk) => {
                      const isSelected = selectedSkillId === sk.id;
                      const isAlreadyAdded = existingSkillIds.has(sk.id);
                      return (
                        <button
                          key={sk.id}
                          type="button"
                          disabled={isAlreadyAdded}
                          onClick={() => {
                            setSelectedSkillId(sk.id);
                            setCustomSkillName('');
                            setSearchTerm(sk.name);
                          }}
                          className={`w-full p-2.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                            isAlreadyAdded
                              ? 'opacity-40 cursor-not-allowed bg-transparent'
                              : isSelected
                              ? 'bg-accent text-white font-semibold'
                              : 'hover:bg-surface-raised text-text'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{sk.name}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-surface border border-border text-text-muted'
                              }`}
                            >
                              {SKILL_CATEGORY_LABELS[sk.category]}
                            </span>
                          </div>
                          {isAlreadyAdded ? (
                            <span className="text-[10px] italic text-text-muted">Already added</span>
                          ) : isSelected ? (
                            <Check className="w-4 h-4 shrink-0" />
                          ) : null}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Step 2: Proficiency Selection (Accessible & Visual) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  2. Select Proficiency Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PROFICIENCIES.map((p) => {
                    const isSelected = proficiency === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setProficiency(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-accent/10 border-accent text-text ring-1 ring-accent'
                            : 'bg-surface-raised border-border text-text hover:border-border/80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs flex items-center gap-1.5">
                            {p.label}
                            {/* Visual level bars (accessible indicator) */}
                            <span className="flex gap-0.5 ml-1" aria-hidden="true">
                              {[1, 2, 3, 4].map((bar) => (
                                <span
                                  key={bar}
                                  className={`w-1.5 h-2.5 rounded-xs ${
                                    bar <= p.level
                                      ? isSelected
                                        ? 'bg-accent'
                                        : 'bg-text-secondary'
                                      : 'bg-border'
                                  }`}
                                />
                              ))}
                            </span>
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-accent" />}
                        </div>
                        <p className="text-[11px] text-text-muted leading-tight">{p.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Optional Experience & Primary Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Years of Experience (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    placeholder="e.g. 2"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    id="is-primary-checkbox"
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 rounded text-accent focus:ring-accent border-border"
                  />
                  <label htmlFor="is-primary-checkbox" className="text-xs text-text select-none cursor-pointer">
                    <span className="font-semibold">Mark as Primary Skill</span>
                    <span className="block text-[11px] text-text-muted">
                      Highlights this skill on your profile card
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('MY_SKILLS')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  isLoading={addSkillMutation.isPending}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Save Skill
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
