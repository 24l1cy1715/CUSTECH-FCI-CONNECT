import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Code2, Briefcase, Calendar, Flame,
  Trophy, ChevronRight, Users, BookOpen, Zap,
} from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Marquee } from "@/components/common/Marquee";
import {
  MOCK_STUDENTS, MOCK_PROJECTS, MOCK_NEWS,
  MOCK_EVENTS, MOCK_LEADERBOARD,
} from "@/data/mockData";
import { DEPARTMENT_LABELS } from "@/types";
import { CampusMap } from "@/components/common/CampusMap";

export const HomePage: React.FC = () => {
  const featuredProjects = MOCK_PROJECTS.slice(0, 3);
  const latestNews      = MOCK_NEWS.slice(0, 3);
  const topStudents     = MOCK_STUDENTS.slice(0, 3);
  const upcomingEvents  = MOCK_EVENTS.slice(0, 2);

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden">

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary text-white">
        {/* Pattern backdrop */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary-900" />

        {/* Ambient Glowing Orbs */}
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -25, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="glow-orb w-96 h-96 -top-20 -left-20 bg-accent/20"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="glow-orb w-[28rem] h-[28rem] top-1/3 -right-20 bg-blue-500/20"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-20 pb-14 sm:pb-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">

            {/* Left Content with Staggered Entrance */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-5 sm:space-y-6 max-w-2xl"
            >
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-sm"
              >
                <img
                  src="/custech-logo.png"
                  alt="CUSTECH Seal"
                  className="w-5 h-5 object-contain drop-shadow-sm"
                />
                <span className="text-white/90">Faculty of Computing and Informatics</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-white font-extrabold leading-tight text-3xl sm:text-5xl lg:text-5xl tracking-tight"
              >
                The Digital Hub for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-300 to-accent">
                  FCI Students
                </span>{" "}
                at CUSTECH
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-white/70 text-sm sm:text-base leading-relaxed"
              >
                Connect with peers, showcase projects, find roommates, follow campus news, and discover tech businesses across all FCI departments.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col xs:flex-row gap-3">
                <Link to="/register" className="xs:flex-none">
                  <Button
                    variant="accent"
                    size="lg"
                    glow
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full xs:w-auto font-bold"
                  >
                    Join the Community
                  </Button>
                </Link>
                <Link to="/discover" className="xs:flex-none">
                  <Button
                    size="lg"
                    glow
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full xs:w-auto bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    Explore Students
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-center gap-6 sm:gap-10 pt-2 border-t border-white/10"
              >
                {[
                  { val: "1,200+", label: "Students" },
                  { val: "340+",   label: "Projects" },
                  { val: "7",      label: "Departments" },
                ].map(({ val, label }) => (
                  <div key={label} className="group">
                    <div className="font-extrabold text-xl sm:text-2xl text-accent group-hover:scale-105 transition-transform origin-left">
                      {val}
                    </div>
                    <div className="text-xs text-white/55 font-medium">{label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Showcase Cards with Floating Spring Loops */}
            <div className="hidden md:flex flex-col gap-3.5 max-w-sm mx-auto lg:mx-0 lg:ml-auto w-full relative">
              {/* Featured Project Card */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-md shadow-xl"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-primary-700 shrink-0 ring-1 ring-white/20">
                    <img src={featuredProjects[0]?.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-accent font-bold uppercase tracking-wider mb-0.5">Featured Project</p>
                    <p className="text-sm font-bold text-white leading-snug truncate">{featuredProjects[0]?.title}</p>
                    <p className="text-xs text-white/55 mt-0.5 truncate">{featuredProjects[0]?.author?.fullName}</p>
                  </div>
                  <Badge variant="accent" size="sm" className="shadow-sm">
                    <Zap className="w-3 h-3 animate-bounce" /> Hot
                  </Badge>
                </div>
              </motion.div>

              {/* Top Members Card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-md shadow-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Top Members</p>
                  <Trophy className="w-4 h-4 text-accent animate-pulse" />
                </div>
                <div className="space-y-2.5">
                  {topStudents.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-accent w-4 text-center">{i + 1}</span>
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-primary-700 shrink-0 ring-1 ring-white/20">
                        <img src={s.avatarUrl} alt={s.fullName} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{s.fullName}</p>
                        <p className="text-[10px] text-white/45 truncate">{DEPARTMENT_LABELS[s.department]}</p>
                      </div>
                      <span className="text-xs font-mono font-semibold text-accent">{s.communityPoints}pts</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Upcoming Event Card */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-accent rounded-2xl p-4 flex items-center gap-3 shadow-xl shadow-accent/20"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Upcoming Event</p>
                  <p className="text-sm font-bold text-primary leading-snug truncate">{upcomingEvents[0]?.title}</p>
                  <p className="text-xs text-primary/70 mt-0.5">
                    {new Date(upcomingEvents[0]?.startDate ?? "").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats bar with Scroll Reveal ────────────────────── */}
      <section className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden shadow-sm"
          >
            {[
              { icon: Users,    label: "Active Students",  val: "1,240", color: "text-primary dark:text-blue-400" },
              { icon: Code2,    label: "Projects Shared",  val: "340+",  color: "text-accent" },
              { icon: Briefcase,label: "Tech Businesses",  val: "48",    color: "text-emerald-500" },
              { icon: Calendar, label: "Events This Term", val: "12",    color: "text-amber-500" },
            ].map(({ icon: Icon, label, val, color }) => (
              <motion.div
                key={label}
                whileHover={{ backgroundColor: "var(--color-surface-raised)" }}
                transition={{ duration: 0.15 }}
                className="bg-surface flex items-center gap-3 px-4 sm:px-6 py-4 sm:py-5 cursor-default transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center shrink-0 ${color} shadow-xs`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className={`font-extrabold text-xl sm:text-2xl ${color} leading-none`}>{val}</div>
                  <div className="text-[11px] text-text-muted mt-1 leading-tight font-medium">{label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Marquee strip ───────────────────────────────────── */}
      <div className="py-2.5 border-b border-border bg-surface-raised/40 overflow-hidden">
        <Marquee speed="slow">
          <div className="flex items-center gap-6 px-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">
            {["CS", "Cyber Security", "Software Eng.", "Data Science",
              "Computer Eng.", "Info. Systems", "IT Mgmt.", "AI & ML",
              "Open Source", "Hackathons", "Tech Startups", "FCI Community"].map(t => (
              <React.Fragment key={t}>
                <span className="hover:text-accent transition-colors cursor-default">{t}</span>
                <span className="text-accent">·</span>
              </React.Fragment>
            ))}
          </div>
        </Marquee>
      </div>

      {/* ── Featured Projects ────────────────────────────────── */}
      <section className="py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="flex flex-col xs:flex-row xs:items-end justify-between gap-3 mb-6 sm:mb-8"
          >
            <div className="space-y-1">
              <div className="eyebrow"><Code2 className="w-3.5 h-3.5" />Student Projects</div>
              <h2 className="font-extrabold text-primary dark:text-white text-2xl sm:text-3xl">Showcased Innovations</h2>
            </div>
            <Link to="/projects" className="flex items-center gap-1 text-sm font-semibold text-accent hover:underline whitespace-nowrap self-start xs:self-auto group">
              View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {featuredProjects.map(project => (
              <motion.div
                key={project.id}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                <Card hoverable glow className="flex flex-col p-0 overflow-hidden group h-full">
                  <div className="relative h-44 sm:h-48 bg-primary-900 overflow-hidden shrink-0">
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge variant="accent" size="sm" className="shadow-sm">{project.category}</Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 shrink-0 ring-1 ring-white/30">
                        <img src={project.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] font-semibold text-white/90 truncate">{project.author.fullName}</span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
                    <Link to={`/projects/${project.slug}`}>
                      <h3 className="font-bold text-base text-text group-hover:text-accent transition-colors leading-snug line-clamp-2">
                        {project.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed flex-1">{project.description}</p>
                    <div className="flex items-center justify-between text-xs text-text-muted pt-2.5 border-t border-border">
                      <span className="font-medium">{project.likesCount} likes</span>
                      <span className="font-medium">{project.viewsCount} views</span>
                      <Link to={`/projects/${project.slug}`} className="text-accent font-semibold hover:underline flex items-center gap-1 group/link">
                        <span>View Project</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── News + Leaderboard ───────────────────────────────── */}
      <section className="py-10 sm:py-16 bg-surface-raised/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

            {/* News Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 space-y-5"
            >
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <div className="eyebrow"><Flame className="w-3.5 h-3.5" />Newsroom</div>
                  <h2 className="font-extrabold text-primary dark:text-white text-2xl sm:text-3xl">Latest Faculty News</h2>
                </div>
                <Link to="/news" className="flex items-center gap-1 text-sm font-semibold text-accent hover:underline whitespace-nowrap group">
                  All news <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="space-y-3.5">
                {latestNews.map((article, idx) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08, duration: 0.4 }}
                  >
                    <Card hoverable className="p-0 overflow-hidden flex flex-col sm:flex-row group">
                      <div className="h-40 sm:h-auto sm:w-36 lg:w-44 shrink-0 overflow-hidden bg-gray-200 dark:bg-gray-800">
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                        />
                      </div>
                      <div className="flex flex-col justify-between p-4 sm:p-5 flex-1 min-w-0">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="neutral" size="sm">{article.category}</Badge>
                            <span className="text-[11px] text-text-muted">{article.readingTimeMinutes} min read</span>
                          </div>
                          <Link to={`/news/${article.slug}`}>
                            <h3 className="font-bold text-sm sm:text-base text-text group-hover:text-accent transition-colors leading-snug line-clamp-2">
                              {article.title}
                            </h3>
                          </Link>
                          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{article.excerpt}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
                          <span className="text-[11px] text-text-muted font-medium">{article.author.fullName}</span>
                          <Link to={`/news/${article.slug}`} className="text-xs text-accent font-semibold hover:underline">
                            Read →
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Leaderboard Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-5"
            >
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <div className="eyebrow"><Trophy className="w-3.5 h-3.5" />Rankings</div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-primary dark:text-white">Top Minds</h2>
                </div>
                <Link to="/leaderboard" className="flex items-center gap-1 text-sm font-semibold text-accent hover:underline whitespace-nowrap group">
                  Full list <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <Card className="p-0 overflow-hidden divide-y divide-border shadow-md">
                {MOCK_LEADERBOARD.slice(0, 5).map(item => (
                  <motion.div
                    key={item.user.id}
                    whileHover={{ x: 4, backgroundColor: "var(--color-surface-raised)" }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-3 px-4 py-3.5 transition-colors cursor-default"
                  >
                    <span
                      className={`font-mono font-bold text-sm w-5 text-center shrink-0 ${
                        item.rank === 1
                          ? "text-amber-400"
                          : item.rank === 2
                          ? "text-slate-400"
                          : item.rank === 3
                          ? "text-amber-700"
                          : "text-text-muted"
                      }`}
                    >
                      #{item.rank}
                    </span>
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-primary shrink-0 ring-1 ring-border">
                      <img src={item.user.avatarUrl} alt={item.user.fullName} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-text truncate">{item.user.fullName}</p>
                      <p className="text-[11px] text-text-muted truncate">{DEPARTMENT_LABELS[item.user.department]}</p>
                    </div>
                    <span className="font-mono font-bold text-sm text-accent shrink-0">
                      {item.communityPoints.toLocaleString()}
                    </span>
                  </motion.div>
                ))}
              </Card>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Events ──────────────────────────────────────────── */}
      <section className="py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="flex flex-col xs:flex-row xs:items-end justify-between gap-3 mb-6 sm:mb-8"
          >
            <div className="space-y-1">
              <div className="eyebrow"><Calendar className="w-3.5 h-3.5" />Events</div>
              <h2 className="font-extrabold text-primary dark:text-white text-2xl sm:text-3xl">Upcoming on Campus</h2>
            </div>
            <Link to="/events" className="flex items-center gap-1 text-sm font-semibold text-accent hover:underline whitespace-nowrap self-start xs:self-auto group">
              All events <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {upcomingEvents.map((evt, idx) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <Card hoverable glow className="p-0 overflow-hidden group flex flex-col sm:flex-row h-full">
                  <div className="h-44 sm:h-auto sm:w-36 lg:w-44 overflow-hidden bg-primary-900 shrink-0">
                    <img
                      src={evt.bannerUrl}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    />
                  </div>
                  <div className="p-4 sm:p-5 flex flex-col justify-between gap-3 flex-1 min-w-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="accent" size="sm">{evt.category}</Badge>
                        {evt.isVirtual && <Badge variant="neutral" size="sm">Virtual</Badge>}
                      </div>
                      <h3 className="font-bold text-base text-text leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                        {evt.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-accent" />
                          {new Date(evt.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="truncate">{evt.location}</span>
                      </div>
                    </div>
                    <Link to="/events" className="self-start">
                      <Button variant="outline" size="sm">Register</Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Campus Location Map ──────────────────────────────── */}
      <CampusMap />

      {/* ── CTA with Glowing Mesh ────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-800 to-primary-900 py-14 sm:py-20 text-white">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="glow-orb w-[30rem] h-[30rem] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent/25"
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 sm:space-y-6"
        >
          <div className="eyebrow justify-center text-accent">
            <BookOpen className="w-3.5 h-3.5" />Your community awaits
          </div>
          <h2 className="text-white font-extrabold text-2xl sm:text-3xl lg:text-4xl leading-tight">
            Ready to connect with the best minds in CUSTECH FCI?
          </h2>
          <p className="text-white/70 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join over 1,200 students. Share your projects, find roommates, collaborate on research, and build your tech career.
          </p>
          <div className="flex flex-col xs:flex-row gap-3 justify-center pt-2">
            <Link to="/register">
              <Button
                variant="accent"
                size="lg"
                className="w-full xs:w-auto shadow-xl shadow-accent/25"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Free Account
              </Button>
            </Link>
            <Link to="/discover">
              <Button
                size="lg"
                className="w-full xs:w-auto bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                Browse Students
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
};
