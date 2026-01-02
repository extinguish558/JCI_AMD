
import React, { useState, useMemo } from 'react';
import { Member, AuthUser, AuditInfo } from '../types';
import SignaturePad from './SignaturePad';

interface MemberAuditSystemProps {
  members: Member[];
  user: AuthUser;
  onUpdateMember: (member: Member) => void;
  onClose: () => void;
}

const MemberAuditSystem: React.FC<MemberAuditSystemProps> = ({ members, user, onUpdateMember, onClose }) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [filter, setFilter] = useState<'PENDING' | 'VERIFIED'>('PENDING');

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (user.managedChapter && m.chapter !== user.managedChapter) return false;
      const isVerified = m.auditInfo?.isVerified || false;
      return filter === 'VERIFIED' ? isVerified : !isVerified;
    });
  }, [members, filter, user]);

  const activeMember = members.find(m => m.id === selectedMemberId);

  const handleAuditSuccess = (signature: string) => {
    if (!activeMember) return;
    
    const auditInfo: AuditInfo = {
      isVerified: true,
      verifiedBy: user.name,
      verifiedAt: new Date().toISOString(),
      signatureBase64: signature
    };

    onUpdateMember({
      ...activeMember,
      auditInfo
    });

    setIsSigning(false);
    setSelectedMemberId(null);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/98 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-10 py-8 flex justify-between items-center text-white">
          <div className="flex items-center">
            <div className="bg-amber-500 p-3 rounded-2xl mr-5 shadow-lg shadow-amber-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter">會員資料審核中心</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Information Verification & Signature</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">✕</button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* List Section */}
          <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50">
            <div className="p-6">
              <div className="flex bg-slate-200 p-1 rounded-2xl">
                <button onClick={() => setFilter('PENDING')} className={`flex-1 py-2 text-[11px] font-black rounded-xl transition-all ${filter === 'PENDING' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}>待審核 ({members.filter(m => !m.auditInfo?.isVerified).length})</button>
                <button onClick={() => setFilter('VERIFIED')} className={`flex-1 py-2 text-[11px] font-black rounded-xl transition-all ${filter === 'VERIFIED' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}>已核可</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-2">
              {filteredMembers.map(m => (
                <button 
                  key={m.id}
                  onClick={() => { setSelectedMemberId(m.id); setIsSigning(false); }}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center group ${selectedMemberId === m.id ? 'border-blue-600 bg-white shadow-lg' : 'border-transparent hover:bg-white'}`}
                >
                  <img src={m.avatarUrl || 'https://via.placeholder.com/100'} className="w-10 h-10 rounded-xl object-cover mr-3 border border-slate-100" />
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-sm text-slate-900 truncate">{m.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 truncate">{m.company || '未填公司'}</div>
                  </div>
                </button>
              ))}
              {filteredMembers.length === 0 && (
                <div className="py-20 text-center px-6">
                  <div className="text-4xl mb-4 opacity-20">🍃</div>
                  <p className="text-xs font-bold text-slate-400">目前沒有資料需要處理</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail Section */}
          <div className="flex-1 overflow-y-auto p-12 bg-white scrollbar-hide">
            {activeMember ? (
              <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center space-x-6">
                  <img src={activeMember.avatarUrl || 'https://via.placeholder.com/300'} className="w-32 h-32 rounded-[2rem] object-cover shadow-2xl border-4 border-slate-50" />
                  <div>
                    <h3 className="text-4xl font-black text-slate-900">{activeMember.name}</h3>
                    <p className="text-blue-600 font-black text-sm mt-2">{activeMember.jciTitle || '青商會員'}</p>
                    <div className="mt-4 flex space-x-2">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 border border-slate-200 uppercase tracking-widest">{activeMember.type}</span>
                      {activeMember.auditInfo?.isVerified && <span className="px-3 py-1 bg-green-100 rounded-lg text-[10px] font-black text-green-600 border border-green-200">已通過審核</span>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">行動電話</label>
                      <p className="font-bold text-slate-900">{activeMember.mobile || '-'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">出生日期</label>
                      <p className="font-bold text-slate-900">{activeMember.birthday || '-'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">公司電話</label>
                      <p className="font-bold text-slate-900">{activeMember.companyPhone || '-'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">現職商號</label>
                      <p className="font-bold text-slate-900">{activeMember.company || '-'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">通訊地址</label>
                      <p className="font-bold text-slate-900 text-sm leading-relaxed">{activeMember.address || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  {activeMember.auditInfo?.isVerified ? (
                    <div className="flex items-center bg-green-50 p-8 rounded-[2.5rem] border border-green-100">
                      <div className="flex-1">
                        <h4 className="font-black text-green-800 mb-2">審核已完成</h4>
                        <div className="text-[11px] font-bold text-green-600 space-y-1">
                          <p>審核人員：{activeMember.auditInfo.verifiedBy}</p>
                          <p>審核時間：{new Date(activeMember.auditInfo.verifiedAt).toLocaleString()}</p>
                        </div>
                      </div>
                      {activeMember.auditInfo.signatureBase64 && (
                        <div className="bg-white p-2 rounded-2xl shadow-sm">
                          <img src={activeMember.auditInfo.signatureBase64} className="h-16 w-auto opacity-80" />
                        </div>
                      )}
                    </div>
                  ) : isSigning ? (
                    <div className="animate-in zoom-in duration-300">
                      <SignaturePad 
                        onSave={handleAuditSuccess} 
                        onCancel={() => setIsSigning(false)} 
                      />
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsSigning(true)}
                      className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:bg-black transition-all flex items-center justify-center space-x-3 active:scale-[0.98]"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span>確認無誤，進行電子簽章</span>
                    </button>
                  )
                  }
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                </div>
                <p className="font-black tracking-widest uppercase text-sm">請從左側選擇一名會員開始審核</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberAuditSystem;
