import React from 'react';
import { Building2, Mail, DollarSign, UserCheck, Trash2, Eye } from 'lucide-react';

const STATUS_BADGES = {
  NEW: 'bg-amber-50/80 text-amber-900 border-amber-200',
  CONTACTED: 'bg-blue-50 text-blue-900 border-blue-200',
  QUALIFIED: 'bg-stone-100 text-stone-800 border-stone-300',
  PROPOSAL_SENT: 'bg-purple-50 text-purple-900 border-purple-200',
  WON: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  LOST: 'bg-stone-100 text-stone-600 border-slate-200',
};

const LeadTable = ({ leads, onSelectLead, onDeleteLead, isAdmin }) => {
  return (
    <div className="bg-white border border-stone-200/90 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#faf6ee] text-stone-700 text-xs uppercase tracking-wider border-b border-stone-200">
              <th className="py-3.5 px-4 font-bold">Lead & Company</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold">Assigned Rep</th>
              <th className="py-3.5 px-4 font-bold">Est. Value</th>
              <th className="py-3.5 px-4 font-bold">Source</th>
              <th className="py-3.5 px-4 font-bold">Created Date</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {leads.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-stone-400 italic">
                  No leads found matching current filter criteria.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-[#fdfbf7] transition-colors group cursor-pointer"
                  onClick={() => onSelectLead(lead)}
                >
                  {/* Lead Info */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
                      {lead.name}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-stone-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-stone-400" />
                        {lead.email}
                      </span>
                      {lead.company && (
                        <span className="flex items-center gap-1 text-stone-500">
                          <Building2 className="w-3 h-3 text-stone-400" />
                          {lead.company}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${
                        STATUS_BADGES[lead.status] || STATUS_BADGES.NEW
                      }`}
                    >
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Assigned Rep */}
                  <td className="py-3.5 px-4">
                    {lead.assignedTo ? (
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1 bg-stone-100 px-2 py-1 rounded border border-stone-200 w-fit">
                        <UserCheck className="w-3.5 h-3.5 text-amber-800" />
                        {lead.assignedTo.name}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Unassigned</span>
                    )}
                  </td>

                  {/* Estimated Value */}
                  <td className="py-3.5 px-4 font-bold text-emerald-800">
                    ${lead.value ? lead.value.toLocaleString() : '0'}
                  </td>

                  {/* Source */}
                  <td className="py-3.5 px-4 text-xs text-stone-500">{lead.source || 'Website'}</td>

                  {/* Created Date */}
                  <td className="py-3.5 px-4 text-xs text-stone-500">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onSelectLead(lead)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => onDeleteLead(lead.id)}
                          className="p-1.5 text-stone-500 hover:text-red-700 hover:bg-stone-100 rounded transition-colors"
                          title="Delete Lead (Admin Only)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTable;
