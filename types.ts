
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

export interface Member {
  id: string;
  name: string;
  englishName?: string; // 新增：英文姓名
  chapter: Chapter; 
  avatarUrl?: string;
  
  // A. Basic Data
  title?: string; 
  joinDate: string; 
  birthday?: string; 
  gender?: '男' | '女';
  mobile?: string;
  phone?: string;
  email?: string;
  address?: string;
  fax?: string;
  lineId?: string; 

  // B. Company Data
  company?: string;
  companyPhone?: string;
  companyFax?: string;
  companyAddress?: string;
  companyEmail?: string;
  
  // C. Family Data
  spouseName?: string;
  spouseBirthday?: string;

  // D. Identity & Classification
  type: MemberType;
  senatorId?: string; 
  
  // E. Media
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
