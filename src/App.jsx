import { useMLBData } from './hooks/useMLBData'
import { CURRENT_SEASON, PAST_SEASONS } from './data/seasons'
import Header from './components/Header'
import PlayoffCard from './components/cards/PlayoffCard'
import WinTotalCard from './components/cards/WinTotalCard'
import DivisionCard from './components/cards/DivisionCard'
import PastSeasons from './components/PastSeasons'
import OverallPerformance from './components/OverallPerformance'
import { Zap } from 'lucide-react'

function BetCard({ bet, betData }) {
  if (bet.type === 'playoff_qualifier') {
    return <PlayoffCard bet={bet} betData={betData} />
  }
  if (bet.type === 'win_total') {
    return <WinTotalCard bet={bet} betData={betData} />
  }
  if (bet.type === 'division_winner') {
    return <DivisionCard bet={bet} betData={betData} />
  }
  return null
}

function ParlayHeader({ season }) {
  const { parlay, bets } = season
  return (
    <div
      className="px-5 py-4 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Left: season name + person dots */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Zap size={13} color="#4f7ef8" fill="#4f7ef8" />
          <span className="text-base font-bold text-white">{season.label}</span>
        </div>
        <div
          className="h-4 w-px hidden sm:block"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
        />
        <div className="flex items-center gap-3 flex-wrap">
          {bets.map((bet) => (
            <div key={bet.id} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: bet.personColor }} />
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {bet.person}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: financials */}
      <div className="grid grid-cols-2 sm:flex sm:items-center sm:gap-6 gap-x-4 gap-y-3">
        <FinStat label="Odds" value={parlay.odds} color="#4f7ef8" />
        <FinStat label="Wagered" value={`$${parlay.wagered.toLocaleString()}`} />
        <FinStat label="To Win" value={`$${parlay.toWin.toLocaleString()}`} color="#10b981" />
        <FinStat label="Total Payout" value={`$${parlay.totalPayout.toLocaleString()}`} bold />
      </div>
    </div>
  )
}

function FinStat({ label, value, color = '#f1f5f9', bold = false }) {
  return (
    <div>
      <p className="text-[10px] mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
      <p className={`text-sm ${bold ? 'font-bold' : 'font-semibold'}`} style={{ color }}>{value}</p>
    </div>
  )
}

export default function App() {
  const { loading, error, lastUpdated, refresh, getBetData } = useMLBData()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <Header lastUpdated={lastUpdated} onRefresh={refresh} loading={loading} />

      <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        {/* Error banner */}
        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
            style={{
              backgroundColor: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#fca5a5',
            }}
          >
            <span>⚠</span>
            <span>Could not reach MLB API: {error}. Standings may be unavailable.</span>
          </div>
        )}

        {/* Overall performance */}
        <OverallPerformance currentSeason={CURRENT_SEASON} pastSeasons={PAST_SEASONS} />

        {/* Active parlay — encompassing card */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Active Parlay</h2>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              4-leg parlay · all legs must hit
            </span>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            <ParlayHeader season={CURRENT_SEASON} />
            <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {CURRENT_SEASON.bets.map((bet) => (
                <BetCard key={bet.id} bet={bet} betData={getBetData(bet)} />
              ))}
            </div>
          </div>
        </div>

        {/* Past parlays */}
        <PastSeasons seasons={PAST_SEASONS} />
      </main>
    </div>
  )
}
