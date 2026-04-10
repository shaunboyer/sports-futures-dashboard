import { useState } from 'react'
import { getLogoUrl } from '../utils/teamLogos'

export default function TeamLogo({ teamId, abbr, size = 24, className = '' }) {
  const [failed, setFailed] = useState(false)
  const url = getLogoUrl(teamId)

  if (!url || failed) {
    // Fallback: letter badge
    return (
      <div
        className={`flex items-center justify-center text-[9px] font-bold rounded flex-shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: 'rgba(255,255,255,0.05)',
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        {abbr?.slice(0, 3)}
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={abbr}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={`rounded flex-shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
