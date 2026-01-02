
import React, { useState, useMemo } from 'react';
import { Member, AuthUser, MembershipStatus, StatusLog } from '../types';

interface MembershipAdjustmentSystemProps {
  members: Member[];
  user: AuthUser;
  onUpdateMember: (member: Member) => void;
  onClose: () => void;
}

const MembershipAdjustmentSystem: React.FC<MembershipAdjustmentSystemProps> = ({ members, user, onUpdateMember, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (user.managedChapter && m.chapter !== user.managedChapter) return false;
      const term = searchTerm.toLowerCase();
      return m.name.toLowerCase().includes(term) || m.company?.toLowerCase().includes(term);
    });
  }, [members, user, searchTerm]);

  const activeMember = members.find(m => m.id === selectedId);

  const handleStatusChange = (newStatus: MembershipStatus) => {
    if (!activeMember) return;
    
    const currentStatus = activeMember.status || MembershipStatus.ACTIVE;
    const logEntry: StatusLog = {
      fromStatus: currentStatus,
      toStatus: newStatus,
      changedAt: new Date().toISOString(),
      changedBy: user.name,
      reason: `後台管理員 ${user.name} 手動調整`
    };

    onUpdateMember({
      ...activeMember,
      status: newStatus,
      statusLog: [...(activeMember.statusLog || []), logEntry]
    });
    
    alert(`已將 ${activeMember.name} 的會籍調整為：${newStatus}`);
  };

  const handleDeleteLog = (originalIndex: number) => {
    if (!activeMember || !activeMember.statusLog) return;
    
    if (confirm('確定要刪除這條會籍變更紀錄嗎？此動作無法復原。')) {
      const newLogs = [...activeMember.statusLog];
      newLogs.splice(originalIndex, 1);
      
      onUpdateMember({
        ...activeMember,
        statusLog: newLogs
      });
    }
  };

  const getStatusBadge = (status?: MembershipStatus) => {
    switch (status) {
      case MembershipStatus.ON_LEAVE: return 'bg-amber-100 text-amber-700 border-amber-200';
      case MembershipStatus.RESIGNED: return 'bg-red-100 text-red-700 border-red-200';
      case MembershipStatus.PROBATION_FAILED: return 'bg-rose-100 text-rose-700 border-rose-200';
      case MembershipStatus.NOT_JOINING: return 'bg-slate-200 text-slate-700 border-slate-300';
      case MembershipStatus.REINSTATED: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusIcon = (status: MembershipStatus) => {
    switch (status) {
      case MembershipStatus.ACTIVE: return '🏠';
      case MembershipStatus.ON_LEAVE: return '💤';
      case MembershipStatus.RESIGNED: return '🚪';
      case MembershipStatus.REINSTATED: return '🔄';
      case MembershipStatus.PROBATION_FAILED: return '❌';
      case MembershipStatus.NOT_JOINING: return '🚫';
      default: return '👤';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/98 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-slate-900 px-10 py-8 flex justify-between items-center text-white">
          <div className="flex items-center">
            <div className="bg-violet-600 p-3 rounded-2xl mr-5 shadow-lg shadow-violet-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter">會籍調整管理系統</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Membership Status Adjustment & History</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">✕</button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* 左側：名單與搜尋 */}
          <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50">
            <div className="p-6">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="搜尋姓名或公司..." 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black focus:ring-2 focus:ring-violet-500 outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <svg className="w-4 h-4 absolute left-3 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-2">
              {filteredMembers.map(m => (
                <button 
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center group ${selectedId === m.id ? 'border-violet-600 bg-white shadow-lg' : 'border-transparent hover:bg-white'}`}
                >
                  <img src={m.avatarUrl || 'https://via.placeholder.com/100'} className="w-10 h-10 rounded-xl object-cover mr-3 border border-slate-100" />
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-sm text-slate-900 truncate">{m.name}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${getStatusBadge(m.status)}`}>{m.status || '會友'}</span>
                      <span className="text-[9px] font-bold text-slate-400 truncate">{m.type}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 右側：調整功能區 */}
          <div className="flex-1 overflow-y-auto p-12 bg-white">
            {activeMember ? (
              <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center space-x-6">
                  <img src={activeMember.avatarUrl || 'https://via.placeholder.com/300'} className="w-32 h-32 rounded-[2rem] object-cover shadow-2xl border-4 border-slate-50" />
                  <div>
                    <h3 className="text-4xl font-black text-slate-900">{activeMember.name}</h3>
                    <p className="text-violet-600 font-black text-sm mt-2">{activeMember.company || '未填寫商號'}</p>
                    <div className="mt-4 flex space-x-3">
                      <span className="px-4 py-1.5 bg-slate-100 rounded-xl text-[10px] font-black text-slate-600 border border-slate-200 uppercase tracking-widest">目前狀態：{activeMember.status || '會友'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 space-y-8">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">變更會籍狀態</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      MembershipStatus.ACTIVE, 
                      MembershipStatus.ON_LEAVE, 
                      MembershipStatus.RESIGNED, 
                      MembershipStatus.REINSTATED,
                      MembershipStatus.PROBATION_FAILED,
                      MembershipStatus.NOT_JOINING
                    ].map(status => (
                      <button 
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={activeMember.status === status || (!activeMember.status && status === MembershipStatus.ACTIVE)}
                        className={`py-6 rounded-[1.5rem] font-black text-sm transition-all border-2 flex flex-col items-center justify-center space-y-2
                          ${(activeMember.status === status || (!activeMember.status && status === MembershipStatus.ACTIVE))
                            ? 'bg-violet-600 border-violet-700 text-white shadow-xl opacity-50 cursor-default' 
                            : 'bg-white border-slate-200 text-slate-700 hover:border-violet-400 hover:bg-violet-50'
                          }`}
                      >
                        <span className="text-lg">{getStatusIcon(status)}</span>
                        <span>{status}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">變更歷史紀錄</h4>
                  <div className="space-y-3">
                    {activeMember.statusLog && activeMember.statusLog.length > 0 ? (
                      [...activeMember.statusLog].map((log, idx) => ({ log, originalIndex: idx })).reverse().map(({ log, originalIndex }) => (
                        <div key={originalIndex} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm group">
                           <div className="flex items-center space-x-3">
                             <div className="text-[10px] font-black text-slate-400 line-through">{log.fromStatus}</div>
                             <svg className="w-3 h-3 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                             <div className="text-xs font-black text-violet-600">{log.toStatus}</div>
                           </div>
                           <div className="flex items-center space-x-4">
                             <div className="text-right">
                               <div className="text-[9px] font-black text-slate-900">經辦人：{log.changedBy}</div>
                               <div className="text-[8px] text-slate-400">{new Date(log.changedAt).toLocaleString()}</div>
                             </div>
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleDeleteLog(originalIndex); }}
                               className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                               title="刪除紀錄"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                               </svg>
                             </button>
                           </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-8 text-xs text-slate-400 font-bold italic">尚無變更紀錄</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <p className="font-black tracking-widest uppercase text-xs">請從左側名單選取人員進行會籍調整</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipAdjustmentSystem;
