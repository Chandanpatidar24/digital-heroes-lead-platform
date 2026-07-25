import React from 'react';
import { Building2, DollarSign, UserCheck, MessageSquare } from 'lucide-react';

const COLUMNS = [
  { id: 'NEW', title: 'New Leads', color: 'border-amber-200 bg-amber-50/80 text-amber-900' },
  { id: 'CONTACTED', title: 'Contacted', color: 'border-blue-200 bg-blue-50/80 text-blue-900' },
  { id: 'QUALIFIED', title: 'Qualified', color: 'border-stone-300 bg-stone-100 text-stone-800' },
  { id: 'PROPOSAL_SENT', title: 'Proposal Sent', color: 'border-purple-200 bg-purple-50/80 text-purple-900' },
  { id: 'WON', title: 'Won', color: 'border-emerald-200 bg-emerald-50/80 text-emerald-900' },
  { id: 'LOST', title: 'Lost', color: 'border-stone-300 bg-stone-100 text-stone-600' },
];

const KanbanBoard = ({ leads, onSelectLead, onUpdateStatus }) => {
  const getLeadsByStatus = (statusId) => leads.filter((l) => l.status === statusId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-6">
      {COLUMNS.map((column) => {
        const columnLeads = getLeadsByStatus(column.id);
        const columnTotalValue = columnLeads.reduce((acc, l) => acc + (l.value || 0), 0);

        return (
          <div
            key={column.id}
            className="flex flex-col bg-stone-100/60 border border-stone-200/90 rounded-xl p-3 min-w-[260px] shadow-xs"
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between p-2.5 rounded-lg border mb-3 ${column.color}`}>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xs uppercase tracking-wider">{column.title}</span>
                <span className="bg-white/90 px-2 py-0.5 rounded-full text-[11px] font-bold shadow-xs">
                  {columnLeads.length}
                </span>
              </div>
              <div className="text-[11px] font-bold">
                ${columnTotalValue.toLocaleString()}
              </div>
            </div>

            {/* Column Cards List */}
            <div className="flex-1 space-y-3 min-h-[350px]">
              {columnLeads.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-stone-200 rounded-lg flex items-center justify-center text-xs text-stone-400 italic">
                  No leads in stage
                </div>
              ) : (
                columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="group bg-white hover:bg-[#fdfbf7] border border-stone-200 hover:border-amber-400 rounded-xl p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                  >
                    {/* Side indicator */}
                    <div
                      className={`absolute top-0 left-0 bottom-0 w-1 ${
                        column.id === 'WON'
                          ? 'bg-emerald-500'
                          : column.id === 'LOST'
                          ? 'bg-stone-400'
                          : 'bg-amber-700'
                      }`}
                    />

                    {/* Lead Title & Company */}
                    <div className="pl-2">
                      <h4 className="font-bold text-stone-900 text-sm group-hover:text-amber-900 transition-colors line-clamp-1">
                        {lead.name}
                      </h4>
                      {lead.company && (
                        <div className="flex items-center space-x-1 text-xs text-stone-500 mt-0.5">
                          <Building2 className="w-3 h-3 text-stone-400" />
                          <span className="line-clamp-1">{lead.company}</span>
                        </div>
                      )}
                    </div>

                    {/* Lead Value & Assignee */}
                    <div className="mt-3 pl-2 flex items-center justify-between text-xs">
                      <div className="flex items-center text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <DollarSign className="w-3 h-3 mr-0.5" />
                        {lead.value ? lead.value.toLocaleString() : '0'}
                      </div>

                      <div className="flex items-center text-stone-600">
                        {lead.assignedTo ? (
                          <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 border border-stone-200">
                            <UserCheck className="w-3 h-3 text-amber-800" />
                            {lead.assignedTo.name.split(' ')[0]}
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Move Status Toolbar */}
                    <div
                      className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1 text-stone-500">
                        <MessageSquare className="w-3 h-3 text-stone-400" />
                        <span>{lead._count?.notes || 0} notes</span>
                      </div>

                      <select
                        value={lead.status}
                        onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                        className="bg-[#fdfbf7] text-stone-900 border border-stone-200 rounded px-1.5 py-0.5 text-[11px] focus:outline-none focus:border-amber-500 font-medium"
                      >
                        {COLUMNS.map((col) => (
                          <option key={col.id} value={col.id}>
                            Move to {col.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
