import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Clock, CheckCircle2, ArrowRight, Award } from 'lucide-react';
import { LearningPath } from '@/types/learning';

interface LearningPathCardProps {
  path: LearningPath;
}

export const LearningPathCard: React.FC<LearningPathCardProps> = ({ path }) => {
  const enrollment = path.userEnrollment;
  const itemsCount = path.items?.length || 0;

  const difficultyColors = {
    BEGINNER: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    INTERMEDIATE: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
    ADVANCED: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
    ALL_LEVELS: 'bg-accent/15 text-accent border-accent/30',
  };

  return (
    <div className="group relative rounded-2xl bg-surface border border-border hover:border-accent/50 shadow-md hover:shadow-2xl transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between overflow-hidden">
      {/* Background subtle gradient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/15 transition-all pointer-events-none" />

      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-bold tracking-wider uppercase text-text-muted flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-accent" />
            FCI Connect Learning Path
          </span>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              difficultyColors[path.difficulty] || difficultyColors.ALL_LEVELS
            }`}
          >
            {path.difficulty.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Path Title */}
        <Link to={`/learning/paths/${path.slug}`} className="block group-hover:text-accent transition-colors">
          <h3 className="font-extrabold text-lg text-text leading-tight mb-2">
            {path.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-text-muted leading-relaxed line-clamp-3 mb-4">
          {path.description}
        </p>

        {/* Meta Stats: Duration and Steps */}
        <div className="flex items-center gap-4 text-xs text-text-secondary font-mono mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-accent" />
            {path.estimatedDuration}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
            {itemsCount} Steps
          </span>
        </div>
      </div>

      {/* Progress & Action Bottom */}
      <div className="pt-4 border-t border-border/70 mt-2">
        {enrollment ? (
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-text-muted">Path Progress</span>
              <span className="font-mono font-bold text-accent">
                {enrollment.progressPercentage}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  enrollment.isCompleted ? 'bg-emerald-500' : 'bg-accent'
                }`}
                style={{ width: `${enrollment.progressPercentage}%` }}
              />
            </div>
            <Link
              to={`/learning/paths/${path.slug}`}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-accent/15 text-accent hover:bg-accent hover:text-black transition-all"
            >
              {enrollment.isCompleted ? (
                <>
                  <Award className="w-4 h-4" /> Completed (Review)
                </>
              ) : (
                <>
                  Continue Path <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Link>
          </div>
        ) : (
          <Link
            to={`/learning/paths/${path.slug}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-600 transition-all shadow-sm"
          >
            Start Learning Path <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
