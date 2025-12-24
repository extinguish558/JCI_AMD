
import React, { useState, useRef } from 'react';
import { Member, MemberType, SeniorTitleType } from '../types';
import { compressImage, formatBytes } from '../utils/imageCompression';

interface MemberCardProps {
  member: Member;
}

const MemberCard: React.FC<MemberCardProps> = ({ member: initialMember }) => {
  const [member, setMember] = useState(initialMember);
  const [expanded, setExpanded] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadStats, setUploadStats] = useState<{ original: string; compressed: string; type: string } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const businessCardInputRef = useRef<HTMLInputElement>(null);

  const isSenior = member.type === MemberType.SENIOR;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'businessCard') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    try {
      const options = target === 'avatar' 
        ? { maxWidth: 500, maxHeight: 500, quality: 0.7 } // Optimized for thumbnails
        : { maxWidth: 1200, maxHeight: 1200, quality: 0.8 };
      const result = await compressImage(file, options);
      setMember(prev => ({ ...prev, [target === 'avatar' ? 'avatarUrl' : 'businessCardUrl']: result.base64 }));
      setUploadStats({ original: formatBytes(result.originalSize), compressed: formatBytes(result.compressedSize), type: target === 'avatar' ? '頭像' : '名片' });
    } catch (error) {
      alert("圖片處理失敗");
    } finally { setIsCompressing(false); }
  };

  const getBirthdayDisplay = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const handleLineClick = () => {
    if (member.lineId) {
      // 支援 ID 形式的快速連結
      window.open(`https://line.me/ti/p/~${member.lineId}`, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-slate-100 flex flex-col relative h-full">
      {isCompressing && (
        <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center flex-col">
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
          <span className="text-xs font-bold text-blue-600">優化中...</span>
        </div>
      )}

      <div className="p-4 flex items-start space-x-3">
        <div className="flex-shrink-0 relative">
          <img 
            className="h-14 w-14 rounded-full object-cover border-2 border-slate-50 bg-slate-100" 
            src={member.avatarUrl || 'https://via.placeholder.com/150'} 
            alt={member.name}
            loading="lazy"
            width="56"
            height="56"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 truncate">{member.name}</h3>
            <span className="text-[10px] text-slate-400">{new Date(member.joinDate).getFullYear()}入會</span>
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">{member.currentRole?.roleName || member.title || '會員'}</p>
          <p className="text-[11px] text-slate-400 truncate">{member.company || '未填寫公司'}</p>
        </div>
      </div>

      <div className="px-4 pb-3 flex flex-wrap gap-1">
        {member.currentRole && (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100">
            {member.currentRole.roleName}
          </span>
        )}
        {member.senatorId && (
          <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[10px] font-bold rounded-full border border-yellow-100">
            參 {member.senatorId}
          </span>
        )}
        {!member.currentRole && (
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${isSenior ? 'bg-slate-50 text-slate-500 border-slate-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
            {member.type}
          </span>
        )}
      </div>
      
      {expanded && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs space-y-2">
          {member.mobile && <div className="flex items-center text-slate-600"><span className="w-8 text-slate-400">手機</span>{member.mobile}</div>}
          {member.lineId && <div className="flex items-center text-slate-600"><span className="w-8 text-slate-400">LINE</span>{member.lineId}</div>}
          {member.birthday && <div className="flex items-center text-slate-600"><span className="w-8 text-slate-400">生日</span>{getBirthdayDisplay(member.birthday)}</div>}
          {member.companyAddress && <div className="text-slate-600"><span className="text-slate-400 block mb-0.5">公司地址</span>{member.companyAddress}</div>}
          {member.businessCardUrl && (
            <img src={member.businessCardUrl} className="w-full h-auto rounded-lg border border-slate-200 mt-2" alt="Business Card" loading="lazy" />
          )}
        </div>
      )}

      <div className="mt-auto border-t border-slate-50 px-4 py-2 flex justify-between items-center bg-white">
        <div className="flex space-x-3">
          <button onClick={() => member.mobile && window.open(`tel:${member.mobile}`)} className="text-[11px] font-bold text-blue-600 flex items-center hover:bg-blue-50 px-2 py-1 rounded-md transition-colors">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            撥號
          </button>
          {member.lineId && (
            <button onClick={handleLineClick} className="text-[11px] font-bold text-[#06C755] flex items-center hover:bg-[#06C755]/10 px-2 py-1 rounded-md transition-colors">
              <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975 1.725-1.841 2.548-3.754 2.548-5.768zm-17.616 3.492h-1.523c-.15 0-.271-.12-.271-.271V9.006c0-.15.121-.271.271-.271h1.523c.15 0 .271.12.271.271v4.519c0 .15-.121.271-.271.271zm3.896 0h-1.524c-.15 0-.271-.12-.271-.271V9.006c0-.15.121-.271.271-.271h.167c.15 0 .271.12.271.271v3.978h1.086c.15 0 .271.12.271.271v.271c0 .15-.121.271-.271.271zm2.394 0h-1.524c-.15 0-.271-.12-.271-.271V9.006c0-.15.121-.271.271-.271h.167c.15 0 .271.12.271.271v4.519c0 .15-.121.271-.271.271zm6.052 0h-1.603c-.131 0-.244-.093-.267-.222l-.462-2.548-.462 2.548c-.024.129-.136.222-.267.222h-1.604c-.15 0-.271-.12-.271-.271V9.006c0-.15.121-.271.271-.271h.167c.15 0 .271.12.271.271v3.91l.654-3.64c.026-.145.152-.251.299-.251h.782c.147 0 .273.106.299.251l.654 3.64v-3.91c0-.15.121-.271.271-.271h.167c.15 0 .271.12.271.271v4.519c0 .15-.121.271-.271.271z"/></svg>
              LINE
            </button>
          )}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-[11px] font-bold text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors">
          {expanded ? '收起' : '詳細'}
        </button>
      </div>
    </div>
  );
};

export default MemberCard;
