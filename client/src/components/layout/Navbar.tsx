import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Sun, Moon, Globe, Sparkles, User, LogOut,
  LayoutDashboard, Settings, ChevronDown, ChevronRight, ShieldCheck,
  Bot, QrCode, Trophy, MapPin, Activity, BookOpen, CreditCard,
  FolderKanban, Briefcase, FlaskConical, Award, ShoppingBag, Vote, Bell, Github,
  Search, Users, Calendar, Building, Compass, Flame, CheckCircle2,
  ExternalLink, Layers
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { NavSearchModal } from "./NavSearchModal";
import { NavNotificationsPopover } from "./NavNotificationsPopover";

interface NavSubItem {
  to: string;
  label: string;
  desc?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  id: string;
  label: string;
  to?: string; // Direct link if clicked directly
  activePatterns: string[];
  items: NavSubItem[];
  wide?: boolean;
}

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { theme, setTheme, setLanguage } = useUIStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN') || user?.email === 'admin@custech.edu.ng';

  // State management
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<any>(null);

  /* Scroll detection for sticky shadow */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* Global keyboard shortcut (Ctrl+K or Cmd+K) for search */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setMobileOpen(false);
        setActiveDropdown(null);
        setUserOpen(false);
        setLangOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const target = e.target as Node;
      if (langRef.current && !langRef.current.contains(target)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(target)) setUserOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (navContainerRef.current && !navContainerRef.current.contains(target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* Close dropdowns and mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
    setUserOpen(false);
    setLangOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Handle dropdown open with hover delay
  const handleMouseEnter = (id: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  // Structured Information Architecture
  const exploreGroup: NavGroup = {
    id: "explore",
    label: "Explore",
    activePatterns: ["/discover", "/opportunities", "/events", "/campus", "/news", "/businesses", "/roommates", "/leaderboard"],
    items: [
      { to: "/discover", label: "Discover Students", desc: "Connect with classmates by department & skill", icon: Compass },
      { to: "/opportunities", label: "Opportunity Hub", desc: "Hackathons, internships & competitions", icon: Briefcase, badge: "Hot" },
      { to: "/events", label: "Events & Workshops", desc: "Faculty tech talks and academic seminars", icon: Calendar },
      { to: "/campus", label: "Smart Campus Map", desc: "Navigate Osara campus buildings & labs", icon: MapPin },
      { to: "/news", label: "FCI Tech News", desc: "Departmental bulletins & student articles", icon: Calendar },
      { to: "/businesses", label: "Business Directory", desc: "Student ventures & tech services", icon: Building },
      { to: "/roommates", label: "Roommate Finder", desc: "Find student housing in Osara", icon: Users },
      { to: "/leaderboard", label: "Campus Leaderboard", desc: "Top contributors & reputation points", icon: Trophy },
    ],
    wide: true,
  };

  const communityGroup: NavGroup = {
    id: "community",
    label: "Community",
    activePatterns: ["/communities", "/activity", "/student-voice", "/mentorship", "/announcements"],
    items: [
      { to: "/communities", label: "Clubs & Societies", desc: "Join student tech societies & clubs", icon: Users },
      { to: "/activity", label: "Live Activity Feed", desc: "Real-time campus updates & project launches", icon: Activity },
      { to: "/student-voice", label: "Student Voice & Polls", desc: "Vote on faculty polls & submit ideas", icon: Vote, badge: "Voice" },
      { to: "/mentorship", label: "Mentorship Network", desc: "Peer coaching with senior students & alumni", icon: Users },
      { to: "/announcements", label: "Official Announcements", desc: "Exam timetables, notices & alerts", icon: Bell },
    ],
  };

  const opportunitiesGroup: NavGroup = {
    id: "opportunities",
    label: "Opportunities",
    to: "/opportunities",
    activePatterns: ["/opportunities", "/marketplace"],
    items: [
      { to: "/opportunities", label: "All Opportunities", desc: "Browse internships, hackathons & jobs", icon: Briefcase },
      { to: "/opportunities/tracker", label: "Application Tracker", desc: "Deadlines, countdowns & application status", icon: Briefcase, badge: "Pro" },
      { to: "/marketplace", label: "Student Marketplace", desc: "Hire student freelancers & offer gigs", icon: ShoppingBag, badge: "Gigs" },
    ],
  };

  const learningGroup: NavGroup = {
    id: "learning",
    label: "Learning",
    to: "/learning",
    activePatterns: ["/learning", "/assessments"],
    items: [
      { to: "/learning", label: "Learning Hub", desc: "Faculty curriculum, study notes & past questions", icon: BookOpen },
      { to: "/assessments", label: "Skill Assessments", desc: "Earn verified badges via timed tech tests", icon: Award, badge: "Verified" },
      { to: "/learning", label: "Structured Paths", desc: "Curated roadmaps for software & cyber security", icon: Layers },
    ],
  };

  const projectsGroup: NavGroup = {
    id: "projects",
    label: "Projects",
    to: "/project-lab",
    activePatterns: ["/project-lab", "/projects", "/team-builder", "/github"],
    items: [
      { to: "/project-lab", label: "FCI Project Lab", desc: "Kanban task boards, milestones & team rooms", icon: FolderKanban, badge: "New" },
      { to: "/projects", label: "Project Showcase", desc: "Explore software & hardware built by students", icon: Sparkles },
      { to: "/team-builder", label: "AI Team Builder", desc: "Match complementary skills for hackathons", icon: Bot, badge: "AI" },
      { to: "/github", label: "GitHub Portfolio", desc: "Showcase code repositories & commit telemetry", icon: Github },
    ],
  };

  const researchGroup: NavGroup = {
    id: "research",
    label: "Research",
    to: "/research",
    activePatterns: ["/research", "/siwes", "/internships", "/copilot"],
    items: [
      { to: "/research", label: "Research & Innovation", desc: "Faculty publications, labs & research thesis", icon: FlaskConical },
      { to: "/siwes", label: "SIWES & Internships", desc: "Industrial training logbook & supervisor sign-offs", icon: Briefcase, badge: "SIWES" },
      { to: "/copilot", label: "FCI Copilot AI", desc: "Personal AI coding & academic study assistant", icon: Bot, badge: "AI" },
    ],
  };

  // Primary navigation groups displayed on large desktop (>= 1440px)
  const fullDesktopGroups = [
    exploreGroup,
    communityGroup,
    opportunitiesGroup,
    learningGroup,
    projectsGroup,
    researchGroup,
  ];

  // Secondary items grouped into intelligent "More ▼" for normal desktop (1200px – 1439px)
  const moreGroup: NavGroup = {
    id: "more",
    label: "More",
    activePatterns: [...projectsGroup.activePatterns, ...researchGroup.activePatterns],
    items: [
      ...projectsGroup.items,
      ...researchGroup.items,
    ],
    wide: true,
  };

  // Languages supported
  const languages = [
    { code: "en", label: "English" },
    { code: "pcm", label: "Naija Pidgin" },
    { code: "yo", label: "Yorùbá" },
    { code: "ha", label: "Hausa" },
    { code: "ig", label: "Igbo" },
  ];

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleLang = (code: string) => {
    i18n.changeLanguage(code);
    setLanguage(code);
    setLangOpen(false);
  };

  const currentLang = languages.find((l) => l.code === i18n.language) ?? languages[0];

  // Check if a group has an active route
  const isGroupActive = (group: NavGroup) => {
    return group.activePatterns.some((pattern) => {
      if (pattern === "/") return location.pathname === "/";
      return location.pathname === pattern || location.pathname.startsWith(pattern + "/");
    });
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
          scrolled
            ? "bg-surface/92 backdrop-blur-xl border-border shadow-xs shadow-black/[0.04]"
            : "bg-surface/98 backdrop-blur-md border-border"
        }`}
      >
        <div className="max-w-[94rem] mx-auto px-3 sm:px-5 lg:px-6">
          <div className="flex items-center justify-between h-16 min-w-0 gap-2">

            {/* ── 1. Brand Logo ─────────────────────────────────────── */}
            <Link
              to="/"
              className="flex items-center gap-2.5 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg pr-1"
              aria-label="CUSTECH FCI Connect Home"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden flex items-center justify-center shrink-0 drop-shadow-xs bg-surface-raised"
              >
                <img
                  src="/custech-logo.png"
                  alt="CUSTECH Logo"
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <div className="flex flex-col leading-tight select-none">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-[15px] sm:text-base tracking-tight text-primary dark:text-white">
                    CUSTECH
                  </span>
                  <span className="font-black text-[15px] sm:text-base tracking-tight text-accent">
                    FCI
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-text-muted font-bold -mt-0.5">
                  Connect
                </span>
              </div>
            </Link>

            {/* ── 2. Desktop Navigation (Visible on >= 1200px) ───────── */}
            <nav
              ref={navContainerRef}
              className="hidden min-[1200px]:flex items-center gap-0.5 xl:gap-1 relative flex-nowrap"
              aria-label="Main navigation"
            >
              {/* Home */}
              <Link
                to="/"
                className={`relative px-2.5 xl:px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-150 whitespace-nowrap ${
                  location.pathname === "/"
                    ? "text-accent font-semibold"
                    : "text-text-secondary hover:text-text hover:bg-surface-raised/80"
                }`}
              >
                {location.pathname === "/" && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-accent/10 border border-accent/25 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                {t("nav.home", "Home")}
              </Link>

              {/* My FCI */}
              <Link
                to="/my-fci"
                className={`relative px-2.5 xl:px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-150 whitespace-nowrap flex items-center gap-1 ${
                  location.pathname.startsWith("/my-fci") || location.pathname.startsWith("/dashboard")
                    ? "text-accent font-semibold"
                    : "text-text-secondary hover:text-text hover:bg-surface-raised/80"
                }`}
              >
                {(location.pathname.startsWith("/my-fci") || location.pathname.startsWith("/dashboard")) && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-accent/10 border border-accent/25 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>My FCI</span>
              </Link>

              {/* Primary Dropdowns for Normal Desktop (1200px - 1439px): Explore, Community, Opportunities, Learning, More */}
              <div className="flex items-center gap-0.5 xl:gap-1 min-[1440px]:hidden">
                {[exploreGroup, communityGroup, opportunitiesGroup, learningGroup, moreGroup].map((group) => {
                  const active = isGroupActive(group);
                  const isOpen = activeDropdown === group.id;

                  return (
                    <div
                      key={group.id}
                      className="relative"
                      onMouseEnter={() => handleMouseEnter(group.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        onClick={() => setActiveDropdown(isOpen ? null : group.id)}
                        className={`group relative flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 whitespace-nowrap ${
                          active
                            ? "text-accent font-semibold"
                            : "text-text-secondary hover:text-accent hover:bg-accent/5 dark:hover:bg-accent/10"
                        }`}
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                      >
                        {active && !isOpen && (
                          <motion.div
                            layoutId="activeNavPill"
                            className="absolute inset-0 bg-accent/10 border border-accent/25 rounded-lg -z-10"
                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                          />
                        )}
                        <span>{group.label}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-accent" : "group-hover:text-accent"
                          }`}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.98 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className={`absolute left-0 top-full mt-1.5 rounded-2xl bg-surface border border-border shadow-2xl p-2 z-50 backdrop-blur-xl ${
                              group.wide ? "w-80 sm:w-96" : "w-72"
                            }`}
                          >
                            <div className="px-2.5 py-1.5 border-b border-border/50 mb-1 flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                {group.label}
                              </span>
                              {group.to && (
                                <Link
                                  to={group.to}
                                  onClick={() => setActiveDropdown(null)}
                                  className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-0.5"
                                >
                                  View all <ChevronRight className="w-3 h-3" />
                                </Link>
                              )}
                            </div>

                            <div className={`space-y-0.5 ${group.wide ? "grid grid-cols-2 gap-1 space-y-0" : ""}`}>
                              {group.items.map((item) => {
                                const Icon = item.icon;
                                const isItemActive = location.pathname === item.to;
                                return (
                                  <Link
                                    key={item.label}
                                    to={item.to}
                                    onClick={() => setActiveDropdown(null)}
                                    className={`flex items-start gap-2.5 p-2 rounded-xl transition-all duration-100 group ${
                                      isItemActive
                                        ? "bg-accent/12 text-accent font-semibold"
                                        : "hover:bg-surface-raised text-text"
                                    }`}
                                  >
                                    <div
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                        isItemActive
                                          ? "bg-accent text-primary"
                                          : "bg-surface-raised text-text-muted group-hover:text-accent group-hover:bg-accent/10"
                                      }`}
                                    >
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[12.5px] leading-tight font-medium truncate">
                                          {item.label}
                                        </span>
                                        {item.badge && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-accent/20 text-accent uppercase">
                                            {item.badge}
                                          </span>
                                        )}
                                      </div>
                                      {item.desc && !group.wide && (
                                        <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">
                                          {item.desc}
                                        </p>
                                      )}
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Full Primary Dropdowns for Large Desktop (>= 1440px) */}
              <div className="hidden min-[1440px]:flex items-center gap-1">
                {fullDesktopGroups.map((group) => {
                  const active = isGroupActive(group);
                  const isOpen = activeDropdown === group.id;

                  return (
                    <div
                      key={group.id}
                      className="relative"
                      onMouseEnter={() => handleMouseEnter(group.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        onClick={() => setActiveDropdown(isOpen ? null : group.id)}
                        className={`group relative flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 whitespace-nowrap ${
                          active
                            ? "text-accent font-semibold"
                            : "text-text-secondary hover:text-accent hover:bg-accent/5 dark:hover:bg-accent/10"
                        }`}
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                      >
                        {active && !isOpen && (
                          <motion.div
                            layoutId="activeNavPill"
                            className="absolute inset-0 bg-accent/10 border border-accent/25 rounded-lg -z-10"
                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                          />
                        )}
                        <span>{group.label}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-accent" : "group-hover:text-accent"
                          }`}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.98 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className={`absolute left-0 top-full mt-1.5 rounded-2xl bg-surface border border-border shadow-2xl p-2.5 z-50 backdrop-blur-xl ${
                              group.wide ? "w-80 sm:w-96" : "w-72"
                            }`}
                          >
                            <div className="px-2.5 py-1.5 border-b border-border/50 mb-1 flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                {group.label}
                              </span>
                              {group.to && (
                                <Link
                                  to={group.to}
                                  onClick={() => setActiveDropdown(null)}
                                  className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-0.5"
                                >
                                  View all <ChevronRight className="w-3 h-3" />
                                </Link>
                              )}
                            </div>

                            <div className={`space-y-0.5 ${group.wide ? "grid grid-cols-2 gap-1 space-y-0" : ""}`}>
                              {group.items.map((item) => {
                                const Icon = item.icon;
                                const isItemActive = location.pathname === item.to;
                                return (
                                  <Link
                                    key={item.label}
                                    to={item.to}
                                    onClick={() => setActiveDropdown(null)}
                                    className={`flex items-start gap-2.5 p-2 rounded-xl transition-all duration-100 group ${
                                      isItemActive
                                        ? "bg-accent/12 text-accent font-semibold"
                                        : "hover:bg-surface-raised text-text"
                                    }`}
                                  >
                                    <div
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                        isItemActive
                                          ? "bg-accent text-primary"
                                          : "bg-surface-raised text-text-muted group-hover:text-accent group-hover:bg-accent/10"
                                      }`}
                                    >
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[12.5px] leading-tight font-medium truncate">
                                          {item.label}
                                        </span>
                                        {item.badge && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-accent/20 text-accent uppercase">
                                            {item.badge}
                                          </span>
                                        )}
                                      </div>
                                      {item.desc && !group.wide && (
                                        <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">
                                          {item.desc}
                                        </p>
                                      )}
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </nav>

            {/* ── 3. Right Utility Controls ─────────────────────────── */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

              {/* Global Quick Search Button */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-text-secondary hover:text-text hover:bg-surface-raised border border-border/70 transition-colors text-xs"
                title="Search CUSTECH FCI Connect (Ctrl+K)"
                aria-label="Search platform"
              >
                <Search className="w-4 h-4 text-text-muted" />
                <span className="hidden min-[1360px]:inline text-xs text-text-muted font-medium">Search</span>
                <kbd className="hidden min-[1360px]:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold text-text-muted bg-surface-raised rounded border border-border">
                  ⌘K
                </kbd>
              </motion.button>

              {/* Notifications Popover Trigger */}
              <div className="relative" ref={notifRef}>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-xl text-text-secondary hover:text-text hover:bg-surface-raised transition-colors"
                  aria-label="Notifications & Bulletins"
                  aria-expanded={notifOpen}
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
                  )}
                </motion.button>

                <NavNotificationsPopover
                  isOpen={notifOpen}
                  onClose={() => setNotifOpen(false)}
                  onUnreadCountChange={setUnreadNotifications}
                />
              </div>

              {/* Language Selector */}
              <div className="relative hidden sm:block" ref={langRef}>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-text-secondary hover:text-text hover:bg-surface-raised transition-colors text-xs"
                  aria-label="Select Language"
                  aria-expanded={langOpen}
                >
                  <Globe className="w-4 h-4 text-text-muted" />
                  <span className="font-mono text-xs font-semibold uppercase">{currentLang.code}</span>
                  <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${langOpen ? "rotate-180" : ""}`} />
                </motion.button>

                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-44 rounded-2xl bg-surface border border-border shadow-xl p-1.5 z-50 backdrop-blur-lg"
                    >
                      <p className="px-2.5 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        Language
                      </p>
                      {languages.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => handleLang(l.code)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-xl transition-colors ${
                            i18n.language === l.code
                              ? "bg-accent/12 text-accent font-semibold"
                              : "text-text hover:bg-surface-raised"
                          }`}
                        >
                          <span className="w-6 h-5 rounded bg-surface-raised border border-border text-[10px] font-mono font-bold flex items-center justify-center text-text-secondary uppercase">
                            {l.code}
                          </span>
                          <span className="flex-1 text-left">{l.label}</span>
                          {i18n.language === l.code && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle Button */}
              <motion.button
                whileTap={{ scale: 0.9, rotate: 15 }}
                onClick={toggleTheme}
                className="p-2 rounded-xl text-text-secondary hover:text-text hover:bg-surface-raised transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-accent" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </motion.button>

              {/* Super Admin Badge (Direct Link for Admins) */}
              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin"
                  className="hidden min-[1360px]:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 transition-all shadow-xs"
                  title="Super Admin Executive Console"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Profile / Auth Button */}
              {isAuthenticated && user ? (
                <div className="relative" ref={userRef}>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setUserOpen(!userOpen)}
                    className="flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-full hover:bg-surface-raised border border-border transition-colors"
                    aria-expanded={userOpen}
                    aria-haspopup="true"
                    aria-label="User profile menu"
                  >
                    <span className="text-xs font-semibold text-text hidden sm:inline max-w-[80px] truncate">
                      {user.profile?.fullName?.split(" ")[0] ?? user.email.split("@")[0]}
                    </span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 ring-1 ring-border">
                      {user.profile?.avatarUrl ? (
                        <img src={user.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user.email.charAt(0).toUpperCase()
                      )}
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {userOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-surface border border-border shadow-2xl p-1.5 z-50 backdrop-blur-xl"
                      >
                        <div className="px-3 py-2 border-b border-border mb-1">
                          <p className="text-xs font-bold text-text truncate">
                            {user.profile?.fullName ?? "FCI Member"}
                          </p>
                          <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                          {user.profile?.communityPoints !== undefined && (
                            <div className="mt-1">
                              <Badge variant="accent" size="sm">
                                <Sparkles className="w-3 h-3" />
                                {user.profile.communityPoints} pts
                              </Badge>
                            </div>
                          )}
                        </div>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl text-accent bg-accent/10 hover:bg-accent/20 transition-colors border border-accent/25 mb-1"
                          >
                            <ShieldCheck className="w-4 h-4 text-accent" />
                            Super Admin Console
                          </Link>
                        )}

                        <div className="space-y-0.5">
                          {[
                            { to: "/my-fci", icon: Sparkles, label: "My FCI Command Center" },
                            { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard Overview" },
                            { to: "/digital-id", icon: CreditCard, label: "Digital Student ID" },
                            { to: "/profile", icon: User, label: "My Profile & Skills" },
                            { to: "/project-lab", icon: FolderKanban, label: "My Project Workspaces" },
                            { to: "/opportunities/tracker", icon: Briefcase, label: "Application Tracker" },
                            { to: "/achievements", icon: Trophy, label: "Achievements & Badges" },
                            { to: "/settings", icon: Settings, label: "Account Settings" },
                          ].map(({ to, icon: Icon, label }) => (
                            <Link
                              key={to}
                              to={to}
                              onClick={() => setUserOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-text hover:bg-surface-raised transition-colors"
                            >
                              <Icon className="w-4 h-4 text-text-muted" />
                              <span>{label}</span>
                            </Link>
                          ))}
                        </div>

                        <div className="my-1 border-t border-border" />
                        <button
                          onClick={() => {
                            logout();
                            setUserOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link to="/login" className="hidden sm:block">
                    <Button variant="ghost" size="sm">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="accent" size="sm">
                      Join FCI
                    </Button>
                  </Link>
                </div>
              )}

              {/* Hamburger Button (Visible on screens < 1200px) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="min-[1200px]:hidden p-2 rounded-xl text-text-secondary hover:text-text hover:bg-surface-raised transition-colors"
                aria-label="Toggle navigation drawer"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* ── 4. Mobile & Tablet Slide-out Drawer (< 1200px) ─────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm min-[1200px]:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[min(100vw,380px)] bg-surface flex flex-col min-[1200px]:hidden shadow-2xl border-l border-border"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation drawer"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0 bg-surface-raised/40">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shrink-0 bg-surface drop-shadow-xs">
                    <img
                      src="/custech-logo.png"
                      alt="CUSTECH Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-extrabold text-sm text-primary dark:text-white">
                    CUSTECH <span className="text-accent">FCI</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl hover:bg-surface-raised transition-colors text-text-muted hover:text-text"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-4 pb-safe">

                {/* Mobile Search Button */}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setSearchOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text-muted hover:text-text transition-colors"
                >
                  <Search className="w-4 h-4 text-accent" />
                  <span>Search modules, projects, SIWES, polls...</span>
                </button>

                {/* Authenticated User Card */}
                {isAuthenticated && user && (
                  <div className="p-3.5 rounded-2xl bg-surface-raised border border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                        {user.profile?.avatarUrl ? (
                          <img src={user.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          user.email.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-text truncate">
                          {user.profile?.fullName ?? "FCI Member"}
                        </p>
                        <p className="text-[11px] text-accent font-semibold">
                          {user.profile?.communityPoints ?? 0} pts
                        </p>
                      </div>
                    </div>
                    <Link to="/my-fci" onClick={() => setMobileOpen(false)}>
                      <Button variant="accent" size="sm">
                        My FCI
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Admin Quick Entry */}
                {isAuthenticated && isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-accent/15 border border-accent/40 text-accent font-bold text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-accent" />
                      Super Admin Console
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/20">
                      EXECUTIVE
                    </span>
                  </Link>
                )}

                {/* Accordion Navigation Groups */}
                <nav className="space-y-1.5" aria-label="Mobile Navigation">
                  {/* Home */}
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      location.pathname === "/"
                        ? "text-accent bg-accent/10 border border-accent/25"
                        : "text-text hover:bg-surface-raised"
                    }`}
                  >
                    <span>Home</span>
                  </Link>

                  {/* My FCI */}
                  <Link
                    to="/my-fci"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      location.pathname.startsWith("/my-fci")
                        ? "text-accent bg-accent/10 border border-accent/25"
                        : "text-text hover:bg-surface-raised"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      My FCI Command Center
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent uppercase">
                      AI
                    </span>
                  </Link>

                  {/* Collapsible Sections */}
                  {[
                    exploreGroup,
                    communityGroup,
                    opportunitiesGroup,
                    learningGroup,
                    projectsGroup,
                    researchGroup,
                  ].map((group) => {
                    const isExpanded = mobileExpandedGroup === group.id;
                    const active = isGroupActive(group);

                    return (
                      <div
                        key={group.id}
                        className="rounded-2xl border border-border/80 overflow-hidden bg-surface"
                      >
                        <button
                          onClick={() => setMobileExpandedGroup(isExpanded ? null : group.id)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                            active
                              ? "text-accent bg-accent/5 font-bold"
                              : "text-text hover:bg-surface-raised"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{group.label}</span>
                            {active && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-accent" : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="px-2 pb-2 space-y-0.5 bg-surface-raised/30 border-t border-border/40"
                            >
                              {group.items.map((item) => {
                                const Icon = item.icon;
                                const isItemActive = location.pathname === item.to;
                                return (
                                  <Link
                                    key={item.label}
                                    to={item.to}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                                      isItemActive
                                        ? "bg-accent/12 text-accent font-semibold"
                                        : "text-text-secondary hover:text-text hover:bg-surface-raised"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <Icon className="w-3.5 h-3.5 text-text-muted" />
                                      <span>{item.label}</span>
                                    </span>
                                    {item.badge && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-accent/20 text-accent uppercase">
                                        {item.badge}
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </nav>

                {/* Language Switcher */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-1">
                    Select Language
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => handleLang(l.code)}
                        className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-[11px] font-semibold border transition-all ${
                          i18n.language === l.code
                            ? "border-accent bg-accent/12 text-accent ring-1 ring-accent/20"
                            : "border-border bg-surface-raised text-text"
                        }`}
                      >
                        <span className="w-5 h-4 rounded bg-surface border border-border text-[9px] font-mono font-bold flex items-center justify-center uppercase">
                          {l.code}
                        </span>
                        <span className="truncate max-w-full">{l.label.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Appearance Theme */}
                <div className="flex items-center justify-between px-1 pt-2 border-t border-border">
                  <span className="text-xs font-medium text-text-secondary">Appearance</span>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-raised border border-border text-xs font-semibold text-text"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="w-3.5 h-3.5 text-accent" />
                        Light
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5 text-text-muted" />
                        Dark
                      </>
                    )}
                  </button>
                </div>

                {/* Auth Controls */}
                {!isAuthenticated ? (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <Link
                      to="/login"
                      className="block"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button variant="outline" size="md" className="w-full">
                        Sign in
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      className="block"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button variant="accent" size="md" className="w-full">
                        Join FCI
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="border-t border-border pt-2">
                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-rose-500 bg-rose-500/8 hover:bg-rose-500/15 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── 5. Spotlight Search Modal (Command Palette) ────────────── */}
      <NavSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
};
