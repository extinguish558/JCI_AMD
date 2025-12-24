
import { Member, MemberType, SeniorTitleType } from '../types';

export const MOCK_MEMBERS: Member[] = [
  // --- CHIAYI CHAPTER (嘉義分會) ---
  
  // Current Officers (Chiayi)
  {
    id: 'c1',
    name: '陳嘉義',
    chapter: '嘉義分會',
    title: '總經理',
    gender: '男',
    type: MemberType.YB, 
    joinDate: '2015-05-20',
    birthday: '1980-05-15',
    mobile: '0912-345-678',
    lineId: 'david_jci', // 範例 LINE ID
    email: 'david.chen@example.com',
    currentRole: { roleName: '會長', rankInRole: 10 },
    avatarUrl: 'https://picsum.photos/200/200?random=1',
    company: '嘉義食品有限公司',
    companyPhone: '05-2345-6789',
    companyAddress: '嘉義市西區垂楊路',
    spouseName: '林小美',
    spouseBirthday: '1982-08-20'
  },
  {
    id: 'c2',
    name: '李副會',
    chapter: '嘉義分會',
    title: '執行長',
    gender: '男',
    type: MemberType.YB,
    joinDate: '2016-01-15',
    birthday: '1985-11-02',
    currentRole: { roleName: '副會長', rankInRole: 20 },
    avatarUrl: 'https://picsum.photos/200/200?random=2',
    company: '阿里山茶業',
    companyAddress: '嘉義縣阿里山鄉',
    mobile: '0922-333-444',
    lineId: 'tea_master_lee',
    senatorId: 'CY-001'
  },
  {
    id: 'c3',
    name: '林理事',
    chapter: '嘉義分會',
    title: '負責人',
    gender: '女',
    type: MemberType.YB,
    joinDate: '2018-03-10',
    currentRole: { roleName: '理事', rankInRole: 30 },
    avatarUrl: 'https://picsum.photos/200/200?random=3',
    company: '火雞肉飯連鎖',
    birthday: '1990-03-10'
  },
  // Added Committee Chair for Testing
  {
    id: 'c4',
    name: '王主委',
    chapter: '嘉義分會',
    title: '專案經理',
    gender: '男',
    type: MemberType.YB,
    joinDate: '2020-05-20',
    currentRole: { roleName: '活動主委', rankInRole: 50 },
    avatarUrl: 'https://picsum.photos/200/200?random=4',
    company: '嘉義行銷',
    mobile: '0911-222-333'
  },

  // Senior Members (Chiayi)
  {
    id: 's1',
    name: '老會長 A',
    chapter: '嘉義分會',
    title: '董事長',
    gender: '男',
    type: MemberType.SENIOR,
    joinDate: '1990-01-01',
    birthday: '1960-10-10',
    seniorHistory: [{ type: SeniorTitleType.PRESIDENT, termNo: 10 }],
    avatarUrl: 'https://picsum.photos/200/200?random=20',
    senatorId: 'CY-999',
    spouseName: '陳夫人'
  },

  // YB Members (Chiayi)
  {
    id: 'y1',
    name: '資深YB A',
    chapter: '嘉義分會',
    title: '建築師',
    gender: '男',
    type: MemberType.YB,
    joinDate: '2010-01-01',
    birthday: '1975-12-25',
    mobile: '0933-111-222',
    address: '嘉義市東區中山路',
    company: '嘉義建設',
    avatarUrl: 'https://picsum.photos/200/200?random=10'
  },


  // --- NANTOU CHAPTER (南投分會) ---

  // Current Officers (Nantou)
  {
    id: 'n1',
    name: '張南投',
    chapter: '南投分會',
    title: '廠長',
    gender: '男',
    type: MemberType.YB,
    joinDate: '2017-01-01',
    birthday: '1982-01-01',
    currentRole: { roleName: '會長', rankInRole: 10 },
    avatarUrl: 'https://picsum.photos/200/200?random=50',
    company: '南投生技園區',
    companyAddress: '南投市中興新村',
    mobile: '0988-777-666',
    lineId: 'nantou_chief'
  },
  {
    id: 'n2',
    name: '王監事',
    chapter: '南投分會',
    gender: '男',
    type: MemberType.YB,
    joinDate: '2019-02-20',
    currentRole: { roleName: '監事', rankInRole: 40 },
    avatarUrl: 'https://picsum.photos/200/200?random=5',
    birthday: '1988-02-20',
    address: '南投縣埔里鎮'
  },
  // Added Committee Chair for Nantou
  {
    id: 'n3',
    name: '劉主委',
    chapter: '南投分會',
    gender: '女',
    type: MemberType.YB,
    joinDate: '2021-01-01',
    currentRole: { roleName: '公關主委', rankInRole: 50 },
    avatarUrl: 'https://picsum.photos/200/200?random=51',
    company: '南投好茶',
  },

  // Senior Members (Nantou)
  {
    id: 's3',
    name: '前主席 A',
    chapter: '南投分會',
    gender: '女',
    type: MemberType.SENIOR,
    joinDate: '2005-01-01',
    seniorHistory: [{ type: SeniorTitleType.CHAIR, year: 2018 }],
    avatarUrl: 'https://picsum.photos/200/200?random=22',
    birthday: '1970-05-20',
    address: '南投縣竹山鎮'
  },
  {
    id: 's4',
    name: '前主席 B',
    chapter: '南投分會',
    gender: '男',
    type: MemberType.SENIOR,
    joinDate: '2006-01-01',
    seniorHistory: [{ type: SeniorTitleType.CHAIR, year: 2020 }],
    avatarUrl: 'https://picsum.photos/200/200?random=23',
    company: '日月潭飯店'
  },

  // YB Members (Nantou)
  {
    id: 'y2',
    name: '新進YB B',
    chapter: '南投分會',
    gender: '女',
    type: MemberType.YB,
    joinDate: '2022-05-01',
    birthday: '1995-05-05',
    avatarUrl: 'https://picsum.photos/200/200?random=11',
    address: '南投縣草屯鎮'
  },
  {
    id: 'y3',
    name: '中期YB C',
    chapter: '南投分會',
    gender: '男',
    type: MemberType.YB,
    joinDate: '2015-08-15',
    avatarUrl: 'https://picsum.photos/200/200?random=12'
  },
  {
    id: 's5',
    name: '普通特友 A',
    chapter: '嘉義分會',
    gender: '男',
    type: MemberType.SENIOR,
    joinDate: '1995-05-05',
    avatarUrl: 'https://picsum.photos/200/200?random=24'
  },
  {
    id: 's6',
    name: '普通特友 B',
    chapter: '南投分會',
    gender: '女',
    type: MemberType.SENIOR,
    joinDate: '1998-12-12',
    avatarUrl: 'https://picsum.photos/200/200?random=25'
  }
];
