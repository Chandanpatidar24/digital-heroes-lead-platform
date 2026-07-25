import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, MessageSquare, History, Send, ShieldAlert, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST'];

const LeadModal = ({ leadId, onClose, onRefresh, isAdmin, users }) => {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'activity'
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    fetchLeadDetails();
  }, [leadId]);

  const fetchLeadDetails = async () => {
    setLoading(true);
    setError(null);
    setActionError(null);
    try {
      const response = await api.get(`/leads/${leadId}`);
      setLead(response.data.lead);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load lead details');
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setActionError(null);
    try {
      await api.patch(`/leads/${leadId}`, { status: newStatus });
      fetchLeadDetails();
      onRefresh();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAssigneeChange = async (newAssigneeId) => {
    setActionError(null);
    if (!isAdmin) {
      setActionError('Only Admin role is permitted to reassign leads.');
      return;
    }
    try {
      await api.patch(`/leads/${leadId}`, { assignedToId: newAssigneeId || null });
      fetchLeadDetails();
      onRefresh();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reassign lead');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setActionError(null);
    setSubmittingNote(true);
    try {
      await api.post(`/leads/${leadId}/notes`, { content: newNote });
      setNewNote('');
      setSubmittingNote(false);
      fetchLeadDetails();
      onRefresh();
    } catch (err) {
      setSubmittingNote(false);
      setActionError(err.response?.data?.message || 'Failed to add note');
    }
  };

  if (!leadId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-2xl bg-white border-l border-stone-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-[#faf6ee]">
          <div>
            <div className="text-xs font-extrabold uppercase text-amber-800 tracking-wider">Lead # {leadId}</div>
            <h2 className="text-xl font-extrabold text-stone-900">{loading ? 'Loading...' : lead?.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-stone-500">
            Loading details...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-700 font-medium">{error}</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Action Error Banner */}
            {actionError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
                <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Status & Reassignment Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#fdfbf7] border border-stone-200 p-4 rounded-xl">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Pipeline Status
                </label>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full bg-white text-stone-900 border border-stone-200 rounded-lg px-3 py-2 text-sm font-bold focus:border-amber-600 focus:outline-none shadow-xs"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Assigned Rep
                  </label>
                  {!isAdmin && (
                    <span className="text-[10px] text-amber-800 flex items-center gap-1 font-bold">
                      <ShieldAlert className="w-3 h-3" /> Admin Only
                    </span>
                  )}
                </div>
                <select
                  disabled={!isAdmin}
                  value={lead.assignedToId || ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className={`w-full bg-white text-stone-900 border border-stone-200 rounded-lg px-3 py-2 text-sm font-medium focus:border-amber-600 focus:outline-none shadow-xs ${
                    !isAdmin ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">-- Unassigned --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lead Metadata Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-[#fdfbf7] p-3 rounded-lg border border-stone-200">
                <div className="text-[11px] text-stone-500 font-medium">Email Address</div>
                <div className="text-xs font-bold text-stone-800 truncate mt-0.5">{lead.email}</div>
              </div>
              <div className="bg-[#fdfbf7] p-3 rounded-lg border border-stone-200">
                <div className="text-[11px] text-stone-500 font-medium">Phone Number</div>
                <div className="text-xs font-bold text-stone-800 mt-0.5">{lead.phone || 'N/A'}</div>
              </div>
              <div className="bg-[#fdfbf7] p-3 rounded-lg border border-stone-200">
                <div className="text-[11px] text-stone-500 font-medium">Company</div>
                <div className="text-xs font-bold text-stone-800 truncate mt-0.5">{lead.company || 'N/A'}</div>
              </div>
              <div className="bg-[#fdfbf7] p-3 rounded-lg border border-stone-200">
                <div className="text-[11px] text-stone-500 font-medium">Est. Deal Value</div>
                <div className="text-xs font-bold text-emerald-800 mt-0.5">
                  ${lead.value ? lead.value.toLocaleString() : '0'}
                </div>
              </div>
              <div className="bg-[#fdfbf7] p-3 rounded-lg border border-stone-200">
                <div className="text-[11px] text-stone-500 font-medium">Lead Source</div>
                <div className="text-xs font-bold text-stone-800 mt-0.5">{lead.source}</div>
              </div>
              <div className="bg-[#fdfbf7] p-3 rounded-lg border border-stone-200">
                <div className="text-[11px] text-slate-500 font-medium">Created Date</div>
                <div className="text-xs font-bold text-stone-800 mt-0.5">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-stone-200 flex space-x-4">
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-2.5 text-sm font-bold transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === 'notes'
                    ? 'border-amber-800 text-amber-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Notes ({lead.notes?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-2.5 text-sm font-bold transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === 'activity'
                    ? 'border-amber-800 text-amber-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Activity Trail ({lead.activityLogs?.length || 0})</span>
              </button>
            </div>

            {/* TAB 1: Notes Feed */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows="3"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a timestamped note (e.g. Call outcomes, meeting notes)..."
                    className="w-full bg-[#fdfbf7] border border-stone-200 rounded-xl p-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingNote || !newNote.trim()}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingNote ? 'Adding Note...' : 'Add Note'}</span>
                    </button>
                  </div>
                </form>

                <div className="space-y-3 pt-2">
                  {lead.notes?.length === 0 ? (
                    <div className="text-center py-6 text-stone-400 text-xs italic">
                      No notes recorded yet. Add the first note above!
                    </div>
                  ) : (
                    lead.notes?.map((note) => (
                      <div
                        key={note.id}
                        className="bg-[#fdfbf7] border border-stone-200 p-3.5 rounded-xl space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-900">{note.author?.name}</span>
                          <span className="text-stone-400 text-[11px]">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-stone-800 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Activity Trail */}
            {activeTab === 'activity' && (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                {lead.activityLogs?.map((log) => (
                  <div key={log.id} className="relative flex items-start space-x-3">
                    <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-stone-800 border-2 border-white shadow-xs" />
                    <div className="flex-1 bg-[#fdfbf7] p-3 rounded-lg border border-stone-200 text-xs">
                      <div className="flex items-center justify-between text-stone-500">
                        <span className="font-bold text-stone-900 uppercase tracking-wide">
                          {log.action.replace('_', ' ')}
                        </span>
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-stone-700 font-medium mt-1">{log.details}</p>
                      {log.actor && (
                        <div className="text-[11px] text-stone-400 mt-1">
                          By: {log.actor.name} ({log.actor.role})
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadModal;
