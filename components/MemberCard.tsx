
import React, { useState } from 'react';
import { Member, MemberType } from '../types';

interface MemberCardProps {
  member: Member;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const [expanded, setExpanded] = useState(false);
  const isSenior = member.type === MemberType.SENIOR;

  const getBirthdayDisplay = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col relative h-full group">
      <div className="p-5 flex items-start space-x-4">
        <div className="flex-shrink-0 relative">
          <img 
            className="h-16 w-16 rounded-2xl object-cover border-2 border-slate-50 bg-slate-100 shadow-sm transition-transform group-hover:scale-105" 
            src={member.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + member.name} 
            alt={member.name}
            loading="lazy"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 truncate leading-tight">{member.name}</h3>
            <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              {member.joinDate ? `${new Date(member.joinDate).getFullYear()}入會` : '一般會員'}
            </span>
          </div>
          {member.englishName && <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">{member.englishName}</p>}
          <p className="text-xs font-black text-blue-600 truncate mt-1">{member.jciTitle || member.currentRole?.roleName || 'YB 青商'}</p>
          <p className="text-[11px] font-bold text-slate-400 truncate mt-0.5">{member.company ? `${member.company} ${member.title || ''}` : '未填寫現職'}</p>
        </div>
      </div>

      <div className="px-5 pb-4 flex flex-wrap gap-1.5">
        {member.currentRole && (
          <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-md shadow-blue-500/20">
            {member.currentRole.roleName}
          </span>
        )}
        {member.senatorId && (
          <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-lg shadow-md shadow-amber-500/20">
            參 {member.senatorId}
          </span>
        )}
        {!member.currentRole && (
          <span className={`px-3 py-1 text-[10px] font-black rounded-lg border ${isSenior ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-green-600 text-white border-green-700 shadow-md shadow-green-500/20'}`}>
            {member.type}
          </span>
        )}
      </div>
      
      {expanded && (
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 text-[11px] space-y-3 animate-slide-down">
          {member.mobile && (
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-400 uppercase tracking-widest">Mobile</span>
              <span className="font-bold text-slate-700">{member.mobile}</span>
            </div>
          )}
          {member.companyPhone && (
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-400 uppercase tracking-widest">Office</span>
              <span className="font-bold text-slate-700">{member.companyPhone}</span>
            </div>
          )}
          {member.birthday && (
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-400 uppercase tracking-widest">Birthday</span>
              <span className="font-bold text-slate-700">{getBirthdayDisplay(member.birthday)}</span>
            </div>
          )}
          {member.spouseName && (
            <div className="flex items-center justify-between">
              <span className="font-black text-blue-400 uppercase tracking-widest">夫人/姑爺</span>
              <span className="font-bold text-slate-700">{member.spouseName}</span>
            </div>
          )}
          {member.address && (
            <div className="flex flex-col gap-1">
              <span className="font-black text-slate-400 uppercase tracking-widest">Address</span>
              <span className="font-bold text-slate-700 leading-relaxed">{member.address}</span>
            </div>
          )}
          {member.remark && (
            <div className="flex flex-col gap-1 pt-2 border-t border-slate-200/50">
              <span className="font-black text-slate-400 uppercase tracking-widest">Remark / 備註</span>
              <span className="font-medium text-slate-600 italic leading-relaxed">{member.remark}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-auto border-t border-slate-50 px-5 py-3 flex justify-between items-center bg-white">
        <div className="flex space-x-2">
          <button onClick={() => member.mobile && window.open(`tel:${member.mobile}`)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </button>
          <button onClick={() => member.mobile && window.open(`sms:${member.mobile}`)} className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </button>
        </div>
        <button onClick={() => setExpanded(!expanded)} className={`px-5 py-2 text-[11px] font-black rounded-xl transition-all ${expanded ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          {expanded ? '收起資訊' : '查看詳情'}
        </button>
      </div>
    </div>
  );
};

export default MemberCard;
