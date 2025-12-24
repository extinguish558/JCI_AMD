
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

  const parseExcelDate = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val.trim().replace(/\//g, '-');
    if (typeof val === 'number') {
      const date = new Date((val - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    return String(val);
  };

  const calculateMemberType = (birthday?: string): MemberType => {
    if (!birthday) return MemberType.YB;
    try {
      const bDate = new Date(birthday);
      if (isNaN(bDate.getTime())) return MemberType.YB;
      const currentYear = new Date().getFullYear();
      const birthYear = bDate.getFullYear();
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
        
        if (data.length === 0) throw new Error("Excel 檔案內沒有資料");
        setPreviewData(data);
      } catch (err: any) {
        setError(err.message || "解析 Excel 失敗");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = () => {
    try {
      const finalMembers: Member[] = previewData.map((item: any, idx: number) => {
        const name = item['姓名'] || item['name'];
        if (!name) return null;

        const birthday = parseExcelDate(item['生日'] || item['出生日期']);
        const memberType = calculateMemberType(birthday);

        return {
          id: `imp-${Date.now()}-${idx}`, 
          name: String(name).trim(),
          englishName: String(item['英文名'] || item['英文姓名'] || '').trim(),
          chapter: chapter,
          type: memberType,
          
          // 基本資料
          title: String(item['最高職稱'] || '').trim(),
          jciTitle: String(item['青商職務'] || item['職務'] || '').trim(), // 新增：映射青商職務
          joinDate: parseExcelDate(item['入會日期']) || new Date().toISOString().split('T')[0],
          birthday: birthday,
          gender: (item['性別'] === '女' ? '女' : '男') as '男' | '女',
          mobile: String(item['行動電話'] || item['手機'] || '').trim(),
          phone: String(item['電話'] || '').trim(),
          email: String(item['電子信箱'] || item['Email'] || '').trim(),
          address: String(item['地址'] || item['通訊地址'] || '').trim(),
          lineId: String(item['LINE ID'] || '').trim(),

          // 公司資料
          company: String(item['現職'] || item['公司名稱'] || '').trim(),
          companyPhone: String(item['公司電話'] || '').trim(),

          // 家庭與備註
          spouseName: String(item['夫人/姑爺'] || item['夫人'] || item['配偶姓名'] || '').trim(),
          remark: String(item['備註'] || '').trim(), // 新增：映射備註

          senatorId: String(item['參議會編號'] || '').trim(),
        } as Member;
      }).filter(Boolean) as Member[];

      onImport(finalMembers);
      onClose();
    } catch (err: any) {
      setError("資料轉換失敗：" + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
        <div className="bg-slate-900 px-10 py-8 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center">
            <div className="bg-green-600 p-4 rounded-2xl mr-5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m3.222.882a.5.5 0 01.222.418V19a2 2 0 002 2h10a2 2 0 002-2v-1.118a.5.5 0 01.222-.418L17.5 17.5" /></svg>
            </div>
            <div>
              <h2 className="font-black text-3xl tracking-tighter">JCI 名錄全欄位導入</h2>
              <p className="text-slate-400 text-sm mt-1">支援：青商職務、現職、夫人/姑爺、備註與完整通訊錄</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-800 rounded-full text-slate-400">✕</button>
        </div>

        <div className="flex-1 p-10 overflow-y-auto bg-slate-50">
          {previewData.length === 0 ? (
            <div onClick={() => fileInputRef.current?.click()} className="h-full flex flex-col items-center justify-center border-4 border-dashed border-slate-200 rounded-[3rem] bg-white cursor-pointer hover:border-blue-500 transition-all group">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-800">上傳 Excel 會員名錄</h3>
              <p className="text-slate-400 font-bold mt-2 text-center">系統將自動抓取：姓名、生日、電話、現職、職務、夫人/姑爺、備註</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-black text-sm">已讀取 {previewData.length} 筆資料</span>
                <button onClick={() => setPreviewData([])} className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors">重新更換檔案</button>
              </div>
              <div className="flex-1 overflow-auto rounded-[2rem] border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4 text-left">姓名</th>
                      <th className="px-6 py-4 text-left">青商職務</th>
                      <th className="px-6 py-4 text-left">現職</th>
                      <th className="px-6 py-4 text-left">夫人/姑爺</th>
                      <th className="px-6 py-4 text-left">備註</th>
                      <th className="px-6 py-4 text-left">類別</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {previewData.map((row, idx) => {
                      const bday = parseExcelDate(row['生日'] || row['出生日期']);
                      const type = calculateMemberType(bday);
                      return (
                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-6 py-3 font-black text-slate-900">{row['姓名'] || row['name']}</td>
                          <td className="px-6 py-3 text-xs text-blue-600 font-bold">{row['青商職務'] || row['職務'] || '-'}</td>
                          <td className="px-6 py-3 text-xs text-slate-500 truncate max-w-[120px]">{row['現職'] || row['公司'] || '-'}</td>
                          <td className="px-6 py-3 text-xs text-slate-600">{row['夫人/姑爺'] || row['夫人'] || '-'}</td>
                          <td className="px-6 py-3 text-[10px] text-slate-400 truncate max-w-[100px]">{row['備註'] || '-'}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-black ${type === MemberType.YB ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>{type}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white px-10 py-8 border-t border-slate-100 flex justify-end items-center gap-4 shrink-0">
          <button onClick={onClose} className="px-8 py-4 text-slate-400 font-bold hover:text-slate-900 transition-colors">取消</button>
          <button 
            onClick={handleConfirmImport} 
            className="px-16 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-2xl hover:bg-black transition-all"
          >
            確認並同步完整資料
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchImportModal;
