import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  XCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { assessmentApi } from '../api/assessmentApi';
import { SkillAssessment, AssessmentQuestion } from '../types/assessment';

export const AssessmentTakePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<{
    score: number;
    isPassed: boolean;
    passingScore: number;
    message?: string;
  } | null>(null);

  const { data: assessmentData, isLoading, error } = useQuery({
    queryKey: ['assessmentDetail', slug],
    queryFn: () => assessmentApi.getAssessmentBySlug(slug!),
    enabled: !!slug,
  });

  const assessment: SkillAssessment | null = (assessmentData as any) || null;
  const questions: AssessmentQuestion[] = assessment?.questions || [];

  // Initialize countdown timer
  useEffect(() => {
    if (assessment && timeLeftSeconds === null) {
      setTimeLeftSeconds(assessment.timeLimitMinutes * 60);
    }
  }, [assessment, timeLeftSeconds]);

  // Timer Tick
  useEffect(() => {
    if (timeLeftSeconds === null || examSubmitted) return;

    if (timeLeftSeconds <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeftSeconds, examSubmitted]);

  const submitMutation = useMutation({
    mutationFn: () => {
      const timeSpentSeconds = assessment ? (assessment.timeLimitMinutes * 60) - (timeLeftSeconds ?? 0) : 0;
      return assessmentApi.submitAssessment(assessment!.id, {
        timeSpentSeconds,
        answers: selectedAnswers,
      });
    },
    onSuccess: (res: any) => {
      setExamSubmitted(true);
      setExamResult({
        score: res.scorePercentage ?? res.score ?? 0,
        isPassed: res.isPassed ?? false,
        passingScore: res.passingScorePercentage ?? assessment?.passingScorePercentage ?? 70,
      });
      queryClient.invalidateQueries({ queryKey: ['myAssessmentAttempts'] });
      queryClient.invalidateQueries({ queryKey: ['mySkillGraph'] });
    },
  });

  const handleSelectOption = (questionId: string, optIndex: number) => {
    if (examSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optIndex,
    }));
  };

  const handleAutoSubmit = () => {
    if (examSubmitted || !assessment) return;
    submitMutation.mutate();
  };

  const currentQ = questions[currentIdx];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Clock className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading assessment questions...</p>
        </div>
      </div>
    );
  }

  if (!assessment || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Assessment Unavailable</h2>
          <p className="text-xs text-slate-400">
            This assessment has no active questions or could not be found. Please return to the Assessment Center.
          </p>
          <button
            onClick={() => navigate('/assessments')}
            className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
          >
            Back to Assessment Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-6 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Top Bar with Timer */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (
                  examSubmitted ||
                  confirm('Leaving now will forfeit your current assessment progress. Are you sure?')
                ) {
                  navigate('/assessments');
                }
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-white">{assessment.title}</h2>
              <span className="text-xs text-amber-400 font-medium">{assessment.skillName} • {assessment.difficulty}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                (timeLeftSeconds ?? 0) < 120
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              {timeLeftSeconds !== null ? formatTime(timeLeftSeconds) : '--:--'}
            </div>

            <button
              onClick={handleAutoSubmit}
              disabled={examSubmitted || submitMutation.isPending}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              {submitMutation.isPending ? 'Grading...' : 'Submit Exam'}
            </button>
          </div>
        </div>

        {/* Question Stepper Indicator */}
        <div className="flex flex-wrap gap-2 justify-center py-2">
          {questions.map((q, idx) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isCurrent = idx === currentIdx;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center border ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                    : isAnswered
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Question Body */}
        {currentQ && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm space-y-6">
            <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800/80 pb-3">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span className="font-mono text-slate-400">{currentQ.points || 10} Points</span>
            </div>

            <div className="text-base sm:text-lg font-medium text-white leading-relaxed">
              {currentQ.question}
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {(() => {
                let optionsArr: string[] = [];
                try {
                  optionsArr = typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : currentQ.options;
                } catch {
                  optionsArr = ['True', 'False'];
                }

                return optionsArr.map((opt, optIndex) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIndex;
                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleSelectOption(currentQ.id, optIndex)}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition flex items-center gap-3 ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/10 text-white'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400 text-slate-950 font-bold'
                            : 'border-slate-700 text-slate-500'
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}
                      </div>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                });
              })()}
            </div>

            {/* Stepper Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-800/80">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                disabled={currentIdx === questions.length - 1}
                onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1.5 transition"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {examResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0b132b] border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl"
            >
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-slate-800 border-2 border-slate-700">
                {examResult.isPassed ? (
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                ) : (
                  <XCircle className="w-10 h-10 text-rose-400" />
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  {examResult.isPassed ? 'Assessment Passed!' : 'Assessment Incomplete'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {examResult.isPassed
                    ? 'Congratulations! Your score meets the CUSTECH FCI threshold.'
                    : 'You did not achieve the required threshold this time. Review the material and try again.'}
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex justify-around items-center">
                <div>
                  <span className="text-xs text-slate-400 font-mono">Your Score</span>
                  <p className="text-2xl font-bold text-amber-400">{examResult.score}%</p>
                </div>
                <div className="h-8 w-[1px] bg-slate-800" />
                <div>
                  <span className="text-xs text-slate-400 font-mono">Passing Score</span>
                  <p className="text-2xl font-bold text-slate-300">{examResult.passingScore}%</p>
                </div>
              </div>

              {examResult.isPassed && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2 text-left">
                  <Award className="w-5 h-5 shrink-0 text-emerald-400" />
                  <span>
                    Your <strong>{assessment.skillName}</strong> skill has been officially marked as <strong>Verified</strong> on your Student Skill Graph!
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => navigate('/assessments')}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                >
                  All Assessments
                </button>
                <button
                  onClick={() => navigate('/my-fci')}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
                >
                  Go to My FCI
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
