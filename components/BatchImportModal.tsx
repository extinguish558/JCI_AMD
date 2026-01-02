
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
    if (typeof val === 'string') {
      const cleaned = val.trim().replace(/\//g, '-');
      return cleaned;
    }
    if (typeof val === 'number') {
      const date = new Date((val - 25569) * 86400 * 1000);
      if (isNaN(date.getTime())) return String(val);
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
      return (currentYear - birthYear >= 40) ? MemberType.SENIOR : MemberType.YB;
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
        const name = item['姓名'] || item['name'] || item['會員姓名'] || item['姓名'];
        if (!name) return null;

        const birthday = parseExcelDate(item['生日'] || item['出生日期']);
        const memberType = calculateMemberType(birthday);
        
        // 智慧解析現職與職稱
        const occupation = String(item['現職'] || '').trim();
        let company = occupation;
        let title = '';
        if (occupation.includes(' ')) {
          const parts = occupation.split(/\s+/);
          title = parts.pop() || '';
          company = parts.join(' ');
        } else if (occupation.includes('　')) {
          const parts = occupation.split('　');
          title = parts.pop() || '';
          company = parts.join(' ');
        }

        return {
          id: `imp-${Date.now()}-${idx}`, 
          memberCode: String(item['編號'] || item['會員編號'] || '').trim(),
          name: String(name).trim(),
          englishName: String(item['英文名'] || item['英文姓名'] || '').trim(),
          chapter: chapter,
          type: (item['類別'] === '特友會' || item['類別'] === 'SENIOR' || item['類別'] === '特友') ? MemberType.SENIOR : memberType,
          
          title: title || String(item['職稱'] || '').trim(),
          jciTitle: String(item['青商職務'] || '').trim(),
          joinDate: parseExcelDate(item['入會'] || item['入會日期'] || item['入會日']) || new Date().toISOString().split('T')[0],
          birthday: birthday,
          gender: (item['性別'] === '女' ? '女' : '男') as '男' | '女',
          
          mobile: String(item['行動'] || item['行動電話'] || item['手機'] || item['行動電話'] || '').trim(),
          phone: String(item['電話'] || '').trim(),
          homePhone: String(item['住宅電話'] || item['住家電話'] || '').trim(),
          fax: String(item['傳真'] || '').trim(),
          email: String(item['電子信箱'] || item['Email'] || '').trim(),
          address: String(item['地址'] || item['住址'] || '').trim(),
          lineId: String(item['LINE'] || item['Line ID'] || '').trim(),

          company: company,
          companyPhone: String(item['公司電話'] || '').trim(),
          companyAddress: String(item['公司地址'] || ''),

          spouseName: String(item['夫人/站爺'] || item['夫人/姑爺'] || item['配偶姓名'] || '').trim(),
          remark: String(item['備註'] || '').trim(),
          senatorId: String(item['參議'] || item['參議員編號'] || item['參號'] || '').trim(),
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
      <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-slate-900 px-12 py-10 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center">
            <div className="bg-green-600 p-5 rounded-3xl mr-6 shadow-xl shadow-green-600/20">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m3.222.882a.5.5 0 01.222.418V19a2 2 0 002 2h10a2 2 0 002-2v-1.118a.5.5 0 01.222-.418L17.5 17.5" /></svg>
            </div>
            <div>
              <h2 className="font-black text-4xl tracking-tighter text-white">Excel 全方位名錄導入</h2>
              <p className="text-slate-400 text-sm mt-1 font-bold uppercase tracking-widest">支援 15+ 項 Excel 原生欄位智慧對應</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-800 rounded-full text-slate-400 text-3xl">✕</button>
        </div>

        <div className="flex-1 p-12 overflow-y-auto bg-slate-50">
          {previewData.length === 0 ? (
            <div onClick={() => fileInputRef.current?.click()} className="h-full flex flex-col items-center justify-center border-4 border-dashed border-slate-200 rounded-[4rem] bg-white cursor-pointer hover:border-blue-500 transition-all group">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">拖曳或點擊上傳原始 Excel</h3>
              <p className="text-slate-400 font-bold mt-3 text-center">自動對應：英文名、夫人/站爺、傳真、住家電話等欄位</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                  <span className="bg-blue-600 text-white px-6 py-2 rounded-2xl font-black text-xs shadow-lg">偵測到 {previewData.length} 筆有效資料</span>
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">正在進行導入預覽...</span>
                </div>
                <button onClick={() => setPreviewData([])} className="text-xs font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">更換檔案</button>
              </div>
              <div className="flex-1 overflow-auto rounded-[3rem] border border-slate-200 bg-white shadow-inner">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-5 text-left">編號 / 會員</th>
                      <th className="px-8 py-5 text-left">英文名 / 夫人站爺</th>
                      <th className="px-8 py-5 text-left">現職資訊</th>
                      <th className="px-8 py-5 text-left">主要聯繫</th>
                      <th className="px-8 py-5 text-left">通訊地址</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-8 py-4">
                           <div className="text-[10px] font-black text-blue-500 mb-1">{row['編號'] || row['會員編號'] || '-'}</div>
                           <div className="font-black text-slate-900">{row['姓名'] || row['name'] || row['會員姓名']}</div>
                        </td>
                        <td className="px-8 py-4">
                           <div className="text-[11px] text-slate-900 font-black uppercase tracking-tight">{row['英文名'] || row['英文姓名'] || '-'}</div>
                           <div className="text-[10px] text-slate-400 font-bold mt-1">配偶：{row['夫人/站爺'] || row['夫人/姑爺'] || '-'}</div>
                        </td>
                        <td className="px-8 py-4">
                           <div className="text-xs text-slate-800 font-black truncate max-w-[180px]">{row['現職'] || '-'}</div>
                           <div className="text-[10px] text-slate-400 mt-1 font-bold">公司：{row['公司電話'] || '-'}</div>
                        </td>
                        <td className="px-8 py-4">
                           <div className="text-[11px] text-slate-900 font-black">{row['行動'] || row['手機'] || '-'}</div>
                           <div className="text-[10px] text-slate-400 mt-1 font-bold">住：{row['住家電話'] || row['住宅電話'] || '-'} / 傳：{row['傳真'] || '-'}</div>
                        </td>
                        <td className="px-8 py-4 text-[10px] text-slate-500 font-bold truncate max-w-[250px]">{row['地址'] || row['住址'] || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white px-12 py-10 border-t border-slate-100 flex justify-end items-center gap-6 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <button onClick={onClose} className="px-10 py-5 text-slate-400 font-black text-xs hover:text-slate-900 transition-colors uppercase tracking-widest">取消導入</button>
          <button 
            onClick={handleConfirmImport} 
            disabled={previewData.length === 0}
            className="px-20 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm shadow-2xl hover:bg-black transition-all disabled:opacity-30 transform active:scale-95"
          >
            確認並完成數據同步
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchImportModal;
