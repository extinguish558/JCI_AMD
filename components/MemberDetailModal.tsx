
import React, { useState, useRef } from 'react';
import { Member, MemberType } from '../types';
import { compressImage } from '../utils/imageCompression';

interface MemberDetailModalProps {
  member: Member;
  onUpdate: (updatedMember: Member) => void;
  onClose: () => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ member, onUpdate, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState<Member>({ ...member });
  
  const fileRefs = {
    avatar: useRef<HTMLInputElement>(null),
    card: useRef<HTMLInputElement>(null),
    ad1: useRef<HTMLInputElement>(null),
    ad2: useRef<HTMLInputElement>(null),
  };

  const handleVerify = () => {
    const birthday = member.birthday?.replace(/-/g, '');
    if (!birthday) { alert("此會員尚未設定生日資料"); return; }
    if (password === birthday) { 
      setIsEditing(true); 
      setIsVerifying(false); 
      setPassword('');
    } else { 
      alert("密碼錯誤 (請輸入西元生日 8 碼)"); 
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof Member) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await compressImage(file, { maxWidth: 1000, quality: 0.8 });
      setFormData(prev => ({ ...prev, [field]: res.base64 }));
    } catch (err) {
      alert("圖片處理失敗");
    }
  };

  const StatItem = ({ label, value }: { label: string, value?: string }) => (
    <div className="flex flex-col border-l border-white/10 pl-3 py-1">
      <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">{label}</span>
      <span className="text-white font-black text-[11px] truncate leading-none">{value || '-'}</span>
    </div>
  );

  const ResumeSection = ({ title, content, icon }: { title: string, content?: string, icon: string }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{title}</h5>
      </div>
      <div className="text-xs font-bold text-slate-600 leading-relaxed whitespace-pre-wrap pl-1">
        {content || '尚無紀錄'}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center bg-black/85 backdrop-blur-md p-0 md:p-4">
      <div className="bg-[#F2F2F7] w-full max-w-2xl rounded-t-[3rem] md:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[96vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* 固定頂部按鈕欄位 */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-6 py-4 pointer-events-none">
          <div className="pointer-events-auto"></div>
          <div className="flex items-center gap-3 pointer-events-auto">
            {!isEditing ? (
              <button onClick={() => setIsVerifying(true)} className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-black text-white border border-white/20 shadow-lg">編輯資料</button>
            ) : (
              <button onClick={() => { onUpdate(formData); setIsEditing(false); }} className="bg-blue-600 px-5 py-2 rounded-xl text-[9px] font-black text-white shadow-xl">儲存變更</button>
            )}
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full text-white/70 border border-white/20">✕</button>
          </div>
        </div>

        {/* 主要捲動區域 */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          
          {/* 身份標頭區 (深色背景) */}
          <div className="bg-slate-900 pt-16 pb-10 px-6 relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-600/20 rounded-full blur-[80px]"></div>
            
            <div className="flex items-center gap-5 relative z-10 mb-8">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl bg-white">
                  <img 
                    src={isEditing ? formData.avatarUrl : member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} 
                    className="w-full h-full object-cover object-top bg-white" 
                  />
                </div>
                {isEditing && (
                  <button onClick={() => fileRefs.avatar.current?.click()} className="absolute -bottom-1 -right-1 bg-blue-600 p-2 rounded-xl border-2 border-slate-900 shadow-xl">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 9a2 2-0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                  </button>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                  <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white leading-none">{member.name}</h2>
                  {/* 新增職稱顯示位置 */}
                  {member.title && (
                    <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {member.title}
                    </span>
                  )}
                </div>
                <p className="text-blue-400 font-black text-[10px] md:text-xs uppercase tracking-widest opacity-90">{member.englishName || 'JCI Chiayi Member'}</p>
                <div className="flex gap-2 mt-4">
                  <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5 text-slate-300">{member.chapter}</span>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border uppercase tracking-wider ${member.type === MemberType.YB ? 'border-green-500/50 text-green-400' : 'border-indigo-500/50 text-indigo-400'}`}>{member.type}</span>
                </div>
              </div>
            </div>

            {/* 基本統計格 */}
            {!isEditing && (
              <div className="grid grid-cols-3 gap-y-5 gap-x-2 bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-inner relative z-10">
                <StatItem label="會友編號" value={member.memberCode} />
                <StatItem label="行動電話" value={member.mobile} />
                <StatItem label="性別" value={member.gender} />
                <StatItem label="生日" value={member.birthday?.substring(0, 10)} />
                <StatItem label="入會日期" value={member.joinDate?.substring(0, 10)} />
                <StatItem label="家眷姓名" value={member.spouseName} />
                <StatItem label="Line ID" value={member.lineId} />
                <StatItem label="電子郵件" value={member.email} />
                <StatItem label="住宅電話" value={member.homePhone} />
              </div>
            )}
          </div>

          {/* 下半部淺色內容區塊 */}
          <div className="p-4 space-y-8 pb-12">
            {isEditing ? (
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">個人資料修改</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {[
                     { label: '社會職稱 (如：總經理)', field: 'title', type: 'text' },
                     { label: '行動電話', field: 'mobile', type: 'text' },
                     { label: 'LINE ID', field: 'lineId', type: 'text' },
                     { label: '電子信箱', field: 'email', type: 'email' },
                     { label: '通訊地址', field: 'address', type: 'text' },
                     { label: '家眷姓名', field: 'spouseName', type: 'text' },
                   ].map((item) => (
                     <div key={item.field} className="space-y-1">
                       <label className="text-[8px] font-black text-slate-400 pl-1 uppercase tracking-wider">{item.label}</label>
                       <input 
                         type={item.type}
                         value={(formData as any)[item.field] || ''} 
                         onChange={e=>setFormData({...formData, [item.field]:e.target.value})} 
                         className="w-full h-11 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-xs font-black outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all" 
                       />
                     </div>
                   ))}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <h5 className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2">青商資歷填寫</h5>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 pl-1 uppercase">本會經歷</label>
                      <textarea value={formData.jciExperienceLocal || ''} onChange={e=>setFormData({...formData, jciExperienceLocal:e.target.value})} className="w-full h-24 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-600/10 transition-all resize-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 pl-1 uppercase">總會與國際經歷</label>
                      <textarea value={formData.jciExperienceNational || ''} onChange={e=>setFormData({...formData, jciExperienceNational:e.target.value})} className="w-full h-24 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-600/10 transition-all resize-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <h5 className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-4">影像展示</h5>
                  <div className="grid grid-cols-3 gap-3">
                     {['businessCardUrl', 'adImageUrl', 'adImageUrl2'].map((f, i) => (
                       <div key={f} onClick={() => (fileRefs as any)[['card','ad1','ad2'][i]].current?.click()} className="aspect-video bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden relative">
                          {(formData as any)[f] ? <img src={(formData as any)[f]} className="w-full h-full object-cover bg-white" /> : <span className="text-lg">➕</span>}
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* 青商履歷展示區 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">青商履歷 JCI RESUME</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ResumeSection title="本會經歷 LOCAL" content={member.jciExperienceLocal} icon="🏛️" />
                    <ResumeSection title="總會與國際 NATIONAL" content={member.jciExperienceNational} icon="🌍" />
                    <ResumeSection title="得獎榮譽 AWARDS" content={member.awards} icon="🏆" />
                    <ResumeSection title="訓練紀錄 TRAINING" content={member.trainingRecords} icon="📚" />
                  </div>
                </div>

                {/* 商務展示區 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">商務展示冊 SHOWCASE</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {[
                       {title:'個人商務名片', url:member.businessCardUrl, icon:'📇', color:'bg-blue-500'},
                       {title:'事業品牌廣告 A', url:member.adImageUrl, icon:'📢', color:'bg-amber-500'},
                       {title:'事業品牌廣告 B', url:member.adImageUrl2, icon:'🏢', color:'bg-indigo-500'}
                     ].map(ad => (
                       <div key={ad.title} className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col gap-3 transition-all hover:shadow-md active:scale-[0.98]">
                          <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 tracking-widest uppercase">
                            <span className={`w-1.5 h-1.5 rounded-full ${ad.color} shadow-sm`}></span>{ad.title}
                          </div>
                          <div className="aspect-[3/2] bg-white rounded-2xl overflow-hidden border border-slate-100 relative group">
                            {ad.url ? (
                              <img src={ad.url} className="w-full h-full object-contain cursor-zoom-in group-hover:scale-105 transition-transform duration-500 bg-white" alt={ad.title} onClick={() => window.open(ad.url, '_blank')} />
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center opacity-30 text-xs bg-slate-50">
                                <span className="text-3xl mb-2">{ad.icon}</span>
                                <span className="text-[9px] font-black tracking-widest uppercase">No Data</span>
                              </div>
                            )}
                          </div>
                       </div>
                     ))}
                  </div>
                </div>
                
                {/* 底部聯絡列 */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between gap-6 transition-all hover:shadow-md">
                   <div className="min-w-0 flex-1">
                      <h5 className="text-base font-black text-slate-900 truncate mb-1.5 leading-tight">{member.company || '嘉義青商成員'}</h5>
                      <div className="flex items-center text-xs font-bold text-slate-500">
                        <span className="truncate">{member.title || '正式會友'}</span>
                        <span className="mx-2 text-slate-300">•</span>
                        <span className="truncate">{member.address || '通訊地址尚未提供'}</span>
                      </div>
                   </div>
                   <div className="flex gap-3 shrink-0">
                      {member.mobile && <a href={`tel:${member.mobile}`} className="h-12 px-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xs font-black shadow-xl active:scale-95 transition-all hover:bg-black">撥打電話</a>}
                      {member.address && (
                        <button onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(member.address || '')}`)} className="w-12 h-12 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center border border-slate-200 active:scale-95 transition-all hover:bg-white hover:shadow-sm">📍</button>
                      )}
                   </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 驗證遮罩 */}
        {isVerifying && (
          <div className="absolute inset-0 z-[120] bg-slate-900/98 backdrop-blur-2xl flex items-center justify-center p-6">
             <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-xs w-full text-center space-y-6 animate-in zoom-in duration-300 border border-white/20">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">個人編輯權限驗證</h4>
                  <p className="text-[11px] font-bold text-slate-400 mt-2 leading-relaxed">請輸入您的西元生日 8 碼以開啟編輯</p>
                </div>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="19XXXXXX" className="w-full h-14 bg-slate-100 border-none rounded-2xl text-center text-3xl font-black tracking-[0.4em] outline-none focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-sm placeholder:tracking-normal" autoFocus onKeyDown={(e)=>e.key === 'Enter' && handleVerify()} />
                <div className="flex gap-3 pt-2">
                  <button onClick={()=>setIsVerifying(false)} className="flex-1 h-12 text-xs font-black text-slate-400">取消</button>
                  <button onClick={handleVerify} className="flex-1 h-12 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-xl active:scale-95 transition-all">確認身份</button>
                </div>
             </div>
          </div>
        )}

        <input type="file" ref={fileRefs.avatar} className="hidden" accept=".jpg,.jpeg" onChange={e=>handleImageUpload(e, 'avatarUrl')} />
        <input type="file" ref={fileRefs.card} className="hidden" accept=".jpg,.jpeg" onChange={e=>handleImageUpload(e, 'businessCardUrl')} />
        <input type="file" ref={fileRefs.ad1} className="hidden" accept=".jpg,.jpeg" onChange={e=>handleImageUpload(e, 'adImageUrl')} />
        <input type="file" ref={fileRefs.ad2} className="hidden" accept=".jpg,.jpeg" onChange={e=>handleImageUpload(e, 'adImageUrl2')} />
      </div>
    </div>
  );
};

export default MemberDetailModal;
