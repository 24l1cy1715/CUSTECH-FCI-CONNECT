import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award,
  Clock,
  HelpCircle,
  CheckCircle,
  BarChart3,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { assessmentApi } from '../api/assessmentApi';
import { SkillAssessment, AssessmentAttemptHistory } from '../types/assessment';
import { useAuthStore } from '../store/authStore';

export const SkillAssessmentCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: assessmentsData, isLoading } = useQuery({
    queryKey: ['assessments', selectedCategory, selectedDifficulty],
    queryFn: () =>
      assessmentApi.getAssessments({
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        difficulty: selectedDifficulty !== 'ALL' ? selectedDifficulty : undefined,
      }),
  });

  const { data: attemptsData } = useQuery({
    queryKey: ['myAssessmentAttempts'],
    queryFn: () => assessmentApi.getMyAttempts(),
    enabled: isAuthenticated,
  });

  const assessments: SkillAssessment[] = Array.isArray(assessmentsData) ? assessmentsData : [];
  const attempts: AssessmentAttemptHistory[] = Array.isArray(attemptsData) ? attemptsData : [];

  const categories = [
    'ALL',
    'Programming',
    'Web Development',
    'Cybersecurity',
    'Networking',
    'Data Science',
    'DevOps & Cloud',
    'UI/UX Design',
  ];

  const filteredAssessments = assessments.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.skillName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'BEGINNER':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'INTERMEDIATE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'ADVANCED':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'EXPERT':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl">
              <Award className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                FCI Skill Assessment Center
              </h1>
              <p className="text-sm text-slate-400">
                Demonstrate technical competence through verified institutional assessments and earn verified badges on your Skill Graph.
              </p>
            </div>
          </div>
        </div>

        {/* Verification Value Prop Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-slate-900/60 border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Demonstrate, Don't Just Declare
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Passing an assessment automatically upgrades your skill on the CUSTECH Skill Graph with an official
                verified badge, prioritizing your profile for SIWES placements, research teams, and faculty recommendations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 text-center">
            <div>
              <p className="text-xl font-bold text-amber-400">{attempts.filter((a) => a.isPassed).length}</p>
              <span className="text-xs text-slate-400">Skills Verified</span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-200">{attempts.length}</p>
              <span className="text-xs text-slate-400">Assessments Taken</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search assessment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>

        {/* Assessments Grid */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400">Loading assessments...</div>
        ) : filteredAssessments.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No assessments found</h3>
            <p className="text-xs text-slate-500 mt-1">Try selecting another category or clear your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((item) => {
              const previousAttempt = attempts.find((a) => a.assessmentId === item.id);
              return (
                <div
                  key={item.id}
                  className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition group backdrop-blur-sm shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {item.category}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(item.difficulty)}`}>
                        {item.difficulty}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {item.timeLimitMinutes} mins
                      </span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        {item._count?.questions || item.questions?.length || 10} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                        {item.passingScore}% pass
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                    {previousAttempt ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        {previousAttempt.isPassed ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Passed ({previousAttempt.scorePercentage}%)
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold">
                            Attempted ({previousAttempt.scorePercentage}%)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Not attempted</span>
                    )}

                    <button
                      onClick={() => navigate(`/assessments/${item.slug}`)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-xs transition flex items-center gap-1"
                    >
                      {previousAttempt?.isPassed ? 'Retake' : 'Start Exam'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
