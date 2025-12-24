
export enum MemberType {
  YB = 'YB',
  SENIOR = '特友會',
}

export enum SeniorTitleType {
  PRESIDENT = 'PRESIDENT',
  CHAIR = 'CHAIR',
}

export type Chapter = '嘉義分會' | '南投分會';

export interface CurrentRole {
  roleName: string;
  rankInRole: number;
}

export interface SeniorHistory {
  type: SeniorTitleType;
  termNo?: number; 
  year?: number;   
}

// 組織區塊定義 (對應 PDF 佈局)
export type OrgSection = 'MAIN_AXIS' | 'LEFT_ADVISORS' | 'LEFT_SUPERVISORS' | 'RIGHT_ADMIN' | 'RIGHT_TEAMS';

export interface OrgRole {
  id: string;
  section: OrgSection;
  mainTitle: string; // 格子主標題 (例如：秘書處)
  mainMemberIds: string[]; // 正職人員 IDs
  
  hasDeputy: boolean; // 是否有副手設定
  deputyTitle?: string; // 副職稱 (例如：副秘書長)
  deputyMemberIds?: string[]; // 副職人員 IDs
  
  rank: number; // 同區塊排序
  parentId?: string; // 用於建立隸屬關係 (如：副會長 -> 理事 -> 主委)
}

export interface Member {
  id: string;
  name: string;
  englishName?: string;
  chapter: Chapter; 
  avatarUrl?: string;
  title?: string;
  jciTitle?: string;
  joinDate: string; 
  birthday?: string; 
  gender?: '男' | '女';
  mobile?: string;
  phone?: string;
  email?: string;
  address?: string;
  lineId?: string; 
  company?: string;
  companyPhone?: string;
  companyAddress?: string;
  spouseName?: string;
  spouseBirthday?: string;
  type: MemberType;
  senatorId?: string; 
  remark?: string; 
  businessCardUrl?: string;
  currentRole?: CurrentRole;
  seniorHistory?: SeniorHistory[];
}

export interface AuthUser {
  username: string;
  name: string;
  role: 'SUPER_ADMIN' | 'CHAPTER_ADMIN';
  managedChapter?: Chapter; 
}
