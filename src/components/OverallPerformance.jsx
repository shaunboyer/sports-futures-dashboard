import { TrendingUp, DollarSign, Target, Award } from 'lucide-react'

function calcStats(currentSeason, pastSeasons) {
  const allSeasons = [
    { ...currentSeason, result: 'active' },
    ...pastSeasons,
  ]

  let totalWagered = 0
  let totalReturned = 0
  let wins = 0
  let losses = 0
  let active = 0

  for (const season of allSeasons) {
    totalWagered += season.parlay.wagered

    if (season.result === 'won') {
      totalReturned += season.parlay.totalPayout
      wins++
    } else if (season.result === 'lost') {
      losses++
    } else {
      active++
    }
  }

  const netPL = totalReturned - totalWagered
  const completedWagered = pastSeasons.reduce((sum, s) => sum + s.parlay.wagered, 0)
  const roi = completedWagered > 0 ? ((totalReturned - completedWagered) / completedWagered) * 100 : null

  let legWins = 0
  let legLosses = 0
  for (const season of pastSeasons) {
    for (const bet of season.bets) {
      if (bet.result === 'hit') legWins++
      else if (bet.result === 'miss') legLosses++
    }
  }

  return { totalWagered, totalReturned, netPL, wins, losses, active, roi, legWins, legLosses }
}

export default function OverallPerformance({ currentSeason, pastSeasons }) {
  const { totalWagered, totalReturned, netPL, wins, losses, active, roi, legWins, legLosses } = calcStats(
    currentSeason,
    pastSeasons
  )

  const isPositive = netPL >= 0

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-lg font-bold text-white">Overall Performance</h2>
        <div
          className="px-2 py-0.5 rounded text-xs font-medium"
          style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
        >
          All seasons
        </div>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{
          background: '#141b27',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-stretch">
          <StatBlock
            icon={<Target size={15} />}
            label="Record"
            value={`${wins}W · ${losses}L`}
            sub={active > 0 ? `${active} active` : null}
            legRecord={`${legWins}–${legLosses} individual legs`}
            iconColor="#4f7ef8"
          />
          <Divider />
          <StatBlock
            icon={<DollarSign size={15} />}
            label="Total Wagered"
            value={`$${totalWagered.toLocaleString()}`}
            sub={active > 0 ? `$${currentSeason.parlay.wagered} active` : null}
            iconColor="#94a3b8"
          />
          <Divider />
          <StatBlock
            icon={<Award size={15} />}
            label="Total Returned"
            value={totalReturned > 0 ? `$${totalReturned.toLocaleString()}` : '—'}
            sub={totalReturned > 0 ? 'from completed wins' : 'no completed wins yet'}
            iconColor="#10b981"
          />
          <Divider />
          <StatBlock
            icon={<TrendingUp size={15} />}
            label="Net P&L"
            value={`${isPositive ? '+' : ''}$${netPL.toLocaleString()}`}
            sub={roi !== null ? `${roi >= 0 ? '+' : ''}${roi.toFixed(0)}% ROI on completed` : null}
            valueColor={isPositive ? '#22c55e' : '#ef4444'}
            iconColor={isPositive ? '#22c55e' : '#ef4444'}
            large
          />
        </div>

        {/* Active caveat */}
        {active > 0 && (
          <p
            className="text-xs mt-5 pt-4"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            Net P&L treats the active ${currentSeason.parlay.wagered} {currentSeason.label} wager as spent. If the parlay hits, net jumps to{' '}
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>
              +${(netPL + currentSeason.parlay.toWin).toLocaleString()}
            </span>
            .
          </p>
        )}
      </div>
    </div>
  )
}

function StatBlock({ icon, label, value, sub, legRecord, valueColor = '#f1f5f9', iconColor = '#94a3b8', large = false }) {
  return (
    <div className="flex-1 px-6 first:pl-0 last:pr-0">
      <div className="flex items-center gap-2 mb-3" style={{ color: iconColor }}>
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {label}
        </span>
      </div>
      <p
        className={large ? 'text-3xl font-bold' : 'text-2xl font-bold'}
        style={{ color: valueColor }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {sub}
        </p>
      )}
      {legRecord && (
        <p className="text-[11px] mt-2 tabular-nums" style={{ color: 'rgba(255,255,255,0.22)' }}>
          {legRecord}
        </p>
      )}
    </div>
  )
}

function Divider() {
  return (
    <div
      className="self-stretch"
      style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 0' }}
    />
  )
}
