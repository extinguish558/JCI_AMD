
export enum MemberType {
  YB = 'YB',
  SENIOR = '特友會',
}

export enum SeniorTitleType {
  PRESIDENT = 'PRESIDENT',
  CHAIR = 'CHAIR',
}

export type Chapter = '嘉義分會' | '南投分會';

// Current Year Role Definition
export interface CurrentRole {
  roleName: string;
  rankInRole: number; // 10: President, 20: VP, 30: Director, 40: Supervisor, 50: Chair, 60: Committee
}

// Senior History Definition
export interface SeniorHistory {
  type: SeniorTitleType;
  termNo?: number; // For Presidents
  year?: number;   // For Chairs
}

export interface Member {
  id: string;
  name: string;
  chapter: Chapter; // New Field: Association Chapter
  avatarUrl?: string;
  
  // A. Basic Data
  title?: string; // 最高職稱 (Occupation/Title)
  joinDate: string; // ISO Date string YYYY-MM-DD
  birthday?: string; // YYYY-MM-DD or MM-DD
  gender?: '男' | '女';
  mobile?: string;
  phone?: string;
  email?: string;
  address?: string;
  fax?: string;
  lineId?: string; // 新增：LINE ID

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
  senatorId?: string; // 參議會編號
  
  // E. Media
  businessCardUrl?: string;

  // Optional: If they hold a current office
  currentRole?: CurrentRole;
  
  // Optional: If they held senior positions (sorted list of past titles)
  seniorHistory?: SeniorHistory[];
}

// Auth Types
export interface AuthUser {
  username: string;
  name: string;
  role: 'SUPER_ADMIN' | 'CHAPTER_ADMIN';
  managedChapter?: Chapter; // If undefined, can manage all
}
