
import React, { useState } from 'react';

interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  settings: Record<string, any>;
}

interface SystemModuleEditorProps {
  onClose: () => void;
}

const SystemModuleEditor: React.FC<SystemModuleEditorProps> = ({ onClose }) => {
  const [configs, setConfigs] = useState<ModuleConfig[]>([
    {
      id: 'member_detail',
      name: '會友詳情模塊',
      description: '控制詳情頁面的顯示內容與基本資訊佈局',
      isEnabled: true,
      settings: {
        showEnglishName: true,
        showSenatorBadge: true,
        headerGridColumns: 2
      }
    },
    {
      id: 'business_showcase',
      name: '商務展示模塊',
      description: '名片與事業廣告的展示邏輯',
      isEnabled: true,
      settings: {
        maxAds: 2,
        allowZoom: true,
        showCompanyInfo: true
      }
    },
    {
      id: 'audit_validation',
      name: '資料檢核模塊',
      description: '控制系統內的自動化檢核與安全驗證規則',
      isEnabled: true,
      settings: {
        ybAgeLimit: 40,
        editPasswordRule: '西元生日 8 碼',
        requiredFields: ['name', 'mobile', 'birthday']
      }
    }
  ]);

  const toggleModule = (id: string) => {
    setConfigs(configs.map(c => c.id === id ? { ...c, isEnabled: !c.isEnabled } : c));
  };

  const handleUpdateSetting = (modId: string, key: string, value: any) => {
    setConfigs(configs.map(c => c.id === modId ? { 
      ...c, 
      settings: { ...c.settings, [key]: value } 
    } : c));
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/98 backdrop-blur-2xl flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-slate-900 px-10 py-8 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center space-x-6">
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter">系統模塊與檢核編輯頁</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Modular Function & Validation Config</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-800 rounded-full text-slate-400 transition-colors text-2xl">✕</button>
        </div>

        <div className="flex-1 p-10 overflow-y-auto bg-slate-50 space-y-8">
          {configs.map(mod => (
            <div key={mod.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 transition-all hover:shadow-xl">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-black text-slate-900">{mod.name}</h3>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${mod.isEnabled ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      {mod.isEnabled ? '運作中' : '已關閉'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-400">{mod.description}</p>
                </div>
                <button 
                  onClick={() => toggleModule(mod.id)}
                  className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${mod.isEnabled ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {mod.isEnabled ? '禁用模塊' : '啟用模塊'}
                </button>
              </div>

              {mod.isEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(mod.settings).map(([key, value]) => (
                    <div key={key} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{key}</label>
                      {typeof value === 'boolean' ? (
                        <button 
                          onClick={() => handleUpdateSetting(mod.id, key, !value)}
                          className={`w-full py-2.5 rounded-xl font-black text-xs transition-all ${value ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                        >
                          {value ? '開啟' : '關閉'}
                        </button>
                      ) : typeof value === 'number' ? (
                        <input 
                          type="number" 
                          value={value} 
                          onChange={(e) => handleUpdateSetting(mod.id, key, parseInt(e.target.value))}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-800"
                        />
                      ) : Array.isArray(value) ? (
                        <div className="flex flex-wrap gap-2">
                           {value.map((v, i) => <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600">{v}</span>)}
                           <button className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black">+</button>
                        </div>
                      ) : (
                        <input 
                          type="text" 
                          value={value} 
                          onChange={(e) => handleUpdateSetting(mod.id, key, e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-800"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white px-10 py-8 border-t border-slate-100 flex justify-end items-center space-x-4 shrink-0">
          <button onClick={onClose} className="px-8 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">取消修改</button>
          <button 
            onClick={() => { alert('系統模塊設定已儲存並同步至全局！'); onClose(); }}
            className="px-16 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-sm shadow-2xl hover:bg-black transition-all active:scale-95 shadow-slate-900/30"
          >
            儲存所有模塊變更
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemModuleEditor;
