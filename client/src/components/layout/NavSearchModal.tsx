import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, ArrowRight, Sparkles, FolderKanban, Briefcase,
  FlaskConical, Award, ShoppingBag, Vote, Bell, BookOpen,
  MapPin, Activity, Bot, Trophy, Users, QrCode, CreditCard,
  Building, Calendar, Flame, Github, Compass, LayoutDashboard, User
} from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  category: 'My FCI' | 'Explore' | 'Community' | 'Learning' | 'Projects' | 'Research' | 'Opportunities';
  path: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  badge?: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  // My FCI
  { id: 'my-fci', title: 'My FCI Command Center', category: 'My FCI', path: '/my-fci', description: 'Personalized student intelligence & career telemetry', icon: Sparkles, keywords: ['dashboard', 'intelligence', 'summary', 'fci', 'home'], badge: 'AI' },
  { id: 'dashboard', title: 'Student Dashboard', category: 'My FCI', path: '/dashboard', description: 'Overview of courses, alerts and points', icon: LayoutDashboard, keywords: ['dashboard', 'overview', 'stats'] },
  { id: 'profile', title: 'My Profile & Skills', category: 'My FCI', path: '/profile', description: 'Edit your academic profile, department and bio', icon: User, keywords: ['profile', 'skills', 'bio', 'account'] },
  { id: 'digital-id', title: 'Digital FCI Student ID', category: 'My FCI', path: '/digital-id', description: 'QR verifiable cryptographic student card', icon: CreditCard, keywords: ['id', 'card', 'qr', 'verify', 'matric'] },

  // Projects
  { id: 'project-lab', title: 'FCI Project Lab', category: 'Projects', path: '/project-lab', description: 'Collaborative workspaces, kanban tasks & milestones', icon: FolderKanban, keywords: ['lab', 'project', 'workspace', 'kanban', 'tasks', 'milestones'], badge: 'New' },
  { id: 'projects', title: 'Project Showcase', category: 'Projects', path: '/projects', description: 'Browse and showcase student software and hardware projects', icon: Sparkles, keywords: ['showcase', 'portfolio', 'built'] },
  { id: 'team-builder', title: 'AI Team Builder', category: 'Projects', path: '/team-builder', description: 'Find teammates with complementary skills for hackathons', icon: Bot, keywords: ['team', 'hackathon', 'partner', 'builder'], badge: 'AI' },
  { id: 'github', title: 'GitHub Developer Portfolio', category: 'Projects', path: '/github', description: 'Sync repositories, tech stack breakdown & commit stats', icon: Github, keywords: ['git', 'github', 'repo', 'code', 'commit'] },

  // Opportunities
  { id: 'opportunities', title: 'FCI Opportunity Hub', category: 'Opportunities', path: '/opportunities', description: 'Internships, hackathons, scholarships & entry jobs', icon: Briefcase, keywords: ['jobs', 'internships', 'hackathons', 'grants', 'careers'] },
  { id: 'opportunity-tracker', title: 'Opportunity & Competition Tracker', category: 'Opportunities', path: '/opportunities/tracker', description: 'Track applications, countdowns and deadlines', icon: Briefcase, keywords: ['tracker', 'deadlines', 'applications', 'saved'], badge: 'Pro' },
  { id: 'marketplace', title: 'Student Freelance Marketplace', category: 'Opportunities', path: '/marketplace', description: 'Offer or hire student freelance services and gigs', icon: ShoppingBag, keywords: ['freelance', 'marketplace', 'hire', 'gigs', 'services', 'earn'] },

  // Learning
  { id: 'learning', title: 'Smart Study & Learning Hub', category: 'Learning', path: '/learning', description: 'Curated university courses, paths and study resources', icon: BookOpen, keywords: ['study', 'courses', 'notes', 'resources', 'past questions'] },
  { id: 'assessments', title: 'Skill Assessment Center', category: 'Learning', path: '/assessments', description: 'Validate coding & computing skills with verified badges', icon: Award, keywords: ['quiz', 'test', 'exam', 'assessment', 'badge', 'certify'], badge: 'Verified' },

  // Research
  { id: 'research', title: 'Research & Innovation Hub', category: 'Research', path: '/research', description: 'Faculty and student publications, labs & research papers', icon: FlaskConical, keywords: ['research', 'paper', 'journal', 'thesis', 'innovation'] },
  { id: 'siwes', title: 'SIWES & Internship Dashboard', category: 'Research', path: '/siwes', description: 'Industrial training logbook, supervisor reviews & placement', icon: Briefcase, keywords: ['siwes', 'it', 'internship', 'logbook', 'industrial training'] },
  { id: 'copilot', title: 'FCI Copilot AI Assistant', category: 'Research', path: '/copilot', description: 'AI assistant for computing coursework and coding questions', icon: Bot, keywords: ['ai', 'copilot', 'chat', 'assistant', 'help'], badge: 'AI' },

  // Community
  { id: 'communities', title: 'Clubs & Student Communities', category: 'Community', path: '/communities', description: 'Join student tech clubs, departmental societies and groups', icon: Users, keywords: ['club', 'society', 'community', 'groups', 'nacos'] },
  { id: 'student-voice', title: 'Student Voice & Polls', category: 'Community', path: '/student-voice', description: 'Vote in faculty polls and submit student suggestions', icon: Vote, keywords: ['poll', 'vote', 'voice', 'suggestion', 'feedback'] },
  { id: 'activity', title: 'Live Campus Activity Feed', category: 'Community', path: '/activity', description: 'Real-time actions, project launches and achievements', icon: Activity, keywords: ['activity', 'feed', 'stream', 'live', 'updates'] },
  { id: 'mentorship', title: 'Mentorship Network', category: 'Community', path: '/mentorship', description: 'Connect with alumni and senior student peer mentors', icon: Users, keywords: ['mentor', 'alumni', 'guidance', 'mentorship'] },
  { id: 'announcements', title: 'Faculty Announcements & Bulletins', category: 'Community', path: '/announcements', description: 'Official exam timetables, notices and emergency alerts', icon: Bell, keywords: ['announcement', 'notice', 'news', 'exam', 'bulletin'] },

  // Explore
  { id: 'discover', title: 'Discover Students', category: 'Explore', path: '/discover', description: 'Find peer students by department, level and skills', icon: Compass, keywords: ['students', 'search', 'peers', 'classmates'] },
  { id: 'campus', title: 'Smart Campus Map', category: 'Explore', path: '/campus', description: 'Interactive navigation of FCI complexes, labs and hostels', icon: MapPin, keywords: ['map', 'location', 'building', 'hostel', 'lab', 'osara'] },
  { id: 'news', title: 'FCI Tech News', category: 'Explore', path: '/news', description: 'Latest tech news, department updates and student spotlights', icon: Calendar, keywords: ['news', 'articles', 'blog', 'updates'] },
  { id: 'events', title: 'Campus Events & Workshops', category: 'Explore', path: '/events', description: 'Upcoming workshops, bootcamps, tech talks and seminars', icon: Calendar, keywords: ['event', 'workshop', 'seminar', 'talk', 'bootcamp'] },
  { id: 'businesses', title: 'Student Business Directory', category: 'Explore', path: '/businesses', description: 'Discover student-run tech ventures and services in Osara', icon: Building, keywords: ['business', 'store', 'shop', 'services', 'entrepreneur'] },
  { id: 'roommates', title: 'Student Roommate Finder', category: 'Explore', path: '/roommates', description: 'Find compatible student roommates around Osara campus', icon: Users, keywords: ['roommate', 'hostel', 'accommodation', 'rent'] },
  { id: 'leaderboard', title: 'Campus Leaderboard & Points', category: 'Explore', path: '/leaderboard', description: 'Top ranking students by reputation points and contributions', icon: Trophy, keywords: ['leaderboard', 'rank', 'points', 'top', 'karma'] },
  { id: 'achievements', title: 'Student Achievements & Badges', category: 'My FCI', path: '/achievements', description: 'View badges, trophies and milestone achievements', icon: Flame, keywords: ['badge', 'trophy', 'reputation', 'rewards'] },
];

interface NavSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavSearchModal: React.FC<NavSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter items
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return SEARCH_ITEMS.slice(0, 10);
    }
    return SEARCH_ITEMS.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [query]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  };

  const handleSelect = (item: SearchItem) => {
    navigate(item.path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[82vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Quick search navigation"
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-border bg-surface-raised/40">
            <Search className="w-5 h-5 text-accent shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search FCI modules, research, projects, tools (e.g. SIWES, Lab, Polls)..."
              className="w-full bg-transparent text-sm sm:text-base text-text placeholder:text-text-muted focus:outline-none"
            />
            {query ? (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface-raised"
                aria-label="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-text-muted bg-surface-raised border border-border rounded">
                ESC
              </kbd>
            )}
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-1 divide-y divide-border/30"
          >
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-text-muted space-y-1">
                <Search className="w-8 h-8 mx-auto opacity-30 mb-2" />
                <p className="text-sm font-semibold text-text">No matching FCI destination found</p>
                <p className="text-xs text-text-muted">Try searching for "project", "siwes", "assessment", or "scholarship".</p>
              </div>
            ) : (
              filtered.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-100 ${
                      isSelected
                        ? 'bg-accent/12 text-text border border-accent/25'
                        : 'hover:bg-surface-raised text-text-secondary border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-accent text-primary'
                            : 'bg-surface-raised text-text-secondary group-hover:text-text'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold truncate ${isSelected ? 'text-accent' : 'text-text'}`}>
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent uppercase tracking-wider">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted truncate mt-0.5">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider px-2 py-0.5 rounded bg-surface-raised border border-border hidden sm:inline">
                        {item.category}
                      </span>
                      <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-0.5 text-accent' : 'text-text-muted'}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-raised/60 text-[11px] text-text-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded font-mono">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded font-mono">↵</kbd>
                Select
              </span>
            </div>
            <span className="font-semibold text-accent/80">CUSTECH FCI Connect Platform</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
