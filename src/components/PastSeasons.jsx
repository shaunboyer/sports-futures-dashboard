import { CheckCircle2, XCircle, Trophy } from 'lucide-react'

function LegRow({ bet }) {
  const hit = bet.result === 'hit'
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: bet.personColor }} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {bet.person}
            </span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {bet.team.name}
            </span>
          </div>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {bet.description}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {bet.resultNote && (
          <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {bet.resultNote}
          </span>
        )}
        {hit ? (
          <CheckCircle2 size={15} color="#22c55e" />
        ) : (
          <XCircle size={15} color="#ef4444" />
        )}
      </div>
    </div>
  )
}

function PastSeasonCard({ season }) {
  const won = season.result === 'won'
  const allHit = season.bets.every((b) => b.result === 'hit')
  const hitCount = season.bets.filter((b) => b.result === 'hit').length

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#141b27',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Card header */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                {season.sport} · {season.year}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{season.label} Season</h3>
          </div>

          {/* Result badge */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Payout</p>
              <p className="text-lg font-bold" style={{ color: won ? '#22c55e' : '#ef4444' }}>
                ${season.parlay.totalPayout.toLocaleString()}
              </p>
            </div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
              style={
                won
                  ? { backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }
                  : { backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }
              }
            >
              {won ? <Trophy size={12} /> : <XCircle size={12} />}
              {won ? 'WON' : 'LOST'}
            </div>
          </div>
        </div>

        {/* Financial details */}
        <div className="flex items-center gap-6 mt-3">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {season.parlay.odds} odds
          </span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            ${season.parlay.wagered} wagered
          </span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {hitCount}/{season.bets.length} legs hit
          </span>
        </div>
      </div>

      {/* Legs */}
      <div className="px-5 py-2">
        {season.bets.map((bet) => (
          <LegRow key={bet.id} bet={bet} />
        ))}
      </div>
    </div>
  )
}

export default function PastSeasons({ seasons }) {
  if (!seasons?.length) return null

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-lg font-bold text-white">Past Parlays</h2>
        <div
          className="px-2 py-0.5 rounded text-xs font-medium"
          style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
        >
          {seasons.length}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {seasons.map((season) => (
          <PastSeasonCard key={season.id} season={season} />
        ))}
      </div>
    </div>
  )
}
