
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Member, Chapter, MemberType } from '../types';
import { exportToCSV } from '../utils/exportUtils';

interface BatchImportModalProps {
  chapter: Chapter;
  memberType: MemberType;
  onImport: (members: Member[]) => void;
  onClose: () => void;
}

const BatchImportModal: React.FC<BatchImportModalProps> = ({ chapter, memberType, onImport, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Partial<Member>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const processFile = async () => {
    if (!preview) return;
    setIsProcessing(true);
    const base64Data = preview.split(',')[1];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: file?.type || "image/jpeg" } },
            { text: `你是一位專業的資料錄入員。請辨識這張會員名錄圖片中的所有會員。
            圖片中每個方塊代表一位會員。請提取以下資訊：
            - name: 姓名
            - spouseName: 夫人/配偶姓名
            - joinDate: 入會日期 (請轉為 YYYY-MM-DD)
            - birthday: 生日 (請轉為 YYYY-MM-DD)
            - title: 現職/職稱
            - company: 現職公司名稱
            - phone: 電話
            - mobile: 行動電話
            - address: 地址
            - email: 電子信箱
            請以繁體中文 JSON 陣列格式返回。如果欄位不存在請設為空字串。` }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                spouseName: { type: Type.STRING },
                joinDate: { type: Type.STRING },
                birthday: { type: Type.STRING },
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                phone: { type: Type.STRING },
                mobile: { type: Type.STRING },
                address: { type: Type.STRING },
                email: { type: Type.STRING }
              }
            }
          }
        }
      });

      const extracted = JSON.parse(response.text || '[]');
      setResults(extracted);
    } catch (err) {
      console.error(err);
      alert('辨識過程中發生錯誤，請確認檔案格式是否正確。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAll = () => {
    const finalMembers: Member[] = results.map(r => ({
      ...r,
      id: `ai-${Date.now()}-${Math.random()}`,
      chapter,
      type: memberType,
      name: r.name || '未命名',
      joinDate: r.joinDate || new Date().toISOString().split('T')[0],
    } as Member));
    onImport(finalMembers);
    onClose();
  };

  const handleExport = () => {
    exportToCSV(results, `AI辨識結果_${new Date().toLocaleDateString()}.csv`);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="bg-slate-900 px-8 py-6 flex justify-between items-center text-white">
          <div>
            <h2 className="font-black text-2xl flex items-center">
              <span className="bg-blue-600 p-2 rounded-xl mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </span>
              AI 批量檔案自動辨識
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-bold">支援 PDF 截圖、照片、掃描檔自動擷取</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-full transition-colors">✕</button>
        </div>

        <div className="flex-1 flex overflow-hidden bg-slate-50">
          {/* Left: Upload & Preview */}
          <div className="w-1/2 p-8 border-r border-slate-200 overflow-y-auto">
            {!preview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-full border-4 border-dashed border-slate-300 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <p className="text-xl font-black text-slate-700">點擊或拖曳檔案至此</p>
                <p className="text-sm text-slate-400 font-bold mt-2">支援 JPG, PNG, PDF 格式</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
            ) : (
              <div className="relative">
                <img src={preview} className="w-full rounded-2xl shadow-lg border border-slate-300" alt="Preview" />
                <button onClick={() => {setPreview(null); setResults([]);}} className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-xl hover:bg-red-700 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                {!isProcessing && results.length === 0 && (
                  <button onClick={processFile} className="mt-8 w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all">
                    開始 AI 自動辨識
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Results Review */}
          <div className="w-1/2 p-8 overflow-y-auto">
            {isProcessing ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-blue-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-blue-600">AI</div>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mt-8 animate-pulse">正在深度辨識名錄資料...</h3>
                <p className="text-slate-500 font-bold mt-2">擷取姓名、職稱、聯繫方式中</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-800 flex items-center">
                    辨識結果清單
                    <span className="ml-3 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">已擷取 {results.length} 名會員</span>
                  </h3>
                  <button onClick={handleExport} className="text-blue-600 text-sm font-black flex items-center hover:underline">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    下載為 CSV 檔
                  </button>
                </div>
                <div className="space-y-4">
                  {results.map((res, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-black text-lg text-slate-900">{res.name || '辨識失敗'}</div>
                        <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">Row {idx + 1}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <div className="text-slate-500 font-bold flex"><span className="w-12">職稱:</span> <span className="text-slate-900">{res.title || res.company || '---'}</span></div>
                        <div className="text-slate-500 font-bold flex"><span className="w-12">手機:</span> <span className="text-slate-900">{res.mobile || '---'}</span></div>
                        <div className="text-slate-500 font-bold flex"><span className="w-12">入會:</span> <span className="text-slate-900">{res.joinDate || '---'}</span></div>
                        <div className="text-slate-500 font-bold flex"><span className="w-12">生日:</span> <span className="text-slate-900">{res.birthday || '---'}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="font-black">尚未開始辨識</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 flex justify-between items-center">
          <p className="text-sm text-slate-500 font-bold">
            辨識目標分會：<span className="text-slate-900">{chapter}</span> | 類別：<span className="text-slate-900">{memberType}</span>
          </p>
          <div className="flex space-x-4">
            <button onClick={onClose} className="px-8 py-3 text-slate-600 font-bold hover:text-slate-900">取消</button>
            <button 
              disabled={results.length === 0 || isProcessing}
              onClick={handleSaveAll}
              className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all disabled:opacity-30"
            >
              確認並導入系統
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchImportModal;
