
import React, { useState, useMemo } from 'react';
import { Member, AuthUser, Chapter, MemberType } from '../types';
import MemberEditor from './MemberEditor';
import BatchImportModal from './BatchImportModal';
import BulkPhotoSync from './BulkPhotoSync';
import OrganizationManager from './OrganizationManager';
import { exportToCSV } from '../utils/exportUtils';

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
  const [filterText, setFilterText] = useState('');

  const [adminChapter, setAdminChapter] = useState<Chapter>(user.managedChapter || '嘉義分會');
  const [adminType, setAdminType] = useState<MemberType>(MemberType.YB);

  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const visibleMembers = useMemo(() => {
    return members.filter(m => {
      if (m.chapter !== adminChapter) return false;
      if (m.type !== adminType) return false;
      if (filterText) {
        const t = filterText.toLowerCase();
        return m.name.toLowerCase().includes(t) || 
               m.company?.toLowerCase().includes(t) ||
               m.mobile?.includes(t);
      }
      return true;
    });
  }, [members, adminChapter, adminType, filterText]);

  const handleBatchImport = async (newMembers: Member[]) => {
    let updatedCount = 0;
    let createdCount = 0;

    for (const incoming of newMembers) {
      const existing = members.find(m => m.name === incoming.name && m.chapter === adminChapter);
      if (existing) {
        onUpdateMember({
          ...existing,
          ...incoming,
          id: existing.id,
          avatarUrl: existing.avatarUrl
        });
        updatedCount++;
      } else {
        onCreateMember(incoming);
        createdCount++;
      }
    }
    alert(`✅ 同步完成！\n- 更新現有會員：${updatedCount} 位\n- 新增會員：${createdCount} 位`);
  };

  const handleBulkPhotoUpdate = async (updates: Partial<Member>[]) => {
    for (const update of updates) {
      const fullMember = members.find(m => m.id === update.id);
      if (fullMember) {
        onUpdateMember({ ...fullMember, avatarUrl: update.avatarUrl });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <div className="bg-slate-900 text-white shadow-xl z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h1 className="font-bold text-lg hidden sm:block">後台管理：{adminChapter}</h1>
          </div>
          <button onClick={onLogout} className="text-sm bg-slate-800 hover:bg-red-600 px-5 py-2 rounded-xl border border-slate-700 transition-all font-black">登出系統</button>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between py-3 md:h-16">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl space-x-1">
            {isSuperAdmin ? (
              (['嘉義分會', '南投分會'] as Chapter[]).map(ch => (
                <button key={ch} onClick={() => setAdminChapter(ch)} className={`px-6 py-2 rounded-lg text-sm font-black transition-all ${adminChapter === ch ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-white'}`}>{ch}</button>
              ))
            ) : <div className="px-6 py-2 bg-white text-blue-800 rounded-lg text-sm font-black shadow-sm">{adminChapter}</div>}
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl mt-3 md:mt-0">
            {[MemberType.YB, MemberType.SENIOR].map(t => (
              <button key={t} onClick={() => setAdminType(t)} className={`px-8 py-2 rounded-lg text-sm font-black transition-all ${adminType === t ? 'bg-white text-blue-700 shadow-md' : 'text-slate-600 hover:text-slate-800'}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 mt-8 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input type="text" placeholder="搜尋姓名、手機、公司..." className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" value={filterText} onChange={e => setFilterText(e.target.value)} />
          <svg className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div className="flex flex-wrap gap-2">
           <button onClick={() => setIsOrgManaging(true)} className="px-6 py-3.5 bg-indigo-600 text-white font-black text-sm rounded-2xl hover:bg-indigo-700 shadow-lg flex items-center">
             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             組織圖與幹部管理
           </button>
           <button onClick={() => setIsBatchImporting(true)} className="px-6 py-3.5 bg-green-600 text-white font-black text-sm rounded-2xl hover:bg-green-700 shadow-lg flex items-center">
             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             Excel 匯入
           </button>
           <button onClick={() => setIsPhotoSyncing(true)} className="px-6 py-3.5 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 shadow-lg flex items-center">
             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             同步照片
           </button>
           <button onClick={() => setIsCreating(true)} className="px-6 py-3.5 bg-slate-900 text-white font-black text-sm rounded-2xl hover:bg-black shadow-lg">手動新增</button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-800 uppercase tracking-widest">會員姓名與聯繫方式</th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-800 uppercase tracking-widest">分會職稱 / 現職商號</th>
                <th className="px-8 py-5 text-right text-[11px] font-black text-slate-800 uppercase tracking-widest">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleMembers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-slate-500 font-bold italic">目前此分類下沒有會員資料</td>
                </tr>
              ) : (
                visibleMembers.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5 flex items-center">
                      <img className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-sm" src={member.avatarUrl || 'https://via.placeholder.com/100'} alt="" />
                      <div className="ml-4">
                        <div className="text-sm font-black text-slate-900">{member.name}</div>
                        <div className="text-[10px] font-black text-slate-500 mt-0.5">{member.mobile}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${member.currentRole ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {member.currentRole?.roleName || '一般會員'}
                        </span>
                      </div>
                      <div className="text-[11px] font-black text-slate-600 truncate max-w-[250px]">{member.company || '未填寫現職'}</div>
                    </td>
                    <td className="px-8 py-5 text-right space-x-2">
                      <button onClick={() => setEditingMember(member)} className="text-xs font-black text-blue-700 hover:text-blue-900 underline underline-offset-4 decoration-blue-200">編輯</button>
                      <button onClick={() => { if(confirm('確定刪除？')) onDeleteMember(member.id); }} className="text-xs font-black text-red-600 hover:text-red-800 underline underline-offset-4 decoration-red-200">刪除</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(editingMember || isCreating) && (
        <MemberEditor 
          member={editingMember || undefined}
          user={user}
          onSave={(data) => {
            if (isCreating) onCreateMember(data); else onUpdateMember(data);
            setEditingMember(null); setIsCreating(false);
          }}
          onCancel={() => { setEditingMember(null); setIsCreating(false); }}
        />
      )}

      {isBatchImporting && (
        <BatchImportModal chapter={adminChapter} onImport={handleBatchImport} onClose={() => setIsBatchImporting(false)} />
      )}

      {isPhotoSyncing && (
        <BulkPhotoSync members={members} onUpdateMembers={handleBulkPhotoUpdate} onClose={() => setIsPhotoSyncing(false)} />
      )}

      {isOrgManaging && (
        <OrganizationManager 
          chapter={adminChapter}
          members={members}
          onUpdateMembers={onUpdateAllMembers}
          onClose={() => setIsOrgManaging(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
