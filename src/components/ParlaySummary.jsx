import { Zap } from 'lucide-react'

export default function ParlaySummary({ season }) {
  const { parlay, bets } = season

  return (
    <div
      className="rounded-2xl p-6 mb-8 flex items-center justify-between gap-6"
      style={{
        background: 'linear-gradient(135deg, #141b27 0%, #1a2236 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Left: season label + leg dots */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={13} color="#4f7ef8" fill="#4f7ef8" />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Active Parlay
          </span>
        </div>
        <h2 className="text-xl font-bold text-white mb-3">{season.label} Season</h2>
        <div className="flex items-center gap-3">
          {bets.map((bet) => (
            <div key={bet.id} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bet.personColor }} />
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {bet.person}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: financials */}
      <div className="flex items-center gap-8">
        <Stat label="Odds" value={parlay.odds} valueColor="#4f7ef8" />
        <div style={{ width: '1px', height: '36px', backgroundColor: 'rgba(255,255,255,0.07)' }} />
        <Stat label="Wagered" value={`$${parlay.wagered.toLocaleString()}`} />
        <Stat label="To Win" value={`$${parlay.toWin.toLocaleString()}`} valueColor="#10b981" />
        <div style={{ width: '1px', height: '36px', backgroundColor: 'rgba(255,255,255,0.07)' }} />
        <Stat label="Total Payout" value={`$${parlay.totalPayout.toLocaleString()}`} large />
      </div>
    </div>
  )
}

function Stat({ label, value, valueColor = '#f1f5f9', large = false }) {
  return (
    <div className="text-right">
      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </p>
      <p
        className={large ? 'text-2xl font-bold' : 'text-lg font-semibold'}
        style={{ color: valueColor }}
      >
        {value}
      </p>
    </div>
  )
}
