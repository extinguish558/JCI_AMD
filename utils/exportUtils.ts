
import { Member } from '../types';

export const exportToCSV = (members: Partial<Member>[], filename: string) => {
  const headers = [
    '姓名', '職稱/現職', '公司', '入會日期', '生日', '手機', '電話', '電子郵件', '地址', 'LINE_ID', '配偶姓名'
  ];
  
  const rows = members.map(m => [
    m.name || '',
    m.title || '',
    m.company || '',
    m.joinDate || '',
    m.birthday || '',
    m.mobile || '',
    m.phone || '',
    m.email || '',
    m.companyAddress || m.address || '',
    m.lineId || '',
    m.spouseName || ''
  ]);

  const csvContent = "\uFEFF" + [
    headers.join(","),
    ...rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
