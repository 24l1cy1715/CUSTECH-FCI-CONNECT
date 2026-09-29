import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Heart,
  MessageSquare,
  Share2,
  Calendar,
  Eye,
  Send,
  User,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { MOCK_PROJECTS } from '@/data/mockData';
import { DEPARTMENT_LABELS } from '@/types';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = MOCK_PROJECTS.find((p) => p.slug === slug) || MOCK_PROJECTS[0];

  const [likes, setLikes] = useState(project.likesCount);
  const [isLiked, setIsLiked] = useState(!!project.isLiked);
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Aisha Bello',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      content: 'This architecture is very impressive! Did you consider using WebSockets for the live location sync?',
      date: '2 days ago',
    },
    {
      id: 'c2',
      author: 'Chukwuemeka Okonkwo',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      content: 'Great initiative for CUSTECH Osara campus navigation. Would love to test out the AR module.',
      date: '1 day ago',
    },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: 'Current Student',
        avatar: '',
        content: newComment,
        date: 'Just now',
      },
    ]);
    setNewComment('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </Link>

      {/* Main Banner / Image */}
      <div className="rounded-3xl overflow-hidden border border-border bg-gray-900 h-64 sm:h-96 relative">
        <img
          src={project.images[0]}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="accent" size="md">
            {project.category}
          </Badge>
        </div>
      </div>

      {/* Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-3">
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-primary dark:text-white leading-tight">
            {project.title}
          </h1>

          {/* Author info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary border border-border">
              <img
                src={project.author.avatarUrl}
                alt={project.author.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-semibold text-sm text-text">{project.author.fullName}</div>
              <div className="text-xs text-text-muted">
                {DEPARTMENT_LABELS[project.author.department]} • {project.author.level}L
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={isLiked ? 'secondary' : 'outline'}
            size="md"
            onClick={handleLike}
            leftIcon={
              <Heart
                className={`w-4 h-4 ${isLiked ? 'text-rose-500 fill-rose-500' : ''}`}
              />
            }
          >
            {likes} Likes
          </Button>

          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="md" leftIcon={<Github className="w-4 h-4" />}>
                Repository
              </Button>
            </a>
          )}

          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noreferrer">
              <Button variant="accent" size="md" rightIcon={<ExternalLink className="w-4 h-4" />}>
                Live Preview
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Description & Tech Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h2 className="font-display font-bold text-xl text-primary dark:text-white">
              About the Project
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Comments Section */}
          <div className="pt-6 border-t border-border space-y-6">
            <h3 className="font-display font-bold text-lg text-primary dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" />
              Community Discussion ({comments.length})
            </h3>

            {/* Post comment */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts or feedback on this project..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent"
              />
              <Button type="submit" variant="accent" size="md">
                Post
              </Button>
            </form>

            {/* Comments list */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-surface border border-border rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text">{comment.author}</span>
                    <span className="text-text-muted">{comment.date}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-text">
              Technologies Used
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-lg text-xs font-mono bg-surface-raised border border-border text-text font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Card>

          <Card className="space-y-3 text-xs text-text-secondary">
            <div className="flex items-center justify-between">
              <span>Date Published</span>
              <span className="font-medium text-text">
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Views</span>
              <span className="font-medium text-text">{project.viewsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status</span>
              <Badge variant="success" size="sm">
                Approved
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
