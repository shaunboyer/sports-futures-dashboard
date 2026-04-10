// Maps MLB Stats API team ID → ESPN logo slug
// Usage: https://a.espncdn.com/i/teamlogos/mlb/500/{slug}.png
export const MLB_LOGO_SLUGS = {
  // AL East
  110: 'bal',   // Baltimore Orioles
  111: 'bos',   // Boston Red Sox
  147: 'nyy',   // New York Yankees
  139: 'tb',    // Tampa Bay Rays
  141: 'tor',   // Toronto Blue Jays
  // AL Central
  145: 'cws',   // Chicago White Sox
  114: 'cle',   // Cleveland Guardians
  116: 'det',   // Detroit Tigers
  118: 'kc',    // Kansas City Royals
  142: 'min',   // Minnesota Twins
  // AL West
  117: 'hou',   // Houston Astros
  108: 'laa',   // Los Angeles Angels
  133: 'oak',   // Athletics (ESPN slug — confirm if changed)
  136: 'sea',   // Seattle Mariners
  140: 'tex',   // Texas Rangers
  // NL East
  144: 'atl',   // Atlanta Braves
  146: 'mia',   // Miami Marlins
  121: 'nym',   // New York Mets
  143: 'phi',   // Philadelphia Phillies
  120: 'wsh',   // Washington Nationals
  // NL Central
  112: 'chc',   // Chicago Cubs
  113: 'cin',   // Cincinnati Reds
  158: 'mil',   // Milwaukee Brewers
  134: 'pit',   // Pittsburgh Pirates
  138: 'stl',   // St. Louis Cardinals
  // NL West
  109: 'ari',   // Arizona Diamondbacks
  115: 'col',   // Colorado Rockies
  119: 'lad',   // Los Angeles Dodgers
  135: 'sd',    // San Diego Padres
  137: 'sf',    // San Francisco Giants
}

export function getLogoUrl(teamId) {
  const slug = MLB_LOGO_SLUGS[teamId]
  if (!slug) return null
  return `https://a.espncdn.com/i/teamlogos/mlb/500/${slug}.png`
}
