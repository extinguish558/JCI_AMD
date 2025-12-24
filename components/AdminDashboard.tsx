
import React, { useState, useMemo } from 'react';
import { Member, AuthUser, Chapter, MemberType } from '../types';
import MemberEditor from './MemberEditor';
import BatchImportModal from './BatchImportModal';
import BulkPhotoSync from './BulkPhotoSync';
import { isFirebaseReady } from '../lib/firebase';
import { exportToCSV } from '../utils/exportUtils';

interface AdminDashboardProps {
  user: AuthUser;
  members: Member[];
  onLogout: () => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onCreateMember: (member: Member) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, 
  members, 
  onLogout, 
  onUpdateMember, 
  onDeleteMember,
  onCreateMember
}) => {
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isBatchImporting, setIsBatchImporting] = useState(false);
  const [isPhotoSyncing, setIsPhotoSyncing] = useState(false);
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

  const handleBatchImport = (newMembers: Member[]) => {
    newMembers.forEach(m => onCreateMember(m));
  };

  const handleBulkPhotoUpdate = async (updates: Partial<Member>[]) => {
    for (const update of updates) {
      const fullMember = members.find(m => m.id === update.id);
      if (fullMember) {
        onUpdateMember({ ...fullMember, avatarUrl: update.avatarUrl });
      }
    }
  };

  const handleExportCSV = () => {
    const filename = `${adminChapter}_名錄備份_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(visibleMembers, filename);
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
          <button onClick={onLogout} className="text-sm bg-slate-800 hover:bg-red-600 px-5 py-2 rounded-xl border border-slate-700 transition-all font-bold">登出系統</button>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between py-3 md:h-16">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl space-x-1">
            {isSuperAdmin ? (
              (['嘉義分會', '南投分會'] as Chapter[]).map(ch => (
                <button key={ch} onClick={() => setAdminChapter(ch)} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${adminChapter === ch ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}>{ch}</button>
              ))
            ) : <div className="px-6 py-2 bg-white text-blue-700 rounded-lg text-sm font-black shadow-sm">{adminChapter}</div>}
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl mt-3 md:mt-0">
            {[MemberType.YB, MemberType.SENIOR].map(t => (
              <button key={t} onClick={() => setAdminType(t)} className={`px-8 py-2 rounded-lg text-sm font-bold transition-all ${adminType === t ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 mt-8 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input type="text" placeholder="搜尋..." className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" value={filterText} onChange={e => setFilterText(e.target.value)} />
          <svg className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setIsBatchImporting(true)} className="px-6 py-3.5 bg-green-600 text-white font-black text-sm rounded-2xl hover:bg-green-700 shadow-lg flex items-center">
             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             匯入 Excel
           </button>
           <button onClick={() => setIsPhotoSyncing(true)} className="px-6 py-3.5 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 shadow-lg flex items-center">
             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             同步照片
           </button>
           <button onClick={() => setIsCreating(true)} className="px-6 py-3.5 bg-slate-900 text-white font-black text-sm rounded-2xl hover:bg-black shadow-lg">單筆新增</button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-500 uppercase">會員資訊</th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-500 uppercase">現職 / 類型</th>
                <th className="px-8 py-5 text-right text-[11px] font-black text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleMembers.map(member => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5 flex items-center">
                    <img className="h-10 w-10 rounded-xl object-cover border border-slate-200" src={member.avatarUrl || 'https://via.placeholder.com/100'} alt="" />
                    <div className="ml-4">
                      <div className="text-sm font-black text-slate-900">{member.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5">{member.mobile}</div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-xs font-bold text-slate-700">{member.company || '未填寫'}</div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${member.type === MemberType.YB ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>{member.type}</span>
                  </td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <button onClick={() => setEditingMember(member)} className="text-xs font-black text-blue-600 hover:underline">編輯</button>
                    <button onClick={() => { if(confirm('確定刪除？')) onDeleteMember(member.id); }} className="text-xs font-black text-red-500 hover:underline">刪除</button>
                  </td>
                </tr>
              ))}
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
        <BatchImportModal 
          chapter={adminChapter}
          onImport={handleBatchImport}
          onClose={() => setIsBatchImporting(false)}
        />
      )}

      {isPhotoSyncing && (
        <BulkPhotoSync 
          members={members}
          onUpdateMembers={handleBulkPhotoUpdate}
          onClose={() => setIsPhotoSyncing(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
