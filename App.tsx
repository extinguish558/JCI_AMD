
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MOCK_MEMBERS } from './data/mockMembers';
import { sortMembers } from './utils/sortMembers';
import MemberCard from './components/MemberCard';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import { Member, MemberType, Chapter, AuthUser } from './types';
import { db, isFirebaseReady } from './lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

const ITEMS_PER_PAGE = 24; 

const App: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [view, setView] = useState<'HOME' | 'LOGIN' | 'ADMIN'>('HOME');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter>('嘉義分會');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'CURRENT' | 'COMMITTEE' | 'YB' | 'SENIOR'>('ALL');
  const [birthdayMonth, setBirthdayMonth] = useState<string>(''); 
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const fetchCloudData = useCallback(async () => {
    if (!isFirebaseReady || !db) {
      setIsLoading(false);
      return;
    }
    try {
      const querySnapshot = await getDocs(collection(db, "members"));
      const cloudData: Member[] = [];
      querySnapshot.forEach((doc) => {
        cloudData.push(doc.data() as Member);
      });
      
      // 如果雲端資料庫有東西，則以雲端為主；如果是空的，初次使用維持 Mock 資料
      if (cloudData.length > 0) {
        setMembers(cloudData);
      }
      setIsCloudMode(true);
    } catch (error) {
      console.error("雲端讀取失敗:", error);
      setIsCloudMode(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCloudData();
  }, [fetchCloudData]);

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

  const handleUpdateMember = async (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    if (db) {
      try {
        await setDoc(doc(db, "members", updatedMember.id), updatedMember);
      } catch (e) {
        alert("存檔失敗，請檢查網路連線或 Firebase 規則");
      }
    }
  };

  const handleCreateMember = async (newMember: Member) => {
    setMembers(prev => [...prev, newMember]);
    if (db) {
      try {
        await setDoc(doc(db, "members", newMember.id), newMember);
      } catch (e) {
        alert("新增失敗，請檢查權限");
      }
    }
  };

  const handleDeleteMember = async (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    if (db) {
      try {
        await deleteDoc(doc(db, "members", id));
      } catch (e) {
        alert("刪除失敗");
      }
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      if (member.chapter !== currentChapter) return false;
      const term = searchTerm.trim().toLowerCase();
      let matchesSearch = true;
      if (term) {
        matchesSearch = 
          member.name.toLowerCase().includes(term) || 
          member.title?.toLowerCase().includes(term) || 
          member.company?.toLowerCase().includes(term) || 
          member.senatorId?.toLowerCase().includes(term) || 
          member.mobile?.includes(term);
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

  const sortedMembers = useMemo(() => sortMembers(filteredMembers), [filteredMembers]);
  const paginatedMembers = useMemo(() => sortedMembers.slice(0, visibleCount), [sortedMembers, visibleCount]);

  const renderSectionHeader = (title: string, count: number, iconPath: string) => (
    <div className="col-span-full mt-10 mb-4 flex items-center border-b-2 border-slate-200 pb-3">
      <div className="bg-slate-900 rounded-lg p-2 mr-4 text-white shadow-lg">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} /></svg>
      </div>
      <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
      <span className="ml-4 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-[11px] font-black border border-slate-300">{count} 人</span>
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
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
           <div className="animate-spin h-14 w-14 border-4 border-blue-600 border-t-transparent rounded-full mb-6"></div>
           <p className="font-black text-slate-900 text-xl tracking-tight">名錄系統啟動中...</p>
           <p className="text-slate-400 text-sm mt-2">正在載入雲端資料庫最新資訊</p>
        </div>
      )}

      {view === 'LOGIN' && <LoginForm onLogin={handleLogin} onCancel={() => setView('HOME')} />}

      <div className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex justify-between h-14 items-center">
          <div className="flex items-center p-1 bg-slate-800 rounded-lg">
            <button onClick={() => setCurrentChapter('嘉義分會')} className={`px-4 py-1.5 rounded-md text-xs font-black transition-all ${currentChapter === '嘉義分會' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>嘉義分會</button>
            <button onClick={() => setCurrentChapter('南投分會')} className={`px-4 py-1.5 rounded-md text-xs font-black transition-all ${currentChapter === '南投分會' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>南投分會</button>
          </div>
          <div className="flex items-center space-x-3">
             {isCloudMode && (
               <div className="hidden sm:flex items-center text-[10px] font-black text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">
                 <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse mr-2"></span>
                 CLOUD SYNCED
               </div>
             )}
             <button onClick={() => setView('LOGIN')} className="bg-slate-800 hover:bg-slate-700 px-4 py-1.5 rounded-lg text-xs text-slate-300 font-bold transition-colors flex items-center border border-slate-700">
               <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
               後台管理
             </button>
          </div>
        </div>
      </div>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <div className="flex items-center group cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
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
                <input type="text" placeholder="姓名、公司、手機搜尋..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full px-10 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm" />
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            {['ALL', 'CURRENT', 'COMMITTEE', 'YB', 'SENIOR'].map((id) => (
              <button key={id} onClick={() => setActiveTab(id as any)} className={`px-6 py-2.5 text-sm font-black rounded-xl transition-all whitespace-nowrap ${activeTab === id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
                {id === 'ALL' ? '全部顯示' : id === 'CURRENT' ? '本屆幹部' : id === 'COMMITTEE' ? '主委團隊' : id === 'YB' ? 'YB 會員' : '特友會'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10">
        {!isCloudMode && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 p-4 rounded-2xl flex items-center text-yellow-800 text-sm font-bold">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.268 16c-.77 1.333.192 3 1.732 3z" /></svg>
            注意：目前連線至預覽資料。若要正式啟用雲端同步，請確保 Firebase Rules 已設為允許讀寫。
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedMembers.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-black text-slate-800">查無相符資料</h3>
              <p className="text-slate-500 font-bold mt-2">請嘗試更換搜尋關鍵字</p>
              <button onClick={() => { setSearchTerm(''); setBirthdayMonth(''); setActiveTab('ALL'); }} className="mt-6 px-8 py-2.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-lg transition-transform active:scale-95">重置搜尋條件</button>
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
                   <MemberCard member={member} />
                 </React.Fragment>
               );
             })
          )}
        </div>
      </main>

      {/* 回到頂部按鈕 */}
      <button 
        onClick={() => window.scrollTo({top:0, behavior:'smooth'})}
        className="fixed bottom-8 right-8 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl z-40 hover:bg-slate-800 transition-all active:scale-90"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
      </button>
    </div>
  );
};

export default App;
