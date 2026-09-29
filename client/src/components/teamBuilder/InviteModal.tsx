import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, UserCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useSendInvitation } from '@/api/teamBuilderApi';
import { CandidateStudent } from '@/types/teamBuilder';
import { Button } from '@/components/common/Button';
import toast from 'react-hot-toast';

interface InviteModalProps {
  candidate: CandidateStudent | null;
  suggestedRole?: string;
  projectTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COMMON_ROLES = [
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'Mobile Developer',
  'UI/UX Designer',
  'AI / ML Engineer',
  'Data Scientist',
  'Cybersecurity Specialist',
  'DevOps / Cloud Engineer',
  'Project Manager',
  'Technical Researcher',
  'Hardware / IoT Engineer',
];

export const InviteModal: React.FC<InviteModalProps> = ({
  candidate,
  suggestedRole = 'Collaborator',
  projectTitle = 'Our Project',
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [role, setRole] = useState(suggestedRole);
  const [message, setMessage] = useState(
    `Hi ${candidate?.fullName.split(' ')[0] || 'there'}, I would love for you to join as our ${suggestedRole} for "${projectTitle}"!`,
  );
  const [customRole, setCustomRole] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sendInvitationMutation = useSendInvitation();

  if (!isOpen || !candidate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const finalRole = role === 'CUSTOM' ? customRole.trim() : role;
    if (!finalRole) {
      setErrorMsg('Please specify a role for this collaborator.');
      return;
    }

    try {
      await sendInvitationMutation.mutateAsync({
        recipientId: candidate.id,
        role: finalRole,
        message: message.trim() || undefined,
      });

      toast.success(`Invitation sent to ${candidate.fullName}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send invitation. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-surface-raised/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-raised border border-border shrink-0">
              <img
                src={
                  candidate.avatarUrl ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${candidate.fullName}`
                }
                alt={candidate.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2
                id="invite-modal-title"
                className="font-display font-bold text-lg text-primary dark:text-white"
              >
                Invite to Project
              </h2>
              <p className="text-xs text-text-muted">
                Inviting <span className="font-semibold text-text">{candidate.fullName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-raised transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Role selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Project Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
            >
              {COMMON_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="CUSTOM">+ Custom Role...</option>
            </select>

            {role === 'CUSTOM' && (
              <input
                type="text"
                placeholder="Enter custom role title..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
                autoFocus
              />
            )}
          </div>

          {/* Personal message */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Personalized Message (Optional)
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell them why you'd like them to join your team..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/20 text-[11px] text-text-secondary leading-relaxed">
            <strong className="text-accent font-semibold block mb-0.5">Notification Guarantee</strong>
            An in-app collaboration alert will be dispatched to {candidate.fullName}. They can accept or decline directly from their FCI dashboard.
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              isLoading={sendInvitationMutation.isPending}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
