
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
  const [view, setView] = useState<'MAP' | 'PREVIEW'>('MAP');
  
  // 完整 PDF 職務內容初始化
  const [roles, setRoles] = useState<OrgRole[]>([
    // 中央主軸
    { id: 'm1', section: 'MAIN_AXIS', mainTitle: '個人會員', mainMemberIds: [], hasDeputy: false, rank: 1 },
    { id: 'm2', section: 'MAIN_AXIS', mainTitle: '會員大會', mainMemberIds: [], hasDeputy: false, rank: 2 },
    { id: 'm3', section: 'MAIN_AXIS', mainTitle: '理事會', mainMemberIds: [], hasDeputy: false, rank: 3 },
    { id: 'm4', section: 'MAIN_AXIS', mainTitle: '常務理事會', mainMemberIds: [], hasDeputy: false, rank: 4 },
    { id: 'm5', section: 'MAIN_AXIS', mainTitle: '會長', mainMemberIds: [], hasDeputy: false, rank: 5 },

    // 左側：顧問團
    { id: 'la1', section: 'LEFT_ADVISORS', mainTitle: '歷屆前會長', mainMemberIds: [], hasDeputy: false, rank: 10 },
    { id: 'la2', section: 'LEFT_ADVISORS', mainTitle: '榮譽顧問', mainMemberIds: [], hasDeputy: false, rank: 11 },
    { id: 'la3', section: 'LEFT_ADVISORS', mainTitle: '榮譽會員', mainMemberIds: [], hasDeputy: false, rank: 12 },

    // 左側：監事會
    { id: 'ls1', section: 'LEFT_SUPERVISORS', mainTitle: '常務監事', mainMemberIds: [], hasDeputy: false, rank: 20 },
    { id: 'ls2', section: 'LEFT_SUPERVISORS', mainTitle: '監事', mainMemberIds: [], hasDeputy: false, rank: 21 },
    { id: 'ls3', section: 'LEFT_SUPERVISORS', mainTitle: '監事', mainMemberIds: [], hasDeputy: false, rank: 22 },
    { id: 'ls4', section: 'LEFT_SUPERVISORS', mainTitle: '候補監事', mainMemberIds: [], hasDeputy: false, rank: 23 },

    // 右側：行政核心組 (對照 PDF 頂部區塊)
    { id: 'ra1', section: 'RIGHT_ADMIN', mainTitle: '金龍聯誼會', mainMemberIds: [], hasDeputy: false, rank: 30 },
    { id: 'ra2', section: 'RIGHT_ADMIN', mainTitle: '參議員聯誼會', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主席', deputyMemberIds: [], rank: 31 },
    { id: 'ra3', section: 'RIGHT_ADMIN', mainTitle: '行政特別助理', mainMemberIds: [], hasDeputy: false, rank: 32 },
    { id: 'ra4', section: 'RIGHT_ADMIN', mainTitle: '財務長', mainMemberIds: [], hasDeputy: true, deputyTitle: '副財務長', deputyMemberIds: [], rank: 33 },
    { id: 'ra5', section: 'RIGHT_ADMIN', mainTitle: '秘書長', mainMemberIds: [], hasDeputy: true, deputyTitle: '副秘書長', deputyMemberIds: [], rank: 34 },
    { id: 'ra6', section: 'RIGHT_ADMIN', mainTitle: '會章顧問主委', mainMemberIds: [], hasDeputy: false, rank: 35 },
    { id: 'ra7', section: 'RIGHT_ADMIN', mainTitle: '會員擴展主委', mainMemberIds: [], hasDeputy: false, rank: 36 },
    { id: 'ra8', section: 'RIGHT_ADMIN', mainTitle: '長期發展主委', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主委', deputyMemberIds: [], rank: 37 },
    { id: 'ra9', section: 'RIGHT_ADMIN', mainTitle: '特友聯誼會', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主席', deputyMemberIds: [], rank: 38 },
    { id: 'ra10', section: 'RIGHT_ADMIN', mainTitle: '會館基金主委', mainMemberIds: [], hasDeputy: false, rank: 39 },
    { id: 'ra11', section: 'RIGHT_ADMIN', mainTitle: '國際基金主委', mainMemberIds: [], hasDeputy: false, rank: 40 },
    { id: 'ra12', section: 'RIGHT_ADMIN', mainTitle: '法制顧問', mainMemberIds: [], hasDeputy: false, rank: 41 },
    { id: 'ra13', section: 'RIGHT_ADMIN', mainTitle: '訓練委員會主委', mainMemberIds: [], hasDeputy: false, rank: 42 },
    { id: 'ra14', section: 'RIGHT_ADMIN', mainTitle: '直前會長', mainMemberIds: [], hasDeputy: false, rank: 43 },

    // 會務副會長體系 (RT1)
    { id: 'rt1', section: 'RIGHT_TEAMS', mainTitle: '會務副會長', mainMemberIds: [], hasDeputy: false, rank: 100 },
    { id: 'rt1-1', section: 'RIGHT_TEAMS', mainTitle: '理事', mainMemberIds: [], hasDeputy: false, rank: 101 },
    { id: 'rt1-2', section: 'RIGHT_TEAMS', mainTitle: '理事', mainMemberIds: [], hasDeputy: false, rank: 102 },
    { id: 'rv1-1', section: 'RIGHT_TEAMS', mainTitle: '數位發展主委', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主委', deputyMemberIds: [], rank: 110 },
    { id: 'rv1-2', section: 'RIGHT_TEAMS', mainTitle: '編輯記錄主委', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主委', deputyMemberIds: [], rank: 111 },
    { id: 'rv1-3', section: 'RIGHT_TEAMS', mainTitle: '才能發展主委', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主委', deputyMemberIds: [], rank: 112 },
    { id: 'rv1-4', section: 'RIGHT_TEAMS', mainTitle: '運動休閒主委', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主委', deputyMemberIds: [], rank: 113 },
    { id: 'rv1-5', section: 'RIGHT_TEAMS', mainTitle: '青商家庭主委', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主委', deputyMemberIds: [], rank: 114 },
    { id: 'rv1-6', section: 'RIGHT_TEAMS', mainTitle: '例行會務主委', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主委', deputyMemberIds: [], rank: 115 },

    // 組務副會長體系 (RT2)
    { id: 'rt2', section: 'RIGHT_TEAMS', mainTitle: '組務副會長', mainMemberIds: [], hasDeputy: false, rank: 200 },
    { id: 'rt2-1', section: 'RIGHT_TEAMS', mainTitle: '理事', mainMemberIds: [], hasDeputy: false, rank: 201 },
    { id: 'rt2-2', section: 'RIGHT_TEAMS', mainTitle: '理事', mainMemberIds: [], hasDeputy: false, rank: 202 },
    { id: 'rv2-1', section: 'RIGHT_TEAMS', mainTitle: '地方創生主委', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主委', deputyMemberIds: [], rank: 210 },
    { id: 'rv2-2', section: 'RIGHT_TEAMS', mainTitle: '公關接待主委', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主委', deputyMemberIds: [], rank: 211 },
    { id: 'rv2-3', section: 'RIGHT_TEAMS', mainTitle: '社區發展主委', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主委', deputyMemberIds: [], rank: 212 },
    { id: 'rv2-4', section: 'RIGHT_TEAMS', mainTitle: '國際事務主委', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主委', deputyMemberIds: [], rank: 213 },
    { id: 'rv2-5', section: 'RIGHT_TEAMS', mainTitle: '特友會聯誼主委', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主委', deputyMemberIds: [], rank: 214 },
    { id: 'rv2-6', section: 'RIGHT_TEAMS', mainTitle: '會員聯誼主委', mainMemberIds: [], hasDeputy: true, deputyTitle: '副主委', deputyMemberIds: [], rank: 215 },

    // 底部專案
    { id: 'rb1', section: 'RIGHT_TEAMS', mainTitle: '交接典禮總幹事', mainMemberIds: [], hasDeputy: false, rank: 500 },
    { id: 'rb2', section: 'RIGHT_TEAMS', mainTitle: '忘年會總幹事', mainMemberIds: [], hasDeputy: false, rank: 501 },
  ]);
  
  const [activeRoleId, setActiveRoleId] = useState<string | null>(roles[0].id);
  const [assigningType, setAssigningType] = useState<'MAIN' | 'DEPUTY'>('MAIN');
  const [searchTerm, setSearchTerm] = useState('');

  const activeRole = roles.find(r => r.id === activeRoleId);

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
    alert('組織職務同步成功！');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/98 backdrop-blur-2xl p-4">
      <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-[98vw] h-[95vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-10 py-5 flex justify-between items-center text-white shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-6">
            <h2 className="font-black text-2xl tracking-tighter">115 年度組織架構管理</h2>
            <div className="bg-blue-600/20 text-blue-400 px-4 py-1 rounded-full text-[10px] font-black tracking-widest border border-blue-500/30">
              點擊圖表方塊進行人員指派
            </div>
          </div>
          
          <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
            <button onClick={() => setView('MAP')} className={`px-8 py-2 rounded-xl text-xs font-black transition-all ${view === 'MAP' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>格子設定</button>
            <button onClick={() => setView('PREVIEW')} className={`px-8 py-2 rounded-xl text-xs font-black transition-all ${view === 'PREVIEW' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>圖表預覽</button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {view === 'MAP' ? (
            <>
              {/* Left: Map */}
              <div className="flex-[3] border-r border-slate-100 overflow-auto bg-slate-50 p-6 scrollbar-hide">
                <OrgVisualChart 
                  roles={roles} 
                  members={members} 
                  interactive 
                  activeRoleId={activeRoleId} 
                  onSelectRole={setActiveRoleId} 
                />
              </div>

              {/* Right: Picker */}
              <div className="flex-[1] flex flex-col bg-white border-l border-slate-100 shadow-2xl z-10">
                <div className="p-8 bg-slate-900 text-white rounded-bl-[3rem] shadow-xl mb-6">
                  <span className="text-[10px] font-black text-blue-400 mb-2 block uppercase tracking-widest">目前選中職位</span>
                  <h3 className="text-2xl font-black mb-6">{activeRole?.mainTitle}</h3>
                  
                  {activeRole?.hasDeputy ? (
                    <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
                      <button onClick={() => setAssigningType('MAIN')} className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all ${assigningType === 'MAIN' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500'}`}>正職人員</button>
                      <button onClick={() => setAssigningType('DEPUTY')} className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all ${assigningType === 'DEPUTY' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500'}`}>{activeRole.deputyTitle}</button>
                    </div>
                  ) : (
                    <div className="bg-slate-800 px-6 py-3 rounded-2xl text-[11px] font-black text-slate-400 text-center border border-slate-700 italic">
                      此職位僅有正職設定
                    </div>
                  )}
                </div>

                <div className="px-8 pb-4 shrink-0">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="快速搜尋人員..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                    <svg className="w-5 h-5 absolute left-4.5 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-4 space-y-3 pb-20">
                  {members.filter(m => m.chapter === chapter && m.name.includes(searchTerm)).map(m => {
                    const isSelected = assigningType === 'MAIN' ? activeRole?.mainMemberIds.includes(m.id) : activeRole?.deputyMemberIds?.includes(m.id);
                    return (
                      <button 
                        key={m.id}
                        onClick={() => toggleMemberInRole(m.id)}
                        className={`w-full flex items-center p-4 rounded-3xl border-2 transition-all group ${isSelected ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-500/10' : 'border-slate-50 bg-slate-50 hover:border-slate-300'}`}
                      >
                        <div className="relative">
                          <img src={m.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} className="w-12 h-12 rounded-2xl mr-4 object-cover border-2 border-white shadow-sm" />
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-1 border-2 border-white shadow-md">
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <span className={`text-sm font-black block ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>{m.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 truncate w-40 block">{m.company || '未填寫現職'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full overflow-auto bg-white flex justify-center p-12 scrollbar-hide">
               <OrgVisualChart roles={roles} members={members} />
            </div>
          )}
        </div>

        <div className="bg-white px-10 py-6 border-t border-slate-100 flex justify-end space-x-6 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
           <button onClick={onClose} className="px-10 py-4 text-slate-400 font-black hover:text-slate-900 transition-colors uppercase tracking-widest text-xs">捨棄變更</button>
           <button onClick={handleSaveAndSync} className="px-16 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl hover:bg-black transition-all transform active:scale-95 shadow-slate-900/20">
              確認並同步 115 年度組織狀態
           </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationManager;
