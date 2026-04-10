import { useMLBData } from './hooks/useMLBData'
import { CURRENT_SEASON, PAST_SEASONS } from './data/seasons'
import Header from './components/Header'
import ParlaySummary from './components/ParlaySummary'
import PlayoffCard from './components/cards/PlayoffCard'
import WinTotalCard from './components/cards/WinTotalCard'
import DivisionCard from './components/cards/DivisionCard'
import PastSeasons from './components/PastSeasons'
import OverallPerformance from './components/OverallPerformance'

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

export default function App() {
  const { loading, error, lastUpdated, refresh, getBetData } = useMLBData()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <Header lastUpdated={lastUpdated} onRefresh={refresh} loading={loading} />

      <main className="max-w-7xl mx-auto px-6 py-8">
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

        {/* Active season */}
        <ParlaySummary season={CURRENT_SEASON} />

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{CURRENT_SEASON.label} Bets</h2>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            4-leg parlay · all legs must hit
          </span>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {CURRENT_SEASON.bets.map((bet) => (
            <BetCard key={bet.id} bet={bet} betData={getBetData(bet)} />
          ))}
        </div>

        {/* Past seasons */}
        <PastSeasons seasons={PAST_SEASONS} />

        {/* Overall performance */}
        <OverallPerformance currentSeason={CURRENT_SEASON} pastSeasons={PAST_SEASONS} />
      </main>
    </div>
  )
}
