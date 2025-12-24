import { Member } from '../types';

export const exportToCSV = (members: Partial<Member>[], filename: string) => {
  const headers = [
    'ID', '姓名', '分會', '類型', '最高職稱', '入會日期', '生日', '性別', 
    '手機', '電話', 'Email', '傳真', '地址', 'LINE_ID', 
    '公司名稱', '公司電話', '公司傳真', '公司地址', '公司Email',
    '配偶姓名', '配偶生日', '參議會編號'
  ];
  
  const rows = members.map(m => [
    m.id || '',
    m.name || '',
    m.chapter || '',
    m.type || '',
    m.title || '',
    m.joinDate || '',
    m.birthday || '',
    m.gender || '',
    m.mobile || '',
    m.phone || '',
    m.email || '',
    m.fax || '',
    m.address || '',
    m.lineId || '',
    m.company || '',
    m.companyPhone || '',
    m.companyFax || '',
    m.companyAddress || '',
    m.companyEmail || '',
    m.spouseName || '',
    m.spouseBirthday || '',
    m.senatorId || ''
  ]);

  // Use \uFEFF for Excel UTF-8 BOM to prevent garbled Chinese characters
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