
import React from 'react';
import { Member, OrgRole, OrgSection } from '../types';

interface OrgVisualChartProps {
  roles: OrgRole[];
  members: Member[];
}

const OrgVisualChart: React.FC<OrgVisualChartProps> = ({ roles, members }) => {
  
  const getNames = (ids: string[] | undefined) => {
    if (!ids || ids.length === 0) return '待定';
    return ids.map(id => members.find(m => m.id === id)?.name || '未知').join('、');
  };

  const RoleBox = ({ role, className = "" }: { role: OrgRole, className?: string }) => (
    <div className={`bg-white border border-slate-900 flex flex-col min-w-[180px] shadow-sm text-[11px] ${className}`}>
      {/* 主標題與人名 */}
      <div className="flex border-b border-slate-900 last:border-0">
        <div className="w-1/2 border-r border-slate-900 bg-slate-50 p-1 flex items-center justify-center font-bold text-center">
          {role.mainTitle}
        </div>
        <div className="w-1/2 p-1 flex items-center justify-center font-black text-slate-900">
          {getNames(role.mainMemberIds)}
        </div>
      </div>
      {/* 副標題與人名 (如有) */}
      {role.hasDeputy && (
        <div className="flex">
          <div className="w-1/2 border-r border-slate-900 bg-slate-50 p-1 flex items-center justify-center font-bold text-center">
            {role.deputyTitle || '副手'}
          </div>
          <div className="w-1/2 p-1 flex items-center justify-center font-black text-slate-900">
            {getNames(role.deputyMemberIds)}
          </div>
        </div>
      )}
    </div>
  );

  const filterSection = (s: OrgSection) => roles.filter(r => r.section === s).sort((a,b) => a.rank - b.rank);

  return (
    <div className="p-16 min-w-max bg-white font-sans text-slate-900">
      {/* 標題區 */}
      <div className="text-center mb-16 space-y-2">
        <h1 className="text-4xl font-black tracking-[0.2em] border-b-4 border-slate-900 inline-block pb-2">115 年度組織圖</h1>
        <p className="font-bold text-slate-500 uppercase tracking-widest text-sm">Junior Chamber International Chiayi</p>
      </div>

      <div className="flex items-start justify-center gap-10">
        
        {/* 左側分支：顧問與監事 */}
        <div className="flex flex-col space-y-20 pt-40">
           {/* 顧問團 */}
           <div className="flex flex-col items-end space-y-4">
              <div className="bg-slate-900 text-white px-4 py-1 text-xs font-black">顧問團</div>
              <div className="space-y-1">
                {filterSection('LEFT_ADVISORS').map(r => <RoleBox key={r.id} role={r} />)}
              </div>
           </div>
           {/* 監事會 */}
           <div className="flex flex-col items-end space-y-4">
              <div className="bg-slate-900 text-white px-4 py-1 text-xs font-black">監事會</div>
              <div className="space-y-1">
                {filterSection('LEFT_SUPERVISORS').map(r => <RoleBox key={r.id} role={r} />)}
              </div>
           </div>
        </div>

        {/* 中心主軸 */}
        <div className="flex flex-col items-center space-y-8 pt-60 relative">
          <div className="absolute top-0 bottom-0 w-0.5 bg-slate-300 -z-0"></div>
          {filterSection('MAIN_AXIS').map(r => (
            <div key={r.id} className="relative z-10 bg-white p-2 border-2 border-slate-900 font-black text-sm min-w-[120px] text-center shadow-md">
              {r.mainTitle}
            </div>
          ))}
        </div>

        {/* 右側：龐大行政與功能體系 */}
        <div className="flex flex-col space-y-10 pt-10">
           {/* 右上：行政輔助團隊 */}
           <div className="grid grid-cols-1 gap-1 border-l-4 border-blue-600 pl-6">
              {filterSection('RIGHT_ADMIN').map(r => <RoleBox key={r.id} role={r} />)}
           </div>

           {/* 右下：功能委員會 (副會體系) */}
           <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-l-4 border-green-600 pl-6">
              {filterSection('RIGHT_TEAMS').map(r => (
                <div key={r.id} className="flex flex-col">
                   <RoleBox role={r} className={r.mainTitle.includes('副會長') ? "border-slate-900 !bg-slate-100" : ""} />
                </div>
              ))}
           </div>
        </div>

      </div>

      <div className="mt-40 text-center border-t border-slate-200 pt-10">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">會長及特會主席交接 & 理監事宣誓 就職典禮</p>
      </div>
    </div>
  );
};

export default OrgVisualChart;
