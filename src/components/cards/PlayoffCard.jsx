function TeamRow({ row, isTracked, accentColor }) {
  const abbr =
    row.team?.abbreviation ||
    row.team?.name
      ?.split(' ')
      .pop()
      .slice(0, 3)
      .toUpperCase()

  const gb = row.gamesBack === '-' ? '—' : row.gamesBack

  return (
    <tr>
      <td className="py-2 pr-2">
        <div className="flex items-center gap-2.5">
          {isTracked ? (
            <div className="w-0.5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
          ) : (
            <div className="w-0.5 h-5 flex-shrink-0" />
          )}
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0"
            style={
              isTracked
                ? {
                    backgroundColor: accentColor + '22',
                    border: `1px solid ${accentColor}44`,
                    color: accentColor,
                  }
                : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' }
            }
          >
            {abbr}
          </div>
          <span
            className="text-sm leading-none"
            style={{
              color: isTracked ? '#f1f5f9' : 'rgba(255,255,255,0.5)',
              fontWeight: isTracked ? 600 : 400,
            }}
          >
            {row.team?.name}
          </span>
        </div>
      </td>
      <td
        className="text-sm text-right py-2 px-2 tabular-nums"
        style={{ color: isTracked ? '#f1f5f9' : 'rgba(255,255,255,0.45)', fontWeight: isTracked ? 600 : 400 }}
      >
        {row.wins}
      </td>
      <td
        className="text-sm text-right py-2 px-2 tabular-nums"
        style={{ color: isTracked ? '#f1f5f9' : 'rgba(255,255,255,0.45)', fontWeight: isTracked ? 600 : 400 }}
      >
        {row.losses}
      </td>
      <td
        className="text-sm text-right py-2 pl-2 tabular-nums"
        style={{ color: isTracked ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)' }}
      >
        {gb}
      </td>
    </tr>
  )
}

export default function PlayoffCard({ bet, betData }) {
  const { teamRecord, divStandings, playoffStatus, wins, losses, gamesRemaining } = betData || {}

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
            {playoffStatus ? (
              <>
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={
                    playoffStatus.inPosition
                      ? { backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }
                      : { backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }
                  }
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: playoffStatus.inPosition ? '#22c55e' : '#ef4444' }}
                  />
                  {playoffStatus.inPosition ? 'In Position' : 'Out of Position'}
                </div>
                <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {playoffStatus.label}
                </p>
              </>
            ) : (
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>—</div>
            )}
          </div>
        </div>
      </div>

      {/* Standings */}
      <div className="px-5 py-4 flex-1">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-3"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          {bet.team.divisionName} Standings
        </p>

        {divStandings ? (
          <table className="w-full border-separate" style={{ borderSpacing: 0 }}>
            <thead>
              <tr>
                <th className="text-left pb-2 text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Team
                </th>
                <th className="text-right pb-2 text-[10px] font-medium w-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  W
                </th>
                <th className="text-right pb-2 text-[10px] font-medium w-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  L
                </th>
                <th className="text-right pb-2 text-[10px] font-medium w-10" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  GB
                </th>
              </tr>
            </thead>
            <tbody>
              {divStandings.map((row) => (
                <TeamRow
                  key={row.team?.id}
                  row={row}
                  isTracked={row.team?.id === bet.team.id}
                  accentColor={bet.personColor}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <div
            className="h-28 flex items-center justify-center text-xs rounded-lg"
            style={{ color: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            Loading standings...
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-5 py-3 flex items-center justify-between text-xs"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }}
      >
        <span>{teamRecord ? `${wins}–${losses}` : '—'}</span>
        <span>{gamesRemaining != null ? `${gamesRemaining} games remaining` : ''}</span>
      </div>
    </div>
  )
}
