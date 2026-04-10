import { Zap } from 'lucide-react'

export default function ParlaySummary({ season }) {
  const { parlay, bets } = season

  return (
    <div
      className="rounded-2xl p-5 md:p-6 mb-5"
      style={{
        background: 'linear-gradient(135deg, #141b27 0%, #1a2236 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Top row: label + season name */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={13} color="#4f7ef8" fill="#4f7ef8" />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Active Parlay
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white">{season.label} Season</h2>
        </div>
        {/* Person dots — top right on mobile */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {bets.map((bet) => (
            <div key={bet.id} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: bet.personColor }} />
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {bet.person}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Financial stats — 2x2 on mobile, single row on desktop */}
      <div className="grid grid-cols-2 md:flex md:items-center md:justify-end gap-x-4 gap-y-4 md:gap-8">
        <Stat label="Odds" value={parlay.odds} valueColor="#4f7ef8" />
        <Stat label="Wagered" value={`$${parlay.wagered.toLocaleString()}`} />
        <Stat label="To Win" value={`$${parlay.toWin.toLocaleString()}`} valueColor="#10b981" />
        <Stat label="Total Payout" value={`$${parlay.totalPayout.toLocaleString()}`} large />
      </div>
    </div>
  )
}

function Stat({ label, value, valueColor = '#f1f5f9', large = false }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </p>
      <p
        className={large ? 'text-xl md:text-2xl font-bold' : 'text-base md:text-lg font-semibold'}
        style={{ color: valueColor }}
      >
        {value}
      </p>
    </div>
  )
}
