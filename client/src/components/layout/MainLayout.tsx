import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Marquee } from "../common/Marquee";
import { BackToTop } from "../common/BackToTop";
import { Sparkles, ArrowRight } from "lucide-react";

export const MainLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text selection:bg-accent selection:text-primary">
      {/* ── Announcement bar ───────────────────────────────── */}
      <div className="bg-primary text-white py-1.5 border-b border-primary-900/50 overflow-hidden shrink-0">
        <Marquee speed="normal" pauseOnHover>
          <div className="flex items-center gap-6 sm:gap-10 px-4 text-[11px] sm:text-xs text-white/90 whitespace-nowrap">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
              <span className="font-bold text-accent uppercase tracking-wide">Breaking:</span>
              {" "}CUSTECH FCI wins 1st Prize — National Inter-University Tech Challenge!
            </span>
            <span className="text-white/40">·</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-accent shrink-0" />
              <span className="font-semibold">FCI Hackathon 2024</span> — Over ₦1.5M in prizes. Register now!
            </span>
            <span className="text-white/40">·</span>
            <span>
              <span className="font-semibold text-accent">New Lab:</span> Advanced Cybersecurity & Cloud Lab now open at FCI complex.
            </span>
            <span className="text-white/40">·</span>
            <Link to="/roommates" className="text-accent font-semibold hover:underline flex items-center gap-1">
              Find student roommates in Osara <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Marquee>
      </div>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <Navbar />

      {/* ── Page content with subtle entrance animation ───── */}
      <main id="main-content" role="main" className="flex-1 w-full min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <Footer />

      {/* ── Back To Top ────────────────────────────────────── */}
      <BackToTop />
    </div>
  );
};
