import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Search,
  Plus,
  Heart,
  MessageSquare,
  Eye,
  Github,
  ExternalLink,
  Sparkles,
  Bot,
  ArrowRight,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { MOCK_PROJECTS } from '@/data/mockData';
import { ProjectCategory, Project } from '@/types';
import { projectsApi } from '@/api/projectsApi';

export const ProjectsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const { data: apiProjectsData } = useQuery({
    queryKey: ['projects', selectedCategory, searchTerm],
    queryFn: () =>
      projectsApi.listProjects({
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        search: searchTerm || undefined,
      }),
  });

  const categories: ProjectCategory[] = [
    'WEB',
    'MOBILE',
    'CYBERSECURITY',
    'AI',
    'ML',
    'DATA_SCIENCE',
    'IOT',
    'CLOUD',
    'SOFTWARE_ENGINEERING',
  ];

  const liveProjects: Project[] = apiProjectsData?.data || [];

  const allProjects = useMemo(() => {
    const existingSlugs = new Set(liveProjects.map((p) => p.slug));
    const extraMock = MOCK_PROJECTS.filter((p) => !existingSlugs.has(p.slug));
    return [...liveProjects, ...extraMock];
  }, [liveProjects]);

  const likeMutation = useMutation({
    mutationFn: (id: string) => projectsApi.likeProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleLike = (id: string) => {
    likeMutation.mutate(id);
  };

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.technologies || []).some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'ALL' ||
        project.category === selectedCategory ||
        (selectedCategory === 'WEB' && (project.category as string) === 'WEB_DEVELOPMENT') ||
        (selectedCategory === 'MOBILE' && (project.category as string) === 'MOBILE_DEVELOPMENT') ||
        (selectedCategory === 'AI' && (project.category as string) === 'ARTIFICIAL_INTELLIGENCE') ||
        (selectedCategory === 'ML' && (project.category as string) === 'MACHINE_LEARNING') ||
        (selectedCategory === 'CLOUD' && (project.category as string) === 'CLOUD_COMPUTING');

      return matchesSearch && matchesCategory;
    });
  }, [allProjects, searchTerm, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider">
            <Code2 className="w-4 h-4" />
            Student Showcase
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-primary dark:text-white">
            Faculty Projects &amp; Innovations
          </h1>
          <p className="text-text-secondary text-sm sm:text-base max-w-2xl">
            Explore engineering solutions, open source applications, machine learning experiments, and mobile tools built by FCI undergraduates and researchers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/team-builder">
            <Button variant="outline" size="md" leftIcon={<Bot className="w-4 h-4 text-accent" />}>
              Build a Team
            </Button>
          </Link>
          <Link to="/projects/new">
            <Button variant="accent" size="md" glow leftIcon={<Plus className="w-4 h-4" />}>
              Upload Your Project
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Search & Categories ─────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search projects by title, keywords, or tech stack (e.g. Flutter, PyTorch, Docker)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-primary text-white dark:bg-accent dark:text-black font-semibold'
                : 'bg-surface border border-border text-text hover:bg-surface-raised'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-white dark:bg-accent dark:text-black font-semibold'
                  : 'bg-surface border border-border text-text hover:bg-surface-raised'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Projects Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} hoverable glow className="flex flex-col p-0 overflow-hidden group">
            {/* Project Image */}
            <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={project.images[0]}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge variant="neutral" size="sm">
                  {project.category}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <Link to={`/projects/${project.slug}`}>
                  <h2 className="font-display font-bold text-base sm:text-lg text-primary dark:text-white group-hover:text-accent transition-colors line-clamp-2">
                    {project.title}
                  </h2>
                </Link>

                <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                  {project.description}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface-raised border border-border text-text-secondary"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author & Action Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                    {project.author.fullName.charAt(0)}
                  </div>
                  <span className="text-text-muted font-medium truncate max-w-[100px]">
                    {project.author.fullName}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    to={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-1 font-semibold text-accent hover:underline text-xs group/btn"
                  >
                    <span>View Project</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-text-muted hover:text-text transition-colors"
                      title="View GitHub repository"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleLike(project.id)}
                    className="flex items-center gap-1 text-text-muted hover:text-rose-500 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        project.isLiked ? 'text-rose-500 fill-rose-500' : ''
                      }`}
                    />
                    <span>{project.likesCount}</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
