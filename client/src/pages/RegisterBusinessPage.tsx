import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, Plus, X } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export const RegisterBusinessPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('Software Development');
  const [description, setDescription] = useState('');
  const [serviceInput, setServiceInput] = useState('');
  const [services, setServices] = useState<string[]>([
    'Web Development',
    'Mobile Apps',
  ]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddService = () => {
    if (serviceInput.trim() && !services.includes(serviceInput.trim())) {
      setServices([...services, serviceInput.trim()]);
      setServiceInput('');
    }
  };

  const handleRemoveService = (svc: string) => {
    setServices(services.filter((s) => s !== svc));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/businesses');
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        to="/businesses"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to tech businesses
      </Link>

      <div className="space-y-2">
        <h1 className="font-display font-extrabold text-3xl text-primary dark:text-white">
          Register Your Tech Business
        </h1>
        <p className="text-sm text-text-secondary">
          Get listed in the official CUSTECH FCI commercial directory to reach campus clients and community enterprises.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text">
              Business / Agency Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ConfluenceByte Solutions"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              >
                <option value="Software Development">Software Development</option>
                <option value="Cybersecurity & Hardware">Cybersecurity &amp; Hardware</option>
                <option value="Design & Multimedia">UI/UX &amp; Graphic Design</option>
                <option value="Cloud & Networking">Cloud &amp; Networking</option>
                <option value="IT Services & Training">IT Services &amp; Training</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                One-Line Tagline *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Modern web & mobile apps for Kogi enterprises"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text">
              Full Business Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Explain your offerings, expertise, past work, and target clients..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
            />
          </div>

          {/* Services list */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text">
              Services Offered
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type service (e.g. SEO, Cloud Migration) and press Add"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddService();
                  }
                }}
                className="flex-1 px-4 py-2 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddService}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {services.map((svc) => (
                <span
                  key={svc}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-surface-raised border border-border text-text"
                >
                  {svc}
                  <button
                    type="button"
                    onClick={() => handleRemoveService(svc)}
                    className="hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                Business Email *
              </label>
              <input
                type="email"
                required
                placeholder="contact@business.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+234 802 111 2233"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                WhatsApp Business Link
              </label>
              <input
                type="tel"
                placeholder="+234 802 111 2233"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                Website or Portfolio
              </label>
              <input
                type="url"
                placeholder="https://mybusiness.ng"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Link to="/businesses">
              <Button type="button" variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="accent" size="md" isLoading={isSubmitting}>
              Submit Application
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
