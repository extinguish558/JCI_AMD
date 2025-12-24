
import React, { useState, useRef } from 'react';
import { Member, Chapter, MemberType } from '../types';
import * as XLSX from 'xlsx';

interface BatchImportModalProps {
  chapter: Chapter;
  onImport: (members: Member[]) => void;
  onClose: () => void;
}

const BatchImportModal: React.FC<BatchImportModalProps> = ({ chapter, onImport, onClose }) => {
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateMemberType = (birthday?: string): MemberType => {
    if (!birthday) return MemberType.YB;
    try {
      const birthDate = new Date(birthday);
      if (isNaN(birthDate.getTime())) return MemberType.YB;
      
      const currentYear = new Date().getFullYear();
      const birthYear = birthDate.getFullYear();
      
      // JCI 規範：滿 40 歲後之隔年轉為特友會，或是當年滿 40 歲為最後一年 YB
      return (currentYear - birthYear > 40) ? MemberType.SENIOR : MemberType.YB;
    } catch {
      return MemberType.YB;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          throw new Error("Excel 檔案內沒有資料");
        }
        setPreviewData(data);
      } catch (err: any) {
        setError(err.message || "解析 Excel 失敗，請確保格式正確");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = () => {
    try {
      const finalMembers: Member[] = previewData.map((item: any, idx: number) => {
        // 欄位映射邏輯 (根據您的 Excel 截圖優化)
        const name = item['姓名'] || item['name'] || '';
        if (!name) return null;

        const birthday = item['生日'] || item['birthday'] || '';
        const memberType = calculateMemberType(birthday);

        return {
          id: `imp-${Date.now()}-${idx}`,
          name: name,
          englishName: item['英文名'] || item['englishName'] || '',
          chapter: chapter,
          type: memberType,
          company: item['現職'] || item['公司'] || item['company'] || '',
          title: item['職稱'] || item['title'] || '',
          joinDate: item['入會日期'] || item['joinDate'] || new Date().toISOString().split('T')[0],
          birthday: birthday,
          mobile: item['行動電話'] || item['mobile'] || '',
          companyPhone: item['公司電話'] || item['companyPhone'] || '',
          email: item['電子信箱'] || item['email'] || '',
          address: item['地址'] || item['address'] || '',
        } as Member;
      }).filter(Boolean) as Member[];

      onImport(finalMembers);
      alert(`✅ 成功匯入 ${finalMembers.length} 筆資料！系統已根據年齡自動分類 YB 與 特友會。`);
      onClose();
    } catch (err: any) {
      setError("資料轉換失敗：" + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-white/20">
        
        <div className="bg-slate-900 px-10 py-8 flex justify-between items-center text-white">
          <div className="flex items-center">
            <div className="bg-green-600 p-4 rounded-2xl mr-5 shadow-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m3.222.882a.5.5 0 01.222.418V19a2 2 0 002 2h10a2 2 0 002-2v-1.118a.5.5 0 01.222-.418L17.5 17.5" /></svg>
            </div>
            <div>
              <h2 className="font-black text-3xl tracking-tighter">Excel 智慧匯入系統</h2>
              <p className="text-slate-400 text-sm mt-1 font-bold uppercase tracking-[0.2em]">Target: {chapter} · Auto YB/OB Detection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all">✕</button>
        </div>

        <div className="flex-1 p-10 overflow-y-auto bg-slate-50 flex flex-col gap-6">
          {previewData.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-slate-200 rounded-[3rem] bg-white cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls, .csv" className="hidden" />
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-800">選取 Excel 檔案 (.xlsx)</h3>
              <p className="text-slate-400 font-bold mt-2">系統將自動解析欄位，並根據生日判斷 YB 或 OB</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-slate-700">數據預覽 ({previewData.length} 筆)</h4>
                <button onClick={() => setPreviewData([])} className="text-xs font-black text-red-500 hover:underline">更換檔案</button>
              </div>
              <div className="flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-inner">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase">姓名</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase">現職</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase">生日</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase">預計分類</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {previewData.slice(0, 50).map((row, idx) => {
                      const bday = row['生日'] || row['birthday'];
                      const type = calculateMemberType(bday);
                      return (
                        <tr key={idx} className="text-xs">
                          <td className="px-4 py-3 font-bold text-slate-900">{row['姓名'] || row['name']}</td>
                          <td className="px-4 py-3 text-slate-500 truncate max-w-[200px]">{row['現職'] || row['company']}</td>
                          <td className="px-4 py-3 text-slate-500">{bday || '未填寫'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-md font-black text-[10px] ${type === MemberType.YB ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                              {type}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {previewData.length > 50 && <div className="p-4 text-center text-[10px] font-bold text-slate-400">... 及其他 {previewData.length - 50} 筆</div>}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-black animate-shake flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}
        </div>

        <div className="bg-white px-10 py-8 border-t border-slate-100 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Chapter</span>
            <span className="text-slate-900 font-black text-lg">{chapter}</span>
          </div>
          <div className="flex space-x-4">
            <button onClick={onClose} className="px-8 py-4 text-slate-500 font-black text-sm hover:text-slate-900 transition-colors">取消動作</button>
            <button 
              onClick={handleConfirmImport}
              disabled={isProcessing || previewData.length === 0}
              className="px-16 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-2xl transition-all active:scale-95 disabled:opacity-30 hover:bg-black"
            >
              {isProcessing ? '處理中...' : `確認匯入 ${previewData.length} 位會員`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchImportModal;
