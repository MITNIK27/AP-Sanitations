/**
 * AP Sanitations — Production Logo Component (Refined)
 * Typography-based AP + controlled wave overlay
 */

interface Props {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  tagline?: boolean
  className?: string
}

const SIZES = {
  sm: { ap: 32, sans: 10, tag: 7 },
  md: { ap: 48, sans: 14, tag: 9 },
  lg: { ap: 68, sans: 18, tag: 11 },
  xl: { ap: 96, sans: 24, tag: 14 },
}

export function APLogo({
  variant = 'dark',
  size = 'md',
  tagline = true,
  className = '',
}: Props) {
  const s = SIZES[size]

  const gold = '#B8935A'
  const teal = '#3D6B65'

  const textSubtle =
    variant === 'dark'
      ? 'rgba(237,234,228,0.5)'
      : 'rgba(26,25,20,0.5)'

  return (
    <div
      className={`inline-flex flex-col items-center ${className}`}
      style={{
        gap: 5,
        lineHeight: 0.5,
      }}
    >
      {/* ===== AP (TYPOGRAPHY + WAVE OVERLAY) ===== */}
      <div
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: s.ap,
        }}
      >
        {/* A P TEXT */}
        <span
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: s.ap,
            color: gold,
            fontWeight: 500,
            letterSpacing: '-0.04em',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ marginRight: s.ap * 0.08 }}>A</span>
          <span>P</span>
        </span>

        {/* WAVE */}
        <svg
          viewBox="0 0 120 40"
          width={s.ap * 1.2}
          height={s.ap * 0.35}
          style={{
            position: 'absolute',
            bottom: s.ap * 0.2,
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
          fill="none"
        >
          {/* main wave */}
          <path
            d="M4 24 
              C28 14, 48 28, 68 20 
              S100 14, 116 22"
            stroke={teal}
            strokeWidth="2.2"
            strokeLinecap="butt"
          />

          {/* secondary wave */}
          <path
            d="M6 30 
               C30 18, 50 38, 70 26 
               S100 18, 115 28"
            stroke={gold}
            strokeWidth="2"
            opacity="0.6"
            strokeLinecap="inherit"
          />

          {/* droplets */}
            {/* premium droplet (main) */}
            <path
              d="M25 15 
                C25 11, 29 9, 29 15 
                C29 18, 25 20, 25 15 Z"
              fill={gold}
              opacity="0.6"
            />

            {/* secondary droplet */}
            <path
              d="M25 28 
                C25 25, 28 23, 28 28 
                C28 30, 25 32, 25 28 Z"
              fill={teal}
              opacity="0.6"
            />

          {/* <circle cx="25" cy="15" r="1.5" fill={gold} opacity="0.6" />
          <circle cx="32" cy="10" r="1.2" fill={teal} opacity="0.5" />
          <circle cx="25" cy="28" r="1.5" fill={teal} opacity="0.6" />
          <circle cx="25" cy="35" r="1.5" fill={gold} opacity="0.5" /> */}
\        </svg>
      </div>

      {/* ===== SANITATIONS ===== */}
      <span
        style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: s.sans,
          letterSpacing: '0.22em',
          color: gold,
          fontWeight: 900,
          textTransform: 'uppercase',
        }}
      >
        SANITATIONS
      </span>
      {/* ===== Divider ===== */}
      <div
        style={{
          width: s.ap * 0.8,
          height: 0.9,
          background: gold,
          opacity: 0.6,
        }}
      />

      {/* ===== TAGLINE ===== */}
      {/* {tagline && (
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: s.tag,
            letterSpacing: '0.18em',
            color: textSubtle,
            textTransform: 'uppercase',
          }}
        >
          PURE FLOW • PURE LIVING
        </span>
      )} */}
    </div>
  )
}