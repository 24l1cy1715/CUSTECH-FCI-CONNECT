import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Crown,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { MOCK_LEADERBOARD } from '@/data/mockData';
import { DEPARTMENT_LABELS } from '@/types';

export const LeaderboardPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'allTime'>('allTime');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-2xl mx-auto space-y-3"
      >
        <div className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider">
          <Trophy className="w-4 h-4 animate-bounce" />
          FCI Merit &amp; Innovation Points
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-primary dark:text-white">
          Community Leaderboard
        </h1>
        <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
          Celebrating student developers, open-source contributors, campus leaders, and technical researchers in the Faculty of Computing and Informatics.
        </p>

        {/* Timeframe Selector with Animated Pill */}
        <div className="flex flex-wrap justify-center gap-1 p-1 rounded-xl bg-surface border border-border shadow-sm w-full sm:w-auto sm:inline-flex relative">
          {(['weekly', 'monthly', 'allTime'] as const).map((t) => {
            const labels = { weekly: 'This Week', monthly: 'This Month', allTime: 'All-Time' };
            const active = timeframe === t;
            return (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`relative px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  active ? 'text-black' : 'text-text-muted hover:text-text'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeTimeframe"
                    className="absolute inset-0 bg-accent rounded-lg shadow-sm -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {labels[t]}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Top 3 Podium Cards with Spring Elevation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
        {/* Silver #2 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -6 }}
          className="order-2 md:order-1"
        >
          <Card className="text-center p-6 space-y-4 border-t-4 border-t-slate-400 shadow-md">
            <div className="w-10 h-10 rounded-full bg-slate-300 text-slate-800 font-bold mx-auto flex items-center justify-center text-sm shadow">
              2nd
            </div>
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-slate-300 shadow-md ring-2 ring-slate-200 dark:ring-slate-700">
              <img
                src={MOCK_LEADERBOARD[1].user.avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-text">
                {MOCK_LEADERBOARD[1].user.fullName}
              </h3>
              <p className="text-xs text-text-muted">
                {DEPARTMENT_LABELS[MOCK_LEADERBOARD[1].user.department]}
              </p>
            </div>
            <div className="font-mono font-bold text-xl text-accent">
              {MOCK_LEADERBOARD[1].communityPoints.toLocaleString()} pts
            </div>
          </Card>
        </motion.div>

        {/* Gold #1 */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="order-1 md:order-2"
        >
          <Card className="text-center p-8 space-y-4 border-t-4 border-t-amber-400 bg-gradient-to-b from-amber-400/10 via-surface to-surface shadow-xl relative overflow-hidden">
            <motion.div
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="w-12 h-12 rounded-full bg-amber-400 text-amber-950 font-extrabold mx-auto flex items-center justify-center text-sm shadow-md ring-4 ring-amber-300/40 gap-1"
            >
              <Crown className="w-4 h-4 fill-amber-950" />
              <span>1st</span>
            </motion.div>
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-4 border-amber-400 shadow-xl ring-4 ring-amber-300/20">
              <img
                src={MOCK_LEADERBOARD[0].user.avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl text-text">
                {MOCK_LEADERBOARD[0].user.fullName}
              </h3>
              <p className="text-xs text-text-muted">
                {DEPARTMENT_LABELS[MOCK_LEADERBOARD[0].user.department]} ({MOCK_LEADERBOARD[0].user.level}L)
              </p>
            </div>
            <div className="font-mono font-extrabold text-2xl text-accent">
              {MOCK_LEADERBOARD[0].communityPoints.toLocaleString()} pts
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {MOCK_LEADERBOARD[0].achievements.map((ach) => (
                <span
                  key={ach}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-amber-400/15 text-amber-800 dark:text-amber-300 font-semibold"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{ach}</span>
                </span>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Bronze #3 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -6 }}
          className="order-3"
        >
          <Card className="text-center p-6 space-y-4 border-t-4 border-t-amber-700 shadow-md">
            <div className="w-10 h-10 rounded-full bg-amber-700 text-amber-100 font-bold mx-auto flex items-center justify-center text-sm shadow">
              3rd
            </div>
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-amber-700 shadow-md ring-2 ring-amber-700/20">
              <img
                src={MOCK_LEADERBOARD[2].user.avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-text">
                {MOCK_LEADERBOARD[2].user.fullName}
              </h3>
              <p className="text-xs text-text-muted">
                {DEPARTMENT_LABELS[MOCK_LEADERBOARD[2].user.department]}
              </p>
            </div>
            <div className="font-mono font-bold text-xl text-accent">
              {MOCK_LEADERBOARD[2].communityPoints.toLocaleString()} pts
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Full Rankings Table with Staggered Entrance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-0 overflow-hidden divide-y divide-border shadow-md">
          <div className="bg-surface-raised px-6 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider grid grid-cols-12 gap-4">
            <span className="col-span-1">Rank</span>
            <span className="col-span-6 sm:col-span-5">Student</span>
            <span className="hidden sm:block sm:col-span-3">Department</span>
            <span className="col-span-3 text-right">Points</span>
          </div>

          {MOCK_LEADERBOARD.map((item) => (
            <motion.div
              key={item.user.id}
              whileHover={{ x: 4, backgroundColor: 'var(--color-surface-raised)' }}
              transition={{ duration: 0.15 }}
              className="px-6 py-4 grid grid-cols-12 gap-4 items-center transition-colors cursor-default"
            >
              <div className="col-span-1 font-mono font-bold text-sm text-text">
                #{item.rank}
              </div>

              <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-border">
                  <img src={item.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="truncate">
                  <div className="font-semibold text-sm text-text truncate">
                    {item.user.fullName}
                  </div>
                  <div className="text-[11px] text-text-muted truncate sm:hidden">
                    {DEPARTMENT_LABELS[item.user.department]}
                  </div>
                </div>
              </div>

              <div className="hidden sm:block sm:col-span-3 text-xs text-text-secondary truncate font-medium">
                {DEPARTMENT_LABELS[item.user.department]} ({item.user.level}L)
              </div>

              <div className="col-span-3 text-right font-mono font-bold text-accent text-sm sm:text-base">
                {item.communityPoints.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </Card>
      </motion.div>
    </div>
  );
};
