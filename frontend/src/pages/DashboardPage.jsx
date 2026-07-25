import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import KanbanBoard from '../components/KanbanBoard';
import LeadTable from '../components/LeadTable';
import LeadModal from '../components/LeadModal';
import TeamModal from '../components/TeamModal';
import {
  Kanban,
  Table as TableIcon,
  Search,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  RefreshCw,
  AlertCircle,
  X,
  Lock,
} from 'lucide-react';

const DashboardPage = () => {
  const { user, isAdmin, token } = useAuth();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
  const [leads, setLeads] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [token, page, statusFilter, assigneeFilter, search]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', viewMode === 'kanban' ? 50 : 10);
      if (statusFilter) params.append('status', statusFilter);
      if (isAdmin && assigneeFilter) params.append('assignedTo', assigneeFilter);
      if (search.trim()) params.append('search', search.trim());

      const [leadsRes, usersRes] = await Promise.all([
        api.get(`/leads?${params.toString()}`),
        api.get('/auth/users'),
      ]);

      setLeads(leadsRes.data.leads || []);
      setPagination(leadsRes.data.pagination || { total: 0, totalPages: 1 });
      setTeamUsers(usersRes.data.users || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to load dashboard data.');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    setErrorMessage(null);
    try {
      await api.patch(`/leads/${leadId}`, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update lead status');
    }
  };

  const handleDeleteLead = async (leadId) => {
    setErrorMessage(null);
    if (!isAdmin) {
      setErrorMessage('Only Admin role is permitted to delete leads.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this lead? This action is permanent.')) {
      return;
    }

    try {
      await api.delete(`/leads/${leadId}`);
      if (selectedLeadId === leadId) setSelectedLeadId(null);
      fetchDashboardData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete lead');
    }
  };

  // Metrics (Excludes LOST deals from Active Pipeline Value)
  const totalLeadsCount = pagination.total || leads.length;
  const newLeadsCount = leads.filter((l) => l.status === 'NEW').length;
  const contactedLeadsCount = leads.filter((l) => l.status === 'CONTACTED').length;
  const wonLeadsCount = leads.filter((l) => l.status === 'WON').length;
  
  // Pipeline Value calculates Active & Won deals (Excludes LOST)
  const totalPipelineValue = leads
    .filter((l) => l.status !== 'LOST')
    .reduce((acc, l) => acc + (l.value || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-stone-800">
      <Navbar onOpenTeam={() => setShowTeamModal(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header & Role Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Sales Pipeline & Lead Management
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Logged in as <span className="text-stone-900 font-bold">{user?.name}</span> (
              <span className={isAdmin ? 'text-amber-900 font-bold' : 'text-stone-700 font-bold'}>
                {user?.role} Role
              </span>
              ) &bull;{' '}
              <span className="text-stone-600 italic">
                {isAdmin ? 'Full pipeline view & assignment control' : 'Showing your assigned leads only'}
              </span>
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setShowTeamModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#faf6ee] border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-amber-800" />
              <span>{isAdmin ? 'Manage Team' : 'View Team'}</span>
            </button>

            <button
              onClick={fetchDashboardData}
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 hover:text-stone-900 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-800" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Top Summary Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white border border-stone-200/90 p-4 rounded-xl shadow-xs">
            <div className="text-stone-500 text-xs font-semibold flex items-center justify-between">
              <span>{isAdmin ? 'Total System Leads' : 'My Assigned Leads'}</span>
              <TrendingUp className="w-4 h-4 text-amber-800" />
            </div>
            <div className="text-2xl font-extrabold text-stone-900 mt-2">{totalLeadsCount}</div>
          </div>

          <div className="bg-white border border-stone-200/90 p-4 rounded-xl shadow-xs">
            <div className="text-stone-500 text-xs font-semibold flex items-center justify-between">
              <span>New Inquiries</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
            </div>
            <div className="text-2xl font-extrabold text-amber-900 mt-2">{newLeadsCount}</div>
          </div>

          <div className="bg-white border border-stone-200/90 p-4 rounded-xl shadow-xs">
            <div className="text-stone-500 text-xs font-semibold flex items-center justify-between">
              <span>In Contact</span>
              <Users className="w-4 h-4 text-blue-700" />
            </div>
            <div className="text-2xl font-extrabold text-blue-700 mt-2">{contactedLeadsCount}</div>
          </div>

          <div className="bg-white border border-stone-200/90 p-4 rounded-xl shadow-xs">
            <div className="text-stone-500 text-xs font-semibold flex items-center justify-between">
              <span>Won Deals</span>
              <Award className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-2">{wonLeadsCount}</div>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-white border border-stone-200/90 p-4 rounded-xl shadow-xs">
            <div className="text-stone-500 text-xs font-semibold flex items-center justify-between">
              <span>Active Pipeline Value</span>
              <DollarSign className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-2">
              ${totalPipelineValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Toolbar: View Switcher, Search, and Filters */}
        <div className="bg-white border border-stone-200/90 p-4 rounded-xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 self-start">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'kanban'
                  ? 'bg-white text-stone-900 border border-stone-300 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5 text-amber-800" />
              <span>Kanban Board</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white text-stone-900 border border-stone-300 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-amber-800" />
              <span>Table View</span>
            </button>
          </div>

          {/* Filters & Search input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search leads, companies..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-56 pl-9 pr-3 py-2 bg-[#fdfbf7] border border-stone-200 focus:border-stone-400 focus:bg-white rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#fdfbf7] border border-stone-200 focus:border-stone-400 focus:bg-white rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none transition-all"
            >
              <option value="">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="PROPOSAL_SENT">PROPOSAL SENT</option>
              <option value="WON">WON</option>
              <option value="LOST">LOST</option>
            </select>

            {/* Assignee Filter: ADMIN ONLY */}
            {isAdmin ? (
              <select
                value={assigneeFilter}
                onChange={(e) => {
                  setAssigneeFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-[#fdfbf7] border border-stone-200 focus:border-stone-400 focus:bg-white rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none transition-all"
              >
                <option value="">All Assignees</option>
                <option value="unassigned">Unassigned Only</option>
                {teamUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-600 font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-stone-500" />
                <span>My Assigned Leads</span>
              </div>
            )}
          </div>
        </div>

        {/* Main View Area */}
        {loading ? (
          <div className="py-20 text-center text-stone-500 text-sm italic">
            Loading sales pipeline...
          </div>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard
            leads={leads}
            onSelectLead={(lead) => setSelectedLeadId(lead.id)}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <div className="space-y-4">
            <LeadTable
              leads={leads}
              onSelectLead={(lead) => setSelectedLeadId(lead.id)}
              onDeleteLead={handleDeleteLead}
              isAdmin={isAdmin}
            />

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white border border-stone-200 p-3 rounded-xl text-xs text-stone-600 shadow-xs">
                <div>
                  Page <span className="font-bold text-stone-900">{pagination.page}</span> of{' '}
                  <span className="font-bold text-stone-900">{pagination.totalPages}</span> ({pagination.total} total leads)
                </div>
                <div className="flex space-x-2">
                  <button
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-800 font-bold transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-800 font-bold transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Lead Modal Drawer */}
      {selectedLeadId && (
        <LeadModal
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onRefresh={fetchDashboardData}
          isAdmin={isAdmin}
          users={teamUsers}
        />
      )}

      {/* Team Management Modal */}
      {showTeamModal && (
        <TeamModal
          users={teamUsers}
          onClose={() => setShowTeamModal(false)}
          onRefresh={fetchDashboardData}
          isAdmin={isAdmin}
        />
      )}

      <Footer />
    </div>
  );
};

export default DashboardPage;
