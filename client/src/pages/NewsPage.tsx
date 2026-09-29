import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, ChevronRight, Search, Tag } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { MOCK_NEWS } from '@/data/mockData';

export const NewsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  const allTags = ['ALL', 'AI', 'Cyber Security', 'Future Tech', 'Design', 'Lab', 'Campus', 'Hackathon', 'Awards'];

  const filteredNews = MOCK_NEWS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'ALL' || item.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider">
          <Flame className="w-4 h-4" />
          FCI Newsroom
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-primary dark:text-white">
          Faculty News, Insights &amp; Announcements
        </h1>
        <p className="text-text-secondary text-sm sm:text-base max-w-2xl">
          Stay informed on campus developments, hackathon winners, academic schedules, technology workshops, and student achievements at CUSTECH Osara.
        </p>
      </div>

      {/* Filter and Tags */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search news by keywords, announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-primary text-white dark:bg-accent dark:text-black font-semibold'
                  : 'bg-surface border border-border text-text hover:bg-surface-raised'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((article) => (
          <Card key={article.id} hoverable className="flex flex-col p-0 overflow-hidden group">
            <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge variant="accent" size="sm">
                  {article.category}
                </Badge>
                {article.isFeatured && (
                  <Badge variant="primary" size="sm">
                    Featured
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readingTimeMinutes} min read
                  </span>
                  <span>•</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>

                <Link to={`/news/${article.slug}`}>
                  <h2 className="font-display font-bold text-lg text-primary dark:text-white group-hover:text-accent transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                </Link>

                <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span className="font-medium text-text">{article.author.fullName}</span>
                <Link
                  to={`/news/${article.slug}`}
                  className="font-semibold text-accent hover:underline flex items-center gap-1"
                >
                  Read <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
