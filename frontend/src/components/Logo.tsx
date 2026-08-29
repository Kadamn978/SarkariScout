interface LogoProps {
  className?: string
  size?: number
}

export default function Logo({ className = '', size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SarkariScout logo"
    >
      {/* Shield */}
      <path
        d="M20 2L4 10v10c0 9.4 6.8 18.2 16 20 9.2-1.8 16-10.6 16-20V10L20 2z"
        fill="url(#shieldGrad)"
        stroke="url(#shieldStroke)"
        strokeWidth="1.5"
      />
      {/* Magnifying glass */}
      <circle
        cx="17"
        cy="17"
        r="6"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
      />
      <line
        x1="21.5"
        y1="21.5"
        x2="27"
        y2="27"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Document lines inside magnifier */}
      <line x1="14" y1="15" x2="20" y2="15" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="14" y1="17.5" x2="19" y2="17.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="14" y1="20" x2="18" y2="20" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <defs>
        <linearGradient id="shieldGrad" x1="4" y1="2" x2="36" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="shieldStroke" x1="4" y1="2" x2="36" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#818CF8" />
        </linearGradient>
      </defs>
    </svg>
  )
}
