import { generatePath } from 'react-router'

// ADMIN:
export const SIGN_UP = '/signup'
export const LOG_IN = '/login'
export const LOG_OUT = '/logout'
export const NOT_FOUND = '/notfound'
export const ADMIN_DASHBOARD = '/admin/dashboard'
// export const ARTICLE = '/article/:gameId'
// export const LINK_MAP = '/linkMap'
// export const TEAMS = '/teams'
// export const TEAM = '/team/:teamId'
export const ADMIN_PLAYERS = '/admin/players'
export const PLAYER = '/admin/player/:playerId'
// export const PLAYER_MERGE = '/playerMerge'

// export const getArticleRoute = gameId => generatePath(ARTICLE, { gameId })
// export const getArticleGeneratedRoute = gameId =>
//   generatePath(ARTICLE_GENERATED, { gameId })
// export const getTeamRoute = teamId => generatePath(TEAM, { teamId })
export const getAdminPlayerRoute = playerId =>
  generatePath(PLAYER, { playerId })
