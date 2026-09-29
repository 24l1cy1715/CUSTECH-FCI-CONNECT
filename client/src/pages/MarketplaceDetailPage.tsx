import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Tag,
  ArrowLeft,
  MessageSquare,
  User,
  ShieldCheck,
  Send,
  AlertCircle
} from 'lucide-react';
import { marketplaceApi } from '../api/marketplaceApi';
import { MarketplaceService } from '../types/marketplace';

export const MarketplaceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState('');
  const [requirements, setRequirements] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  const { data: serviceData, isLoading } = useQuery({
    queryKey: ['marketplaceDetail', slug],
    queryFn: () => marketplaceApi.getServiceBySlug(slug!),
    enabled: !!slug,
  });

  const service: MarketplaceService | null = (serviceData as any) || null;

  const inquiryMutation = useMutation({
    mutationFn: (body: { message: string; requirements?: string }) =>
      marketplaceApi.submitInquiry(service!.id, body),
    onSuccess: () => {
      setInquirySent(true);
      setMessage('');
      setRequirements('');
      queryClient.invalidateQueries({ queryKey: ['myInquiries'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <ShoppingBag className="w-8 h-8 text-amber-400 animate-bounce mx-auto" />
          <p className="text-sm text-slate-400">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Service Not Found</h2>
          <p className="text-xs text-slate-400">
            This freelance listing could not be found or may have been unlisted.
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = () => {
    if (service.pricingType === 'CONTACT_FOR_PRICE') return 'Contact for price';
    if (service.pricingType === 'NEGOTIABLE') return 'Negotiable';
    if (service.startingPrice) {
      return `₦${service.startingPrice.toLocaleString()} ${
        service.pricingType === 'HOURLY' ? '/ hr' : 'starting'
      }`;
    }
    return 'Negotiable';
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Link */}
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </button>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {service.coverImage && (
              <div className="rounded-2xl overflow-hidden max-h-96 border border-slate-800">
                <img
                  src={service.coverImage}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold">
                    {service.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    Posted on {new Date(service.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {service.title}
                </h1>
              </div>

              <div className="border-t border-slate-800/80 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  About this Service
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>

              {service.skills && (
                <div className="border-t border-slate-800/80 pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Skills & Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(service.skills)
                      ? service.skills
                      : String(service.skills).split(',')
                    ).map((skill: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Inquiry Sidebar */}
          <div className="space-y-6">
            {/* Price Box */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Pricing</span>
                <p className="text-3xl font-extrabold text-amber-400">{formatPrice()}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Estimated Delivery: <strong>{service.deliveryTimeDays} Business Days</strong></span>
              </div>
            </div>

            {/* Provider Box */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Service Provider
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/30 flex items-center justify-center text-lg font-bold text-amber-400">
                  {service.owner?.profile?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {service.owner?.profile?.fullName || service.owner?.email}
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </h4>
                  <p className="text-xs text-slate-400">CUSTECH Faculty of Computing & Informatics</p>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Send Inquiry to Provider
              </h3>

              {inquirySent ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-semibold text-emerald-300">
                    Your inquiry has been sent to the service provider!
                  </p>
                  <p className="text-[11px] text-slate-400">
                    They will receive a notification and can reply to your inquiry.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    inquiryMutation.mutate({ message, requirements });
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="text-xs text-slate-400">Project Requirements / Scope</label>
                    <textarea
                      rows={3}
                      placeholder="Explain what you need built, timeline constraints, etc..."
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400">Personal Message *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Hi, I'm interested in this service for my final year project..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={inquiryMutation.isPending}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {inquiryMutation.isPending ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
