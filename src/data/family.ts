export type MemberId = 'greti' | 'szabina' | 'pisti' | 'david' | 'zoli' | 'gyongyi' | 'kitti';

export type MemberIconKind = 'ski' | 'snowboard' | 'walking';

export interface FamilyMember {
  id: MemberId;
  name: string;
  color: string;
  icon: MemberIconKind;
  emoji: string;
}

export const FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'greti', name: 'Gréti', color: '#a855f7', icon: 'ski', emoji: '⛷️' },
  { id: 'szabina', name: 'Szabina', color: '#ec4899', icon: 'ski', emoji: '⛷️' },
  { id: 'pisti', name: 'Pisti', color: '#38bdf8', icon: 'ski', emoji: '⛷️' },
  { id: 'david', name: 'Dávid', color: '#22c55e', icon: 'ski', emoji: '⛷️' },
  { id: 'zoli', name: 'Zoli', color: '#eab308', icon: 'snowboard', emoji: '🏂' },
  { id: 'gyongyi', name: 'Gyöngyi', color: '#ff6600', icon: 'walking', emoji: '🚶' },
  { id: 'kitti', name: 'Kitti', color: '#d946ef', icon: 'walking', emoji: '🚶' },
];

export const FAMILY_PASSWORD = '21';

export function findMember(id: string | null): FamilyMember | undefined {
  return FAMILY_MEMBERS.find((member) => member.id === id);
}
