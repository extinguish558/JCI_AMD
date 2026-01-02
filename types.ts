
export enum MemberType {
  YB = 'YB',
  SENIOR = '特友會',
}

export enum MembershipStatus {
  ACTIVE = '會友',
  ON_LEAVE = '休會',
  RESIGNED = '退會',
  REINSTATED = '覆會',
  PROBATION_FAILED = '見習未通過',
  NOT_JOINING = '不入會',
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

export interface AuditInfo {
  isVerified: boolean;
  verifiedBy: string;
  verifiedAt: string;
  signatureBase64?: string;
}

export interface StatusLog {
  fromStatus: MembershipStatus;
  toStatus: MembershipStatus;
  changedAt: string;
  changedBy: string;
  reason?: string;
}

export interface Member {
  id: string;
  memberCode?: string; 
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
  homePhone?: string; 
  fax?: string; 
  email?: string;
  address?: string;
  lineId?: string; 
  company?: string;
  companyPhone?: string;
  companyAddress?: string;
  spouseName?: string;
  spouseBirthday?: string;
  type: MemberType;
  status?: MembershipStatus;
  statusLog?: StatusLog[];
  senatorId?: string; 
  remark?: string; 
  businessCardUrl?: string;
  adImageUrl?: string;
  adImageUrl2?: string;
  currentRole?: CurrentRole;
  seniorHistory?: SeniorHistory[];
  auditInfo?: AuditInfo;
  // 新增青商履歷欄位
  jciExperienceLocal?: string;      // 本會經歷
  jciExperienceNational?: string;   // 總會/區會經歷
  awards?: string;                   // 得獎紀錄
  trainingRecords?: string;          // 訓練紀錄
}

export interface AuthUser {
  username: string;
  name: string;
  role: 'SUPER_ADMIN' | 'CHAPTER_ADMIN';
  managedChapter?: Chapter; 
}

export type OrgSection = 'MAIN_AXIS' | 'LEFT_ADVISORS' | 'LEFT_SUPERVISORS' | 'RIGHT_ADMIN' | 'RIGHT_TEAMS';

export interface OrgRole {
  id: string;
  section: OrgSection;
  mainTitle: string;
  mainMemberIds: string[];
  hasDeputy: boolean;
  deputyTitle?: string;
  deputyMemberIds?: string[];
  rank: number;
}
