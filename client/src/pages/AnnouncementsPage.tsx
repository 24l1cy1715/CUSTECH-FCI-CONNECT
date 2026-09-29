import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  Pin,
  CheckCircle,
  Eye,
  Filter,
  Search,
  Plus,
  Calendar,
  ShieldAlert,
  Clock,
  Volume2
} from 'lucide-react';
import { announcementApi } from '../api/announcementApi';
import { Announcement } from '../types/announcement';
import { useAuthStore } from '../store/authStore';

export const AnnouncementsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Announcement Form
  const [form, setForm] = useState({
    title: '',
    content: '',
    priority: 'NORMAL' as any,
    category: 'GENERAL' as any,
    audience: 'ALL' as any,
    isPinned: false,
  });

  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ['announcements', selectedPriority, selectedCategory],
    queryFn: () =>
      announcementApi.getAnnouncements({
        priority: selectedPriority !== 'ALL' ? selectedPriority : undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      }),
  });

  const announcements: Announcement[] = announcementsData?.data || [];

  const markReadMutation = useMutation({
    mutationFn: (id: string) => announcementApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => announcementApi.createAnnouncement(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setShowCreateModal(false);
      setForm({
        title: '',
        content: '',
        priority: 'NORMAL',
        category: 'GENERAL',
        audience: 'ALL',
        isPinned: false,
      });
    },
  });

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'IMPORTANT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl">
              <Bell className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Faculty Announcements & Bulletins
              </h1>
              <p className="text-sm text-slate-400">
                Official notices, exam schedules, registration deadlines, and emergency communications.
              </p>
            </div>
          </div>

          {(user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('MODERATOR')) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Publish Announcement
            </button>
          )}
        </div>

        {/* Priority Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2">
            {['ALL', 'URGENT', 'IMPORTANT', 'NORMAL'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedPriority === p
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>

        {/* Announcements List */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400">Loading announcements...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No announcements found</h3>
            <p className="text-xs text-slate-500 mt-1">There are no notices matching your current filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`bg-slate-900/60 border rounded-2xl p-6 backdrop-blur-sm transition relative overflow-hidden ${
                  item.priority === 'URGENT'
                    ? 'border-rose-500/40 bg-gradient-to-r from-rose-500/5 via-slate-900/60 to-slate-900/60 shadow-lg shadow-rose-500/5'
                    : item.isPinned
                    ? 'border-amber-500/40 bg-gradient-to-r from-amber-500/5 via-slate-900/60 to-slate-900/60'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Pin indicator */}
                {item.isPinned && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                    <Pin className="w-3.5 h-3.5" /> Pinned Notice
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPriorityStyle(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(item.publishAt || item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => markReadMutation.mutate(item.id)}
                    className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
                    Mark Read
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>Author: {item.author?.profile?.fullName || 'Faculty Administration'}</span>
                  <span>Target Audience: {item.audience}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b132b] border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8"
            >
              <h3 className="text-lg font-bold text-white">Publish Faculty Announcement</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createMutation.mutate(form);
                }}
                className="space-y-3 text-sm"
              >
                <div>
                  <label className="text-xs text-slate-400">Notice Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mandatory Departmental Project Defense Timetable Release"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Priority Level</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="IMPORTANT">Important</option>
                      <option value="URGENT">Urgent (Immediate Attention)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="GENERAL">General</option>
                      <option value="ACADEMIC">Academic</option>
                      <option value="EXAMINATION">Examination</option>
                      <option value="REGISTRATION">Registration</option>
                      <option value="INTERNSHIP">Internship & SIWES</option>
                      <option value="COMPETITION">Competitions</option>
                      <option value="EMERGENCY">Emergency Notice</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Detailed Notice Content *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter the official announcement text..."
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.isPinned}
                    onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
                  />
                  <span>Pin to top of bulletin board</span>
                </label>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    {createMutation.isPending ? 'Publishing...' : 'Publish Notice'}
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
