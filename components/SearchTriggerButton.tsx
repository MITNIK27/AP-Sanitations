'use client'

interface SearchTriggerButtonProps {
  variant?: 'light' | 'dark'
}

export function SearchTriggerButton({ variant = 'dark' }: SearchTriggerButtonProps) {
  const handleClick = () => {
    document.dispatchEvent(new CustomEvent('ap:open-search'))
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Search products"
      className={`p-2 rounded-lg transition-colors duration-300 ${
        variant === 'light'
          ? 'text-cream/70 hover:text-cream hover:bg-cream/10'
          : 'text-stone hover:text-charcoal hover:bg-stone/10'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    </button>
  )
}
