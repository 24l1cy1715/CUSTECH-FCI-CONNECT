import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Compass,
  Building2,
} from 'lucide-react';
import {
  CUSTECH_MAP_EMBED_URL,
  CUSTECH_LOCATION_DETAILS,
} from '@/constants/map';
import { Button } from '@/components/common/Button';

export interface CampusMapProps {
  className?: string;
  showSectionHeader?: boolean;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  className = '',
  showSectionHeader = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Animation variants respecting prefers-reduced-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0.1 }
        : { staggerChildren: 0.09, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.45,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      id="campus-location"
      aria-labelledby="campus-location-heading"
      className={`py-12 sm:py-16 lg:py-20 bg-surface/60 border-t border-border ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
          className="space-y-6 sm:space-y-8"
        >
          {/* ── Section Header ───────────────────────────────────── */}
          {showSectionHeader && (
            <div className="space-y-2 max-w-2xl">
              <motion.div variants={itemVariants} className="eyebrow">
                <Compass className="w-3.5 h-3.5" />
                FIND US
              </motion.div>
              <motion.h2
                id="campus-location-heading"
                variants={itemVariants}
                className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-primary dark:text-white tracking-tight"
              >
                Visit CUSTECH
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-text-secondary text-sm sm:text-base leading-relaxed"
              >
                Confluence University of Science and Technology, Osara, Kogi State.
              </motion.p>
            </div>
          )}

          {/* ── Main Map Card Container ─────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="bg-surface rounded-2xl sm:rounded-3xl border border-border shadow-md overflow-hidden relative"
          >
            {/* Map Frame Area */}
            <div className="relative w-full overflow-hidden bg-surface-raised">
              {/* Floating Location Overlay Badge (Top-left, non-intrusive) */}
              <div className="absolute top-3.5 left-3.5 sm:top-5 sm:left-5 z-20 pointer-events-auto max-w-[calc(100%-2rem)] sm:max-w-xs">
                <div className="flex items-center gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-primary/95 text-white backdrop-blur-md border border-white/15 shadow-lg shadow-black/15">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-accent animate-bounce" />
                  </div>
                  <div className="min-w-0 pr-1">
                    <p className="text-xs font-bold leading-tight truncate text-white">
                      {CUSTECH_LOCATION_DETAILS.shortName}
                    </p>
                    <p className="text-[11px] text-white/70 leading-tight truncate">
                      {CUSTECH_LOCATION_DETAILS.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Iframe or Graceful Placeholder */}
              {CUSTECH_MAP_EMBED_URL ? (
                <iframe
                  src={CUSTECH_MAP_EMBED_URL}
                  width="100%"
                  height="500"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Confluence University of Science and Technology location"
                  className="h-[380px] w-full sm:h-[450px] lg:h-[500px] block"
                />
              ) : (
                <div
                  role="region"
                  aria-label="Campus map preview"
                  className="h-[380px] w-full sm:h-[450px] lg:h-[500px] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary to-primary-950 text-white"
                >
                  {/* Background map grid effect */}
                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E\")",
                    }}
                  />

                  {/* Topographic glow circles */}
                  <div className="absolute w-72 h-72 rounded-full border border-accent/20 animate-pulse-glow pointer-events-none" />
                  <div className="absolute w-96 h-96 rounded-full border border-white/10 pointer-events-none" />

                  <div className="relative z-10 max-w-md space-y-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-accent/20 text-accent flex items-center justify-center mx-auto ring-4 ring-accent/10 shadow-lg">
                      <MapPin className="w-7 h-7 stroke-[2.5]" />
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                        {CUSTECH_LOCATION_DETAILS.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/70 mt-1 font-mono">
                        {CUSTECH_LOCATION_DETAILS.address}
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2.5 justify-center">
                      <a
                        href={CUSTECH_LOCATION_DETAILS.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-primary-950 font-bold text-xs hover:bg-accent-400 transition-colors shadow-md"
                        aria-label="Open directions to CUSTECH in Google Maps"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Open in Google Maps</span>
                      </a>
                    </div>

                    <p className="text-[11px] text-white/50 pt-2 italic">
                      Paste the Google Maps Share → Embed iframe URL into{' '}
                      <code className="px-1.5 py-0.5 rounded bg-white/10 text-accent font-mono text-[10px]">
                        src/constants/map.ts
                      </code>{' '}
                      to display live map tiles.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Location Information & Action Bar Below Map ──── */}
            <div className="p-4 sm:p-6 lg:p-7 border-t border-border bg-surface">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
                {/* Location and Address Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 flex-1 min-w-0">
                  {/* Location Info */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-accent" />
                      Location
                    </span>
                    <p className="font-semibold text-sm sm:text-base text-text leading-snug">
                      {CUSTECH_LOCATION_DETAILS.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {CUSTECH_LOCATION_DETAILS.location}
                    </p>
                  </div>

                  {/* Address Info */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      Address &amp; Plus Code
                    </span>
                    <p className="font-mono font-semibold text-xs sm:text-sm text-text leading-snug">
                      {CUSTECH_LOCATION_DETAILS.address}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      Nigeria • {CUSTECH_LOCATION_DETAILS.faculty}
                    </p>
                  </div>
                </div>

                {/* CTA Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                  <a
                    href={CUSTECH_LOCATION_DETAILS.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial"
                  >
                    <Button
                      variant="accent"
                      size="md"
                      className="w-full sm:w-auto shadow-md shadow-accent/15"
                      leftIcon={<Navigation className="w-4 h-4" />}
                      aria-label="Get directions to CUSTECH in Google Maps (opens in new tab)"
                    >
                      Get Directions
                    </Button>
                  </a>

                  <a
                    href={CUSTECH_LOCATION_DETAILS.viewOnMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial"
                  >
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full sm:w-auto"
                      rightIcon={<ExternalLink className="w-3.5 h-3.5 text-text-muted" />}
                      aria-label="View CUSTECH on Google Maps in a new tab"
                    >
                      View on Maps
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
