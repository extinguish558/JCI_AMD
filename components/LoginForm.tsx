import React, { useState } from 'react';
import { AuthUser } from '../types';

interface LoginFormProps {
  onLogin: (user: AuthUser) => void;
  onCancel: () => void;
}

const MOCK_USERS: Record<string, { password: string; user: AuthUser }> = {
  '000': {
    password: '000',
    user: { username: '000', name: '最高管理員', role: 'SUPER_ADMIN' }
  },
  'admin': {
    password: 'password',
    user: { username: 'admin', name: '系統總管理員', role: 'SUPER_ADMIN' }
  },
  'chiayi': {
    password: '123',
    user: { username: 'chiayi', name: '嘉義分會秘書處', role: 'CHAPTER_ADMIN', managedChapter: '嘉義分會' }
  },
  'nantou': {
    password: '123',
    user: { username: 'nantou', name: '南投分會秘書處', role: 'CHAPTER_ADMIN', managedChapter: '南投分會' }
  }
};

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = MOCK_USERS[username];
    
    if (account && account.password === password) {
      onLogin(account.user);
    } else {
      setError('帳號或密碼錯誤');
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all text-slate-900 font-medium placeholder-slate-400";
  const labelClass = "block text-sm font-bold text-slate-700 mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-slate-900 px-8 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-white font-black text-xl tracking-tight">後台登入</h2>
            <p className="text-slate-400 text-[10px] uppercase font-bold mt-1 tracking-widest">Management System</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-100 flex items-center animate-shake">
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="font-bold">{error}</span>
            </div>
          )}

          <div>
            <label className={labelClass}>帳號 (Username)</label>
            <input 
              type="text" 
              required
              className={inputClass}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="請輸入後台帳號"
            />
          </div>

          <div>
            <label className={labelClass}>密碼 (Password)</label>
            <input 
              type="password" 
              required
              className={inputClass}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="請輸入密碼"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98]"
            >
              進入管理後台
            </button>
          </div>
          
          <div className="text-[11px] text-slate-400 text-center mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
             預設帳號: <span className="font-black text-slate-700">000</span> / 密碼: <span className="font-black text-slate-700">000</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;