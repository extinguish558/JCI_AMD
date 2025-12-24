
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Member, Chapter, MemberType } from '../types';

interface BatchImportModalProps {
  chapter: Chapter;
  memberType: MemberType;
  onImport: (members: Member[]) => void;
  onClose: () => void;
}

const BatchImportModal: React.FC<BatchImportModalProps> = ({ chapter, memberType, onImport, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Partial<Member>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

  const processFile = async () => {
    if (!file) return;
    
    // 檢查 API KEY 是否存在
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      alert('錯誤：找不到 API_KEY。\n\n請檢查 Vercel 環境變數名稱是否「完全符合」大寫的 API_KEY，而非 CLIENT_KEY_。');
      return;
    }

    setIsProcessing(true);

    try {
      const reader = new FileReader();
      const base64DataPromise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      const base64Data = await base64DataPromise;
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview", 
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: file.type } },
            { text: `你是一位專業的名錄資料轉換專家。請從這份檔案中提取所有會員資訊。
            請根據系統要求的以下欄位精準填寫並返回繁體中文 JSON 陣列：
            
            1. name: 姓名
            2. title: 最高職稱
            3. company: 公司名稱
            4. mobile: 手機號碼 (09xx-xxxxxx)
            5. lineId: LINE ID
            6. joinDate: 入會日期 (YYYY-MM-DD)
            7. birthday: 會員生日 (YYYY-MM-DD)
            8. companyAddress: 公司地址
            9. spouseName: 配偶姓名
            10. senatorId: 參議會編號
            
            請為每一位會員建立一個物件。只返回純 JSON 陣列，不要包含 Markdown 標記 (如 \`\`\`json)。` }
          ]
        },
        config: {
          responseMimeType: "application/json",
        }
      });

      // 清理可能出現的 Markdown 或額外字元
      let jsonText = response.text || '[]';
      jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const extracted = JSON.parse(jsonText);
      setResults(Array.isArray(extracted) ? extracted : []);
      
    } catch (err: any) {
      console.error("AI 辨識錯誤:", err);
      const errorMsg = err?.message || '';
      if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('403')) {
        alert('API 金鑰無效，請檢查金鑰內容是否複製正確。');
      } else {
        alert('辨識失敗。\n\n請確認：\n1. Vercel 變數名稱是 API_KEY。\n2. 檔案是否小於 20MB。\n3. 是否已點擊 Redeploy 讓變數生效。');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAll = () => {
    const finalMembers: Member[] = results.map(r => ({
      ...r,
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chapter,
      type: memberType,
      name: r.name || '未命名',
      joinDate: r.joinDate || new Date().toISOString().split('T')[0],
    } as Member));
    onImport(finalMembers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="bg-slate-900 px-8 py-6 flex justify-between items-center text-white">
          <div className="flex items-center">
            <div className="bg-blue-600 p-3 rounded-2xl mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h2 className="font-black text-2xl">批量 AI 解析填寫</h2>
              <p className="text-slate-400 text-xs mt-1 font-bold tracking-widest uppercase">High Performance Mode</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">✕</button>
        </div>

        <div className="flex-1 flex overflow-hidden bg-slate-50">
          <div className="w-1/2 p-6 border-r border-slate-200 flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 mb-4 tracking-widest uppercase">Source Preview</h3>
            <div className="flex-1 bg-slate-200 rounded-3xl overflow-hidden border-2 border-slate-200 relative shadow-inner">
              {file ? (
                file.type === 'application/pdf' ? (
                  <iframe src={previewUrl!} className="w-full h-full border-none" title="PDF Preview" />
                ) : (
                  <div className="w-full h-full p-4 flex items-center justify-center overflow-auto">
                    <img src={previewUrl!} className="max-w-full h-auto shadow-2xl rounded-lg" alt="Preview" />
                  </div>
                )
              ) : (
                <div onClick={() => fileInputRef.current?.click()} className="h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors group">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <p className="font-black text-slate-600 text-lg">點擊上傳名錄檔案</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest">Supports PDF / JPG / PNG</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
            </div>
          </div>

          <div className="w-1/2 p-6 overflow-y-auto bg-white">
            <h3 className="text-[10px] font-black text-slate-400 mb-4 tracking-widest uppercase">AI Extraction Result</h3>
            
            {isProcessing ? (
              <div className="py-32 flex flex-col items-center">
                <div className="relative mb-8">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600/20 border-t-blue-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                  </div>
                </div>
                <h4 className="text-2xl font-black text-slate-800 tracking-tight">AI 正在深度掃描名錄...</h4>
                <p className="text-slate-500 font-bold mt-3 text-sm">正自動匹配姓名、手機與公司資訊</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((res, idx) => (
                  <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-3 shadow-sm text-slate-400 font-black text-xs border border-slate-100">{idx + 1}</div>
                        <span className="text-xl font-black text-slate-900">{res.name}</span>
                      </div>
                      {res.mobile && <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-lg shadow-blue-500/20">READY</span>}
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex bg-white/50 p-3 rounded-xl border border-slate-100">
                        <span className="w-20 text-slate-400 font-black text-[10px] uppercase pt-1">Company</span> 
                        <span className="text-slate-700 font-bold">{res.company || '未知公司'} {res.title}</span>
                      </div>
                      <div className="flex bg-white/50 p-3 rounded-xl border border-slate-100">
                        <span className="w-20 text-slate-400 font-black text-[10px] uppercase pt-1">Mobile</span> 
                        <span className="text-blue-600 font-black tracking-wider">{res.mobile || '未偵測到手機'}</span>
                      </div>
                      {res.spouseName && (
                        <div className="flex bg-pink-50 p-3 rounded-xl border border-pink-100">
                          <span className="w-20 text-pink-400 font-black text-[10px] uppercase pt-1">Family</span> 
                          <span className="text-pink-600 font-black">配偶：{res.spouseName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-40 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                </div>
                <p className="font-black text-slate-300 text-lg">等待處理檔案中...</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white px-8 py-6 border-t border-slate-200 flex justify-between items-center">
          <div className="flex space-x-8">
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Association</span>
               <span className="text-sm font-black text-slate-900">{chapter}</span>
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Group</span>
               <span className="text-sm font-black text-slate-900">{memberType}</span>
             </div>
          </div>
          <div className="flex space-x-4">
            <button onClick={onClose} className="px-8 py-3 text-slate-500 font-black text-sm hover:text-slate-800 transition-colors">取消</button>
            {file && results.length === 0 && !isProcessing && (
              <button onClick={processFile} className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 transition-all active:scale-95">執行 AI 智慧辨識</button>
            )}
            {results.length > 0 && (
              <button onClick={handleSaveAll} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-2xl hover:bg-black hover:scale-105 transition-all active:scale-95">確定匯入 {results.length} 筆資料</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchImportModal;
