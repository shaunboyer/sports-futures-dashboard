import { useState, useEffect, useCallback } from 'react'

const MLB_API = 'https://statsapi.mlb.com/api/v1'
const SEASON = 2026
const REFRESH_MS = 30 * 60 * 1000 // 30 minutes

export function useMLBData() {
  const [records, setRecords] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetch_ = useCallback(async (isManual = false) => {
    if (isManual) setLoading(true)
    try {
      const res = await fetch(
        `${MLB_API}/standings?leagueId=103,104&season=${SEASON}&standingsType=regularSeason&hydrate=team`
      )
      if (!res.ok) throw new Error(`MLB API error: ${res.status}`)
      const data = await res.json()
      setRecords(data.records || [])
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

  const getDivision = (divisionId) => {
    if (!records) return null
    return records.find((r) => r.division?.id === divisionId)?.teamRecords ?? null
  }

  const getTeam = (teamId, divisionId) => {
    return getDivision(divisionId)?.find((r) => r.team?.id === teamId) ?? null
  }

  const getPlayoffStatus = (teamRecord) => {
    if (!teamRecord) return null
    const divRank = parseInt(teamRecord.divisionRank)
    const wcRank = parseInt(teamRecord.wildCardRank)
    const wcGB = teamRecord.wildCardGamesBack ?? ''

    if (divRank === 1) {
      return { inPosition: true, label: 'Division Leader', sub: 'div. winner' }
    }
    if (!isNaN(wcRank) && wcRank >= 1 && wcRank <= 3) {
      return { inPosition: true, label: `Wild Card ${wcRank}`, sub: `wc ${wcRank}` }
    }
    const out = wcGB && wcGB !== '-' ? wcGB : '?'
    return { inPosition: false, label: `Out of Position`, sub: `${out} back` }
  }

  const getBetData = (bet) => {
    const divStandings = getDivision(bet.team.divisionId)
    const teamRecord = getTeam(bet.team.id, bet.team.divisionId)

    if (!divStandings || !teamRecord) return null

    const wins = teamRecord.wins ?? 0
    const losses = teamRecord.losses ?? 0
    const gamesPlayed = wins + losses
    const gamesRemaining = 162 - gamesPlayed
    const pace = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 162) : null

    const base = { teamRecord, divStandings, wins, losses, gamesPlayed, gamesRemaining }

    if (bet.type === 'playoff_qualifier') {
      return { ...base, playoffStatus: getPlayoffStatus(teamRecord) }
    }

    if (bet.type === 'win_total') {
      const winsNeeded = Math.max(0, bet.target - wins)
      const onPace = pace !== null ? pace >= bet.target : null
      const pct = Math.min(100, (wins / bet.target) * 100)
      return { ...base, target: bet.target, pace, winsNeeded, onPace, pct }
    }

    if (bet.type === 'division_winner') {
      const divRank = parseInt(teamRecord.divisionRank)
      const gb = teamRecord.gamesBack
      return { ...base, divRank, gamesBack: gb, inFirst: divRank === 1 }
    }

    return base
  }

  return {
    loading,
    error,
    lastUpdated,
    refresh: () => fetch_(true),
    getDivision,
    getBetData,
  }
}
