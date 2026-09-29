import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  QrCode,
  Share2,
  Mail,
  Edit3,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  MapPin,
  Calendar,
  Award,
  Layers,
  Sparkles,
  Eye,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Briefcase,
  Code2,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { fetchPublicPortfolio, fetchMyPortfolioSettings } from '@/api/portfolio';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { PortfolioShareModal } from '@/components/portfolio/PortfolioShareModal';
import { PortfolioConnectModal } from '@/components/portfolio/PortfolioConnectModal';
import { PortfolioEditorModal } from '@/components/portfolio/PortfolioEditorModal';
import { DEPARTMENT_LABELS, Department } from '@/types';
import { useAuthStore } from '@/store/authStore';

export const PublicPortfolioPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [editorModalOpen, setEditorModalOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['portfolio', username],
    queryFn: () => fetchPublicPortfolio(username!),
    enabled: Boolean(username),
    retry: 1,
  });

  const { data: mySettings } = useQuery({
    queryKey: ['portfolio-settings'],
    queryFn: fetchMyPortfolioSettings,
    enabled: Boolean(data?.isOwner),
  });

  // Dynamic SEO metadata
  useEffect(() => {
    if (data?.profile) {
      const deptLabel = data.profile.department
        ? DEPARTMENT_LABELS[data.profile.department as Department] || data.profile.department
        : 'Student';
      document.title = `${data.profile.fullName} — ${deptLabel} | CUSTECH FCI Connect`;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute(
        'content',
        data.profile.headline ||
          data.profile.bio ||
          `${data.profile.fullName}'s verified technical portfolio on CUSTECH FCI Connect.`
      );
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
        <div className="h-64 rounded-3xl bg-surface border border-border" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 rounded-2xl bg-surface border border-border" />
          <div className="h-48 rounded-2xl bg-surface border border-border md:col-span-2" />
        </div>
      </div>
    );
  }

  // Handle Privacy or Error States
  if (isError || !data) {
    const errStatus = (error as any)?.response?.status;

    if (errStatus === 401) {
      return (
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-primary dark:text-white">FCI Students Only</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            This student has set their portfolio visibility to FCI Only. Please sign in with your CUSTECH account to view.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/login">
              <Button variant="primary">Sign In to Continue</Button>
            </Link>
          </div>
        </div>
      );
    }

    if (errStatus === 403) {
      return (
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-primary dark:text-white">Private Portfolio</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            This student has set their technical portfolio to private.
          </p>
          <div className="pt-2">
            <Link to="/discover">
              <Button variant="outline">Browse Other Students</Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <h2 className="text-2xl font-bold text-primary dark:text-white">Portfolio Not Found</h2>
        <p className="text-sm text-text-secondary">
          No CUSTECH student portfolio exists with the username <span className="font-mono text-accent">@{username}</span>.
        </p>
        <Link to="/discover">
          <Button variant="primary">Explore Student Directory</Button>
        </Link>
      </div>
    );
  }

  const { profile, skills, projects, achievements, isOwner } = data;
  const deptLabel = profile.department
    ? DEPARTMENT_LABELS[profile.department as Department] || profile.department
    : 'Faculty of Computing & Informatics';

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = skill.category || 'OTHER';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <div>
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Student Directory
        </Link>
      </div>

      {/* ── Hero Profile Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-surface to-surface-raised p-6 sm:p-10 shadow-xl"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 text-center md:text-left">
          {/* Avatar with status border */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-2 border-accent/40 bg-surface-raised shadow-lg">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-display font-extrabold text-4xl text-accent bg-accent/10">
                  {profile.fullName.charAt(0)}
                </div>
              )}
            </div>
            <div
              className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-500 rounded-full text-white shadow-md"
              title="Verified CUSTECH Student"
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Bio & Details */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Badge variant="accent" size="sm">
                FCI • CUSTECH
              </Badge>
              {profile.level && (
                <Badge variant="neutral" size="sm">
                  {profile.level.replace('LEVEL_', '')} Level
                </Badge>
              )}
              {profile.visibility !== 'PUBLIC' && (
                <Badge variant="primary" size="sm" className="flex items-center gap-1">
                  <Lock className="w-3 h-3" /> {profile.visibility}
                </Badge>
              )}
            </div>

            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-primary dark:text-white">
                {profile.fullName}
              </h1>
              <div className="text-sm font-medium text-accent mt-0.5">
                @{profile.username}
              </div>
            </div>

            {profile.headline && (
              <p className="text-base sm:text-lg font-medium text-text leading-snug">
                {profile.headline}
              </p>
            )}

            <div className="text-xs sm:text-sm text-text-secondary flex flex-wrap items-center justify-center md:justify-start gap-y-1 gap-x-4">
              <span>{deptLabel}</span>
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-text-muted" />
                  {profile.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                Joined {new Date(profile.memberSince).getFullYear()}
              </span>
            </div>

            {profile.bio && (
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed pt-1 max-w-2xl whitespace-pre-line">
                {profile.bio}
              </p>
            )}

            {/* Social Links */}
            <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-border bg-surface hover:border-accent text-text-secondary hover:text-accent transition-colors"
                  title="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-border bg-surface hover:border-accent text-text-secondary hover:text-accent transition-colors"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-border bg-surface hover:border-accent text-text-secondary hover:text-accent transition-colors"
                  title="Personal Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {profile.customSections.showContact && (
              <Button
                variant="primary"
                onClick={() => setConnectModalOpen(true)}
                className="flex items-center gap-1.5 text-xs py-2 px-4 shadow-md"
              >
                <Mail className="w-3.5 h-3.5" />
                Connect
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-1.5 text-xs py-2 px-3.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-1.5 text-xs py-2 px-3.5"
              title="Show QR Code"
            >
              <QrCode className="w-4 h-4 text-accent" />
              QR Card
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {isOwner && (
              <Button
                variant="secondary"
                onClick={() => setEditorModalOpen(true)}
                className="flex items-center gap-1.5 text-xs py-2 px-3.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Customize Portfolio
              </Button>
            )}
            <div className="text-[11px] font-mono text-text-muted flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              {profile.portfolioViewsCount} views
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Skills Section (Integrated with Phase 1 Skill Graph) ── */}
      {profile.customSections.showSkills && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Code2 className="w-4 h-4" />
              </div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-primary dark:text-white">
                Technical Skills &amp; Proficiencies
              </h2>
            </div>
            <span className="text-xs font-mono text-text-muted">
              {skills.length} verified
            </span>
          </div>

          {skills.length === 0 ? (
            <Card className="text-center py-10 text-text-muted text-sm">
              No public skills listed on this portfolio yet.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                <Card key={category} className="p-5 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {category.replace(/_/g, ' ')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map((sk) => (
                      <div
                        key={sk.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          sk.isPrimary
                            ? 'bg-accent/10 border-accent/40 text-accent font-semibold shadow-sm'
                            : 'bg-surface border-border text-text hover:border-text-muted'
                        }`}
                      >
                        <span>{sk.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                            sk.proficiency === 'EXPERT'
                              ? 'bg-purple-500/20 text-purple-400'
                              : sk.proficiency === 'ADVANCED'
                              ? 'bg-blue-500/20 text-blue-400'
                              : sk.proficiency === 'INTERMEDIATE'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {sk.proficiency.charAt(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Featured Projects Section ── */}
      {profile.customSections.showProjects && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <Briefcase className="w-4 h-4" />
              </div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-primary dark:text-white">
                Featured Projects
              </h2>
            </div>
            <span className="text-xs font-mono text-text-muted">
              {projects.length} published
            </span>
          </div>

          {projects.length === 0 ? (
            <Card className="text-center py-10 text-text-muted text-sm">
              No public projects showcased yet.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <Card key={proj.id} hoverable className="p-0 overflow-hidden flex flex-col group">
                  {proj.thumbnail && (
                    <div className="h-44 overflow-hidden bg-gray-900 border-b border-border">
                      <img
                        src={proj.thumbnail}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="accent" size="sm">
                          {proj.category.replace(/_/g, ' ')}
                        </Badge>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span className="inline-flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-rose-500" />
                            <span>{proj.likesCount}</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                            <span>{proj.commentsCount}</span>
                          </span>
                        </div>
                      </div>

                      <Link to={`/projects/${proj.slug}`}>
                        <h3 className="font-display font-bold text-lg text-primary dark:text-white group-hover:text-accent transition-colors line-clamp-1">
                          {proj.title}
                        </h3>
                      </Link>

                      {proj.description && (
                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {proj.skills.slice(0, 3).map((sk) => (
                          <span
                            key={sk.id}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-raised border border-border text-text-secondary"
                          >
                            {sk.name}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-text-muted hover:text-accent p-1"
                            title="GitHub Repository"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {proj.demoUrl && (
                          <a
                            href={proj.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-text-muted hover:text-accent p-1"
                            title="Live Demo"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Badges & Achievements Section ── */}
      {profile.customSections.showAchievements && achievements.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-primary dark:text-white">
              Verified Badges &amp; Achievements
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((ach) => (
              <Card key={ach.id} className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text">{ach.name}</h4>
                  <p className="text-[11px] text-text-muted line-clamp-1">{ach.description}</p>
                  <div className="text-[10px] font-mono text-accent font-semibold mt-0.5">
                    +{ach.points} pts
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      <PortfolioShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        username={profile.username}
        fullName={profile.fullName}
        headline={profile.headline}
        department={profile.department}
      />

      <PortfolioConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        username={profile.username}
        fullName={profile.fullName}
      />

      {isOwner && (
        <PortfolioEditorModal
          isOpen={editorModalOpen}
          onClose={() => setEditorModalOpen(false)}
          initialData={mySettings}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
};
