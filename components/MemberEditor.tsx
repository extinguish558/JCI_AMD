
import React, { useState, useRef, useEffect } from 'react';
import { Member, MemberType, Chapter, AuthUser } from '../types';
import { compressImage } from '../utils/imageCompression';

interface MemberEditorProps {
  member?: Member;
  user: AuthUser;
  initialScanMode?: boolean;
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

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none placeholder-slate-400";
  const labelClass = "block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="bg-slate-900 px-6 py-5 flex justify-between items-center text-white">
          <div>
            <h2 className="font-bold text-xl">{initialData ? '編輯會員資料' : '手動新增會員'}</h2>
            <p className="text-slate-400 text-xs mt-1">請確保資料欄位填寫正確</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-800 rounded-full transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50">
          <form id="memberForm" onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-8 items-start">
               <div className="flex-shrink-0 group relative">
                  <img src={formData.avatarUrl || 'https://via.placeholder.com/150'} className="w-32 h-32 rounded-3xl object-cover border-4 border-slate-100 shadow-md" alt="Avatar" />
                  <button type="button" onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-slate-900/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">更換照片</button>
                  <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const res = await compressImage(file, { maxWidth: 500, quality: 0.7 });
                      handleChange('avatarUrl', res.base64);
                    }
                  }} />
               </div>
               
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                     <label className={labelClass}>中文姓名 *</label>
                     <input type="text" required value={formData.name} onChange={e => handleChange('name', e.target.value)} className={`${inputClass} font-bold`} placeholder="中文名" />
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
                       <option value={MemberType.YB}>YB 青商</option>
                       <option value={MemberType.SENIOR}>特友會 (OB)</option>
                     </select>
                  </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">商務聯繫資訊</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className={labelClass}>公司/事業名稱</label>
                  <input type="text" value={formData.company || ''} onChange={e => handleChange('company', e.target.value)} className={inputClass} placeholder="公司名稱" />
                </div>
                <div>
                  <label className={labelClass}>最高職稱</label>
                  <input type="text" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className={inputClass} placeholder="例如：董事長" />
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
                  <input type="email" value={formData.email || ''} onChange={e => handleChange('email', e.target.value)} className={inputClass} placeholder="email@example.com" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-5">
               <div>
                  <label className={labelClass}>入會日期</label>
                  <input type="date" value={formData.joinDate} onChange={e => handleChange('joinDate', e.target.value)} className={inputClass} />
               </div>
               <div>
                  <label className={labelClass}>生日</label>
                  <input type="date" value={formData.birthday || ''} onChange={e => handleChange('birthday', e.target.value)} className={inputClass} />
               </div>
            </div>
          </form>
        </div>

        <div className="bg-white px-8 py-5 flex justify-end space-x-4 border-t border-slate-200">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors">取消</button>
          <button type="submit" form="memberForm" className="px-10 py-2.5 bg-blue-600 text-white rounded-xl font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95">確認儲存</button>
        </div>
      </div>
    </div>
  );
};

export default MemberEditor;
