
import React, { useState, useCallback } from 'react';
import { Member } from '../types';
import { compressImage } from '../utils/imageCompression';

interface BulkPhotoSyncProps {
  members: Member[];
  onUpdateMembers: (updates: Partial<Member>[]) => Promise<void>;
  onClose: () => void;
}

interface MatchResult {
  fileName: string;
  matchedMemberId: string | null;
  memberName: string | null;
  base64: string;
  status: 'SUCCESS' | 'NOT_FOUND' | 'PENDING';
}

const BulkPhotoSync: React.FC<BulkPhotoSyncProps> = ({ members, onUpdateMembers, onClose }) => {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newResults: MatchResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // 解析檔名：移除副檔名，並嘗試分割「分會_姓名」
      const rawName = file.name.split('.')[0];
      const nameParts = rawName.split('_');
      const targetName = nameParts.length > 1 ? nameParts[1] : nameParts[0];

      // 壓縮圖片
      try {
        const compressed = await compressImage(file, { maxWidth: 300, quality: 0.7 });
        
        // 尋找匹配的會員
        const matchedMember = members.find(m => m.name === targetName);

        newResults.push({
          fileName: file.name,
          matchedMemberId: matchedMember?.id || null,
          memberName: matchedMember?.name || null,
          base64: compressed.base64,
          status: matchedMember ? 'SUCCESS' : 'NOT_FOUND'
        });
      } catch (err) {
        console.error(`處理 ${file.name} 失敗`, err);
      }
    }

    setResults(prev => [...prev, ...newResults]);
    setIsProcessing(false);
  };

  const handleConfirmSync = async () => {
    const validUpdates = results
      .filter(r => r.status === 'SUCCESS' && r.matchedMemberId)
      .map(r => ({
        id: r.matchedMemberId as string,
        avatarUrl: r.base64
      }));

    if (validUpdates.length === 0) return;

    setIsProcessing(true);
    await onUpdateMembers(validUpdates);
    alert(`🎉 同步完成！已更新 ${validUpdates.length} 位會員的照片。`);
    onClose();
  };

  const successCount = results.filter(r => r.status === 'SUCCESS').length;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-white/20">
        
        <div className="bg-slate-900 px-10 py-8 flex justify-between items-center text-white">
          <div className="flex items-center">
            <div className="bg-blue-600 p-4 rounded-2xl mr-5 shadow-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h2 className="font-black text-3xl tracking-tighter">照片智能同步中心</h2>
              <p className="text-slate-400 text-sm mt-1 font-bold uppercase tracking-[0.2em]">Smart Filename Matcher</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all">✕</button>
        </div>

        <div className="flex-1 p-10 overflow-y-auto bg-slate-50">
          {results.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center border-4 border-dashed border-slate-200 rounded-[3rem] bg-white group hover:border-blue-400 transition-all">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileSelect}
                className="hidden" 
                id="bulk-photo-input"
              />
              <label htmlFor="bulk-photo-input" className="cursor-pointer flex flex-col items-center">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-800">選取或拖入照片檔案</h3>
                <p className="text-slate-500 font-bold mt-3 text-center px-10">檔名建議格式：<span className="text-blue-600">嘉義_王小明.png</span> 或 <span className="text-blue-600">王小明.jpg</span><br/>系統將根據姓名自動對應會員資料</p>
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {results.map((res, idx) => (
                <div key={idx} className={`relative p-3 rounded-3xl border-2 transition-all ${res.status === 'SUCCESS' ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30 opacity-60'}`}>
                  <img src={res.base64} className="w-full aspect-square object-cover rounded-2xl shadow-sm mb-3" />
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate mb-1">{res.fileName}</div>
                  <div className={`text-xs font-black truncate ${res.status === 'SUCCESS' ? 'text-green-600' : 'text-red-500'}`}>
                    {res.status === 'SUCCESS' ? `✅ 已匹配：${res.memberName}` : '❌ 找不到此會員'}
                  </div>
                  {res.status === 'SUCCESS' && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
              ))}
              <label htmlFor="bulk-photo-input-more" className="border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all aspect-square">
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" id="bulk-photo-input-more" />
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span className="text-[10px] font-black text-slate-500 mt-2 uppercase">繼續添加</span>
              </label>
            </div>
          )}
        </div>

        <div className="bg-white px-10 py-8 border-t border-slate-100 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matched Records</span>
            <span className="text-slate-900 font-black text-lg">{successCount} / {results.length} 檔案就緒</span>
          </div>
          <div className="flex space-x-4">
            <button onClick={() => setResults([])} className="px-6 py-4 text-slate-400 font-black text-sm hover:text-red-500 transition-colors">重置所有</button>
            <button onClick={onClose} className="px-6 py-4 text-slate-500 font-black text-sm hover:text-slate-900 transition-colors">取消動作</button>
            <button 
              onClick={handleConfirmSync}
              disabled={isProcessing || successCount === 0}
              className="px-16 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-2xl transition-all active:scale-95 disabled:opacity-30 hover:bg-blue-700 shadow-blue-500/20"
            >
              {isProcessing ? '同步中...' : `立即更新 ${successCount} 位會員`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkPhotoSync;
