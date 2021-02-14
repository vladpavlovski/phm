import { generatePath } from 'react-router'

// ADMIN:
export const SIGN_UP = '/signup'
export const LOG_IN = '/login'
export const LOG_OUT = '/logout'
export const NOT_FOUND = '/notfound'
export const NETWORK_ERROR = '/network-error'
export const ADMIN_DASHBOARD = '/admin/dashboard'
// export const ARTICLE = '/article/:gameId'
// export const LINK_MAP = '/linkMap'

export const ADMIN_PLAYERS = '/admin/players'
export const ADMIN_PLAYER = '/admin/player/:playerId'
export const ADMIN_TEAMS = '/admin/teams'
export const ADMIN_TEAM = '/admin/team/:teamId'
export const ADMIN_ASSOCIATIONS = '/admin/associations'
export const ADMIN_ASSOCIATION = '/admin/association/:associationId'
export const ADMIN_COMPETITIONS = '/admin/competitions'
export const ADMIN_COMPETITION = '/admin/competition/:competitionId'
export const ADMIN_SPONSORS = '/admin/sponsors'
export const ADMIN_SPONSOR = '/admin/sponsor/:sponsorId'
export const ADMIN_SEASONS = '/admin/seasons'
export const ADMIN_SEASON = '/admin/season/:seasonId'
export const ADMIN_VENUES = '/admin/venues'
export const ADMIN_VENUE = '/admin/venue/:venueId'

// export const getArticleRoute = gameId => generatePath(ARTICLE, { gameId })
// export const getArticleGeneratedRoute = gameId =>
//   generatePath(ARTICLE_GENERATED, { gameId })
// export const getTeamRoute = teamId => generatePath(TEAM, { teamId })
export const getAdminPlayerRoute = playerId =>
  generatePath(ADMIN_PLAYER, { playerId })

export const getAdminTeamRoute = teamId => generatePath(ADMIN_TEAM, { teamId })

export const getAdminAssociationRoute = associationId =>
  generatePath(ADMIN_ASSOCIATION, { associationId })

export const getAdminCompetitionRoute = competitionId =>
  generatePath(ADMIN_COMPETITION, { competitionId })

export const getAdminSponsorRoute = sponsorId =>
  generatePath(ADMIN_SPONSOR, { sponsorId })

export const getAdminSeasonRoute = seasonId =>
  generatePath(ADMIN_SEASON, { seasonId })

export const getAdminVenueRoute = venueId =>
  generatePath(ADMIN_VENUE, { venueId })
