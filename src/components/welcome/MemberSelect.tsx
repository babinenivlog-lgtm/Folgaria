import type { ComponentType, SVGProps } from 'react';
import { FAMILY_MEMBERS, type FamilyMember, type MemberIconKind } from '@/data/family';
import { HikerIcon, SkierIcon, SnowboarderIcon } from '@/components/welcome/ActivityIcons';

const START_IMAGE_URL =
  'https://images.pexels.com/photos/6918155/pexels-photo-6918155.jpeg?auto=compress&cs=tinysrgb&w=1600';

const MEMBER_ICONS: Record<MemberIconKind, ComponentType<SVGProps<SVGSVGElement>>> = {
  ski: SkierIcon,
  snowboard: SnowboarderIcon,
  walking: HikerIcon,
};

function iconToneFor(hex: string) {
  const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const [r, g, b] = channels.map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.4 ? '#0f172a' : '#ffffff';
}

interface MemberSelectProps {
  onSelect: (member: FamilyMember) => void;
}

export default function MemberSelect({ onSelect }: MemberSelectProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-900">
      <img
        src={START_IMAGE_URL}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-900/40 to-slate-950/85" />

      <div className="relative flex flex-1 flex-col gap-10 px-6 pb-10 pt-16 sm:px-8">
        <h1 className="motion-safe:animate-[fade-up_700ms_ease-out_both] text-4xl font-extrabold leading-[1.15] text-white drop-shadow-lg sm:text-5xl">
          FolgariAPP
        </h1>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {FAMILY_MEMBERS.map((member, index) => {
            const Icon = MEMBER_ICONS[member.icon];
            const tone = iconToneFor(member.color);
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => onSelect(member)}
                className="group flex flex-col items-start gap-4 rounded-3xl border border-white/30 bg-white/15 p-4 text-left text-white shadow-xl shadow-black/20 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/25 hover:shadow-2xl active:scale-[0.97] motion-safe:animate-[fade-up_700ms_ease-out_both]"
                style={{ animationDelay: `${120 + index * 90}ms` }}
              >
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-2xl p-2.5 shadow-lg ring-1 ring-white/40 transition duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${member.color}, ${member.color}b3)`,
                    color: tone,
                  }}
                  aria-hidden="true"
                >
                  <Icon className="h-full w-full drop-shadow" />
                </span>
                <span className="text-lg font-bold text-white drop-shadow">{member.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
