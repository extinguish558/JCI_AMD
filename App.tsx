
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MOCK_MEMBERS } from './data/mockMembers';
import { sortMembers } from './utils/sortMembers';
import MemberCard from './components/MemberCard';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import MemberDetailModal from './components/MemberDetailModal'; 
import { Member, MemberType, Chapter, AuthUser, MembershipStatus } from './types';
import { db, isFirebaseReady } from './lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch, onSnapshot } from "firebase/firestore";

const App: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [view, setView] = useState<'HOME' | 'LOGIN' | 'ADMIN'>('HOME');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter>('嘉義分會');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'CURRENT' | 'COMMITTEE' | 'YB' | 'SENIOR'>('ALL');
  const [birthdayMonth, setBirthdayMonth] = useState<string>(''); 
  const [selectedMember, setSelectedMember] = useState<Member | null>(null); 

  /**
   * 強健的資料清理函數
   * 解決「Converting circular structure to JSON」錯誤
   * 排除非 POJO 物件、函式、循環引用以及 Firestore 內部物件
   */
  const sanitizeData = useCallback((data: any) => {
    const seen = new WeakSet();

    const clean = (obj: any): any => {
      // 基本類型直接返回
      if (obj === null || typeof obj !== 'object') return obj;

      // 處理日期物件
      if (obj instanceof Date) return obj.toISOString();

      // 處理 Firestore Timestamp 物件
      if (typeof obj.toDate === 'function') return obj.toDate().toISOString();

      // 處理循環引用：如果已經處理過，返回 undefined (會被後續 filter 或 delete 排除)
      if (seen.has(obj)) return undefined;
      seen.add(obj);

      // 處理陣列
      if (Array.isArray(obj)) {
        return obj.map(clean).filter(v => v !== undefined);
      }

      // 處理普通物件：只保留 Own Properties 並排除函式與內部屬性
      const result: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          // 排除 Firebase 內部屬性 (通常以 _ 或 $ 開頭)
          if (key.startsWith('_') || key.startsWith('$')) continue;
          
          const val = obj[key];
          // 排除函式
          if (typeof val === 'function') continue;

          const cleanedVal = clean(val);
          if (cleanedVal !== undefined) {
            result[key] = cleanedVal;
          }
        }
      }
      return result;
    };

    return clean(data);
  }, []);

  useEffect(() => {
    if (!isFirebaseReady || !db) return;

    if (members.length === 0) setIsLoading(true);

    const unsubscribe = onSnapshot(collection(db, "members"), 
      (snapshot) => {
        const cloudData: Member[] = [];
        snapshot.forEach((doc) => { 
          const data = doc.data();
          // 確保從 Firestore 拿到的資料也是乾淨的
          cloudData.push(data as Member); 
        });
        
        if (cloudData.length > 0) {
          setMembers(sanitizeData(cloudData));
        }
        setIsOnline(!snapshot.metadata.fromCache);
        setIsLoading(false);
      },
      (error) => {
        console.warn("Firestore 連線不穩:", error);
        setIsOnline(false);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isFirebaseReady, sanitizeData]);

  const handleUpdateMember = async (updatedMember: Member) => {
    const cleanMember = sanitizeData(updatedMember);
    setMembers(prev => prev.map(m => m.id === cleanMember.id ? cleanMember : m));
    if (db) { 
      try { 
        await setDoc(doc(db, "members", cleanMember.id), cleanMember); 
      } catch (e) { 
        console.error("同步失敗:", e); 
      } 
    }
  };

  const handleCreateMember = async (newMember: Member) => {
    const cleanMember = sanitizeData(newMember);
    setMembers(prev => [...prev, cleanMember]);
    if (db) { 
      try { 
        await setDoc(doc(db, "members", cleanMember.id), cleanMember); 
      } catch (e) { 
        console.error("建立失敗:", e); 
      }
    }
  };

  const handleDeleteMember = async (id: string) => {
    if(!confirm("確定刪除此會友？")) return;
    setMembers(prev => prev.filter(m => m.id !== id));
    if (db) { 
      try { 
        await deleteDoc(doc(db, "members", id)); 
      } catch (e) { 
        console.error("刪除失敗:", e); 
      }
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      if (member.chapter !== currentChapter) return false;
      const inactive = [MembershipStatus.ON_LEAVE, MembershipStatus.RESIGNED, MembershipStatus.PROBATION_FAILED, MembershipStatus.NOT_JOINING];
      if (member.status && inactive.includes(member.status)) return false;
      const term = searchTerm.trim().toLowerCase();
      if (term && !(
        member.name.toLowerCase().includes(term) || 
        member.company?.toLowerCase().includes(term) || 
        member.mobile?.includes(term) ||
        member.englishName?.toLowerCase().includes(term)
      )) return false;
      if (birthdayMonth) {
        const mMonth = member.birthday ? new Date(member.birthday).getMonth() + 1 : 0;
        if (mMonth !== parseInt(birthdayMonth, 10)) return false;
      }
      if (activeTab === 'ALL') return true;
      if (activeTab === 'CURRENT') return !!member.currentRole;
      if (activeTab === 'COMMITTEE') return !!member.currentRole && member.currentRole.rankInRole > 40;
      if (activeTab === 'YB') return member.type === MemberType.YB;
      if (activeTab === 'SENIOR') return member.type === MemberType.SENIOR;
      return true;
    });
  }, [members, currentChapter, searchTerm, activeTab, birthdayMonth]);

  const sortedMembers = useMemo(() => sortMembers(filteredMembers), [filteredMembers]);

  const spotlightMembers = useMemo(() => {
    if (searchTerm || birthdayMonth || activeTab !== 'ALL') return [];
    return [...filteredMembers].sort(() => 0.5 - Math.random()).slice(0, 2);
  }, [filteredMembers, searchTerm, birthdayMonth, activeTab]);

  const getMemberGroup = (m: Member) => {
    if (m.currentRole) return m.currentRole.rankInRole <= 40 ? 'BOARD' : 'COMMITTEE';
    return m.type === MemberType.YB ? 'YB' : 'SENIOR';
  };

  const renderSectionHeader = (title: string, icon: string) => (
    <div className="col-span-full mt-4 mb-2 flex items-center px-2 border-b border-slate-200 pb-2">
      <span className="text-sm mr-2">{icon}</span>
      <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">{title}</h2>
    </div>
  );

  if (view === 'ADMIN' && currentUser) {
    return (
      <AdminDashboard 
        user={currentUser} 
        members={members} 
        onLogout={() => { setCurrentUser(null); setView('HOME'); }} 
        onUpdateMember={handleUpdateMember} 
        onDeleteMember={handleDeleteMember} 
        onCreateMember={handleCreateMember} 
        onUpdateAllMembers={async (m) => {
          const cleanList = sanitizeData(m);
          setMembers(cleanList);
          if (db) {
            try {
              const batch = writeBatch(db);
              cleanList.forEach((item: Member) => batch.set(doc(db, "members", item.id), item));
              await batch.commit();
            } catch (err) {
              console.error("批次更新失敗:", err);
            }
          }
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] font-sans text-slate-900 pb-24 selection:bg-blue-100">
      {isLoading && (
        <div className="fixed inset-0 z-[150] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-[5px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-5 font-black text-slate-900 text-[11px] tracking-[0.3em] uppercase animate-pulse">Data Initializing</p>
        </div>
      )}

      {view === 'LOGIN' && <LoginForm onLogin={(u) => { setCurrentUser(u); setView('ADMIN'); }} onCancel={() => setView('HOME')} />}

      <nav className="sticky top-0 z-50 bg-white/75 backdrop-blur-2xl border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-12 flex justify-between items-center">
          <div className="flex bg-[#EEEEF0] p-0.5 rounded-xl shadow-inner">
            {['嘉義分會', '南投分會'].map((c) => (
              <button key={c} onClick={() => setCurrentChapter(c as Chapter)} className={`px-5 py-1.5 rounded-lg text-[11px] font-black transition-all ${currentChapter === c ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{c}</button>
            ))}
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{isOnline ? 'Cloud Synced' : 'Cache Mode'}</span>
             </div>
             <button onClick={() => setView('LOGIN')} className="text-blue-600 text-xs font-black tracking-tight active:opacity-50">管理登入</button>
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 py-3 flex gap-3">
           <div className="relative flex-1">
              <input type="text" placeholder="搜尋姓名、職務、公司..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full h-10 bg-[#E3E3E8] rounded-xl pl-10 pr-4 text-sm font-medium outline-none focus:bg-[#D1D1D6] transition-all border-none ring-0" />
              <svg className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </div>
           <select value={birthdayMonth} onChange={(e)=>setBirthdayMonth(e.target.value)} className="h-10 bg-[#E3E3E8] rounded-xl px-4 text-[11px] font-black text-blue-600 outline-none border-none appearance-none shadow-sm">
             <option value="">🎂 壽星</option>
             {Array.from({length:12}, (_,i)=>i+1).map(m=><option key={m} value={m}>{m}月</option>)}
           </select>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-3 flex space-x-2 overflow-x-auto scrollbar-hide">
           {['ALL', 'CURRENT', 'COMMITTEE', 'YB', 'SENIOR'].map((id) => (
             <button key={id} onClick={() => setActiveTab(id as any)} className={`px-5 py-2 rounded-full text-[11px] font-black whitespace-nowrap transition-all duration-200 ${activeTab === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-[#E3E3E8] text-slate-500 hover:bg-[#D1D1D6]'}`}>
               {id === 'ALL' ? '全部顯示' : id === 'CURRENT' ? '本屆理監事' : id === 'COMMITTEE' ? '主委團隊' : id === 'YB' ? 'YB 會友' : '特友前輩'}
             </button>
           ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-6">
        {/* Spotlight Section */}
        {spotlightMembers.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between px-1 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">會友焦點 Spotlight</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {spotlightMembers.map(m => (
                <div key={m.id} onClick={() => setSelectedMember(m)} className="bg-white p-3.5 rounded-3xl shadow-sm flex items-center gap-4 active:scale-[0.97] transition-all cursor-pointer border border-white hover:border-blue-100 group">
                  <img src={m.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} className="w-12 h-12 rounded-2xl object-cover object-top bg-white shadow-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-900 leading-none mb-1.5 group-hover:text-blue-600 transition-colors">{m.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold truncate">{m.company || 'JCI Chiayi'}</p>
                  </div>
                  <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <svg className="w-3 h-3 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMembers.length === 0 ? (
            <div className="col-span-full py-24 text-center">
               <div className="text-5xl mb-6 opacity-20">📂</div>
               <p className="font-black text-slate-400 text-sm tracking-widest uppercase">No Members Found</p>
               <button onClick={()=>{setSearchTerm(''); setBirthdayMonth(''); setActiveTab('ALL')}} className="mt-4 text-blue-600 font-black text-xs underline">重設所有篩選</button>
            </div>
          ) : (
            sortedMembers.map((m, idx) => {
              const showHeader = activeTab === 'ALL' && !searchTerm && !birthdayMonth;
              let header = null;
              if (showHeader) {
                const group = getMemberGroup(m);
                const prev = idx > 0 ? getMemberGroup(sortedMembers[idx - 1]) : null;
                if (group !== prev) {
                  if (group === 'BOARD') header = renderSectionHeader('本年度理監事核心團隊', '🏛️');
                  else if (group === 'COMMITTEE') header = renderSectionHeader('本年度分會主委團隊', '🛡️');
                  else if (group === 'YB') header = renderSectionHeader('全體 YB 正式會員', '👥');
                  else if (group === 'SENIOR') header = renderSectionHeader('特友會歷屆前輩', '🎖️');
                }
              }
              return (
                <React.Fragment key={m.id}>
                  {header}
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${Math.min(idx * 50, 500)}ms` }}>
                    <MemberCard member={m} onViewDetails={setSelectedMember} />
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>
      </main>

      {selectedMember && (
        <MemberDetailModal 
          member={selectedMember} 
          onUpdate={(updated) => { handleUpdateMember(updated); setSelectedMember(updated); }}
          onClose={() => setSelectedMember(null)} 
        />
      )}
    </div>
  );
};

export default App;
