import { Member, MemberType, SeniorTitleType } from '../types';

/**
 * Calculates the sorting keys based on user requirements.
 */

// Rank mapping for current roles (lower is higher priority)
// 会長10、副會長20、理事30、監事40、主席50、主委60
const ROLE_PRIORITY_ORDER = {
  PRESIDENT: 10,
  VP: 20,
  DIRECTOR: 30,
  SUPERVISOR: 40,
  CHAIR: 50,
  COMMITTEE: 60,
}; 

// 1. Group Priority: 
// 0: Board (President to Supervisor, rank <= 40)
// 1: Committee (Chair/Committee, rank > 40) - "主委"
// 2: YB (MemberType.YB)
// 3: Senior (MemberType.SENIOR)
const getGroupPriority = (member: Member): number => {
  if (member.currentRole) {
    // Split Current Role into Board (<=40) and Committee (>40)
    if (member.currentRole.rankInRole <= 40) {
      return 0;
    }
    return 1;
  }
  if (member.type === MemberType.YB) return 2;
  return 3; // Senior
};

// 2. Role Priority (Only for current officers)
const getRolePriority = (member: Member): number => {
  return member.currentRole?.rankInRole || 999;
};

// 3. Senior Priority (Only for Senior members)
// 0: Past President, 1: Past Chair, 2: Other Senior
const getSeniorPriority = (member: Member): number => {
  if (!member.seniorHistory || member.seniorHistory.length === 0) return 2;

  // Find the "highest" rank they held. 
  // If they were both President and Chair, President takes precedence (0).
  const hasPresident = member.seniorHistory.some(h => h.type === SeniorTitleType.PRESIDENT);
  if (hasPresident) return 0;

  const hasChair = member.seniorHistory.some(h => h.type === SeniorTitleType.CHAIR);
  if (hasChair) return 1;

  return 2;
};

// 4. Term or Year Sort (Descending - Newest First)
const getSeniorTermOrYear = (member: Member): number => {
  if (!member.seniorHistory) return 0;

  // We need to find the specific term/year relevant to their highest senior priority.
  // Example: If sorting by Past President, use the President TermNo.
  
  const priority = getSeniorPriority(member);
  
  if (priority === 0) {
    // Return highest term number if multiple exist
    const presTerms = member.seniorHistory
      .filter(h => h.type === SeniorTitleType.PRESIDENT)
      .map(h => h.termNo || 0);
    return Math.max(...presTerms);
  }
  
  if (priority === 1) {
    // Return highest year
    const chairYears = member.seniorHistory
      .filter(h => h.type === SeniorTitleType.CHAIR)
      .map(h => h.year || 0);
    return Math.max(...chairYears);
  }

  return 0;
};

export const sortMembers = (members: Member[]): Member[] => {
  return [...members].sort((a, b) => {
    // 1. Group Priority
    const groupA = getGroupPriority(a);
    const groupB = getGroupPriority(b);
    if (groupA !== groupB) return groupA - groupB;

    // --- Level 2 Split ---

    // CASE A: Current Officers (Board & Committee) - Groups 0 and 1
    if (groupA === 0 || groupA === 1) {
      // Sort by Role Rank
      const rankA = getRolePriority(a);
      const rankB = getRolePriority(b);
      return rankA - rankB;
    }

    // CASE B: YB Members (Group 2)
    if (groupA === 2) {
      // Sort by Join Date (Ascending - Seniority first? or Newest first?)
      // Prompt: "Usually Senior first (Earliest date)". 
      const dateA = new Date(a.joinDate).getTime();
      const dateB = new Date(b.joinDate).getTime();
      if (dateA !== dateB) return dateA - dateB; // Earlier date comes first
      return a.name.localeCompare(b.name); // Stable sort by name
    }

    // CASE C: Senior Members (Group 3)
    if (groupA === 3) {
      // 1. Senior Role Priority (Past Pres > Past Chair > Other)
      const seniorRankA = getSeniorPriority(a);
      const seniorRankB = getSeniorPriority(b);
      if (seniorRankA !== seniorRankB) return seniorRankA - seniorRankB;

      // 2. Term or Year (Descending - Newest first)
      const valA = getSeniorTermOrYear(a);
      const valB = getSeniorTermOrYear(b);
      
      // For "Other" (priority 2), val is 0, so this block effectively skips for them
      if (seniorRankA < 2) {
        if (valA !== valB) return valB - valA; // Descending
      }

      // 3. Join Date (for everyone in Senior group as final fallback)
      const dateA = new Date(a.joinDate).getTime();
      const dateB = new Date(b.joinDate).getTime();
      if (dateA !== dateB) return dateA - dateB; // Earlier date comes first

      return a.name.localeCompare(b.name);
    }

    return 0;
  });
};