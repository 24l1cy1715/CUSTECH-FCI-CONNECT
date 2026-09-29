import React, { useState } from 'react';
import {
  Search,
  Filter,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Plus,
  Minus,
  Ban,
  CheckCircle,
  MoreVertical,
  UserCheck,
  Check,
  X,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useAdminStore } from '@/store/adminStore';
import { UserRoleType, AccountStatus } from '@/types/admin';
import toast from 'react-hot-toast';

export const AdminUsersManager: React.FC = () => {
  const { users, setUserRole, setUserStatus, adjustUserPoints } = useAdminStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal / Quick edit states
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [pointsInput, setPointsInput] = useState<number>(100);
  const [pointsReason, setPointsReason] = useState<string>('Exemplary faculty project contribution');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.matricId && u.matricId.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.roles.includes(roleFilter as UserRoleType);
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleToggle = (userId: string, role: UserRoleType, currentHasRole: boolean) => {
    setUserRole(userId, role, !currentHasRole);
    toast.success(
      `Role [${role}] ${!currentHasRole ? 'granted to' : 'revoked from'} student account.`
    );
  };

  const handleStatusChange = (userId: string, newStatus: AccountStatus) => {
    setUserStatus(userId, newStatus);
    toast.success(`Account status changed to [${newStatus}].`);
  };

  const handleApplyPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    adjustUserPoints(selectedUser.id, pointsInput, pointsReason);
    toast.success(`Successfully awarded ${pointsInput} community points to ${selectedUser.fullName}!`);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, username or matric number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-blue-400"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admins</option>
            <option value="ADMIN">Admins</option>
            <option value="MODERATOR">Moderators</option>
            <option value="STUDENT">Students</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-blue-400"
          >
            <option value="ALL">All Account Status</option>
            <option value="ACTIVE">Active</option>
            <option value="FLAGGED">Flagged</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* ── Users Table Card ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold tracking-wider text-[10px]">
                <th className="py-3 px-4">User &amp; Identity</th>
                <th className="py-3 px-4">Department &amp; Level</th>
                <th className="py-3 px-4">Roles &amp; Clearance</th>
                <th className="py-3 px-4 text-center">Points</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSuperAdmin = user.roles.includes('SUPER_ADMIN');
                  const isAdmin = user.roles.includes('ADMIN');
                  const isMod = user.roles.includes('MODERATOR');

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      {/* Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center overflow-hidden shrink-0 border border-blue-200">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              user.fullName.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              {user.fullName}
                              {isSuperAdmin && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                  SUPER
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {user.matricId || user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-700">{user.department.replace(/_/g, ' ')}</div>
                        <div className="text-[11px] text-slate-400">{user.level}</div>
                      </td>

                      {/* Roles */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1">
                          {user.roles.map((r) => (
                            <span
                              key={r}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                r === 'SUPER_ADMIN'
                                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                  : r === 'ADMIN'
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : r === 'MODERATOR'
                                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                  : 'bg-slate-100 border border-slate-200 text-slate-500'
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Points */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-600">
                        {user.communityPoints.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700'
                              : user.status === 'FLAGGED'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Award Points button */}
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-1.5 rounded-lg border border-border bg-surface hover:border-accent hover:text-accent transition-colors"
                            title="Award / Deduct Community Points"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          {/* Moderator Toggle */}
                          {!isSuperAdmin && (
                            <button
                              onClick={() => handleRoleToggle(user.id, 'MODERATOR', isMod)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                                isMod
                                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                  : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                              }`}
                              title={isMod ? 'Revoke Moderator Role' : 'Promote to Moderator'}
                            >
                              {isMod ? (
                                <span className="inline-flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Mod
                                </span>
                              ) : (
                                '+ Mod'
                              )}
                            </button>
                          )}

                          {/* Admin Toggle */}
                          {!isSuperAdmin && (
                            <button
                              onClick={() => handleRoleToggle(user.id, 'ADMIN', isAdmin)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                                isAdmin
                                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                                  : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600'
                              }`}
                              title={isAdmin ? 'Revoke Admin Role' : 'Promote to Admin'}
                            >
                              {isAdmin ? (
                                <span className="inline-flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Admin
                                </span>
                              ) : (
                                '+ Admin'
                              )}
                            </button>
                          )}

                          {/* Suspension Toggle */}
                          {!isSuperAdmin && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  user.id,
                                  user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
                                )
                              }
                              className={`p-1.5 rounded-lg border transition-colors ${
                                user.status === 'SUSPENDED'
                                  ? 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                                  : 'border-border text-rose-500 hover:bg-rose-500/10'
                              }`}
                              title={user.status === 'SUSPENDED' ? 'Re-activate Account' : 'Suspend Account'}
                            >
                              {user.status === 'SUSPENDED' ? (
                                <UserCheck className="w-3.5 h-3.5" />
                              ) : (
                                <Ban className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Points Adjustment Modal ── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-base text-slate-800">Adjust Community Points</h3>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-slate-400">Target Student:</span>
              <div className="font-bold text-sm text-slate-800">{selectedUser.fullName}</div>
              <div className="font-mono text-slate-500">{selectedUser.matricId || selectedUser.email}</div>
              <div className="text-blue-600 font-semibold pt-1">
                Current Points: {selectedUser.communityPoints} PTS
              </div>
            </div>

            <form onSubmit={handleApplyPoints} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Points Delta (+ or -)</label>
                <div className="flex gap-2 mt-1">
                  {[50, 100, 250, 500].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPointsInput(val)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                        pointsInput === val
                          ? 'bg-blue-100 border-blue-400 text-blue-700'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      +{val}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  required
                  value={pointsInput}
                  onChange={(e) => setPointsInput(Number(e.target.value))}
                  className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Audit Justification / Note</label>
                <input
                  type="text"
                  required
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setSelectedUser(null)}>Cancel</Button>
                <Button variant="accent" size="sm" type="submit">Confirm Credit</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
