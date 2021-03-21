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
export const ADMIN_ORGANIZATIONS = '/admin/organizations'
export const ADMIN_ORGANIZATION = '/admin/organization/:organizationId'
export const ADMIN_COMPETITIONS = '/admin/competitions'
export const ADMIN_COMPETITION = '/admin/competition/:competitionId'
export const ADMIN_SPONSORS = '/admin/sponsors'
export const ADMIN_SPONSOR = '/admin/sponsor/:sponsorId'
export const ADMIN_SEASONS = '/admin/seasons'
export const ADMIN_SEASON = '/admin/season/:seasonId'
export const ADMIN_VENUES = '/admin/venues'
export const ADMIN_VENUE = '/admin/venue/:venueId'
export const ADMIN_RULEPACK = '/admin/rulePack/:rulePackId'
export const ADMIN_RULEPACKS = '/admin/rulePacks'
export const ADMIN_AWARD = '/admin/award/:awardId'
export const ADMIN_AWARDS = '/admin/awards'
export const ADMIN_PHASE = '/admin/phase/:phaseId'
export const ADMIN_PHASES = '/admin/phases'
export const ADMIN_GROUP = '/admin/group/:groupId'
export const ADMIN_GROUPS = '/admin/groups'
export const ADMIN_PERSONS = '/admin/persons'
export const ADMIN_PERSON = '/admin/person/:personId'

// export const getArticleRoute = gameId => generatePath(ARTICLE, { gameId })
// export const getArticleGeneratedRoute = gameId =>
//   generatePath(ARTICLE_GENERATED, { gameId })
// export const getTeamRoute = teamId => generatePath(TEAM, { teamId })
export const getAdminPlayerRoute = playerId =>
  generatePath(ADMIN_PLAYER, { playerId })

export const getAdminTeamRoute = teamId => generatePath(ADMIN_TEAM, { teamId })

export const getAdminOrganizationRoute = organizationId =>
  generatePath(ADMIN_ORGANIZATION, { organizationId })

export const getAdminCompetitionRoute = competitionId =>
  generatePath(ADMIN_COMPETITION, { competitionId })

export const getAdminSponsorRoute = sponsorId =>
  generatePath(ADMIN_SPONSOR, { sponsorId })

export const getAdminSeasonRoute = seasonId =>
  generatePath(ADMIN_SEASON, { seasonId })

export const getAdminVenueRoute = venueId =>
  generatePath(ADMIN_VENUE, { venueId })

export const getAdminRulePackRoute = rulePackId =>
  generatePath(ADMIN_RULEPACK, { rulePackId })

export const getAdminAwardRoute = awardId =>
  generatePath(ADMIN_AWARD, { awardId })

export const getAdminPhaseRoute = phaseId =>
  generatePath(ADMIN_PHASE, { phaseId })

export const getAdminGroupRoute = groupId =>
  generatePath(ADMIN_GROUP, { groupId })

export const getAdminPersonRoute = personId =>
  generatePath(ADMIN_PERSON, { personId })
