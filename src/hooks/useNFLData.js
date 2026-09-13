import { useState, useEffect, useCallback } from 'react'

const NFL_API = 'https://site.api.espn.com/apis/v2/sports/football/nfl/standings'
const NFL_GAMES = 17
const REFRESH_MS = 30 * 60 * 1000

// ESPN NFL team IDs grouped by division
const NFL_DIVISIONS = {
  'AFC East':  [2, 15, 17, 20],    // BUF, MIA, NE, NYJ
  'AFC North': [33, 4, 5, 23],     // BAL, CIN, CLE, PIT
  'AFC South': [34, 11, 30, 10],   // HOU, IND, JAX, TEN
  'AFC West':  [7, 12, 13, 24],    // DEN, KC, LV, LAC
  'NFC East':  [6, 19, 21, 28],    // DAL, NYG, PHI, WAS
  'NFC North': [3, 8, 9, 16],      // CHI, DET, GB, MIN
  'NFC South': [1, 29, 18, 27],    // ATL, CAR, NO, TB
  'NFC West':  [22, 14, 25, 26],   // ARI, LAR, SF, SEA
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
    if (!teamMap) return null
    const ids = NFL_DIVISIONS[divisionName]
    if (!ids) return null

    const teams = ids.map(id => teamMap[id]).filter(Boolean)
    const sorted = [...teams].sort((a, b) =>
      b.wins - a.wins || a.losses - b.losses
    )

    const leader = sorted[0]
    return sorted.map((t, i) => {
      let gamesBack = '-'
      if (i > 0 && leader) {
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
    if (!teamMap) return null
    const espnId = bet.team.espnId
    if (!espnId) return null

    const team = teamMap[espnId]
    if (!team) return null

    const { wins, losses } = team
    const gamesPlayed = wins + losses
    const gamesRemaining = NFL_GAMES - gamesPlayed
    const divStandings = getDivisionStandings(bet.team.divisionName)

    const base = { wins, losses, gamesPlayed, gamesRemaining, divStandings, teamRecord: team }

    if (bet.type === 'playoff_qualifier') {
      return { ...base, playoffStatus: getPlayoffStatus(team) }
    }

    if (bet.type === 'miss_playoffs') {
      const status = getPlayoffStatus(team)
      const inverted = status
        ? { inPosition: !status.inPosition, label: status.label }
        : null
      return { ...base, playoffStatus: inverted }
    }

    if (bet.type === 'win_total') {
      const pace = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * NFL_GAMES) : null
      const onPace = pace !== null
        ? (bet.under ? pace <= bet.target : pace >= bet.target)
        : null
      const pct = bet.under
        ? Math.min(100, (wins / (bet.target + 1)) * 100)
        : Math.min(100, (wins / bet.target) * 100)
      const winsNeeded = bet.under ? null : Math.max(0, bet.target - wins)
      return { ...base, target: bet.target, pace, winsNeeded, onPace, pct, nflGames: NFL_GAMES }
    }

    if (bet.type === 'division_winner') {
      const divTeams = getDivisionStandings(bet.team.divisionName)
      const divRank = divTeams ? divTeams.findIndex(t => t.team.id === espnId) + 1 : null
      const teamRow = divTeams?.find(t => t.team.id === espnId)
      return { ...base, divRank, gamesBack: teamRow?.gamesBack ?? '-', inFirst: divRank === 1 }
    }

    return base
  }

  return { loading, error, lastUpdated, refresh: () => fetch_(true), getNFLBetData }
}
