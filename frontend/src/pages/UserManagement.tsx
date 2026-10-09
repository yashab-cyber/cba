import React, { useState, useEffect } from 'react';
import { Users, Shield, UserCheck, UserX, AlertTriangle, CheckCircle, RefreshCw, Edit3, Building, Key, Bot } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';
import { Modal } from '../components/Modal';

interface UserManagementProps {
  currentUser?: User | null;
}

export const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<'admin' | 'operator' | 'auditor' | 'user' | 'developer'>('user');
  const [newTier, setNewTier] = useState<string>('TIER_1');
  const [newKyc, setNewKyc] = useState<string>('VERIFIED');
  const [isActionPending, setIsActionPending] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setNewTier(user.tier || 'TIER_1');
    setNewKyc(user.kyc_status || 'VERIFIED');
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setIsActionPending(true);
      await api.updateUser(selectedUser.id, {
        role: newRole,
        tier: newTier,
        kyc_status: newKyc,
      });
      setIsEditModalOpen(false);
      await fetchUsers();
      alert(`User ${selectedUser.email} updated successfully.`);
    } catch (err: any) {
      alert(`Failed to update user: ${err.message}`);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const action = user.is_active ? 'suspend' : 'activate';
    if (!confirm(`Are you sure you want to ${action} user account "${user.email}"? If suspended, all of their registered AI agents will be frozen.`)) {
      return;
    }
    try {
      await api.toggleUserStatus(user.id, !user.is_active, `Administrative ${action} action`);
      await fetchUsers();
    } catch (err: any) {
      alert(`Failed to toggle status: ${err.message}`);
    }
  };

  const activeCount = users.filter((u) => u.is_active).length;
  const devCount = users.filter((u) => u.role === 'user' || u.role === 'developer').length;
  const adminCount = users.filter((u) => u.role === 'admin' || u.role === 'operator').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] border border-[#1e293b] p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{users.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Institutional & Developer entities</div>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Banking Clients</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{activeCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Verified operational status</div>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>AI Agent Developers</span>
            <Bot className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400">{devCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Autonomous agent owners</div>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Central Bank Operators</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{adminCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Full governance privileges</div>
        </div>
      </div>

      {/* Users Table Header & Action */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Registered Banking Clients & RBAC Directory
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-tenant user identity, tier permissions, and agent ownership isolation controls
            </p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1e293b] hover:bg-slate-700 text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d18] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#1e293b]">
              <tr>
                <th className="py-3 px-4">Client Identity</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">KYC Tier</th>
                <th className="py-3 px-4">Registered Agents</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] text-slate-300 font-normal">
              {users.map((u) => {
                const isSelf = currentUser?.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                          {u.email.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                            {u.full_name || u.email.split('@')[0]}
                            {isSelf && (
                              <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1 py-0.2 rounded font-mono">
                                (You)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        <span>{u.organization || 'Independent'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          u.role === 'admin'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : u.role === 'operator'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : u.role === 'auditor'
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {u.tier || 'TIER_1'} • {u.kyc_status || 'VERIFIED'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-200">
                      <span className="font-semibold">{u.agent_count || 0}</span> agents
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                          u.is_active
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {u.is_active ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {u.last_login_at
                        ? new Date(u.last_login_at).toLocaleDateString()
                        : new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Edit Permissions"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition ${
                              u.is_active
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                            }`}
                            title={u.is_active ? 'Suspend Account' : 'Activate Account'}
                          >
                            {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Permissions: ${selectedUser.email}`}
          subtitle={`User ID: ${selectedUser.id}`}
        >
          <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Access Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
              >
                <option value="user">User / AI Agent Developer (Scoped view)</option>
                <option value="operator">Central Bank Operator (Administrative)</option>
                <option value="admin">Master Administrator (Full root control)</option>
                <option value="auditor">Auditor (Read-only verification & ledger audits)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Account Tier</label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
              >
                <option value="TIER_1">Tier 1: Standard Sandbox ($1,000 CBAC limits)</option>
                <option value="TIER_2">Tier 2: Verified Enterprise Swarm ($100,000 CBAC limits)</option>
                <option value="ENTERPRISE">Enterprise Institution (Unlimited limits)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">KYC Status</label>
              <select
                value={newKyc}
                onChange={(e) => setNewKyc(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
              >
                <option value="VERIFIED">VERIFIED (Full access)</option>
                <option value="PENDING">PENDING (Review required)</option>
                <option value="RESTRICTED">RESTRICTED (Outbound transfers paused)</option>
              </select>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-[#1e293b]">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isActionPending}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow transition disabled:opacity-50"
              >
                {isActionPending ? 'Updating...' : 'Save Permissions'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
