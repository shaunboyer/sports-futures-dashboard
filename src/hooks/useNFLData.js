import { useState, useEffect, useCallback } from 'react'

const NFL_API = 'https://site.api.espn.com/apis/v2/sports/football/nfl/standings'
const NFL_GAMES = 17
const REFRESH_MS = 30 * 60 * 1000

// Full NFL team roster — id, abbr, name grouped by division
const NFL_DIVISIONS = {
  'AFC East':  [
    { id: 2,  abbr: 'BUF', name: 'Buffalo Bills' },
    { id: 15, abbr: 'MIA', name: 'Miami Dolphins' },
    { id: 17, abbr: 'NE',  name: 'New England Patriots' },
    { id: 20, abbr: 'NYJ', name: 'New York Jets' },
  ],
  'AFC North': [
    { id: 33, abbr: 'BAL', name: 'Baltimore Ravens' },
    { id: 4,  abbr: 'CIN', name: 'Cincinnati Bengals' },
    { id: 5,  abbr: 'CLE', name: 'Cleveland Browns' },
    { id: 23, abbr: 'PIT', name: 'Pittsburgh Steelers' },
  ],
  'AFC South': [
    { id: 34, abbr: 'HOU', name: 'Houston Texans' },
    { id: 11, abbr: 'IND', name: 'Indianapolis Colts' },
    { id: 30, abbr: 'JAX', name: 'Jacksonville Jaguars' },
    { id: 10, abbr: 'TEN', name: 'Tennessee Titans' },
  ],
  'AFC West':  [
    { id: 7,  abbr: 'DEN', name: 'Denver Broncos' },
    { id: 12, abbr: 'KC',  name: 'Kansas City Chiefs' },
    { id: 13, abbr: 'LV',  name: 'Las Vegas Raiders' },
    { id: 24, abbr: 'LAC', name: 'Los Angeles Chargers' },
  ],
  'NFC East':  [
    { id: 6,  abbr: 'DAL', name: 'Dallas Cowboys' },
    { id: 19, abbr: 'NYG', name: 'New York Giants' },
    { id: 21, abbr: 'PHI', name: 'Philadelphia Eagles' },
    { id: 28, abbr: 'WAS', name: 'Washington Commanders' },
  ],
  'NFC North': [
    { id: 3,  abbr: 'CHI', name: 'Chicago Bears' },
    { id: 8,  abbr: 'DET', name: 'Detroit Lions' },
    { id: 9,  abbr: 'GB',  name: 'Green Bay Packers' },
    { id: 16, abbr: 'MIN', name: 'Minnesota Vikings' },
  ],
  'NFC South': [
    { id: 1,  abbr: 'ATL', name: 'Atlanta Falcons' },
    { id: 29, abbr: 'CAR', name: 'Carolina Panthers' },
    { id: 18, abbr: 'NO',  name: 'New Orleans Saints' },
    { id: 27, abbr: 'TB',  name: 'Tampa Bay Buccaneers' },
  ],
  'NFC West':  [
    { id: 22, abbr: 'ARI', name: 'Arizona Cardinals' },
    { id: 14, abbr: 'LAR', name: 'Los Angeles Rams' },
    { id: 25, abbr: 'SF',  name: 'San Francisco 49ers' },
    { id: 26, abbr: 'SEA', name: 'Seattle Seahawks' },
  ],
}

export function useNFLData() {
  const [teamMap, setTeamMap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetch_ = useCallback(async (isManual = false) => {
    if (isManual) setLoading(true)
    try {
      const res = await fetch(NFL_API)
      if (!res.ok) throw new Error(`ESPN NFL API error: ${res.status}`)
      const data = await res.json()

      const map = {}
      for (const conference of data.children || []) {
        for (const entry of conference.standings?.entries || []) {
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
            ties: statsLookup.ties ?? 0,
            playoffSeed: statsLookup.playoffseed ?? 0,
            logoUrl: `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`,
          }
        }
      }
      setTeamMap(map)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      console.error('[useNFLData] fetch failed:', err)
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
    const staticTeams = NFL_DIVISIONS[divisionName]
    if (!staticTeams) return null

    // Merge live data when available, fall back to 0-0
    const teams = staticTeams.map(t => {
      const live = teamMap?.[t.id]
      return {
        id: t.id,
        abbr: t.abbr,
        name: t.name,
        wins: live?.wins ?? 0,
        losses: live?.losses ?? 0,
        logoUrl: `https://a.espncdn.com/i/teamlogos/nfl/500/${t.abbr.toLowerCase()}.png`,
      }
    })

    const sorted = [...teams].sort((a, b) =>
      b.wins - a.wins || a.losses - b.losses
    )

    const leader = sorted[0]
    return sorted.map((t, i) => {
      let gamesBack = '-'
      if (i > 0 && leader && leader.wins > t.wins) {
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

  const getPlayoffStatus = (team) => {
    const seed = team.playoffSeed
    if (!seed || seed === 0) return null

    if (seed >= 1 && seed <= 4) {
      return { inPosition: true, label: `Div Winner (${seed} seed)` }
    }
    if (seed >= 5 && seed <= 7) {
      return { inPosition: true, label: `Wild Card ${seed - 4}` }
    }
    return { inPosition: false, label: `${seed}th in conf.` }
  }

  const getNFLBetData = (bet) => {
    const espnId = bet.team.espnId
    if (!espnId) return null

    const live = teamMap?.[espnId]
    const wins = live?.wins ?? 0
    const losses = live?.losses ?? 0
    const gamesPlayed = wins + losses
    const gamesRemaining = NFL_GAMES - gamesPlayed
    const divStandings = getDivisionStandings(bet.team.divisionName)

    const base = { wins, losses, gamesPlayed, gamesRemaining, divStandings, teamRecord: live ?? null }

    if (bet.type === 'playoff_qualifier') {
      return { ...base, playoffStatus: live ? getPlayoffStatus(live) : null }
    }

    if (bet.type === 'miss_playoffs') {
      const status = live ? getPlayoffStatus(live) : null
      const inverted = status
        ? { inPosition: !status.inPosition, label: status.label }
        : null
      return { ...base, playoffStatus: inverted }
    }

    if (bet.type === 'win_total') {
      const pace = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * NFL_GAMES) : null
      const onPace = (live && pace !== null)
        ? (bet.under ? pace <= bet.target : pace >= bet.target)
        : null
      const pct = bet.under
        ? Math.min(100, (wins / (bet.target + 1)) * 100)
        : Math.min(100, (wins / bet.target) * 100)
      const winsNeeded = bet.under ? null : Math.max(0, bet.target - wins)
      return { ...base, target: bet.target, pace, winsNeeded, onPace, pct, nflGames: NFL_GAMES }
    }

    if (bet.type === 'division_winner') {
      const divRank = divStandings ? divStandings.findIndex(t => t.team.id === espnId) + 1 : 1
      const teamRow = divStandings?.find(t => t.team.id === espnId)
      return { ...base, divRank, gamesBack: teamRow?.gamesBack ?? '-', inFirst: divRank === 1 }
    }

    return base
  }

  return { loading, error, lastUpdated, refresh: () => fetch_(true), getNFLBetData }
}
