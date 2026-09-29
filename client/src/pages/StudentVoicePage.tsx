import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Vote,
  Lightbulb,
  ThumbsUp,
  CheckCircle,
  Plus,
  Filter,
  Clock,
  Shield,
  Send,
  MessageCircle
} from 'lucide-react';
import { voiceApi } from '../api/voiceApi';
import { VoicePoll, VoiceSuggestion } from '../types/voice';
import { useAuthStore } from '../store/authStore';

export const StudentVoicePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'polls' | 'suggestions'>('polls');
  const [showPollModal, setShowPollModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);

  // Poll Form State
  const [pollForm, setPollForm] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    options: ['', ''],
  });

  // Suggestion Form State
  const [suggestionForm, setSuggestionForm] = useState({
    title: '',
    description: '',
    category: 'CAMPUS_LIFE',
    isAnonymous: false,
  });

  const { data: pollsData, isLoading: loadingPolls } = useQuery({
    queryKey: ['voicePolls'],
    queryFn: () => voiceApi.getPolls(),
  });

  const polls: VoicePoll[] = Array.isArray(pollsData) ? pollsData : [];

  const { data: suggestionsData, isLoading: loadingSuggestions } = useQuery({
    queryKey: ['voiceSuggestions'],
    queryFn: () => voiceApi.getSuggestions(),
  });

  const suggestions: VoiceSuggestion[] = suggestionsData?.suggestions || [];

  // Mutations
  const voteMutation = useMutation({
    mutationFn: ({ pollId, optionIndex }: { pollId: string; optionIndex: number }) =>
      voiceApi.votePoll(pollId, optionIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voicePolls'] });
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: (id: string) => voiceApi.upvoteSuggestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voiceSuggestions'] });
    },
  });

  const createPollMutation = useMutation({
    mutationFn: (body: any) => voiceApi.createPoll(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voicePolls'] });
      setShowPollModal(false);
      setPollForm({ title: '', description: '', category: 'GENERAL', options: ['', ''] });
    },
  });

  const createSuggestionMutation = useMutation({
    mutationFn: (body: any) => voiceApi.createSuggestion(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voiceSuggestions'] });
      setShowSuggestionModal(false);
      setSuggestionForm({ title: '', description: '', category: 'CAMPUS_LIFE', isAnonymous: false });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'IN_PROGRESS':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'PLANNED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'DECLINED':
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
              <Vote className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                FCI Student Voice & Democracy
              </h1>
              <p className="text-sm text-slate-400">
                Participate in faculty governance, vote in student polls, and submit actionable suggestions.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSuggestionModal(true)}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold transition flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Submit Suggestion
            </button>
            <button
              onClick={() => setShowPollModal(true)}
              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Poll
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('polls')}
            className={`pb-3 transition relative flex items-center gap-2 ${
              activeTab === 'polls' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Vote className="w-4 h-4" />
            Active Polls ({polls.length})
            {activeTab === 'polls' && (
              <motion.div layoutId="voiceTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`pb-3 transition relative flex items-center gap-2 ${
              activeTab === 'suggestions' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Community Suggestions ({suggestions.length})
            {activeTab === 'suggestions' && (
              <motion.div layoutId="voiceTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
            )}
          </button>
        </div>

        {/* Tab Contents: Polls */}
        {activeTab === 'polls' && (
          <div className="space-y-6">
            {loadingPolls ? (
              <div className="text-center py-16 text-slate-400">Loading polls...</div>
            ) : polls.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
                <Vote className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-300">No active polls</h3>
                <p className="text-xs text-slate-500 mt-1">Start a discussion by creating the first faculty poll!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {polls.map((poll) => {
                  let options: string[] = [];
                  try {
                    options = typeof poll.options === 'string' ? JSON.parse(poll.options) : poll.options;
                  } catch {
                    options = [];
                  }

                  const hasVoted = poll.hasVoted;
                  const totalVotes = poll.totalVotes || 0;

                  return (
                    <div
                      key={poll.id}
                      className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-amber-400/20">
                            {poll.category}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white leading-snug">{poll.title}</h3>
                        {poll.description && (
                          <p className="text-xs text-slate-400 leading-relaxed">{poll.description}</p>
                        )}
                      </div>

                      {/* Poll Options */}
                      <div className="space-y-2.5 pt-2">
                        {options.map((opt, optIdx) => {
                          const optionVotes = poll.votes?.filter((v) => v.optionIndex === optIdx).length || 0;
                          const percent = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                          const isUserChoice = poll.userVoteIndex === optIdx;

                          return (
                            <button
                              key={optIdx}
                              disabled={hasVoted || voteMutation.isPending}
                              onClick={() => voteMutation.mutate({ pollId: poll.id, optionIndex: optIdx })}
                              className={`w-full text-left p-3 rounded-xl border relative overflow-hidden transition ${
                                isUserChoice
                                  ? 'border-amber-400 bg-amber-500/10'
                                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                              }`}
                            >
                              {/* Background percentage fill if voted */}
                              {hasVoted && (
                                <div
                                  className="absolute top-0 bottom-0 left-0 bg-amber-400/10 rounded-xl transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                />
                              )}

                              <div className="relative flex justify-between items-center text-xs">
                                <span className="font-medium text-slate-200 flex items-center gap-2">
                                  {isUserChoice && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
                                  {opt}
                                </span>
                                {hasVoted && (
                                  <span className="font-mono text-slate-400">
                                    {percent}% ({optionVotes})
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Created by: {poll.creator?.profile?.fullName || 'Faculty Member'}</span>
                        {hasVoted ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Voted
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold">Click an option to vote</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab Contents: Suggestions */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            {loadingSuggestions ? (
              <div className="text-center py-16 text-slate-400">Loading suggestions...</div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
                <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-300">No suggestions submitted yet</h3>
                <p className="text-xs text-slate-500 mt-1">Have an idea to improve FCI? Submit a suggestion!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col md:flex-row gap-6 justify-between items-start"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {item.category.replace('_', ' ')}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white">{item.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {item.description}
                      </p>

                      {item.adminResponse && (
                        <div className="mt-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" /> Faculty Official Response:
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">{item.adminResponse}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
                        <span>
                          By: {item.isAnonymous ? 'Anonymous Student' : item.user?.profile?.fullName || 'FCI Member'}
                        </span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                      <button
                        onClick={() => upvoteMutation.mutate(item.id)}
                        disabled={upvoteMutation.isPending}
                        className="p-2 rounded-lg hover:bg-slate-800 text-amber-400 transition"
                      >
                        <ThumbsUp className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-bold text-white mt-1">{item.upvotesCount}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">Upvotes</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Poll Modal */}
      <AnimatePresence>
        {showPollModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b132b] border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8"
            >
              <h3 className="text-lg font-bold text-white">Create Faculty Poll</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createPollMutation.mutate(pollForm);
                }}
                className="space-y-3 text-sm"
              >
                <div>
                  <label className="text-xs text-slate-400">Poll Question / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Which programming track should be prioritized next semester?"
                    value={pollForm.title}
                    onChange={(e) => setPollForm({ ...pollForm, title: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Context / Description</label>
                  <textarea
                    rows={2}
                    placeholder="Optional background for the poll..."
                    value={pollForm.description}
                    onChange={(e) => setPollForm({ ...pollForm, description: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Category</label>
                  <select
                    value={pollForm.category}
                    onChange={(e) => setPollForm({ ...pollForm, category: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="GENERAL">General</option>
                    <option value="ACADEMICS">Academics</option>
                    <option value="FACILITY">Campus Facilities</option>
                    <option value="EVENTS">Events & Competitions</option>
                    <option value="EXAMINATIONS">Examinations</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Voting Options *</label>
                  {pollForm.options.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      required
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...pollForm.options];
                        newOpts[i] = e.target.value;
                        setPollForm({ ...pollForm, options: newOpts });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  ))}
                  {pollForm.options.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setPollForm({ ...pollForm, options: [...pollForm.options, ''] })}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      + Add Option
                    </button>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowPollModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createPollMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    {createPollMutation.isPending ? 'Publishing...' : 'Publish Poll'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Suggestion Modal */}
      <AnimatePresence>
        {showSuggestionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b132b] border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8"
            >
              <h3 className="text-lg font-bold text-white">Submit Community Suggestion</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createSuggestionMutation.mutate(suggestionForm);
                }}
                className="space-y-3 text-sm"
              >
                <div>
                  <label className="text-xs text-slate-400">Suggestion Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Extended Lab Access for AI/ML Workstations"
                    value={suggestionForm.title}
                    onChange={(e) => setSuggestionForm({ ...suggestionForm, title: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Category</label>
                  <select
                    value={suggestionForm.category}
                    onChange={(e) => setSuggestionForm({ ...suggestionForm, category: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="CAMPUS_LIFE">Campus Life & Welfare</option>
                    <option value="ACADEMICS">Academic Curriculum</option>
                    <option value="FACILITIES">Laboratory & Facilities</option>
                    <option value="INNOVATION">Innovation & Hackathons</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Detailed Proposal *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Explain the suggestion, why it benefits students, and practical implementation..."
                    value={suggestionForm.description}
                    onChange={(e) => setSuggestionForm({ ...suggestionForm, description: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={suggestionForm.isAnonymous}
                    onChange={(e) => setSuggestionForm({ ...suggestionForm, isAnonymous: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
                  />
                  <span>Submit anonymously (Hide my student name from public display)</span>
                </label>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowSuggestionModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSuggestionMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    {createSuggestionMutation.isPending ? 'Submitting...' : 'Submit Suggestion'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
