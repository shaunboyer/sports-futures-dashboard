import { useState, useEffect, useCallback } from 'react'

// level=3 groups entries by division (conference → division → teams)
const NBA_API = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings?level=3'
const NBA_GAMES = 82
const REFRESH_MS = 30 * 60 * 1000

const logoUrl = (abbr) => `https://a.espncdn.com/i/teamlogos/nba/500/${abbr.toLowerCase()}.png`

export function useNBAData() {
  const [teamMap, setTeamMap] = useState(null)
  const [divisions, setDivisions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetch_ = useCallback(async (isManual = false) => {
    if (isManual) setLoading(true)
    try {
      const res = await fetch(NBA_API)
      if (!res.ok) throw new Error(`ESPN NBA API error: ${res.status}`)
      const data = await res.json()

      const map = {}
      const divs = {}
      for (const conference of data.children || []) {
        for (const division of conference.children || []) {
          divs[division.name] = []
          for (const entry of division.standings?.entries || []) {
            const id = parseInt(entry.team.id)
            const statsLookup = {}
            for (const stat of entry.stats || []) {
              statsLookup[stat.type] = stat.value
            }
            const abbr = entry.team.abbreviation
            map[id] = {
              id,
              abbr,
              name: entry.team.displayName,
              wins: statsLookup.wins ?? 0,
              losses: statsLookup.losses ?? 0,
              playoffSeed: statsLookup.playoffseed ?? 0,
              logoUrl: logoUrl(abbr),
            }
            divs[division.name].push(id)
          }
        }
      }
      setTeamMap(map)
      setDivisions(divs)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      console.error('[useNBAData] fetch failed:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch_()
    const id = setInterval(() => fetch_(), REFRESH_MS)
    return () => clearInterval(id)
  }, [fetch_])

  const getDivisionStandings = (divisionName) => {
    const ids = divisions?.[divisionName]
    if (!ids || !teamMap) return null

    const sorted = ids
      .map((id) => teamMap[id])
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses)

    const leader = sorted[0]
    return sorted.map((t, i) => {
      let gamesBack = '-'
      if (i > 0) {
        const gb = ((leader.wins - t.wins) + (t.losses - leader.losses)) / 2
        if (gb > 0) gamesBack = String(gb)
      }
      return {
        team: { id: t.id, abbreviation: t.abbr, name: t.name },
        wins: t.wins,
        losses: t.losses,
        gamesBack,
        logoUrl: t.logoUrl,
      }
    })
  }

  // Seeds 1–6 make the playoffs outright; 7–10 go to the play-in
  const getPlayoffStatus = (team) => {
    const seed = team.playoffSeed
    if (!seed || seed === 0) return null

    if (seed <= 6) return { inPosition: true, label: `${seed} seed in conf.` }
    if (seed <= 10) return { inPosition: false, label: `Play-In (${seed} seed)` }
    return { inPosition: false, label: `${seed}th in conf.` }
  }

  const getNBABetData = (bet) => {
    const espnId = bet.team.espnId
    if (!espnId) return null

    const live = teamMap?.[espnId]
    const wins = live?.wins ?? 0
    const losses = live?.losses ?? 0
    const gamesPlayed = wins + losses
    const gamesRemaining = NBA_GAMES - gamesPlayed
    const divStandings = getDivisionStandings(bet.team.divisionName)

    const base = { wins, losses, gamesPlayed, gamesRemaining, divStandings, teamRecord: live ?? null }

    if (bet.type === 'playoff_qualifier') {
      return { ...base, playoffStatus: live ? getPlayoffStatus(live) : null }
    }

    if (bet.type === 'win_total') {
      const pace = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * NBA_GAMES) : null
      const onPace = live && pace !== null ? pace >= bet.target : null
      const pct = Math.min(100, (wins / bet.target) * 100)
      const winsNeeded = Math.max(0, bet.target - wins)
      // nflGames is WinTotalCard's season-length prop
      return { ...base, target: bet.target, pace, winsNeeded, onPace, pct, nflGames: NBA_GAMES }
    }

    return base
  }

  return { loading, error, lastUpdated, refresh: () => fetch_(true), getNBABetData }
}
