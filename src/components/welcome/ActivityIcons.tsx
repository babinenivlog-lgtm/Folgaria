import type { SVGProps } from 'react';

const ICON_PROPS: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 3,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export function SkierIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <circle cx="38" cy="10" r="4.5" fill="currentColor" stroke="none" />
      <path d="M36 18 L31 34" />
      <path d="M33 23 L20 33" />
      <path d="M35 23 L47 30" />
      <path d="M31 34 L40 42 L36 52" />
      <path d="M31 34 L24 46" />
      <path d="M10 56 L56 50" strokeWidth={2.5} />
      <path d="M14 61 L52 56" strokeWidth={2.5} />
      <path d="M18 30 L11 56" strokeWidth={1.5} />
    </svg>
  );
}

export function SnowboarderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <circle cx="30" cy="10" r="4.5" fill="currentColor" stroke="none" />
      <path d="M29 18 L34 34" />
      <path d="M31 23 L42 28" />
      <path d="M31 23 L22 30" />
      <path d="M34 34 L26 44 L31 50" />
      <path d="M34 34 L43 42" />
      <path d="M6 54 Q32 60 58 52" strokeWidth={4.5} />
    </svg>
  );
}

export function HikerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <circle cx="33" cy="10" r="4.5" fill="currentColor" stroke="none" />
      <rect x="20" y="18" width="9" height="16" rx="2.5" />
      <path d="M33 19 L33 36" />
      <path d="M33 23 L40 30" />
      <path d="M28 24 L18 50" strokeWidth={2} />
      <path d="M33 36 L27 54" />
      <path d="M33 36 L40 53" />
    </svg>
  );
}
