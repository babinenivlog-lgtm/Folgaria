import type { MemberId } from '@/data/family';
import type { LiftWait, RouteSummary, SkillLevel } from '@/lib/routeCalculator';

export interface ChatRoute extends RouteSummary {
  arrivalAt: string;
  skill: SkillLevel;
  wait: LiftWait;
}

export interface ChatMessage {
  id: string;
  member_id: MemberId;
  body: string;
  route: ChatRoute | null;
  created_at: string;
}

export interface MemberLocation {
  member_id: MemberId;
  lat: number;
  lng: number;
  speed_kmh: number;
  max_speed_kmh: number;
  distance_m: number;
  updated_at: string;
}
