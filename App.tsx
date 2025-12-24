import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_MEMBERS } from './data/mockMembers';
import { sortMembers } from './utils/sortMembers';
import MemberCard from './components/MemberCard';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import { Member, MemberType, SeniorTitleType, Chapter, AuthUser } from './types';

const ITEMS_PER_PAGE = 24; 

const App: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [view, setView] = useState<'HOME' | 'LOGIN' | 'ADMIN'>('HOME');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [currentChapter, setCurrentChapter] = useState<Chapter>('嘉義分會');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'CURRENT' | 'COMMITTEE' | 'YB' | 'SENIOR'>('ALL');
  const [birthdayMonth, setBirthdayMonth] = useState<string>(''); 
  
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [currentChapter, searchTerm, activeTab, birthdayMonth]);

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    setView('ADMIN');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('HOME');
  };

  const handleUpdateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const handleCreateMember = (newMember: Member) => {
    setMembers(prev => [...prev, newMember]);
  };

  const handleDeleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      if (member.chapter !== currentChapter) return false;

      const term = searchTerm.trim().toLowerCase();
      let matchesSearch = true;

      if (term) {
        const basicMatch = 
          member.name.toLowerCase().includes(term) || 
          member.title?.toLowerCase().includes(term) || 
          member.company?.toLowerCase().includes(term) || 
          member.senatorId?.toLowerCase().includes(term) || 
          member.mobile?.includes(term);
        
        const currentRoleMatch = member.currentRole?.roleName.toLowerCase().includes(term);
        matchesSearch = basicMatch || !!currentRoleMatch;
      }
      
      if (!matchesSearch) return false;

      if (birthdayMonth) {
        const targetMonth = parseInt(birthdayMonth, 10);
        if (member.birthday) {
          const mMonth = new Date(member.birthday).getMonth() + 1;
          if (mMonth !== targetMonth) return false;
        } else return false;
      }

      if (activeTab === 'ALL') return true;
      if (activeTab === 'CURRENT') return !!member.currentRole;
      if (activeTab === 'COMMITTEE') return !!member.currentRole && member.currentRole.rankInRole > 40;
      if (activeTab === 'YB') return member.type === MemberType.YB && !member.currentRole;
      if (activeTab === 'SENIOR') return member.type === MemberType.SENIOR && !member.currentRole;
      
      return true;
    });
  }, [members, currentChapter, searchTerm, activeTab, birthdayMonth]);

  const sortedMembers = useMemo(() => {
    return sortMembers(filteredMembers);
  }, [filteredMembers]);

  const paginatedMembers = useMemo(() => {
    return sortedMembers.slice(0, visibleCount);
  }, [sortedMembers, visibleCount]);

  const renderSectionHeader = (title: string, count: number, iconPath: string) => (
    <div className="col-span-full mt-10 mb-4 flex items-center border-b-2 border-slate-200 pb-3">
      <div className="bg-slate-900 rounded-lg p-2 mr-4 text-white shadow-lg">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} /></svg>
      </div>
      <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
      <span className="ml-4 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-[11px] font-black border border-slate-300">
        {count} 人
      </span>
    </div>
  );

  const getMemberGroup = (m: Member) => {
    if (m.currentRole) return m.currentRole.rankInRole <= 40 ? 'BOARD' : 'COMMITTEE';
    return m.type === MemberType.YB ? 'YB' : 'SENIOR';
  };

  if (view === 'ADMIN' && currentUser) {
    return (
      <AdminDashboard 
        user={currentUser}
        members={members}
        onLogout={handleLogout}
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
        onCreateMember={handleCreateMember}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 pb-24 relative">
      {view === 'LOGIN' && (
        <LoginForm onLogin={handleLogin} onCancel={() => setView('HOME')} />
      )}

      {/* Top Utility Nav */}
      <div className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex justify-between h-14 items-center">
          <div className="flex items-center p-1 bg-slate-800 rounded-lg">
            <button onClick={() => setCurrentChapter('嘉義分會')} className={`px-4 py-1.5 rounded-md text-xs font-black transition-all ${currentChapter === '嘉義分會' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>嘉義分會</button>
            <button onClick={() => setCurrentChapter('南投分會')} className={`px-4 py-1.5 rounded-md text-xs font-black transition-all ${currentChapter === '南投分會' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>南投分會</button>
          </div>
          <button onClick={() => setView('LOGIN')} className="bg-slate-800 hover:bg-slate-700 px-4 py-1.5 rounded-lg text-xs text-slate-300 font-bold transition-colors flex items-center border border-slate-700">
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            後台管理
          </button>
        </div>
      </div>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <div className="flex items-center group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl mr-4 transition-all group-hover:rotate-6 ${currentChapter === '嘉義分會' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-green-600 shadow-green-500/20'}`}>
                {currentChapter === '嘉義分會' ? 'C' : 'N'}
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">{currentChapter} 會員名錄</h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">JCI Member Directory</p>
              </div>
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <select value={birthdayMonth} onChange={(e) => setBirthdayMonth(e.target.value)} className="bg-white px-4 py-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm">
                <option value="">月份壽星</option>
                {Array.from({length:12}, (_,i)=>i+1).map(m=><option key={m} value={m}>{m}月壽星</option>)}
              </select>
              <div className="relative flex-1 md:w-72">
                <input type="text" placeholder="關鍵字快速搜尋..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full px-10 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm" />
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: 'ALL', label: '全部顯示' },
              { id: 'CURRENT', label: '本屆幹部' },
              { id: 'COMMITTEE', label: '主委團隊' },
              { id: 'YB', label: 'YB 會員' },
              { id: 'SENIOR', label: '特友會' }
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2.5 text-sm font-black rounded-xl transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedMembers.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-black text-slate-800">查無相符資料</h3>
              <p className="text-slate-500 font-bold mt-2">請嘗試更換搜尋關鍵字或篩選條件</p>
              <button onClick={() => { setSearchTerm(''); setBirthdayMonth(''); setActiveTab('ALL'); }} className="mt-6 px-8 py-2.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">重置搜尋</button>
            </div>
          ) : (
             paginatedMembers.map((member, index) => {
               const showHeader = activeTab === 'ALL' && !searchTerm && !birthdayMonth;
               let header = null;
               if (showHeader) {
                 const currentGroup = getMemberGroup(member);
                 const prevGroup = index > 0 ? getMemberGroup(paginatedMembers[index - 1]) : null;
                 if (currentGroup !== prevGroup) {
                   if (currentGroup === 'BOARD') header = renderSectionHeader('本年度理監事團隊', sortedMembers.filter(m => getMemberGroup(m) === 'BOARD').length, "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2");
                   else if (currentGroup === 'COMMITTEE') header = renderSectionHeader('本年度主委團隊', sortedMembers.filter(m => getMemberGroup(m) === 'COMMITTEE').length, "M9 5H7a2 2 0 00-2 2v12");
                   else if (currentGroup === 'YB') header = renderSectionHeader('YB 會員成員', sortedMembers.filter(m => getMemberGroup(m) === 'YB').length, "M12 4.354a4 4 0 110 5.292");
                   else if (currentGroup === 'SENIOR') header = renderSectionHeader('特友會長輩', sortedMembers.filter(m => getMemberGroup(m) === 'SENIOR').length, "M5 3v4M3 5h4");
                 }
               }
               return (
                 <React.Fragment key={member.id}>
                   {header}
                   <div className="transform transition-all hover:-translate-y-1">
                    <MemberCard member={member} />
                   </div>
                 </React.Fragment>
               );
             })
          )}
        </div>

        {visibleCount < sortedMembers.length && (
          <div className="mt-20 flex justify-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
              className="bg-white border-2 border-slate-200 px-12 py-4 rounded-2xl text-slate-700 font-black hover:bg-slate-50 hover:border-slate-300 shadow-xl transition-all active:scale-95 flex items-center"
            >
              載入更多會員資料 ({sortedMembers.length - visibleCount})
              <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        )}
      </main>
      
      {/* Scroll to top fab - Optional for long lists */}
      <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-blue-600 transition-all z-40 active:scale-90">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
      </button>
    </div>
  );
};

export default App;