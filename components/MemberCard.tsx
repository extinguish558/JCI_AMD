
import React from 'react';
import { Member, MemberType } from '../types';

interface MemberCardProps {
  member: Member;
  onViewDetails: (member: Member) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onViewDetails }) => {
  const isSenior = member.type === MemberType.SENIOR;

  const getJoinYear = (dateStr?: string) => {
    if (!dateStr) return '正式會員';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '正式會員' : `${date.getFullYear()}入會`;
  };

  const handleLineConnect = () => {
    if (member.lineId) {
      window.open(`https://line.me/ti/p/~${member.lineId}`, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/60 overflow-hidden flex flex-col h-full active:scale-[0.98] group">
      <div className="p-5 flex items-start gap-5">
        <div className="relative shrink-0">
          {/* 頭像容器：背景改為純白以支援去背 PNG */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white transition-transform duration-500 group-hover:scale-105">
            <img 
              className="w-full h-full object-cover object-top bg-white" 
              src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} 
              alt={member.name}
              loading="lazy"
            />
          </div>
          
          {/* 會員類型標籤 */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10">
            <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full border whitespace-nowrap shadow-md ${
              isSenior 
                ? 'bg-indigo-50 text-indigo-500 border-indigo-100' 
                : 'bg-green-500 text-white border-green-600 shadow-green-500/20'
            }`}>
              {member.type === MemberType.SENIOR ? '特友會' : 'YB 員'}
            </span>
          </div>

          {member.memberCode && (
             <span className="absolute -top-1.5 -left-1.5 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-md border-2 border-white">
               {member.memberCode}
             </span>
          )}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-base font-black text-slate-900 truncate tracking-tight">{member.name}</h3>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{getJoinYear(member.joinDate)}</span>
          </div>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.15em] mb-1 truncate">
            {member.currentRole?.roleName || member.jciTitle || 'JCI MEMBER'}
          </p>
          <p className="text-[11px] font-bold text-slate-500 truncate leading-relaxed">
            {member.company || '嘉義青商成員'}
          </p>
        </div>
      </div>

      <div className="px-5 pb-4 flex flex-wrap gap-1.5 mt-1">
        {member.currentRole && (
          <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black rounded-full shadow-lg shadow-blue-500/10">
            {member.currentRole.roleName}
          </span>
        )}
        {member.senatorId && (
          <span className="px-3 py-1 bg-amber-500 text-white text-[9px] font-black rounded-full shadow-lg shadow-amber-500/10">
            參 {member.senatorId}
          </span>
        )}
      </div>
      
      <div className="mt-auto border-t border-slate-50 px-5 py-3 flex justify-between items-center bg-slate-50/50">
        <div className="flex gap-2">
          {/* 撥打電話：改為顯眼的翠綠色 */}
          <button 
            onClick={() => member.mobile && window.open(`tel:${member.mobile}`)} 
            disabled={!member.mobile}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90 shadow-lg ${
              member.mobile 
                ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-110' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'
            }`}
            title="撥打電話"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </button>

          {/* LINE 聯絡：品牌色 #00B900 */}
          <button 
            onClick={handleLineConnect}
            disabled={!member.lineId}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90 shadow-lg ${
              member.lineId 
                ? 'bg-[#00B900] text-white shadow-[#00B900]/20 hover:bg-[#00a300] hover:scale-110' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'
            }`}
            title="LINE 聯絡"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.039 1.085l-.171 1.027c-.052.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.577-1.791 2.571-3.764 2.571-5.992zm-17.881 4.145h-1.395c-.268 0-.486-.219-.486-.487v-5.235c0-.268.218-.487.486-.487h1.395c.268 0 .486.219.486.487v5.235c0 .268-.218.487-.486.487zm3.179 0h-1.395c-.268 0-.486-.219-.486-.487v-5.235c0-.268.218-.487.486-.487h1.395c.268 0 .486.219.486.487v5.235c0 .268-.218.487-.486.487zm5.556 0h-2.181c-.131 0-.256-.052-.345-.145l-2.074-2.19v1.848c0 .268-.218.487-.486.487h-1.395c-.268 0-.486-.219-.486-.487v-5.235c0-.268.218-.487.486-.487h1.395c.268 0 .486.219.486.487v1.848l2.074-2.19c.089-.093.214-.145.345-.145h2.181c.365 0 .543.447.279.699l-1.921 1.831 2.053 2.164c.264.278.067.737-.255.737zm4.331-2.909h-1.87v1.936c0 .268-.218.487-.486.487h-1.395c-.268 0-.486-.219-.486-.487v-5.235c0-.268.218-.487.486-.487h3.751c.268 0 .486.219.486.487v.872c0 .268-.218.487-.486.487h-1.87v.871h1.87c.268 0 .486.219.486.487v.872c0 .268-.218.487-.486.487z" />
            </svg>
          </button>
        </div>

        <button 
          onClick={() => onViewDetails(member)} 
          className="text-[11px] font-black text-white bg-slate-900 px-6 py-2.5 rounded-2xl shadow-xl active:scale-95 transition-all hover:bg-black"
        >
          查看詳情
        </button>
      </div>
    </div>
  );
};

export default MemberCard;
