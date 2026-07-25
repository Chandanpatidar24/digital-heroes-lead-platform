import React, { useState } from 'react';
import api from '../services/api';
import { X, UserPlus, Users, ShieldCheck, UserCheck, CheckCircle2, AlertCircle, Trash2, ArrowRight, UserPlus2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TeamModal = ({ users, onClose, onRefresh, isAdmin }) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MEMBER',
  });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Deletion Modal States
  const [confirmUser, setConfirmUser] = useState(null); // Target user to delete
  const [targetReassignId, setTargetReassignId] = useState(''); // Selected replacement rep ID

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setErrorMsg('Only Admins can register new team members.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await api.post('/auth/register', formData);
      setSuccessMsg(response.data.message || 'User created successfully!');
      setFormData({ name: '', email: '', password: '', role: 'MEMBER' });
      setLoading(false);
      onRefresh();
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'Failed to create team member');
    }
  };

  const handleInitiateDelete = (targetUser) => {
    if (!isAdmin) return;
    if (targetUser.id === currentUser?.id) {
      setErrorMsg('You cannot delete your own logged-in admin account.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setConfirmUser(targetUser);
    setTargetReassignId('');
  };

  const executeDeleteMember = async () => {
    if (!confirmUser) return;

    setDeletingId(confirmUser.id);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.delete(`/auth/users/${confirmUser.id}`, {
        data: { reassignToId: targetReassignId || null },
      });
      setSuccessMsg(res.data.message || 'Member removed successfully');
      setDeletingId(null);
      setConfirmUser(null);
      setTargetReassignId('');
      onRefresh();
    } catch (err) {
      setDeletingId(null);
      setErrorMsg(err.response?.data?.message || 'Failed to remove member');
    }
  };

  // Other eligible team members to receive reassigned leads
  const eligibleReplacementReps = users.filter((u) => u.id !== confirmUser?.id);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 relative">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-[#faf6ee]">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-amber-100/60 border border-amber-200 text-amber-900 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-stone-900">Team Members & Management</h2>
              <p className="text-xs text-stone-500">View team reps, register new accounts, or remove members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Admin Action Form: Register New Team Member */}
          {isAdmin && (
            <div className="bg-[#fdfbf7] border border-stone-200/90 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-amber-800" />
                  <span>Register New Team Member (Admin Only)</span>
                </h3>
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateMember} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Full Name <span className="text-amber-800">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Email Address <span className="text-amber-800">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. priya@digitalheroes.com"
                    className="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Password <span className="text-amber-800">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Role <span className="text-amber-800">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none font-bold"
                  >
                    <option value="MEMBER">MEMBER (Sales Rep)</option>
                    <option value="ADMIN">ADMIN (Full Access)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-100 rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{loading ? 'Creating Member...' : 'Create Team Account'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Existing Team Members List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
              Active Team Members ({users.length})
            </h3>
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white">
              {users.map((u) => {
                const assignedCount = u._count?.assignedLeads || 0;
                return (
                  <div key={u.id} className="p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-800">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span>{u.name}</span>
                          {assignedCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              {assignedCount} lead{assignedCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div className="text-stone-500 text-[11px]">{u.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-100/60 text-amber-900 border-amber-300'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {u.role === 'ADMIN' ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-amber-800" />
                            <span>ADMIN</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3 text-stone-600" />
                            <span>MEMBER</span>
                          </>
                        )}
                      </div>

                      {/* Admin Delete Action */}
                      {isAdmin && u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleInitiateDelete(u)}
                          disabled={deletingId === u.id}
                          title={`Remove ${u.name}`}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* CUSTOM DELETION MODAL WITH 1-CLICK LEAD REASSIGNMENT DROPDOWN */}
        {confirmUser && (
          <div className="absolute inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
              
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto border border-red-200 shadow-inner">
                  <Trash2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-extrabold text-stone-900">Remove Team Member</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Are you sure you want to remove <span className="font-bold text-stone-900">{confirmUser.name}</span> ({confirmUser.email})?
                </p>
              </div>

              {/* Lead Reassignment Option Card if member has assigned leads */}
              {(confirmUser._count?.assignedLeads || 0) > 0 && (
                <div className="bg-[#faf6ee] border border-amber-300 p-4 rounded-xl space-y-2 text-xs">
                  <div className="font-extrabold text-amber-950 flex items-center justify-between">
                    <span>Active Leads Assigned:</span>
                    <span className="bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded-md text-[11px]">
                      {confirmUser._count.assignedLeads} Lead(s)
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Select a replacement sales rep to automatically transfer all assigned leads to before deleting:
                  </p>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-700 mb-1">
                      Transfer Leads To:
                    </label>
                    <select
                      value={targetReassignId}
                      onChange={(e) => setTargetReassignId(e.target.value)}
                      className="w-full bg-white border border-stone-300 focus:border-amber-600 rounded-lg p-2 text-xs text-stone-900 font-bold focus:outline-none"
                    >
                      <option value="">-- Set to Unassigned --</option>
                      {eligibleReplacementReps.map((rep) => (
                        <option key={rep.id} value={rep.id}>
                          {rep.name} ({rep.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center space-x-3">
                <button
                  onClick={() => setConfirmUser(null)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDeleteMember}
                  disabled={deletingId === confirmUser.id}
                  className="flex-1 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <span>{deletingId === confirmUser.id ? 'Removing...' : (confirmUser._count?.assignedLeads || 0) > 0 ? 'Confirm & Transfer' : 'Confirm Remove'}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TeamModal;
