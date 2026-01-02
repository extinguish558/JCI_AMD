import React from 'react';
import { Member, OrgRole, OrgSection } from '../types';

interface OrgVisualChartProps {
  roles: OrgRole[];
  members: Member[];
  onSelectRole?: (roleId: string) => void;
  activeRoleId?: string | null;
  interactive?: boolean;
}

const OrgVisualChart: React.FC<OrgVisualChartProps> = ({ roles, members, onSelectRole, activeRoleId, interactive = false }) => {
  
  const getNames = (ids: string[] | undefined) => {
    if (!ids || ids.length === 0) return '待定';
    return ids.map(id => members.find(m => m.id === id)?.name || '未知').join('、');
  };

  // Add key to prop definition to satisfy TS when used as a component with key prop in map/list
  const RoleBox = ({ role, className = "" }: { role: OrgRole, className?: string, key?: React.Key }) => {
    const isActive = activeRoleId === role.id;
    return (
      <div 
        onClick={() => interactive && onSelectRole?.(role.id)}
        className={`bg-white border-2 flex flex-col min-w-[140px] text-[11px] transition-all relative
          ${interactive ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-600' : ''}
          ${isActive ? 'ring-4 ring-blue-500/30 border-blue-600 bg-blue-50 z-20 scale-105' : 'border-black'}
          ${className}
        `}
      >
        <div className="flex last:border-0 border-b-2 border-black">
          <div className="w-[45%] border-r-2 border-black bg-slate-200 p-1 flex items-center justify-center font-black text-black text-center leading-tight">
            {role.mainTitle}
          </div>
          <div className="w-[55%] p-1 flex items-center justify-center font-black text-slate-900 text-center min-h-[32px]">
            {getNames(role.mainMemberIds)}
          </div>
        </div>
        {role.hasDeputy && (
          <div className="flex">
            <div className="w-[45%] border-r-2 border-black bg-slate-100 p-1 flex items-center justify-center font-black text-black text-center leading-tight">
              {role.deputyTitle || '副手'}
            </div>
            <div className="w-[55%] p-1 flex items-center justify-center font-black text-slate-900 text-center min-h-[32px]">
              {getNames(role.deputyMemberIds)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const findRole = (id: string) => roles.find(r => r.id === id);

  return (
    <div className={`p-12 bg-white min-w-[1300px] flex flex-col items-center ${interactive ? 'scale-[0.8] origin-top' : ''}`}>
      {/* 標題 */}
      {!interactive && (
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black border-b-8 border-black inline-block pb-3 tracking-[0.3em] text-black">115 年度組織圖</h1>
          <p className="text-slate-800 font-black uppercase mt-4 tracking-widest text-sm">JUNIOR CHAMBER INTERNATIONAL CHIAYI</p>
        </div>
      )}

      <div className="flex items-start gap-8">
        {/* 第一欄：顧問團/個人會員/監事會 */}
        <div className="flex flex-col space-y-24 pt-20">
          <div className="flex flex-col items-end gap-3">
            <div className="bg-black text-white px-4 py-1 text-xs font-black shadow-lg">顧問團</div>
            {['la1', 'la2', 'la3'].map(id => {
              const r = findRole(id);
              return r ? <RoleBox key={id} role={r} className="w-56" /> : null;
            })}
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="bg-black text-white px-4 py-1 text-xs font-black shadow-lg">監事會</div>
            {['ls1', 'ls2', 'ls3', 'ls4'].map(id => {
              const r = findRole(id);
              return r ? <RoleBox key={id} role={r} className="w-56" /> : null;
            })}
          </div>
        </div>

        {/* 連接線: 左側到主軸 */}
        <div className="w-16 relative flex items-center justify-center pt-24">
           <div className="absolute top-24 bottom-32 w-1 bg-black"></div>
           <div className="absolute top-24 left-0 w-full h-1 bg-black"></div>
           <div className="absolute bottom-32 left-0 w-full h-1 bg-black"></div>
        </div>

        {/* 第二欄：核心主軸軸 (個人會員 -> 會長) */}
        <div className="flex flex-col items-center space-y-10 pt-48">
          {['m1', 'm2', 'm3', 'm4', 'm5'].map(id => {
             const r = findRole(id);
             if(!r) return null;
             return (
               <div 
                 key={id} 
                 onClick={() => interactive && onSelectRole?.(r.id)}
                 className={`w-32 py-6 border-4 font-black text-lg text-black text-center transition-all cursor-pointer flex items-center justify-center
                   ${activeRoleId === id ? 'border-blue-600 bg-blue-100 ring-8 ring-blue-500/20 z-20 scale-110 shadow-2xl' : 'border-black bg-white hover:bg-slate-50'}
                 `}
                 style={{ writingMode: 'vertical-rl', letterSpacing: '0.4em', height: '140px' }}
               >
                 {r.mainTitle}
               </div>
             )
          })}
        </div>

        {/* 連接線: 主軸到右側 */}
        <div className="w-16 relative pt-[485px]">
          <div className="absolute top-[505px] left-0 w-full h-1 bg-black"></div>
          <div className="absolute top-10 bottom-20 left-16 w-1 bg-black"></div>
        </div>

        {/* 第三欄：右側詳細職務 */}
        <div className="flex flex-col space-y-12">
          {/* 行政組 (上) */}
          <div className="flex flex-col space-y-1.5">
            {['ra1', 'ra2', 'ra3', 'ra4', 'ra5', 'ra6', 'ra7', 'ra8', 'ra9', 'ra10', 'ra11', 'ra12', 'ra13', 'ra14'].map(id => {
              const r = findRole(id);
              return r ? <RoleBox key={id} role={r} className="w-80 shadow-sm" /> : null;
            })}
          </div>

          {/* 副會長分支 (下) */}
          <div className="flex flex-col space-y-12 pl-12 relative">
            {/* 會務副會長分支 */}
            <div className="flex gap-6">
              <div className="flex flex-col space-y-2">
                {findRole('rt1') && <RoleBox role={findRole('rt1')!} className="w-64 border-blue-600 border-2 shadow-md" />}
                {findRole('rt1-1') && <RoleBox role={findRole('rt1-1')!} className="w-64" />}
                {findRole('rt1-2') && <RoleBox role={findRole('rt1-2')!} className="w-64" />}
              </div>
              <div className="flex flex-col space-y-1.5">
                {['rv1-1', 'rv1-2', 'rv1-3', 'rv1-4', 'rv1-5', 'rv1-6'].map(id => {
                  const r = findRole(id);
                  return r ? <RoleBox key={id} role={r} className="w-64" /> : null;
                })}
              </div>
            </div>

            {/* 組務副會長分支 */}
            <div className="flex gap-6">
              <div className="flex flex-col space-y-2">
                {findRole('rt2') && <RoleBox role={findRole('rt2')!} className="w-64 border-blue-600 border-2 shadow-md" />}
                {findRole('rt2-1') && <RoleBox role={findRole('rt2-1')!} className="w-64" />}
                {findRole('rt2-2') && <RoleBox role={findRole('rt2-2')!} className="w-64" />}
              </div>
              <div className="flex flex-col space-y-1.5">
                {['rv2-1', 'rv2-2', 'rv2-3', 'rv2-4', 'rv2-5', 'rv2-6'].map(id => {
                  const r = findRole(id);
                  return r ? <RoleBox key={id} role={r} className="w-64" /> : null;
                })}
              </div>
            </div>

            {/* 底部特別活動 */}
            <div className="flex flex-col space-y-2">
              {['rb1', 'rb2'].map(id => {
                const r = findRole(id);
                return r ? <RoleBox key={id} role={r} className="w-80 shadow-md" /> : null;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgVisualChart;