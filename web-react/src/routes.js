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
// export const PLAYER_MERGE = '/playerMerge'

// export const getArticleRoute = gameId => generatePath(ARTICLE, { gameId })
// export const getArticleGeneratedRoute = gameId =>
//   generatePath(ARTICLE_GENERATED, { gameId })
// export const getTeamRoute = teamId => generatePath(TEAM, { teamId })
export const getAdminPlayerRoute = playerId =>
  generatePath(ADMIN_PLAYER, { playerId })
export const getAdminTeamRoute = teamId => generatePath(ADMIN_TEAM, { teamId })
