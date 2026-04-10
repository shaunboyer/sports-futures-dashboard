import { RefreshCw, Trophy } from 'lucide-react'

export default function Header({ lastUpdated, onRefresh, loading }) {
  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <header
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backgroundColor: '#0d1117',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(79,126,248,0.15)', border: '1px solid rgba(79,126,248,0.25)' }}
          >
            <Trophy size={15} color="#4f7ef8" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-white tracking-widest">FUTURES</span>
            <span className="text-xs font-medium tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
              DASHBOARD
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-5">
          {timeStr && (
            <span className="hidden sm:inline text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Updated {timeStr}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs transition-colors disabled:opacity-30"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>
    </header>
  )
}
