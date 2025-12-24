
import React, { useState, useMemo, useRef } from 'react';
import { Member } from '../types';
import { compressImage } from '../utils/imageCompression';

interface BulkPhotoSyncProps {
  members: Member[];
  onUpdateMembers: (updates: Partial<Member>[]) => Promise<void>;
  onClose: () => void;
}

interface MatchResult {
  id: string; // 內部暫存用的隨記 ID
  fileName: string;
  matchedMemberId: string | null;
  memberName: string | null;
  base64: string;
  status: 'SUCCESS' | 'NOT_FOUND' | 'MANUAL';
}

const BulkPhotoSync: React.FC<BulkPhotoSyncProps> = ({ members, onUpdateMembers, onClose }) => {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectingIdx, setSelectingIdx] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingIdx, setReplacingIdx] = useState<number | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newResults: MatchResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rawName = file.name.split('.')[0];
      // 處理 嘉義_王小明 或 王小明 格式
      const nameParts = rawName.split('_');
      const targetName = nameParts.length > 1 ? nameParts[1] : nameParts[0];

      try {
        const compressed = await compressImage(file, { maxWidth: 300, quality: 0.7 });
        const matchedMember = members.find(m => m.name === targetName);

        newResults.push({
          id: `tmp-${Date.now()}-${i}`,
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
    // 清除 input 值以利重複選取
    e.target.value = '';
  };

  const handleReplaceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingIdx === null) return;

    try {
      const compressed = await compressImage(file, { maxWidth: 300, quality: 0.7 });
      setResults(prev => {
        const next = [...prev];
        next[replacingIdx] = {
          ...next[replacingIdx],
          fileName: file.name,
          base64: compressed.base64
        };
        return next;
      });
    } catch (err) {
      alert("圖片替換失敗");
    } finally {
      setReplacingIdx(null);
      e.target.value = '';
    }
  };

  const handleRemoveItem = (idx: number) => {
    setResults(prev => prev.filter((_, i) => i !== idx));
  };

  const handleManualMatch = (member: Member) => {
    if (selectingIdx === null) return;
    
    setResults(prev => {
      const next = [...prev];
      next[selectingIdx] = {
        ...next[selectingIdx],
        matchedMemberId: member.id,
        memberName: member.name,
        status: 'MANUAL'
      };
      return next;
    });
    setSelectingIdx(null);
    setSearchTerm('');
  };

  const handleConfirmSync = async () => {
    const validUpdates = results
      .filter(r => (r.status === 'SUCCESS' || r.status === 'MANUAL') && r.matchedMemberId)
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

  const candidateMembers = useMemo(() => {
    // 過濾掉已經在本次批次中分配掉的人，避免一張照片配兩個人（除非手動改）
    const alreadyMatchedIds = new Set(results.map(r => r.matchedMemberId).filter(Boolean));
    return members
      .filter(m => !alreadyMatchedIds.has(m.id))
      .filter(m => m.name.includes(searchTerm) || m.company?.includes(searchTerm));
  }, [members, results, searchTerm]);

  const successCount = results.filter(r => r.status === 'SUCCESS' || r.status === 'MANUAL').length;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4">
      <input type="file" ref={replaceInputRef} className="hidden" accept="image/*" onChange={handleReplaceImage} />
      
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden border border-white/20 relative">
        
        {/* 手動選擇會員彈窗 */}
        {selectingIdx !== null && (
          <div className="absolute inset-0 z-20 bg-white/98 backdrop-blur-md flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-2xl font-black text-slate-900">選擇正確對應會員</h3>
                <p className="text-slate-500 font-bold text-sm">正在為檔案「{results[selectingIdx].fileName}」尋找主人</p>
              </div>
              <button onClick={() => setSelectingIdx(null)} className="p-4 hover:bg-slate-200 rounded-full transition-colors font-black text-slate-400">關閉</button>
            </div>
            <div className="p-8 flex-1 flex flex-col min-h-0">
              <div className="relative mb-6">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="輸入姓名、職稱或公司搜尋..." 
                  className="w-full px-14 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <svg className="w-5 h-5 absolute left-5 top-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto flex-1 pb-10">
                {candidateMembers.map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => handleManualMatch(m)}
                    className="flex flex-col items-center p-4 border-2 border-slate-100 rounded-[2rem] hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 mb-3 overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                      {m.avatarUrl ? <img src={m.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-300 bg-slate-100">JCI</div>}
                    </div>
                    <div className="font-black text-slate-900 text-sm group-hover:text-blue-600">{m.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-1 truncate w-full">{m.company || '現職未填'}</div>
                  </button>
                ))}
                {candidateMembers.length === 0 && (
                  <div className="col-span-full py-20 text-center flex flex-col items-center">
                    <div className="text-4xl mb-4">💨</div>
                    <p className="text-slate-400 font-bold">找不到符合條件且尚未分配照片的會員</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-900 px-10 py-8 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center">
            <div className="bg-blue-600 p-4 rounded-2xl mr-5 shadow-xl">
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
              <label htmlFor="bulk-photo-input" className="cursor-pointer flex flex-col items-center p-20 w-full">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-800">選取或拖入會員照片</h3>
                <p className="text-slate-500 font-bold mt-3 text-center">推薦格式：<span className="text-blue-600">王小明.png</span> 或 <span className="text-blue-600">嘉義_陳大天.jpg</span></p>
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-20">
              {results.map((res, idx) => (
                <div key={res.id} className={`group relative p-3 rounded-[2rem] border-2 transition-all flex flex-col h-full ${
                  res.status === 'SUCCESS' ? 'border-green-100 bg-white' : 
                  res.status === 'MANUAL' ? 'border-blue-100 bg-white' :
                  'border-red-100 bg-red-50/20'
                }`}>
                  {/* 照片操作按鈕（懸浮顯示） */}
                  <div className="absolute top-5 right-5 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      title="更換圖片檔"
                      onClick={() => { setReplacingIdx(idx); replaceInputRef.current?.click(); }}
                      className="bg-blue-600 text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                    <button 
                      title="移除此項"
                      onClick={() => handleRemoveItem(idx)}
                      className="bg-red-500 text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>

                  <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl shadow-sm border border-slate-100 bg-slate-50">
                    <img src={res.base64} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    {res.status !== 'NOT_FOUND' && (
                      <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 px-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate mb-1" title={res.fileName}>{res.fileName}</div>
                    <div className={`text-sm font-black truncate mb-3 ${
                      res.status === 'SUCCESS' ? 'text-green-600' : 
                      res.status === 'MANUAL' ? 'text-blue-600' : 'text-red-500'
                    }`}>
                      {res.status === 'SUCCESS' ? `✅ ${res.memberName}` : 
                       res.status === 'MANUAL' ? `🔵 手動：${res.memberName}` : '❌ 找不到對應'}
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectingIdx(idx)}
                    className={`w-full py-2.5 rounded-xl text-[11px] font-black transition-all ${
                      res.status === 'NOT_FOUND' 
                        ? 'bg-red-100 text-red-600 hover:bg-red-500 hover:text-white' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {res.status === 'NOT_FOUND' ? '手動對應會員' : '變更主人'}
                  </button>
                </div>
              ))}
              
              {/* 繼續新增按鈕 */}
              <label htmlFor="bulk-photo-input-more" className="border-4 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all aspect-square group">
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" id="bulk-photo-input-more" />
                <div className="bg-slate-100 text-slate-400 p-4 rounded-2xl group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <span className="text-xs font-black text-slate-400 mt-3 group-hover:text-blue-600 transition-colors">繼續添加照片</span>
              </label>
            </div>
          )}
        </div>

        <div className="bg-white px-10 py-8 border-t border-slate-100 flex justify-between items-center shrink-0 shadow-inner">
          <div className="flex space-x-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">已就緒</span>
              <span className="text-green-600 font-black text-xl">{successCount} 位</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">待處理</span>
              <span className="text-red-500 font-black text-xl">{results.length - successCount} 張</span>
            </div>
          </div>
          
          <div className="flex space-x-4">
            {results.length > 0 && (
              <button 
                onClick={() => { if(confirm('確定清除所有匯入的照片？')) setResults([]); }} 
                className="px-6 py-4 text-red-500 font-black text-sm hover:bg-red-50 rounded-2xl transition-all"
              >
                重置清單
              </button>
            )}
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
