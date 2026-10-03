import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Code2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ProjectCategory } from '@/types';
import { projectsApi } from '@/api/projectsApi';

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('WEB');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>(['React', 'TypeScript', 'Node.js']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTech = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please enter a project title and description');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await projectsApi.createProject({
        title: title.trim(),
        description: description.trim(),
        category,
        githubUrl: githubUrl.trim() || undefined,
        demoUrl: demoUrl.trim() || undefined,
        technologies,
      });

      toast.success(res.message || 'Project showcase published successfully!');
      navigate('/projects');
    } catch (err: any) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Failed to publish project';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </Link>

      <div className="space-y-2">
        <h1 className="font-display font-extrabold text-3xl text-primary dark:text-white">
          Upload Your Project
        </h1>
        <p className="text-sm text-text-secondary">
          Share your innovation with fellow CUSTECH students, faculty lecturers, and prospective industry recruiters.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. CUSTECH Smart Attendance IoT System"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProjectCategory)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
            >
              <option value="WEB">Web Application</option>
              <option value="MOBILE">Mobile App</option>
              <option value="CYBERSECURITY">Cybersecurity &amp; Network Tools</option>
              <option value="AI">Artificial Intelligence</option>
              <option value="ML">Machine Learning</option>
              <option value="DATA_SCIENCE">Data Science &amp; Analytics</option>
              <option value="IOT">Internet of Things (IoT) &amp; Hardware</option>
              <option value="CLOUD">Cloud &amp; DevOps</option>
              <option value="SOFTWARE_ENGINEERING">Software Engineering</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text">
              Detailed Description *
            </label>
            <textarea
              required
              rows={5}
              placeholder="Explain the problem your project solves, its core architecture, and features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
            />
          </div>

          {/* Tech Stack Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text">
              Technologies Used
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type tech name (e.g. Flutter, PyTorch, Docker) and press Add"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTech();
                  }
                }}
                className="flex-1 px-4 py-2 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddTech}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {technologies.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-surface-raised border border-border text-text"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(t)}
                    className="hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                GitHub Repository URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                Live Demo / Deployment URL
              </label>
              <input
                type="url"
                placeholder="https://myproject.com"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Link to="/projects">
              <Button type="button" variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="accent" size="md" isLoading={isSubmitting}>
              Submit Project
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
