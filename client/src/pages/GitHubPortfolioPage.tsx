import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Github,
  Star,
  GitFork,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Code2,
  CheckCircle,
  AlertCircle,
  Unlink
} from 'lucide-react';
import { githubApi } from '../api/githubApi';
import { UserGithubProfile, GithubRepository } from '../types/github';

export const GitHubPortfolioPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [usernameInput, setUsernameInput] = useState('');
  const [personalTokenInput, setPersonalTokenInput] = useState('');

  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ['myGithubProfile'],
    queryFn: () => githubApi.getMyGithubProfile(),
  });

  const profile: UserGithubProfile | null = profileData?.data || null;

  const { data: reposData, isLoading: loadingRepos, refetch: refetchRepos } = useQuery({
    queryKey: ['myGithubRepos'],
    queryFn: () => githubApi.getMyGithubRepos(),
    enabled: !!profile?.githubUsername,
  });

  const repos: GithubRepository[] = reposData?.data || [];

  const connectMutation = useMutation({
    mutationFn: (data: { githubUsername: string; personalAccessToken?: string }) =>
      githubApi.connectGithub(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGithubProfile'] });
      queryClient.invalidateQueries({ queryKey: ['myGithubRepos'] });
      setUsernameInput('');
      setPersonalTokenInput('');
    },
  });

  const syncMutation = useMutation({
    mutationFn: () => githubApi.syncGithub(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGithubProfile'] });
      queryClient.invalidateQueries({ queryKey: ['myGithubRepos'] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => githubApi.disconnectGithub(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGithubProfile'] });
      queryClient.invalidateQueries({ queryKey: ['myGithubRepos'] });
    },
  });

  const privacyMutation = useMutation({
    mutationFn: (settings: { showOnProfile?: boolean; showRepos?: boolean; showContributions?: boolean }) =>
      githubApi.updatePrivacy(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGithubProfile'] });
    },
  });

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl">
              <Github className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                GitHub Developer Integration
              </h1>
              <p className="text-sm text-slate-400">
                Connect your GitHub profile, showcase open-source projects, and sync repositories into CUSTECH Project Lab.
              </p>
            </div>
          </div>

          {profile && (
            <div className="flex gap-2">
              <button
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold transition flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 text-amber-400 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                {syncMutation.isPending ? 'Syncing...' : 'Sync Repos'}
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to disconnect GitHub from your CUSTECH profile?')) {
                    disconnectMutation.mutate();
                  }
                }}
                className="px-4 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-sm font-semibold transition flex items-center gap-2"
              >
                <Unlink className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Profile Connected Card or Connection Form */}
        {profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Bio Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src={profile.avatarUrl || 'https://github.com/identicons/user.png'}
                  alt={profile.githubUsername}
                  className="w-16 h-16 rounded-full border-2 border-amber-400/50"
                />
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                    {profile.githubUsername}
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </h3>
                  <a
                    href={profile.htmlUrl || profile.profileUrl || `https://github.com/${profile.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 mt-0.5"
                  >
                    View on GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {profile.bio && <p className="text-sm text-slate-300 leading-relaxed">{profile.bio}</p>}

              <div className="grid grid-cols-3 gap-2 text-center py-3 border-y border-slate-800/80">
                <div>
                  <p className="text-lg font-bold text-white">{profile.publicReposCount}</p>
                  <span className="text-xs text-slate-400">Repositories</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{profile.followersCount}</p>
                  <span className="text-xs text-slate-400">Followers</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{profile.followingCount}</p>
                  <span className="text-xs text-slate-400">Following</span>
                </div>
              </div>

              {/* Privacy Controls */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Privacy Settings</h4>

                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>Show GitHub on CUSTECH Profile</span>
                  <input
                    type="checkbox"
                    checked={profile.showOnProfile}
                    onChange={(e) => privacyMutation.mutate({ showOnProfile: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>Show Repositories in Portfolio</span>
                  <input
                    type="checkbox"
                    checked={profile.showRepos}
                    onChange={(e) => privacyMutation.mutate({ showRepos: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>Display Contribution Stats</span>
                  <input
                    type="checkbox"
                    checked={profile.showContributions}
                    onChange={(e) => privacyMutation.mutate({ showContributions: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
                  />
                </label>
              </div>

              {profile.lastSyncedAt && (
                <p className="text-xs text-slate-500 text-center font-mono">
                  Last synced: {new Date(profile.lastSyncedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Repositories Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-amber-400" />
                  Public Repositories ({repos.length})
                </h3>
              </div>

              {loadingRepos ? (
                <div className="text-center py-12 text-slate-400">Loading repositories...</div>
              ) : repos.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                  No public repositories found. Try syncing again.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repos.map((repo) => (
                    <div
                      key={repo.id}
                      className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <a
                            href={repo.htmlUrl || repo.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-white group-hover:text-amber-400 transition truncate text-sm flex items-center gap-1.5"
                          >
                            {repo.name}
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition" />
                          </a>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {repo.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        {repo.language ? (
                          <span className="flex items-center gap-1.5 font-medium text-slate-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            {repo.language}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono">Text</span>
                        )}

                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400" />
                            {repo.stars}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="w-3.5 h-3.5 text-slate-400" />
                            {repo.forks}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm space-y-6">
            <div className="text-center space-y-2">
              <Github className="w-12 h-12 text-white mx-auto" />
              <h2 className="text-xl font-bold text-white">Connect Your GitHub Account</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Sync your public GitHub projects, languages, and star activity to showcase real engineering prowess on
                CUSTECH FCI Connect.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                connectMutation.mutate({
                  githubUsername: usernameInput.trim(),
                  personalAccessToken: personalTokenInput.trim() || undefined,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  GitHub Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. octocat"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Personal Access Token (Optional)
                </label>
                <input
                  type="password"
                  placeholder="ghp_... (For higher rate limits & private contributions)"
                  value={personalTokenInput}
                  onChange={(e) => setPersonalTokenInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400 transition"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Read-only public token. Never enter your GitHub password.
                </p>
              </div>

              <button
                type="submit"
                disabled={connectMutation.isPending}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
              >
                <Github className="w-4 h-4" />
                {connectMutation.isPending ? 'Connecting...' : 'Connect GitHub Account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
