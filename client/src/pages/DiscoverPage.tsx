import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  UserPlus,
  Check,
  Github,
  Linkedin,
  Sparkles,
  GraduationCap,
  Bot,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { MOCK_STUDENTS } from '@/data/mockData';
import { Department, DEPARTMENT_LABELS } from '@/types';
import { useSkills } from '@/api/skillsApi';
import { SkillDetailModal } from '@/components/skills/SkillDetailModal';
import { Link } from 'react-router-dom';

export const DiscoverPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL');
  const [selectedProficiency, setSelectedProficiency] = useState<string>('ALL');
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [inspectSkillId, setInspectSkillId] = useState<string | null>(null);

  // Fetch skill catalog for search filter
  const { data: skillsData } = useSkills({ limit: 60 });

  const handleConnect = (id: string) => {
    setConnectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter((student) => {
      const matchesSearch =
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept === 'ALL' || student.department === selectedDept;
      const matchesLevel = selectedLevel === 'ALL' || String(student.level) === selectedLevel;

      const matchesSkill =
        selectedSkill === 'ALL' ||
        student.skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase());

      return matchesSearch && matchesDept && matchesLevel && matchesSkill;
    });
  }, [searchTerm, selectedDept, selectedLevel, selectedSkill]);

  const departments: Department[] = [
    'COMPUTER_SCIENCE',
    'CYBER_SECURITY',
    'SOFTWARE_ENGINEERING',
    'INFORMATION_TECHNOLOGY',
    'DATA_SCIENCE',
    'COMPUTER_ENGINEERING',
    'INFORMATION_SYSTEMS',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ── Page Header & Team Builder Banner ─────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-pulse" />
            FCI Student Network
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-primary dark:text-white">
            Discover FCI Tech Talent
          </h1>
          <p className="text-text-secondary text-sm sm:text-base max-w-2xl leading-relaxed">
            Connect with peers, filter students by verified technical proficiencies, or launch the AI Team Builder for project matchmaking.
          </p>
        </motion.div>

        {/* AI Team Builder Callout */}
        <Link to="/team-builder">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-accent/15 via-emerald-500/10 to-accent/15 border border-accent/30 shadow-sm flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1">
                AI Team Builder
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-text font-medium">Find ideal project collaborators</p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* ── Search & Filter Controls ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name, skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="Filter by department"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent transition-colors"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {DEPARTMENT_LABELS[dept]}
                </option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              aria-label="Filter by academic level"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent transition-colors"
            >
              <option value="ALL">All Academic Levels</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
            </select>
          </div>

          {/* Skill Filter (Database Catalog Driven) */}
          <div>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              aria-label="Filter by specific skill"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent transition-colors"
            >
              <option value="ALL">All Skills</option>
              {skillsData?.skills.map((sk) => (
                <option key={sk.id} value={sk.name}>
                  {sk.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-text-muted flex items-center justify-between">
          <span className="font-medium">Showing {filteredStudents.length} students</span>
          {(searchTerm || selectedDept !== 'ALL' || selectedLevel !== 'ALL' || selectedSkill !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDept('ALL');
                setSelectedLevel('ALL');
                setSelectedSkill('ALL');
              }}
              className="text-accent hover:underline font-medium cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Student Cards Grid ───────────────────────────────────────── */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredStudents.map((student, index) => {
            const isConnected = connectedIds.has(student.id);

            return (
              <motion.div
                key={student.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
              >
                <Card hoverable glow className="flex flex-col justify-between space-y-5 h-full">
                  <div className="space-y-4">
                    {/* Header with Avatar & Points */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-primary shrink-0 border border-border">
                          <img
                            src={student.avatarUrl}
                            alt={student.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <Link to={`/profile?userId=${student.id}`}>
                            <h2 className="font-display font-bold text-base text-primary dark:text-white leading-tight hover:text-accent transition-colors">
                              {student.fullName}
                            </h2>
                          </Link>
                          <p className="text-xs text-text-muted font-mono">@{student.username}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-text-secondary mt-1">
                            <GraduationCap className="w-3.5 h-3.5 text-accent" />
                            <span>{student.level}L • {DEPARTMENT_LABELS[student.department]}</span>
                          </div>
                        </div>
                      </div>

                      <Badge variant="accent" size="sm">
                        {student.communityPoints} pts
                      </Badge>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                      {student.bio}
                    </p>

                    {/* Skills tags (Clickable to view skill details) */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider">
                        Skills &amp; Technologies:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {student.skills.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => {
                              // If matching skill in catalog, open detail
                              const matched = skillsData?.skills.find(
                                (s) => s.name.toLowerCase() === skill.toLowerCase(),
                              );
                              if (matched) {
                                setInspectSkillId(matched.id);
                              } else {
                                setSelectedSkill(skill);
                              }
                            }}
                            title={`Inspect ${skill} or filter peers`}
                            className="px-2 py-0.5 rounded text-[11px] bg-surface-raised border border-border text-text-secondary font-medium hover:border-accent hover:text-accent transition-colors cursor-pointer"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {student.githubUrl && (
                        <a
                          href={student.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
                          title="GitHub"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {student.linkedinUrl && (
                        <a
                          href={student.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
                          title="LinkedIn"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link to={`/team-builder`}>
                        <Button variant="outline" size="sm">
                          Team Up
                        </Button>
                      </Link>
                      <Button
                        variant={isConnected ? 'secondary' : 'accent'}
                        size="sm"
                        onClick={() => handleConnect(student.id)}
                        leftIcon={
                          isConnected ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <UserPlus className="w-3.5 h-3.5" />
                          )
                        }
                      >
                        {isConnected ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* ── Skill Detail Modal ──────────────────────────────────────── */}
      <SkillDetailModal
        skillId={inspectSkillId}
        onClose={() => setInspectSkillId(null)}
        onSelectSkill={(id) => setInspectSkillId(id)}
      />
    </div>
  );
};
