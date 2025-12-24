
import React, { useState, useRef, useEffect } from 'react';
import { Member, MemberType, Chapter, AuthUser } from '../types';
import { compressImage } from '../utils/imageCompression';
import { GoogleGenAI, Type } from "@google/genai";

interface MemberEditorProps {
  member?: Member;
  user: AuthUser;
  initialScanMode?: boolean;
  onSave: (member: Member) => void;
  onCancel: () => void;
}

const EMPTY_MEMBER: Member = {
  id: '',
  name: '',
  chapter: '嘉義分會',
  type: MemberType.YB,
  joinDate: new Date().toISOString().split('T')[0],
  gender: '男',
};

const MemberEditor: React.FC<MemberEditorProps> = ({ member: initialData, user, initialScanMode = false, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Member>(
    initialData ? JSON.parse(JSON.stringify(initialData)) : { 
      ...EMPTY_MEMBER, 
      id: Date.now().toString(),
      chapter: user.managedChapter || '嘉義分會'
    }
  );
  
  const [isScanMode, setIsScanMode] = useState(initialScanMode);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isScanMode) startCamera();
    return () => stopCamera();
  }, [isScanMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('無法啟動相機，請檢查權限設定。');
      setIsScanMode(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    setStatusText('正在拍攝名片...');
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    const base64Data = base64Image.split(',')[1];
    
    stopCamera();
    
    try {
      setStatusText('AI 正在讀取名片資料...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
            { text: "這是一張名片。請提取以下資訊並以繁體中文 JSON 格式返回：姓名(name), 職稱(title), 公司名稱(company), 手機(mobile), 電子郵件(email), 公司地址(companyAddress)。如果找不到某欄位，請設為空字串。只返回 JSON。" }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      let jsonText = response.text || '{}';
      jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

      const extracted = JSON.parse(jsonText);
      setFormData(prev => ({
        ...prev,
        ...extracted,
        businessCardUrl: base64Image
      }));
      setIsScanMode(false);
    } catch (err) {
      console.error("單筆辨識錯誤:", err);
      alert('AI 辨識失敗。請確保 Vercel API_KEY 已設定且正確。');
      setIsScanMode(false);
    } finally {
      setIsProcessing(false);
      setStatusText('');
    }
  };

  const handleChange = (field: keyof Member, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none placeholder-slate-400";
  const labelClass = "block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="bg-slate-900 px-6 py-5 flex justify-between items-center text-white">
          <div>
            <h2 className="font-bold text-xl">{initialData ? '編輯會員資料' : '新增會員資料'}</h2>
            <p className="text-slate-400 text-xs mt-1">{isScanMode ? '名片掃描模式：請對準文字部分' : '手動填寫模式：請確認資料正確性'}</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-800 rounded-full transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50">
          {isScanMode ? (
            <div className="p-8 flex flex-col items-center">
              <div className="relative w-full max-w-xl aspect-[1.6/1] bg-black rounded-3xl overflow-hidden shadow-2xl border-8 border-slate-800">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-[30px] border-black/50 pointer-events-none">
                  <div className="w-full h-full border-2 border-blue-400 border-dashed rounded-xl flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-blue-600/50 px-3 py-1 rounded-full">請置入名片</span>
                  </div>
                </div>
                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p className="font-bold text-lg">{statusText}</p>
                  </div>
                )}
              </div>
              <div className="mt-8 flex space-x-4">
                <button onClick={() => setIsScanMode(false)} className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors">取消</button>
                <button onClick={captureAndProcess} disabled={isProcessing} className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">拍攝並解析</button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            <form id="memberForm" onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-8 items-start">
                 <div className="flex-shrink-0 group relative">
                    <img src={formData.avatarUrl || 'https://via.placeholder.com/150'} className="w-32 h-32 rounded-3xl object-cover border-4 border-slate-100 shadow-md" alt="Avatar" />
                    <button type="button" onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-slate-900/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">更換照片</button>
                    <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const res = await compressImage(file, { maxWidth: 500, quality: 0.7 });
                        handleChange('avatarUrl', res.base64);
                      }
                    }} />
                 </div>
                 
                 <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-1 md:col-span-2">
                       <label className={labelClass}>會員全名 *</label>
                       <input type="text" required value={formData.name} onChange={e => handleChange('name', e.target.value)} className={`${inputClass} text-lg font-bold py-4`} placeholder="例如：王小明" />
                    </div>
                    <div>
                       <label className={labelClass}>所屬分會</label>
                       <select value={formData.chapter} onChange={e => handleChange('chapter', e.target.value)} className={inputClass}>
                         <option value="嘉義分會">嘉義分會</option>
                         <option value="南投分會">南投分會</option>
                       </select>
                    </div>
                    <div>
                       <label className={labelClass}>會員類型</label>
                       <select value={formData.type} onChange={e => handleChange('type', e.target.value)} className={inputClass}>
                         <option value={MemberType.YB}>YB 青商</option>
                         <option value={MemberType.SENIOR}>特友會</option>
                       </select>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest flex items-center mb-2">
                  <span className="bg-blue-100 p-1.5 rounded-lg mr-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </span>
                  聯繫與商務資訊
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className={labelClass}>公司名稱</label>
                    <input type="text" value={formData.company || ''} onChange={e => handleChange('company', e.target.value)} className={inputClass} placeholder="任職公司或自有事業名稱" />
                  </div>
                  <div>
                    <label className={labelClass}>公司職稱</label>
                    <input type="text" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className={inputClass} placeholder="例如：董事長、總經理" />
                  </div>
                  <div>
                    <label className={labelClass}>手機號碼</label>
                    <input type="text" value={formData.mobile || ''} onChange={e => handleChange('mobile', e.target.value)} className={inputClass} placeholder="09XX-XXXXXX" />
                  </div>
                  <div>
                    <label className={`${labelClass} text-[#059669]`}>LINE ID</label>
                    <input type="text" value={formData.lineId || ''} onChange={e => handleChange('lineId', e.target.value)} className={`${inputClass} border-[#059669]/30 focus:ring-[#10b981] focus:border-[#10b981]`} placeholder="輸入 LINE ID" />
                  </div>
                  <div>
                    <label className={labelClass}>電子郵件</label>
                    <input type="email" value={formData.email || ''} onChange={e => handleChange('email', e.target.value)} className={inputClass} placeholder="example@mail.com" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                    <label className={labelClass}>入會日期</label>
                    <input type="date" value={formData.joinDate} onChange={e => handleChange('joinDate', e.target.value)} className={inputClass} />
                 </div>
                 <div>
                    <label className={labelClass}>會員生日</label>
                    <input type="date" value={formData.birthday || ''} onChange={e => handleChange('birthday', e.target.value)} className={inputClass} />
                 </div>
              </div>

              {formData.businessCardUrl && (
                <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200">
                  <label className={labelClass}>名片影像備份</label>
                  <img src={formData.businessCardUrl} className="w-full max-w-lg h-auto rounded-xl border border-white shadow-md mx-auto" alt="Business Card" />
                </div>
              )}
            </form>
          )}
        </div>

        {!isScanMode && (
          <div className="bg-white px-8 py-5 flex justify-between items-center border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button type="button" onClick={() => setIsScanMode(true)} className="text-blue-600 text-sm font-bold flex items-center hover:text-blue-800 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              重新拍攝
            </button>
            <div className="flex space-x-4">
              <button type="button" onClick={onCancel} className="px-6 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors">取消</button>
              <button type="submit" form="memberForm" className="px-10 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95">儲存</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberEditor;
