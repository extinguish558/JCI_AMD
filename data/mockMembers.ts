
import { Member, MemberType, SeniorTitleType, MembershipStatus } from '../types';

export const MOCK_MEMBERS: Member[] = [
  {
    id: 'c1',
    memberCode: '408',
    name: '王意凱',
    englishName: 'Wang Yi-Kai',
    chapter: '嘉義分會',
    title: '負責人',
    gender: '男',
    type: MemberType.YB, 
    joinDate: '2015-12-19',
    birthday: '1985-07-24',
    mobile: '0965-108-939',
    email: 'nicemm0718@gmail.com',
    address: '嘉義市博東路80號',
    company: '威盛加油站有限公司、凱盛大小車檢驗廠',
    currentRole: { roleName: '理事', rankInRole: 30 },
    avatarUrl: 'https://picsum.photos/200/200?random=1',
    status: MembershipStatus.ACTIVE
  },
  {
    id: 's1',
    memberCode: '060',
    name: '黃茂昌',
    englishName: 'Huang, Mao-chang',
    chapter: '嘉義分會',
    title: '經理',
    gender: '男',
    type: MemberType.SENIOR,
    joinDate: '1984-02-08',
    birthday: '1956-01-27',
    mobile: '0910-748-631',
    email: 'mm198473@yahoo.com.tw',
    address: '嘉義市東區大雅路一段213號',
    senatorId: '49941',
    company: '大欣國際專利商標事務所',
    spouseName: '郭美玲',
    seniorHistory: [{ type: SeniorTitleType.PRESIDENT, termNo: 31 }],
    avatarUrl: 'https://picsum.photos/200/200?random=20',
    status: MembershipStatus.ACTIVE
  },
  {
    id: 'c2',
    memberCode: '443',
    name: '何騰',
    englishName: 'HE, SHENG-FONG',
    chapter: '嘉義分會',
    type: MemberType.YB,
    joinDate: '2018-01-01',
    mobile: '0911-222-333',
    company: '嘉義開發建設',
    avatarUrl: 'https://picsum.photos/200/200?random=5',
    status: MembershipStatus.ACTIVE
  }
];
