
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
  const [formData, setFormData] = useState<Member>(() => {
    if (!initialData) {
      return { 
        ...EMPTY_MEMBER, 
        id: Date.now().toString(),
        chapter: user.managedChapter || '嘉義分會'
      };
    }
    return { ...initialData };
  });
  
  // Grouping refs into a single object to match usage in the render method and avoid individual ref variable overhead
  const fileRefs = {
    avatar: useRef<HTMLInputElement>(null),
    card: useRef<HTMLInputElement>(null),
    ad1: useRef<HTMLInputElement>(null),
    ad2: useRef<HTMLInputElement>(null),
  };

  const handleChange = (field: keyof Member, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'businessCardUrl' | 'adImageUrl' | 'adImageUrl2') => {
    const file = e.target.files?.[0];
    if (file) {
      const res = await compressImage(file, { maxWidth: 1000, quality: 0.7 });
      handleChange(field, res.base64);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData });
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none placeholder-slate-400 font-bold";
  const areaClass = "w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none font-bold resize-none h-24";
  const labelClass = "block text-[11px] font-black text-slate-700 uppercase tracking-[0.1em] mb-1.5 ml-1";
  const sectionTitle = "text-xs font-black text-blue-800 uppercase tracking-widest mb-4 flex items-center bg-blue-100/80 px-4 py-2 rounded-xl w-fit border border-blue-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <div className="bg-slate-900 px-8 py-7 flex justify-between items-center text-white shrink-0">
          <div>
            <h2 className="font-black text-2xl tracking-tight text-white">{initialData ? '編輯會員資料' : '新增會員資料'}</h2>
            <p className="text-blue-300 text-xs mt-1.5 font-bold">請確保資料完整，特別是青商履歷部分。</p>
          </div>
          <button onClick={onCancel} className="p-3 hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50">
          <form id="memberForm" onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* 基本照片區 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row gap-8 items-center md:items-start">
               <div className="flex-shrink-0 group relative">
                  <div className="w-40 h-40 rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-xl bg-slate-200">
                    <img src={formData.avatarUrl || 'https://via.placeholder.com/300?text=NO+IMAGE'} className="w-full h-full object-cover" />
                  </div>
                  <button type="button" onClick={() => fileRefs.avatar.current?.click()} className="absolute inset-0 bg-slate-900/60 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-xs font-black">更換照片</button>
                  <input type="file" ref={fileRefs.avatar} className="hidden" accept=".jpg,.jpeg" onChange={(e) => handleImageUpload(e, 'avatarUrl')} />
               </div>
               
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><div className={sectionTitle}>👤 基本身份識別</div></div>
                  <div><label className={labelClass}>中文姓名 *</label><input type="text" required value={formData.name} onChange={e => handleChange('name', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>會員編號</label><input type="text" value={formData.memberCode || ''} onChange={e => handleChange('memberCode', e.target.value)} className={inputClass} /></div>
               </div>
            </div>

            {/* 青商履歷區 - 新增 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <div className={sectionTitle}>🏛️ 青商履歷與資歷</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className={labelClass}>本會經歷</label><textarea value={formData.jciExperienceLocal || ''} onChange={e => handleChange('jciExperienceLocal', e.target.value)} className={areaClass} placeholder="每行一項紀錄..." /></div>
                <div><label className={labelClass}>總會與國際經歷</label><textarea value={formData.jciExperienceNational || ''} onChange={e => handleChange('jciExperienceNational', e.target.value)} className={areaClass} /></div>
                <div><label className={labelClass}>得獎紀錄</label><textarea value={formData.awards || ''} onChange={e => handleChange('awards', e.target.value)} className={areaClass} /></div>
                <div><label className={labelClass}>受訓紀錄</label><textarea value={formData.trainingRecords || ''} onChange={e => handleChange('trainingRecords', e.target.value)} className={areaClass} /></div>
              </div>
            </div>

            {/* 數位名片區 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <div className={sectionTitle}>🎞️ 數位展示管理</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['businessCardUrl', 'adImageUrl', 'adImageUrl2'].map((f, i) => (
                  <div key={f} className="space-y-2">
                    <label className={labelClass}>{['名片','廣告A','廣告B'][i]}</label>
                    <div onClick={() => (fileRefs as any)[['card','ad1','ad2'][i]].current?.click()} className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center cursor-pointer hover:border-blue-400">
                      {(formData as any)[f] ? <img src={(formData as any)[f]} className="w-full h-full object-contain" /> : <span className="text-2xl">➕</span>}
                    </div>
                    <input type="file" ref={(fileRefs as any)[['card','ad1','ad2'][i]]} className="hidden" accept=".jpg,.jpeg" onChange={e => handleImageUpload(e, f as any)} />
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        <div className="bg-white px-10 py-7 flex justify-end space-x-4 border-t border-slate-200 shrink-0">
          <button type="button" onClick={onCancel} className="px-8 py-3 text-slate-500 font-black text-sm">取消</button>
          <button type="submit" form="memberForm" className="px-14 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all">儲存資料</button>
        </div>
      </div>
    </div>
  );
};

export default MemberEditor;
