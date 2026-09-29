import React, { useState } from 'react';
import {
  Megaphone,
  Radio,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  Send,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAdminStore } from '@/store/adminStore';
import toast from 'react-hot-toast';

export const AdminAnnouncementsManager: React.FC = () => {
  const { announcements, createAnnouncement, toggleAnnouncement, deleteAnnouncement } =
    useAdminStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT' | 'CRITICAL'>('NORMAL');
  const [category, setCategory] = useState<'FACULTY' | 'EXAM' | 'SECURITY' | 'HACKATHON' | 'GENERAL'>('FACULTY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      createAnnouncement(title, content, priority, category);
      setIsSubmitting(false);
      setTitle('');
      setContent('');
      toast.success('Official announcement broadcasted to all active faculty portals!');
    }, 600);
  };

  const handleDelete = (id: string, annTitle: string) => {
    deleteAnnouncement(id);
    toast.success(`Announcement "${annTitle}" revoked from public feed.`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Col: Broadcast Composer ── */}
        <Card className="lg:col-span-1 p-5 sm:p-6 space-y-4 bg-white border border-slate-200 h-fit">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
            <h2 className="font-bold text-base text-slate-800">Dispatch Campus Broadcast</h2>
          </div>
          <p className="text-xs text-slate-500">
            Publish an executive bulletin or urgent security alert across all FCI portal headers and student dashboards.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Broadcast Title</label>
              <input
                type="text" required
                placeholder="e.g. Exam Timetable Released for 300L..."
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as any)}
                  className="mt-1 w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-blue-400">
                  <option value="FACULTY">Faculty Notice</option>
                  <option value="EXAM">Examination</option>
                  <option value="SECURITY">Security / 2FA</option>
                  <option value="HACKATHON">Hackathon</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as any)}
                  className="mt-1 w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-blue-400">
                  <option value="NORMAL">Normal (Info)</option>
                  <option value="URGENT">Urgent (Yellow)</option>
                  <option value="CRITICAL">Critical (Red Banner)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Broadcast Message Content</label>
              <textarea required rows={5}
                placeholder="Type the full announcement content here..."
                value={content} onChange={(e) => setContent(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-blue-400 resize-none leading-relaxed"
              />
            </div>

            <Button type="submit" variant="accent" className="w-full" isLoading={isSubmitting}
              leftIcon={<Send className="w-3.5 h-3.5" />}>
              Broadcast Notice
            </Button>
          </form>
        </Card>

        {/* ── Right 2 Cols: Active Announcements Feed ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-500" />
              Active Faculty Bulletins ({announcements.length})
            </h2>
          </div>

          <div className="space-y-3">
            {announcements.map((anc) => (
              <Card
                key={anc.id}
                className={`p-5 space-y-3 bg-white border-l-4 transition-all ${
                  anc.priority === 'CRITICAL'
                    ? 'border-l-rose-500 bg-rose-50/50'
                    : anc.priority === 'URGENT'
                    ? 'border-l-amber-500 bg-amber-50/50'
                    : 'border-l-blue-500'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        anc.priority === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700'
                          : anc.priority === 'URGENT'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {anc.priority}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{anc.category}</span>
                      <span className="text-[11px] text-slate-300">·</span>
                      <span className="text-[11px] text-slate-400">{new Date(anc.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-base text-slate-800 mt-1">{anc.title}</h3>
                  </div>
                  <button onClick={() => handleDelete(anc.id, anc.title)}
                    className="p-1.5 rounded-lg border border-slate-200 text-rose-400 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                    title="Revoke / Delete Announcement">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{anc.content}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Author: {anc.createdBy}</span>
                  <button onClick={() => { toggleAnnouncement(anc.id); toast.success(`Announcement set to ${!anc.isActive ? 'Active' : 'Archived'}`); }}
                    className={`font-semibold hover:underline ${ anc.isActive ? 'text-emerald-600' : 'text-slate-400' }`}>
                    {anc.isActive ? '● Live on Portal' : '○ Archived (Inactive)'}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
