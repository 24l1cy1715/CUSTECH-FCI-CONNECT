import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Plus,
  Star,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { MOCK_BUSINESSES } from '@/data/mockData';

export const BusinessesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = MOCK_BUSINESSES.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            Commercial Tech Ecosystem
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-primary dark:text-white">
            Technology Businesses &amp; Agencies
          </h1>
          <p className="text-text-secondary text-sm sm:text-base max-w-2xl">
            Discover student-founded and alumni-led digital agencies, cybersecurity consultancies, and hardware repair workshops connected to CUSTECH FCI.
          </p>
        </div>

        <Link to="/businesses/new">
          <Button variant="accent" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            Register Your Business
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search businesses by name, services, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent shadow-sm"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((biz) => (
          <Card key={biz.id} hoverable className="flex flex-col justify-between p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary shrink-0 flex items-center justify-center text-white border border-border">
                    {biz.logoUrl ? (
                      <img src={biz.logoUrl} alt={biz.name} className="w-full h-full object-cover" />
                    ) : (
                      <Briefcase className="w-7 h-7 text-accent" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg text-primary dark:text-white flex items-center gap-1.5">
                      {biz.name}
                      {biz.verified && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                    </h2>
                    <p className="text-xs text-text-muted">{biz.category}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mt-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{biz.rating} ({biz.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <Badge variant="neutral" size="sm">
                  {biz.owner.fullName.split(' ')[0]}&apos;s Enterprise
                </Badge>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                {biz.description}
              </p>

              {/* Services */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider">
                  Services Offered:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {biz.services.map((svc) => (
                    <span
                      key={svc}
                      className="px-2.5 py-1 rounded-lg text-xs bg-surface-raised border border-border text-text-secondary"
                    >
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {biz.websiteUrl && (
                  <a
                    href={biz.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-surface-raised transition-colors"
                    title="Website"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                <a
                  href={`mailto:${biz.email}`}
                  className="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-surface-raised transition-colors"
                  title="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>

              <div className="flex items-center gap-2">
                {biz.whatsapp && (
                  <a
                    href={`https://wa.me/${biz.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-500" />}
                    >
                      Chat
                    </Button>
                  </a>
                )}
                <a href={`tel:${biz.phone}`}>
                  <Button variant="accent" size="sm" leftIcon={<Phone className="w-3.5 h-3.5" />}>
                    Call
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
