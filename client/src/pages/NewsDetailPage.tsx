import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Share2, Tag, Eye } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { MOCK_NEWS } from '@/data/mockData';

export const NewsDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = MOCK_NEWS.find((n) => n.slug === slug) || MOCK_NEWS[0];

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        to="/news"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to news
      </Link>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent" size="sm">
            {article.category}
          </Badge>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article.readingTimeMinutes} min read
          </span>
          <span className="text-xs text-text-muted">•</span>
          <span className="text-xs text-text-muted">
            {new Date(article.publishedAt).toLocaleDateString()}
          </span>
        </div>

        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-primary dark:text-white leading-tight">
          {article.title}
        </h1>

        {/* Author bar */}
        <div className="flex items-center gap-3 pt-2 pb-6 border-b border-border">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-primary border border-border">
            {article.author.avatarUrl ? (
              <img
                src={article.author.avatarUrl}
                alt={article.author.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                {article.author.fullName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-sm text-text">{article.author.fullName}</div>
            <div className="text-xs text-text-muted">{article.author.role}</div>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="rounded-3xl overflow-hidden border border-border bg-slate-900/60 backdrop-blur flex items-center justify-center p-2 sm:p-4 shadow-xl">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full max-h-[640px] object-contain rounded-2xl"
        />
      </div>

      {/* Body content */}
      <div className="prose dark:prose-invert max-w-none text-text leading-relaxed space-y-4 text-base sm:text-lg">
        <p className="font-semibold text-lg sm:text-xl text-text-secondary leading-relaxed">
          {article.excerpt}
        </p>
        <div className="whitespace-pre-line text-text-secondary text-base leading-relaxed">
          {article.content}
        </div>
      </div>

      {/* Tags */}
      <div className="pt-6 border-t border-border flex items-center gap-2 flex-wrap">
        <Tag className="w-4 h-4 text-text-muted" />
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-md text-xs bg-surface border border-border text-text-secondary"
          >
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
};
