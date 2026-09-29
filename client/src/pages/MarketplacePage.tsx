import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  Filter,
  Plus,
  Clock,
  Tag,
  Star,
  User,
  MessageSquare,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { marketplaceApi } from '../api/marketplaceApi';
import { MarketplaceService, MarketplaceInquiry } from '../types/marketplace';
import { useAuthStore } from '../store/authStore';

export const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInquiriesModal, setShowInquiriesModal] = useState(false);

  // New Service Form
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    skills: '',
    pricingType: 'FIXED' as any,
    startingPrice: 10000,
    deliveryTimeDays: 3,
    coverImage: '',
  });

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['marketplaceServices', selectedCategory, searchQuery],
    queryFn: () =>
      marketplaceApi.getServices({
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        search: searchQuery || undefined,
      }),
  });

  const { data: inquiriesData } = useQuery({
    queryKey: ['myInquiries'],
    queryFn: () => marketplaceApi.getMyInquiries(),
    enabled: showInquiriesModal,
  });

  const services: MarketplaceService[] = servicesData?.services || [];
  const inquiries: MarketplaceInquiry[] = Array.isArray(inquiriesData) ? inquiriesData : [];

  const createServiceMutation = useMutation({
    mutationFn: (body: any) => marketplaceApi.createService(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceServices'] });
      setShowCreateModal(false);
      setServiceForm({
        title: '',
        description: '',
        category: 'Web Development',
        skills: '',
        pricingType: 'FIXED',
        startingPrice: 10000,
        deliveryTimeDays: 3,
        coverImage: '',
      });
    },
  });

  const categories = [
    'ALL',
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Graphics Design',
    'Cybersecurity',
    'Data Analysis',
    'Tutoring',
    'Writing & Content',
    'Video Editing',
  ];

  const formatPrice = (service: MarketplaceService) => {
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl">
              <ShoppingBag className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                FCI Freelance Marketplace
              </h1>
              <p className="text-sm text-slate-400">
                Discover peer engineering, design, and technical services provided by CUSTECH faculty students.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowInquiriesModal(true)}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold transition flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              My Inquiries
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Offer a Service
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search services or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400">Loading freelance services...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No services listed yet</h3>
            <p className="text-xs text-slate-500 mt-1">Be the first student to offer a technical service to peers!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
            >
              Post a Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((item) => (
              <div
                key={item.id}
                className="card-interactive bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group backdrop-blur-sm shadow-sm"
              >
                {item.coverImage ? (
                  <div className="h-40 w-full overflow-hidden relative">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-sm text-xs font-medium text-amber-400 border border-amber-400/20">
                      {item.category}
                    </span>
                  </div>
                ) : (
                  <div className="h-28 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-between px-6 border-b border-slate-800">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 text-xs font-medium text-amber-400 border border-amber-400/20">
                      {item.category}
                    </span>
                    <ShoppingBag className="w-6 h-6 text-slate-700" />
                  </div>
                )}

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400">
                        {item.owner?.profile?.fullName?.charAt(0) || 'U'}
                      </div>
                      <span className="text-xs text-slate-300 font-medium truncate">
                        {item.owner?.profile?.fullName || item.owner?.email}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800/80">
                    {/* Skills pills */}
                    {item.skills && (
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(item.skills)
                          ? item.skills
                          : String(item.skills).split(',')
                        ).slice(0, 3).map((s: string, idx: number) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>~{item.deliveryTimeDays} days delivery</span>
                      </div>
                      <span className="text-sm font-bold text-amber-400">
                        {formatPrice(item)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-950/50 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => navigate(`/marketplace/${item.slug}`)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all cursor-pointer"
                  >
                    <span>View Details &amp; Inquire</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Service Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b132b] border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8"
            >
              <h3 className="text-lg font-bold text-white">Create Freelance Service Listing</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createServiceMutation.mutate(serviceForm);
                }}
                className="space-y-3 text-sm"
              >
                <div>
                  <label className="text-xs text-slate-400">Service Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Fullstack React & Node.js Web App Development"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Category *</label>
                    <select
                      value={serviceForm.category}
                      onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    >
                      {categories.filter((c) => c !== 'ALL').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400">Pricing Model</label>
                    <select
                      value={serviceForm.pricingType}
                      onChange={(e) => setServiceForm({ ...serviceForm, pricingType: e.target.value as any })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="FIXED">Fixed Price</option>
                      <option value="HOURLY">Hourly Rate</option>
                      <option value="NEGOTIABLE">Negotiable</option>
                      <option value="CONTACT_FOR_PRICE">Contact for Price</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Starting Price (₦ NGN)</label>
                    <input
                      type="number"
                      min={0}
                      value={serviceForm.startingPrice}
                      onChange={(e) => setServiceForm({ ...serviceForm, startingPrice: parseInt(e.target.value) || 0 })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400">Estimated Delivery (Days)</label>
                    <input
                      type="number"
                      min={1}
                      value={serviceForm.deliveryTimeDays}
                      onChange={(e) => setServiceForm({ ...serviceForm, deliveryTimeDays: parseInt(e.target.value) || 1 })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Detailed Description *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe what you deliver, requirements from the client, tools and frameworks used..."
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Skills / Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Tailwind, Figma"
                    value={serviceForm.skills}
                    onChange={(e) => setServiceForm({ ...serviceForm, skills: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Cover Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={serviceForm.coverImage}
                    onChange={(e) => setServiceForm({ ...serviceForm, coverImage: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createServiceMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                  >
                    {createServiceMutation.isPending ? 'Publishing...' : 'Publish Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inquiries Modal */}
      <AnimatePresence>
        {showInquiriesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b132b] border border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 my-8"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  Your Service Inquiries
                </h3>
                <button
                  onClick={() => setShowInquiriesModal(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              {inquiries.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No inquiries recorded yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white">
                          Service: {inq.service?.title}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">
                          {inq.status}
                        </span>
                      </div>
                      <p className="text-slate-300">{inq.message}</p>
                      {inq.requirements && (
                        <p className="text-slate-400 italic">Requirements: {inq.requirements}</p>
                      )}
                      <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-800/60 font-mono">
                        <span>From: {inq.sender?.profile?.fullName || inq.sender?.email}</span>
                        <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
