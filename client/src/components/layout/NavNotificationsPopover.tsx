import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ArrowRight, Pin, Check } from 'lucide-react';
import { announcementApi } from '@/api/announcementApi';
import { AnnouncementItem } from '@/types/announcement';

interface NavNotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NavNotificationsPopover: React.FC<NavNotificationsPopoverProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fetch announcements for quick notification feed
  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ['announcements', 'nav-preview'],
    queryFn: () => announcementApi.listAnnouncements(),
    staleTime: 60 * 1000,
  });

  const announcements: AnnouncementItem[] = announcementsData?.announcements || [];
  const unreadCount = announcements.filter((a) => !a.isRead).length;

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  // Click outside to close
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen, onClose]);

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.95 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-surface border border-border shadow-2xl p-0 z-50 overflow-hidden backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-raised/50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold text-text uppercase tracking-wider">
                Faculty Bulletins & Alerts
              </span>
            </div>
            {unreadCount > 0 ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-primary">
                {unreadCount} unread
              </span>
            ) : (
              <span className="text-[10px] text-text-muted">Up to date</span>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/40 p-1">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-text-muted">Loading notices...</div>
            ) : announcements.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted space-y-1">
                <Check className="w-6 h-6 mx-auto text-emerald-500 opacity-60 mb-1" />
                <p className="font-semibold text-text">No unread notices</p>
                <p>All departmental updates are currently cleared.</p>
              </div>
            ) : (
              announcements.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  to="/announcements"
                  onClick={onClose}
                  className="block p-3 rounded-xl hover:bg-surface-raised transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.isPinned && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-accent uppercase">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      {item.priority === 'URGENT' && (
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                          Urgent
                        </span>
                      )}
                      <span className="text-[10px] text-text-muted font-medium">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-muted font-mono shrink-0">
                      {new Date(item.publishAt || item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-text group-hover:text-accent transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-text-muted line-clamp-2 mt-0.5 leading-relaxed">
                    {item.content}
                  </p>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border bg-surface-raised/40">
            <Link
              to="/announcements"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-accent hover:bg-accent/10 transition-colors"
            >
              <span>View All Announcements & Bulletins</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
