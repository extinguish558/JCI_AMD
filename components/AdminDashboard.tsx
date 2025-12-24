
import React, { useState, useMemo } from 'react';
import { Member, AuthUser, Chapter, MemberType } from '../types';
import MemberEditor from './MemberEditor';
import BatchImportModal from './BatchImportModal';
import { isFirebaseReady } from '../lib/firebase';

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
  const [initialScanMode, setInitialScanMode] = useState(false);
  const [filterText, setFilterText] = useState('');

  const [adminChapter, setAdminChapter] = useState<Chapter>(user.managedChapter || '嘉義分會');
  const [adminType, setAdminType] = useState<MemberType>(MemberType.YB);

  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const visibleMembers = useMemo(() => {
    return members.filter(m => {
      if (m.chapter !== adminChapter) return false;
      if (m.type !== adminType) return false;
      if (filterText) {
        return m.name.toLowerCase().includes(filterText.toLowerCase()) || 
               m.company?.toLowerCase().includes(filterText.toLowerCase()) ||
               m.currentRole?.roleName.toLowerCase().includes(filterText.toLowerCase());
      }
      return true;
    });
  }, [members, adminChapter, adminType, filterText]);

  const handleOpenEditor = (scan: boolean) => {
    setInitialScanMode(scan);
    setIsCreating(true);
  };

  const handleBatchImport = (newMembers: Member[]) => {
    newMembers.forEach(m => onCreateMember(m));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-slate-900 text-white shadow-xl z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3 shadow-lg shadow-blue-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h1 className="font-bold text-lg hidden sm:block tracking-tight">後台管理：{user.name}</h1>
            <div className={`ml-6 flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isFirebaseReady ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
               <span className={`h-1.5 w-1.5 rounded-full mr-2 ${isFirebaseReady ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></span>
               {isFirebaseReady ? 'Cloud Synced' : 'Offline Mode'}
            </div>
          </div>
          <button onClick={onLogout} className="text-sm bg-slate-800 hover:bg-red-600 px-5 py-2 rounded-xl border border-slate-700 transition-all font-bold">登出系統</button>
        </div>
      </div>

      {/* Chapter & Type Switcher */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between py-3 md:h-16">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl space-x-1">
            {isSuperAdmin ? (
              ['嘉義分會', '南投分會'].map(ch => (
                <button key={ch} onClick={() => setAdminChapter(ch as any)} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${adminChapter === ch ? (ch === '嘉義分會' ? 'bg-blue-600 text-white shadow-md' : 'bg-green-600 text-white shadow-md') : 'text-slate-500 hover:bg-white'}`}>{ch}</button>
              ))
            ) : <div className="px-6 py-2 bg-white text-blue-700 rounded-lg text-sm font-black shadow-sm">{adminChapter}</div>}
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl mt-3 md:mt-0">
            {[MemberType.YB, MemberType.SENIOR].map(t => (
              <button key={t} onClick={() => setAdminType(t)} className={`px-8 py-2 rounded-lg text-sm font-bold transition-all ${adminType === t ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>{t === MemberType.YB ? 'YB' : '特友會'}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto w-full px-4 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <input type="text" placeholder="搜尋..." className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-2xl text-slate-900 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all outline-none" value={filterText} onChange={e => setFilterText(e.target.value)} />
            <svg className="w-5 h-5 text-slate-400 absolute left-4 top-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          
          <div className="flex bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
            <button onClick={() => handleOpenEditor(false)} className="px-6 py-4 text-blue-600 font-black text-sm hover:bg-blue-50 transition-colors border-r border-slate-100">單筆新增</button>
            <button onClick={() => handleOpenEditor(true)} className="px-6 py-4 text-slate-600 font-black text-sm hover:bg-slate-50 transition-colors border-r border-slate-100 flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              拍名片
            </button>
            <button onClick={() => setIsBatchImporting(true)} className="px-8 py-4 bg-slate-900 text-white font-black text-sm hover:bg-black transition-all flex items-center group">
              <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              批量 AI 導入
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-700 uppercase tracking-[0.2em]">會員基礎資訊</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-700 uppercase tracking-[0.2em]">分會職務 / 公司商號</th>
                  <th className="px-8 py-5 text-right text-[11px] font-black text-slate-700 uppercase tracking-[0.2em]">操作管理</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {visibleMembers.map(member => (
                  <tr key={member.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap flex items-center">
                      <img className="h-12 w-12 rounded-2xl object-cover border-2 border-slate-200 shadow-sm group-hover:border-blue-300 transition-all" src={member.avatarUrl || 'https://via.placeholder.com/100'} alt="" />
                      <div className="ml-4">
                        <div className="text-base font-black text-slate-900">{member.name}</div>
                        <div className="text-xs font-bold text-slate-500 mt-1">{member.mobile || '無號碼'}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-black text-blue-700">{member.currentRole?.roleName || member.title || '一般會員'}</div>
                      <div className="text-xs font-bold text-slate-600 mt-1">{member.company || '未填寫公司'}</div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => setEditingMember(member)} className="inline-flex items-center px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-black transition-all mr-2">編輯</button>
                      <button onClick={() => { if(confirm('確定要刪除嗎？')) onDeleteMember(member.id); }} className="inline-flex items-center px-4 py-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl text-xs font-black transition-all">刪除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(editingMember || isCreating) && (
        <MemberEditor 
          member={editingMember || undefined}
          user={user}
          initialScanMode={initialScanMode}
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
          memberType={adminType}
          onImport={handleBatchImport}
          onClose={() => setIsBatchImporting(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
