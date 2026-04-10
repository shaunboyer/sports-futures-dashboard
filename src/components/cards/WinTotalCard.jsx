const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function RingChart({ pct, color }) {
  const fill = (pct / 100) * CIRCUMFERENCE
  const gap = CIRCUMFERENCE - fill

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {/* Track */}
      <circle
        cx="70"
        cy="70"
        r={RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="8"
      />
      {/* Progress */}
      <circle
        cx="70"
        cy="70"
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${fill} ${gap}`}
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  )
}

export default function WinTotalCard({ bet, betData }) {
  const { wins, losses, gamesRemaining, target, pace, winsNeeded, onPace, pct } = betData || {}

  const statusColor = onPace === null ? '#94a3b8' : onPace ? '#22c55e' : '#ef4444'
  const ringColor = onPace === null ? 'rgba(255,255,255,0.15)' : onPace ? '#22c55e' : '#ef4444'

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: '#141b27',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: bet.personColor }} />
              <span className="text-xs font-semibold" style={{ color: bet.personColor }}>
                {bet.person}
              </span>
            </div>
            <h3 className="text-base font-bold text-white leading-tight">{bet.team.name}</h3>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {bet.team.divisionName} · {bet.description}
            </p>
          </div>

          {/* Status badge */}
          <div className="text-right flex-shrink-0">
            {betData ? (
              <>
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={
                    onPace
                      ? { backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }
                      : { backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }
                  }
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                  {onPace ? 'On Pace' : 'Behind Pace'}
                </div>
                {pace !== null && (
                  <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Pace: {pace} wins
                  </p>
                )}
              </>
            ) : (
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>—</div>
            )}
          </div>
        </div>
      </div>

      {/* Ring chart */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 gap-4">
        {betData ? (
          <>
            <div className="relative">
              <RingChart pct={pct ?? 0} color={ringColor} />
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white tabular-nums">{wins}</span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  of {target} wins
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6">
              <MiniStat label="W–L" value={`${wins}–${losses}`} />
              <div style={{ width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <MiniStat label="Needed" value={winsNeeded > 0 ? winsNeeded : '✓'} color={winsNeeded === 0 ? '#22c55e' : '#f1f5f9'} />
              <div style={{ width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <MiniStat label="Remaining" value={gamesRemaining} />
            </div>
          </>
        ) : (
          <div
            className="h-28 w-full mx-5 flex items-center justify-center text-xs rounded-lg"
            style={{ color: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            Loading data...
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between text-[10px] mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <span>0</span>
          <span>Target: {target} wins</span>
          <span>162</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${((wins ?? 0) / 162) * 100}%`,
              backgroundColor: ringColor,
            }}
          />
        </div>
        {/* Target marker */}
        <div className="relative h-2">
          <div
            className="absolute top-0 w-px h-2"
            style={{
              left: `${(target / 162) * 100}%`,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, color = '#f1f5f9' }) {
  return (
    <div className="text-center">
      <p className="text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {label}
      </p>
      <p className="text-sm font-semibold tabular-nums" style={{ color }}>
        {value}
      </p>
    </div>
  )
}
