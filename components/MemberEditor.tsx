
import React, { useState, useRef } from 'react';
import { Member, MemberType, Chapter, AuthUser } from '../types';
import { compressImage } from '../utils/imageCompression';

interface MemberEditorProps {
  member?: Member;
  user: AuthUser;
  onSave: (member: Member) => void;
  onCancel: () => void;
}

const EMPTY_MEMBER: Member = {
  id: '',
  name: '',
  englishName: '',
  chapter: '嘉義分會',
  type: MemberType.YB,
  joinDate: new Date().toISOString().split('T')[0],
  gender: '男',
};

const MemberEditor: React.FC<MemberEditorProps> = ({ member: initialData, user, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Member>(
    initialData ? JSON.parse(JSON.stringify(initialData)) : { 
      ...EMPTY_MEMBER, 
      id: Date.now().toString(),
      chapter: user.managedChapter || '嘉義分會'
    }
  );
  
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof Member, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none placeholder-slate-400 font-bold";
  const labelClass = "block text-[11px] font-black text-slate-700 uppercase tracking-[0.1em] mb-1.5 ml-1";
  const sectionTitle = "text-xs font-black text-blue-800 uppercase tracking-widest mb-4 flex items-center bg-blue-100/80 px-4 py-2 rounded-xl w-fit border border-blue-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header - 提高副標題對比度 */}
        <div className="bg-slate-900 px-8 py-7 flex justify-between items-center text-white shrink-0 border-b border-slate-800">
          <div>
            <h2 className="font-black text-2xl tracking-tight">{initialData ? '編輯會員資料' : '新增會員資料'}</h2>
            <p className="text-blue-300 text-xs mt-1.5 font-bold">請確保資料完整，以利後續查詢與匯出</p>
          </div>
          <button onClick={onCancel} className="p-3 hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50">
          <form id="memberForm" onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* 第一群組：基本與照片 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row gap-8 items-center md:items-start">
               <div className="flex-shrink-0 group relative">
                  <div className="w-40 h-40 rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-xl bg-slate-200">
                    <img src={formData.avatarUrl || 'https://via.placeholder.com/300?text=NO+IMAGE'} className="w-full h-full object-cover" alt="Avatar" />
                  </div>
                  <button type="button" onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-slate-900/60 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white text-xs font-black p-4 text-center">
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    更換照片
                  </button>
                  <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const res = await compressImage(file, { maxWidth: 500, quality: 0.7 });
                      handleChange('avatarUrl', res.base64);
                    }
                  }} />
               </div>
               
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="md:col-span-2">
                    <div className={sectionTitle}>
                      <span className="mr-2">👤</span> 基本身份識別
                    </div>
                  </div>
                  <div>
                     <label className={labelClass}>中文姓名 *</label>
                     <input type="text" required value={formData.name} onChange={e => handleChange('name', e.target.value)} className={`${inputClass} !text-lg !font-black !bg-blue-50/30 !border-blue-100`} placeholder="輸入真實姓名" />
                  </div>
                  <div>
                     <label className={labelClass}>英文姓名</label>
                     <input type="text" value={formData.englishName || ''} onChange={e => handleChange('englishName', e.target.value)} className={inputClass} placeholder="English Name" />
                  </div>
                  <div>
                     <label className={labelClass}>所屬分會</label>
                     <select value={formData.chapter} onChange={e => handleChange('chapter', e.target.value)} className={inputClass}>
                       <option value="嘉義分會">嘉義分會</option>
                       <option value="南投分會">南投分會</option>
                     </select>
                  </div>
                  <div>
                     <label className={labelClass}>會員類型</label>
                     <select value={formData.type} onChange={e => handleChange('type', e.target.value)} className={inputClass}>
                       <option value={MemberType.YB}>YB 青商 (40歲以下)</option>
                       <option value={MemberType.SENIOR}>特友會 OB (40歲以上)</option>
                     </select>
                  </div>
               </div>
            </div>

            {/* 第二群組：青商核心資料 - 優化標籤與 Badge 對比 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className={sectionTitle}><span className="mr-2">🏢</span> 青商職務與紀錄</div>
                {formData.currentRole && (
                  <div className="flex items-center space-x-3 bg-indigo-600 px-5 py-2 rounded-2xl shadow-lg shadow-indigo-200">
                    <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">系統指派職務</span>
                    <span className="text-sm font-black text-white">{formData.currentRole.roleName}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>名錄顯示職務 (手動設定)</label>
                  <input type="text" value={formData.jciTitle || ''} onChange={e => handleChange('jciTitle', e.target.value)} className={inputClass} placeholder={formData.currentRole?.roleName || "例如：總務主委、理事"} />
                  <p className="text-[10px] text-slate-500 mt-2 ml-1 font-black">※ 若留空，名錄將自動顯示系統指派職務</p>
                </div>
                <div>
                  <label className={labelClass}>入會日期</label>
                  <input type="date" value={formData.joinDate} onChange={e => handleChange('joinDate', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>參議會編號 (如有)</label>
                  <input type="text" value={formData.senatorId || ''} onChange={e => handleChange('senatorId', e.target.value)} className={inputClass} placeholder="Senator No." />
                </div>
                <div>
                  <label className={labelClass}>生日</label>
                  <input type="date" value={formData.birthday || ''} onChange={e => handleChange('birthday', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            {/* 第三群組：商務與聯繫 - 增強標籤顏色 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6">
              <div className={sectionTitle}><span className="mr-2">💼</span> 現職商務資訊</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>公司 / 事業名稱</label>
                  <input type="text" value={formData.company || ''} onChange={e => handleChange('company', e.target.value)} className={inputClass} placeholder="請輸入完整公司名稱" />
                </div>
                <div>
                  <label className={labelClass}>最高職稱 (現職)</label>
                  <input type="text" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className={inputClass} placeholder="例如：負責人、總經理" />
                </div>
                <div>
                  <label className={labelClass}>行動電話</label>
                  <input type="text" value={formData.mobile || ''} onChange={e => handleChange('mobile', e.target.value)} className={inputClass} placeholder="09XX-XXXXXX" />
                </div>
                <div>
                  <label className={labelClass}>公司電話</label>
                  <input type="text" value={formData.companyPhone || ''} onChange={e => handleChange('companyPhone', e.target.value)} className={inputClass} placeholder="05-XXXXXXX" />
                </div>
                <div>
                  <label className={labelClass}>電子信箱</label>
                  <input type="email" value={formData.email || ''} onChange={e => handleChange('email', e.target.value)} className={inputClass} placeholder="example@email.com" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>通訊地址</label>
                  <input type="text" value={formData.address || ''} onChange={e => handleChange('address', e.target.value)} className={inputClass} placeholder="完整地址" />
                </div>
              </div>
            </div>

            {/* 第四群組：家庭與其他 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6">
              <div className={sectionTitle}><span className="mr-2">🏠</span> 家庭與其他資訊</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>夫人 / 姑爺 (配偶姓名)</label>
                  <input type="text" value={formData.spouseName || ''} onChange={e => handleChange('spouseName', e.target.value)} className={inputClass} placeholder="配偶姓名" />
                </div>
                <div>
                  <label className={labelClass}>LINE ID</label>
                  <input type="text" value={formData.lineId || ''} onChange={e => handleChange('lineId', e.target.value)} className={inputClass} placeholder="Line ID" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>備註說明</label>
                  <textarea rows={3} value={formData.remark || ''} onChange={e => handleChange('remark', e.target.value)} className={`${inputClass} resize-none h-24`} placeholder="例如：入會紀錄、重要事蹟或特殊聯繫要求" />
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="bg-white px-10 py-7 flex justify-end space-x-4 border-t border-slate-200 shrink-0 shadow-inner">
          <button type="button" onClick={onCancel} className="px-8 py-3 text-slate-500 font-black text-sm hover:text-slate-900 transition-colors">取消變更</button>
          <button type="submit" form="memberForm" className="px-14 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all active:scale-95 shadow-blue-500/20">
            確認並儲存資料
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberEditor;
