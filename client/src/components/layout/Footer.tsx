import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Github, Twitter, Linkedin, Mail, MapPin } from "lucide-react";
import { DEPARTMENT_LABELS, Department } from "@/types";

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  const departments: Department[] = [
    "COMPUTER_SCIENCE", "CYBER_SECURITY", "SOFTWARE_ENGINEERING",
    "INFORMATION_TECHNOLOGY", "DATA_SCIENCE", "COMPUTER_ENGINEERING",
    "INFORMATION_SYSTEMS",
  ];

  const platformLinks = [
    { to: "/discover",   label: "Discover Students" },
    { to: "/projects",   label: "Student Projects"  },
    { to: "/roommates",  label: "Roommate Finder"   },
    { to: "/news",       label: "Faculty News"      },
    { to: "/businesses", label: "Tech Businesses"   },
    { to: "/events",     label: "Events"            },
    { to: "/leaderboard",label: "Leaderboard"       },
  ];

  const uniLinks = [
    { href: "https://custech.edu.ng", label: "CUSTECH Portal", external: true },
    { href: "https://library.custech.edu.ng", label: "e-Library", external: true },
    { to: "/news?category=Announcements", label: "Academic Calendar" },
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms",   label: "Terms of Service" },
  ];

  const socials = [
    { href: "https://github.com/custech-fci",      icon: Github,   label: "GitHub"    },
    { href: "https://twitter.com/custech_fci",     icon: Twitter,  label: "Twitter/X" },
    { href: "https://linkedin.com/school/custech", icon: Linkedin, label: "LinkedIn"  },
  ];

  return (
    <footer className="border-t border-border bg-surface-raised/50 mt-auto">

      {/* ── Main grid ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-10">

          {/* Brand — full width on small mobile */}
          <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 w-fit group">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 drop-shadow-sm group-hover:scale-105 transition-transform">
                <img
                  src="/custech-logo.png"
                  alt="CUSTECH Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-lg text-primary dark:text-white">CUSTECH </span>
                <span className="font-bold text-lg text-accent">FCI CONNECT</span>
              </div>
            </Link>

            <p className="text-sm text-text-secondary max-w-xs leading-relaxed">
              {t(
                "footer.tagline",
                "The unified digital community for students, faculty, and innovators at the Faculty of Computing and Informatics, Confluence University of Science and Technology, Osara."
              )}
            </p>

            <div className="space-y-2 text-xs text-text-muted">
              <a
                href="/#campus-location"
                className="flex items-start gap-2 hover:text-accent transition-colors group"
                title="View CUSTECH campus location on map"
              >
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span>Osara Campus, KM 19 Lokoja-Okene Expressway, Kogi State, Nigeria</span>
              </a>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <span>fci@custech.edu.ng</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {socials.map(({ href, icon: Icon, label }) => (
                <a key={href} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/30 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div className="col-span-1 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              {platformLinks.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-text-secondary hover:text-accent transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Departments */}
          <div className="col-span-1 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text">Departments</h3>
            <ul className="space-y-2.5 text-sm">
              {departments.map(dept => (
                <li key={dept}>
                  <Link to={`/discover?department=${dept}`}
                    className="text-text-secondary hover:text-accent transition-colors"
                  >
                    {DEPARTMENT_LABELS[dept]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* University */}
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text">University</h3>
            <ul className="space-y-2.5 text-sm">
              {uniLinks.map(l => (
                <li key={l.label}>
                  {l.external
                    ? <a href={l.href as string} target="_blank" rel="noreferrer" className="text-text-secondary hover:text-accent transition-colors">{l.label}</a>
                    : <Link to={l.to as string} className="text-text-secondary hover:text-accent transition-colors">{l.label}</Link>
                  }
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────── */}
      <div className="border-t border-border py-5 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xs:flex-row items-center justify-between gap-3 text-xs text-text-muted text-center xs:text-left">
          <p>© {new Date().getFullYear()} CUSTECH FCI CONNECT. All rights reserved.</p>
          <p className="hidden sm:block">Designed &amp; engineered with passion by FCI Tech Pioneers</p>
        </div>
      </div>
    </footer>
  );
};
