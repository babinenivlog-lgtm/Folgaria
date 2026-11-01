import type { FamilyMember } from '@/data/family';

interface MemberBadgeProps {
  member: FamilyMember;
  size?: 'sm' | 'md';
}

export default function MemberBadge({ member, size = 'md' }: MemberBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span
      className={`inline-flex min-w-0 items-center gap-1.5 rounded-full font-semibold text-slate-900 ${sizeClass}`}
      style={{ backgroundColor: `${member.color}1f`, boxShadow: `inset 0 0 0 1px ${member.color}88` }}
    >
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: member.color }}
        aria-hidden="true"
      />
      <span className="truncate">{member.name}</span>
    </span>
  );
}
