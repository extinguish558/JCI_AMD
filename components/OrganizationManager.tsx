
import React, { useState, useMemo } from 'react';
import { Member, OrgRole, Chapter, OrgSection } from '../types';
import OrgVisualChart from './OrgVisualChart';

interface OrganizationManagerProps {
  chapter: Chapter;
  members: Member[];
  onUpdateMembers: (updates: Member[]) => Promise<void>;
  onClose: () => void;
}

const OrganizationManager: React.FC<OrganizationManagerProps> = ({ chapter, members, onUpdateMembers, onClose }) => {
  const [view, setView] = useState<'EDITOR' | 'CHART'>('EDITOR');
  const [roles, setRoles] = useState<OrgRole[]>([
    { id: 'm1', section: 'MAIN_AXIS', mainTitle: '個人會員', mainMemberIds: [], hasDeputy: false, rank: 1 },
    { id: 'm2', section: 'MAIN_AXIS', mainTitle: '會員大會', mainMemberIds: [], hasDeputy: false, rank: 2 },
    { id: 'm3', section: 'MAIN_AXIS', mainTitle: '理事會', mainMemberIds: [], hasDeputy: false, rank: 3 },
    { id: 'm4', section: 'MAIN_AXIS', mainTitle: '常務理事會', mainMemberIds: [], hasDeputy: false, rank: 4 },
    { id: 'm5', section: 'MAIN_AXIS', mainTitle: '會長', mainMemberIds: [], hasDeputy: false, rank: 5 },
    
    { id: 'a1', section: 'LEFT_ADVISORS', mainTitle: '歷屆前會長', mainMemberIds: [], hasDeputy: false, rank: 10 },
    { id: 'a2', section: 'LEFT_ADVISORS', mainTitle: '榮譽顧問', mainMemberIds: [], hasDeputy: false, rank: 11 },
    
    { id: 's1', section: 'LEFT_SUPERVISORS', mainTitle: '常務監事', mainMemberIds: [], hasDeputy: false, rank: 20 },
    { id: 's2', section: 'LEFT_SUPERVISORS', mainTitle: '監事', mainMemberIds: [], hasDeputy: false, rank: 21 },
    
    { id: 'e1', section: 'RIGHT_ADMIN', mainTitle: '秘書長', mainMemberIds: [], hasDeputy: true, deputyTitle: '副秘書長', deputyMemberIds: [], rank: 30 },
    { id: 'e2', section: 'RIGHT_ADMIN', mainTitle: '財務長', mainMemberIds: [], hasDeputy: true, deputyTitle: '副財務長', deputyMemberIds: [], rank: 31 },
    
    { id: 'c1', section: 'RIGHT_TEAMS', mainTitle: '數位發展主委', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主委', deputyMemberIds: [], rank: 100 },
    { id: 'c2', section: 'RIGHT_TEAMS', mainTitle: '運動休閒主委', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主委', deputyMemberIds: [], rank: 101 },
  ]);
  
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
  const [assigningType, setAssigningType] = useState<'MAIN' | 'DEPUTY'>('MAIN');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddRole = () => {
    const newRole: OrgRole = {
      id: Date.now().toString(),
      section: 'RIGHT_TEAMS',
      mainTitle: '新委員會主委',
      mainMemberIds: [],
      hasDeputy: true,
      deputyTitle: '副主委',
      deputyMemberIds: [],
      rank: 200
    };
    setRoles([...roles, newRole]);
  };

  const handleUpdateRole = (id: string, updates: Partial<OrgRole>) => {
    setRoles(roles.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const toggleMemberInRole = (memberId: string) => {
    if (!activeRoleId) return;
    setRoles(prev => prev.map(r => {
      if (r.id !== activeRoleId) return r;
      if (assigningType === 'MAIN') {
        const exists = r.mainMemberIds.includes(memberId);
        return { ...r, mainMemberIds: exists ? r.mainMemberIds.filter(id => id !== memberId) : [...r.mainMemberIds, memberId] };
      } else {
        const exists = r.deputyMemberIds?.includes(memberId);
        return { ...r, deputyMemberIds: exists ? r.deputyMemberIds?.filter(id => id !== memberId) : [...(r.deputyMemberIds || []), memberId] };
      }
    }));
  };

  const handleSaveAndSync = async () => {
    const updates: Member[] = members.map(m => {
      if (m.chapter !== chapter) return m;
      const role = roles.find(r => r.mainMemberIds.includes(m.id) || r.deputyMemberIds?.includes(m.id));
      if (role) {
        const isDeputy = role.deputyMemberIds?.includes(m.id);
        const title = isDeputy ? `${role.deputyTitle}(${role.mainTitle})` : role.mainTitle;
        return { ...m, currentRole: { roleName: title, rankInRole: role.rank } };
      }
      const { currentRole, ...rest } = m;
      return rest as Member;
    });
    await onUpdateMembers(updates);
    alert('組織資料已同步！');
  };

  const activeRole = roles.find(r => r.id === activeRoleId);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-7xl h-[94vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-10 py-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600 p-3 rounded-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h2 className="font-black text-2xl tracking-tighter">115 年度組織架構管理</h2>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-2xl">
            <button onClick={() => setView('EDITOR')} className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${view === 'EDITOR' ? 'bg-white text-slate-900' : 'text-slate-400'}`}>格子設定</button>
            <button onClick={() => setView('CHART')} className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${view === 'CHART' ? 'bg-white text-slate-900' : 'text-slate-400'}`}>圖表預覽</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {view === 'EDITOR' ? (
            <>
              {/* Left: Role List */}
              <div className="w-1/2 border-r border-slate-100 p-8 flex flex-col bg-slate-50">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-widest">職務格子清單</h3>
                  <button onClick={handleAddRole} className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-105 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {roles.sort((a,b) => a.rank - b.rank).map(role => (
                    <div 
                      key={role.id} 
                      onClick={() => setActiveRoleId(role.id)}
                      className={`p-4 rounded-3xl border-2 transition-all cursor-pointer bg-white ${activeRoleId === role.id ? 'border-indigo-600 shadow-xl' : 'border-transparent shadow-sm'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                         <div className="space-y-1 flex-1">
                            <div className="flex items-center space-x-2">
                              <input value={role.mainTitle} onChange={e => handleUpdateRole(role.id, { mainTitle: e.target.value })} className="font-black text-slate-800 bg-transparent border-none p-0 focus:ring-0 text-sm w-full" />
                              <select value={role.section} onChange={e => handleUpdateRole(role.id, { section: e.target.value as OrgSection })} className="text-[9px] font-black bg-slate-100 rounded px-1.5 py-0.5 outline-none">
                                <option value="MAIN_AXIS">主軸</option>
                                <option value="LEFT_ADVISORS">左-顧問</option>
                                <option value="LEFT_SUPERVISORS">左-監事</option>
                                <option value="RIGHT_ADMIN">右-行政</option>
                                <option value="RIGHT_TEAMS">右-功能隊</option>
                              </select>
                            </div>
                            <div className="flex flex-wrap gap-1">
                               {role.mainMemberIds.map(id => <span key={id} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 rounded">正:{members.find(m => m.id === id)?.name}</span>)}
                            </div>
                         </div>
                         <button onClick={() => setRoles(roles.filter(r => r.id !== role.id))} className="text-slate-300 hover:text-red-500 transition-colors ml-2">✕</button>
                      </div>
                      {role.hasDeputy && (
                        <div className="mt-3 pt-3 border-t border-dashed border-slate-100">
                           <input value={role.deputyTitle} onChange={e => handleUpdateRole(role.id, { deputyTitle: e.target.value })} className="text-[11px] font-bold text-slate-400 bg-transparent border-none p-0 focus:ring-0 w-full mb-1" placeholder="副職稱..." />
                           <div className="flex flex-wrap gap-1">
                              {role.deputyMemberIds?.map(id => <span key={id} className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 rounded">副:{members.find(m => m.id === id)?.name}</span>)}
                           </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Member Picker */}
              <div className="w-1/2 p-8 flex flex-col">
                <div className="mb-6">
                  <h3 className="font-black text-lg text-slate-800 mb-2">人員指派中心</h3>
                  {activeRole ? (
                    <div className="flex space-x-2">
                       <button onClick={() => setAssigningType('MAIN')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${assigningType === 'MAIN' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>指派正職 ({activeRole.mainTitle})</button>
                       {activeRole.hasDeputy && <button onClick={() => setAssigningType('DEPUTY')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${assigningType === 'DEPUTY' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>指派副手 ({activeRole.deputyTitle})</button>}
                       <button onClick={() => handleUpdateRole(activeRole.id, { hasDeputy: !activeRole.hasDeputy })} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">切換副手開關</button>
                    </div>
                  ) : <p className="text-slate-400 text-sm font-bold animate-pulse">← 請先點選左側職務格子</p>}
                </div>

                <div className="relative mb-6">
                  <input type="text" placeholder="搜尋人員..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-sm font-bold" />
                  <svg className="w-5 h-5 absolute left-5 top-4.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 content-start pr-2 pb-10">
                  {members.filter(m => m.chapter === chapter && m.name.includes(searchTerm)).map(m => {
                    const isMain = activeRole?.mainMemberIds.includes(m.id);
                    const isDeputy = activeRole?.deputyMemberIds?.includes(m.id);
                    return (
                      <button 
                        key={m.id} 
                        onClick={() => toggleMemberInRole(m.id)}
                        className={`flex items-center p-3 rounded-2xl border-2 transition-all text-left ${isMain ? 'border-indigo-600 bg-indigo-50' : isDeputy ? 'border-indigo-400 bg-indigo-50/50' : 'border-transparent bg-slate-50 hover:border-slate-200'}`}
                      >
                        <img src={m.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} className="w-8 h-8 rounded-lg mr-3 object-cover" />
                        <span className="text-sm font-black text-slate-800">{m.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full overflow-auto bg-slate-50">
              <OrgVisualChart roles={roles} members={members} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white px-10 py-6 border-t border-slate-100 flex justify-end space-x-4 shrink-0 shadow-inner">
           <button onClick={onClose} className="px-8 py-3 text-slate-400 font-bold hover:text-slate-900 transition-colors">捨棄變更</button>
           <button onClick={handleSaveAndSync} className="px-12 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all">確認並同步組織狀態</button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationManager;
