import { LevelDefinition } from '../game/types';

interface ObjectIconProps {
  kind: LevelDefinition['objectIcon'];
  className?: string;
}

export function ObjectIcon({ kind, className = 'w-8 h-8' }: ObjectIconProps) {
  const stroke = '#49524F';
  switch (kind) {
    case 'cup':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path d="M8 14h16v10a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6V14Z" fill="#FCFBF8" stroke={stroke} strokeWidth="1.7" />
          <path d="M24 16h3a3 3 0 0 1 0 6h-3" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
          <path d="M13 8c0 2 1.5 2 1.5 4M18 7c0 2 1.5 2 1.5 4" stroke="#DDA089" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'ice':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <rect x="8" y="10" width="14" height="14" rx="3.5" transform="rotate(-8 8 10)" fill="#CFE4EE" stroke={stroke} strokeWidth="1.6" />
          <rect x="16" y="14" width="13" height="13" rx="3.5" transform="rotate(10 16 14)" fill="#E6C675" fillOpacity="0.6" stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
    case 'book':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <rect x="7" y="9" width="7" height="20" rx="2" fill="#8AB4C8" stroke={stroke} strokeWidth="1.6" />
          <rect x="15" y="7" width="7" height="22" rx="2" fill="#7FA68A" stroke={stroke} strokeWidth="1.6" />
          <rect x="23" y="10" width="7" height="19" rx="2" transform="rotate(12 23 10)" fill="#DDA089" stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
    case 'toast':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <rect x="10" y="9" width="16" height="18" rx="4" fill="#E0B989" stroke={stroke} strokeWidth="1.7" />
          <rect x="13" y="12" width="10" height="12" rx="2" fill="#F4DFC1" />
        </svg>
      );
    case 'scale':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path d="M18 10v17M12 27h12" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
          <path d="M7 14h22" stroke="#D5BFA8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="9" cy="20" r="3.5" fill="#E6A87C" stroke={stroke} strokeWidth="1.4" />
          <circle cx="27" cy="20" r="3.5" fill="#E6C675" stroke={stroke} strokeWidth="1.4" />
        </svg>
      );
    case 'drop':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path d="M18 7c4 6 7 10 7 14a7 7 0 1 1-14 0c0-4 3-8 7-14Z" fill="#8AB4C8" stroke={stroke} strokeWidth="1.7" />
        </svg>
      );
    case 'cookie':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="18" cy="18" r="10" fill="#DFB684" stroke={stroke} strokeWidth="1.7" />
          <circle cx="15" cy="15" r="1.4" fill="#7D5D3E" />
          <circle cx="21" cy="16" r="1.4" fill="#7D5D3E" />
          <circle cx="17" cy="21" r="1.4" fill="#7D5D3E" />
        </svg>
      );
    case 'mobile':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path d="M18 6v6M8 12h20" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
          <path d="M10 12v8M26 12v8" stroke={stroke} strokeWidth="1.4" />
          <circle cx="10" cy="23" r="3.5" fill="#E6C675" stroke={stroke} strokeWidth="1.5" />
          <circle cx="26" cy="23" r="3.5" fill="#8AB4C8" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    case 'soap':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <rect x="8" y="13" width="20" height="11" rx="5.5" fill="#E8B8C1" stroke={stroke} strokeWidth="1.7" />
          <circle cx="24" cy="10" r="2.2" fill="#CFE4EE" stroke={stroke} strokeWidth="1.2" />
        </svg>
      );
    case 'lemon':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <ellipse cx="18" cy="19" rx="10" ry="8" fill="#E6C675" stroke={stroke} strokeWidth="1.7" />
          <ellipse cx="21" cy="10" rx="4" ry="2" transform="rotate(-20 21 10)" fill="#7FA68A" stroke={stroke} strokeWidth="1.4" />
        </svg>
      );
    case 'pendulum':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path d="M18 7l6 15" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="18" cy="7" r="2" fill="#B5A8D1" stroke={stroke} strokeWidth="1.4" />
          <circle cx="25" cy="24" r="5" fill="#8AB4C8" stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
    case 'bell':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path d="M10 24a8 8 0 0 1 16 0H10Z" fill="#E6C675" stroke={stroke} strokeWidth="1.7" />
          <path d="M8 26h20" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <circle cx="18" cy="13" r="2" fill="#FCFBF8" stroke={stroke} strokeWidth="1.4" />
        </svg>
      );
  }
}
