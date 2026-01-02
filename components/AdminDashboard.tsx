
import React, { useState, useMemo } from 'react';
import { Member, AuthUser, Chapter, MemberType, MembershipStatus } from '../types';
import MemberEditor from './MemberEditor';
import BatchImportModal from './BatchImportModal';
import BulkPhotoSync from './BulkPhotoSync';
import OrganizationManager from './OrganizationManager';
import MemberAuditSystem from './MemberAuditSystem';
import MembershipAdjustmentSystem from './MembershipAdjustmentSystem';
import SystemModuleEditor from './SystemModuleEditor';

interface AdminDashboardProps {
  user: AuthUser;
  members: Member[];
  onLogout: () => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onCreateMember: (member: Member) => void;
  onUpdateAllMembers: (members: Member[]) => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, 
  members, 
  onLogout, 
  onUpdateMember, 
  onDeleteMember,
  onCreateMember,
  onUpdateAllMembers
}) => {
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isBatchImporting, setIsBatchImporting] = useState(false);
  const [isPhotoSyncing, setIsPhotoSyncing] = useState(false);
  const [isOrgManaging, setIsOrgManaging] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isAdjustingMembership, setIsAdjustingMembership] = useState(false);
  const [isSystemEditing, setIsSystemEditing] = useState(false);
  const [filterText, setFilterText] = useState('');
  
  const [showAgeWarningOnly, setShowAgeWarningOnly] = useState(false);

  const [adminChapter, setAdminChapter] = useState<Chapter>(user.managedChapter || '嘉義分會');
  const [adminType, setAdminType] = useState<MemberType>(MemberType.YB);

  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const calculateAge = (birthday?: string) => {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    if (isNaN(birthDate.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const pendingTransferMembers = useMemo(() => {
    return members.filter(m => {
      if (m.chapter !== adminChapter) return false;
      if (m.type !== MemberType.YB) return false;
      const inactiveStatuses = [
        MembershipStatus.RESIGNED, 
        MembershipStatus.ON_LEAVE, 
        MembershipStatus.PROBATION_FAILED, 
        MembershipStatus.NOT_JOINING
      ];
      if (m.status && inactiveStatuses.includes(m.status)) return false;
      return calculateAge(m.birthday) >= 40;
    });
  }, [members, adminChapter]);

  const visibleMembers = useMemo(() => {
    let list = members.filter(m => m.chapter === adminChapter && m.type === adminType);
    if (showAgeWarningOnly) {
      list = list.filter(m => calculateAge(m.birthday) >= 40 && m.type === MemberType.YB);
    }
    if (filterText) {
      const term = filterText.toLowerCase();
      list = list.filter(m => 
        m.name.toLowerCase().includes(term) || 
        m.company?.toLowerCase().includes(term) ||
        m.memberCode?.includes(term) ||
        m.englishName?.toLowerCase().includes(term)
      );
    }
    return list;
  }, [members, adminChapter, adminType, filterText, showAgeWarningOnly]);

  const handleBulkUpdate = async (updates: Partial<Member>[]) => {
    const updatedAll = members.map(m => {
      const update = updates.find(u => u.id === m.id);
      return update ? { ...m, ...update } as Member : m;
    });
    await onUpdateAllMembers(updatedAll);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">後台管理系統</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{user.name} | {user.role === 'SUPER_ADMIN' ? '系統總管' : adminChapter}</p>
          </div>
        </div>
        <button onClick={onLogout} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[11px] font-black transition-all border border-white/10 backdrop-blur-md">登出系統</button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {pendingTransferMembers.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-[2.5rem] mb-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-5">
               <div className="bg-amber-100 p-4 rounded-3xl text-amber-600 shadow-inner">
                 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               </div>
               <div>
                 <h4 className="text-amber-900 font-black text-sm mb-1">YB 會員超齡提醒</h4>
                 <p className="text-amber-700/80 text-xs font-bold leading-relaxed">偵測到 {pendingTransferMembers.length} 位 YB 會友已屆滿 40 歲，依規定應辦理轉入特友會手續。</p>
               </div>
            </div>
            <button onClick={() => { setAdminType(MemberType.YB); setShowAgeWarningOnly(true); }} className="bg-amber-500 text-white px-8 py-3 rounded-2xl text-[11px] font-black hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 active:scale-95">查看名單</button>
          </div>
        )}

        {/* 管理工具欄 */}
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm">
             {['嘉義分會', '南投分會'].map(c => (
               <button 
                 key={c} 
                 onClick={() => setAdminChapter(c as Chapter)} 
                 disabled={!isSuperAdmin && user.managedChapter !== c}
                 className={`px-8 py-2.5 rounded-xl text-[11px] font-black transition-all ${adminChapter === c ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'} disabled:opacity-20`}
               >
                 {c}
               </button>
             ))}
          </div>
          <div className="flex-1 min-w-[300px] relative">
            <input 
              type="text" 
              placeholder="搜尋管理名錄..." 
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-white border-2 border-slate-100 rounded-[1.5rem] text-sm font-bold outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-sm"
            />
          </div>
          <button onClick={() => setIsCreating(true)} className="px-10 h-14 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center gap-2">
            ＋ 新增會友資料
          </button>
        </div>

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest border-r border-white/5">基本資料</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest border-r border-white/5">現職與職稱</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest border-r border-white/5 text-center">會籍狀態</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">管理操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleMembers.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        {/* 列表頭像容器：改為 bg-white */}
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-100 bg-white shadow-sm group-hover:scale-110 transition-transform">
                          <img src={m.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} className="w-full h-full object-cover object-top bg-white" />
                        </div>
                        <div>
                          <div className="text-[15px] font-black text-slate-900">{m.name}</div>
                          <div className="text-[10px] font-black text-blue-600 mt-0.5">{m.memberCode || '未設編號'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-[11px] font-black text-slate-700 mb-1 truncate max-w-[180px]">{m.company || '-'}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{m.currentRole?.roleName || m.title || '正式會友'}</div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                        m.status === MembershipStatus.ACTIVE || !m.status 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {m.status || MembershipStatus.ACTIVE}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingMember(m)} className="px-4 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-black transition-all">編輯</button>
                        <button onClick={() => onDeleteMember(m.id)} className="px-4 py-2 bg-slate-100 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black transition-all">刪除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <div className="relative z-[150]">
        {isCreating && <MemberEditor user={user} onSave={(m) => { onCreateMember(m); setIsCreating(false); }} onCancel={() => setIsCreating(false)} />}
        {editingMember && <MemberEditor member={editingMember} user={user} onSave={(m) => { onUpdateMember(m); setEditingMember(null); }} onCancel={() => setEditingMember(null)} />}
        {isBatchImporting && <BatchImportModal chapter={adminChapter} onImport={(list) => { onUpdateAllMembers([...members, ...list]); setIsBatchImporting(false); }} onClose={() => setIsBatchImporting(false)} />}
        {isPhotoSyncing && <BulkPhotoSync members={members} onUpdateMembers={handleBulkUpdate} onClose={() => setIsPhotoSyncing(false)} />}
        {isOrgManaging && <OrganizationManager chapter={adminChapter} members={members} onUpdateMembers={onUpdateAllMembers} onClose={() => setIsOrgManaging(false)} />}
        {isAuditing && <MemberAuditSystem members={members} user={user} onUpdateMember={onUpdateMember} onClose={() => setIsAuditing(false)} />}
        {isAdjustingMembership && <MembershipAdjustmentSystem members={members} user={user} onUpdateMember={onUpdateMember} onClose={() => setIsAdjustingMembership(false)} />}
        {isSystemEditing && <SystemModuleEditor onClose={() => setIsSystemEditing(false)} />}
      </div>
    </div>
  );
};

export default AdminDashboard;
