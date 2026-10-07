import { Link } from 'react-router-dom';

export function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="18" fill="#17352A" />
      <path d="M32 50c-9-6-14-14-14-22 0-7 5-12 14-14 9 2 14 7 14 14 0 8-5 16-14 22z" fill="#8FBB9D" />
      <path d="M32 18v30M32 30c-4-1-7-3-9-6M32 36c4-1 7-3 9-6" stroke="#17352A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="46" cy="46" r="5" fill="#E7B93A" />
    </svg>
  );
}

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="NaturalHarvest home">
      <LogoMark />
      <span className={`font-display text-[1.35rem] font-bold leading-none tracking-tight ${light ? 'text-oat-50' : 'text-leaf-900'}`}>
        NaturalHarvest
      </span>
    </Link>
  );
}
