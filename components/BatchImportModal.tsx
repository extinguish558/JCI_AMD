
import React, { useState, useRef, useEffect } from 'react';
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Partial<Member>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 當預覽網址改變時，清除舊的網址釋放記憶體
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: file.type } },
            { text: `你是一位專業的名錄資料轉換專家。請從這份 PDF 或圖片中提取所有會員資訊。
            請根據系統要求的以下欄位精準填寫並返回繁體中文 JSON 陣列：
            
            1. name: 姓名 (必填)
            2. title: 最高職稱 (例如：總經理、負責人)
            3. company: 公司名稱
            4. mobile: 手機號碼 (格式 09xx-xxxxxx)
            5. phone: 電話
            6. fax: 傳真
            7. email: 電子信箱
            8. address: 住家地址
            9. joinDate: 入會日期 (YYYY-MM-DD)
            10. birthday: 會員生日 (YYYY-MM-DD)
            11. lineId: LINE ID
            12. companyAddress: 公司地址
            13. companyPhone: 公司電話
            14. companyFax: 公司傳真
            15. companyEmail: 公司信箱
            16. spouseName: 配偶或夫人姓名 (若有標註『夫人』字樣請填入此處)
            17. spouseBirthday: 配偶生日 (YYYY-MM-DD)
            18. senatorId: 參議會編號 (如果有)
            
            注意：如果是掃描檔，請盡力辨識。如果檔案是電子原生檔，請確保欄位對應正確。
            請為這頁面上的「每一位」會員建立一個物件。如果找不到該欄位，請設為空字串。` }
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
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                mobile: { type: Type.STRING },
                phone: { type: Type.STRING },
                fax: { type: Type.STRING },
                email: { type: Type.STRING },
                address: { type: Type.STRING },
                joinDate: { type: Type.STRING },
                birthday: { type: Type.STRING },
                lineId: { type: Type.STRING },
                companyAddress: { type: Type.STRING },
                companyPhone: { type: Type.STRING },
                companyFax: { type: Type.STRING },
                companyEmail: { type: Type.STRING },
                spouseName: { type: Type.STRING },
                spouseBirthday: { type: Type.STRING },
                senatorId: { type: Type.STRING }
              }
            }
          }
        }
      });

      const extracted = JSON.parse(response.text || '[]');
      setResults(extracted);
    } catch (err) {
      console.error(err);
      alert('辨識失敗。請確保您已在環境變數中設定 API_KEY，且檔案不超過 20MB。');
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
              <p className="text-slate-400 text-xs mt-1 font-bold">支援 PDF 直讀與智慧欄位自動對齊</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="flex-1 flex overflow-hidden bg-slate-50">
          {/* 左側：PDF/圖片 預覽區 */}
          <div className="w-1/2 p-6 border-r border-slate-200 flex flex-col">
            <h3 className="text-sm font-black text-slate-700 mb-4">檔案預覽</h3>
            <div className="flex-1 bg-slate-200 rounded-3xl overflow-hidden border-2 border-slate-200 relative">
              {file ? (
                file.type === 'application/pdf' ? (
                  <iframe src={previewUrl!} className="w-full h-full border-none" title="PDF Preview" />
                ) : (
                  <div className="w-full h-full p-4 flex items-center justify-center overflow-auto">
                    <img src={previewUrl!} className="max-w-full h-auto shadow-xl rounded-lg" alt="Preview" />
                  </div>
                )
              ) : (
                <div onClick={() => fileInputRef.current?.click()} className="h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <p className="font-black text-slate-600">點擊上傳名錄檔案</p>
                  <p className="text-xs text-slate-400 mt-1">PDF、JPG、PNG 均可</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
            </div>
          </div>

          {/* 右側：解析結果區 */}
          <div className="w-1/2 p-6 overflow-y-auto bg-white">
            <h3 className="text-sm font-black text-slate-700 mb-4">AI 識別結果 (分類填寫確認)</h3>
            
            {isProcessing ? (
              <div className="py-24 flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
                <h4 className="text-xl font-black text-slate-800 animate-pulse">正在精確匹配欄位...</h4>
                <p className="text-slate-500 font-bold mt-2 text-sm">正在從檔案結構中分離姓名、電話、地址與家屬資料</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((res, idx) => (
                  <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-black text-slate-900">{res.name}</span>
                      <span className="text-[10px] font-black bg-white px-2 py-1 rounded border border-slate-200 text-slate-400"># {idx + 1}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex"><span className="w-20 text-slate-400 font-bold">公司職稱:</span> <span className="text-slate-700">{res.company} / {res.title}</span></div>
                      <div className="flex"><span className="w-20 text-slate-400 font-bold">聯絡手機:</span> <span className="text-blue-600 font-bold">{res.mobile}</span></div>
                      <div className="flex"><span className="w-20 text-slate-400 font-bold">夫人姓名:</span> <span className="text-pink-500 font-bold">{res.spouseName || '無'}</span></div>
                      <div className="flex"><span className="w-20 text-slate-400 font-bold">住家地址:</span> <span className="text-slate-500 text-xs">{res.address}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center text-slate-300">
                <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                <p className="font-bold">尚未處理檔案</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white px-8 py-6 border-t border-slate-200 flex justify-between items-center">
          <div className="flex space-x-6 text-xs font-bold">
            <div><p className="text-slate-400">當前分會</p><p className="text-slate-900">{chapter}</p></div>
            <div><p className="text-slate-400">導入類型</p><p className="text-slate-900">{memberType}</p></div>
          </div>
          <div className="flex space-x-4">
            <button onClick={onClose} className="px-8 py-3 text-slate-500 font-bold">取消</button>
            {file && results.length === 0 && !isProcessing && (
              <button onClick={processFile} className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">執行 AI 智慧辨識</button>
            )}
            {results.length > 0 && (
              <button onClick={handleSaveAll} className="px-12 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-2xl hover:bg-black transition-all">匯入系統並儲存 ({results.length} 筆)</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchImportModal;
