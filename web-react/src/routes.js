import { generatePath } from 'react-router'

// ADMIN:
export const SIGN_UP = '/signup'
export const LOG_IN = '/login'
export const LOG_OUT = '/logout'
export const NOT_FOUND = '/notfound'
export const NETWORK_ERROR = '/network-error'
export const ADMIN_DASHBOARD = '/admin/dashboard'

export const ADMIN_ORG_PLAYERS = '/admin/:organizationSlug/players'
export const ADMIN_ORG_PLAYER = '/admin/:organizationSlug/player/:playerId'
export const ADMIN_ORG_TEAMS = '/admin/:organizationSlug/teams'
export const ADMIN_ORG_TEAM = '/admin/:organizationSlug/team/:teamId'
export const ADMIN_ORGANIZATIONS = '/admin/organizations'
export const ADMIN_ORGANIZATION = '/admin/organization/:organizationId'
export const ADMIN_ORGANIZATION_DASHBOARD = '/admin/:organizationSlug'
export const ADMIN_COMPETITIONS = '/admin/:organizationSlug/competitions'
export const ADMIN_COMPETITION =
  '/admin/:organizationSlug/competition/:competitionId'
export const ADMIN_SPONSORS = '/admin/:organizationSlug/sponsors'
export const ADMIN_SPONSOR = '/admin/:organizationSlug/sponsor/:sponsorId'
export const ADMIN_SEASONS = '/admin/:organizationSlug/seasons'
export const ADMIN_SEASON = '/admin/:organizationSlug/season/:seasonId'
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
export const ADMIN_ORG_PERSONS = '/admin/:organizationSlug/persons'
export const ADMIN_ORG_PERSON = '/admin/:organizationSlug/person/:personId'
export const ADMIN_USERS = '/admin/users'
export const ADMIN_USER = '/admin/user/:userId'
export const ADMIN_SYSTEM_SETTINGS = '/admin/systemSettings'
export const ADMIN_GAMES = '/admin/games'
export const ADMIN_GAME = '/admin/game/:gameId'
export const ADMIN_STARS = '/admin/stars'
export const ADMIN_STAR = '/admin/star/:starId'
export const ADMIN_EVENTS = '/admin/events'
export const ADMIN_EVENT = '/admin/event/:eventId'

export const getAdminOrgPlayersRoute = organizationSlug =>
  generatePath(ADMIN_ORG_PLAYERS, { organizationSlug })
export const getAdminOrgPlayerRoute = (organizationSlug, playerId) =>
  generatePath(ADMIN_ORG_PLAYER, { organizationSlug, playerId })

export const getAdminOrgTeamsRoute = organizationSlug =>
  generatePath(ADMIN_ORG_TEAMS, { organizationSlug })
export const getAdminOrgTeamRoute = (organizationSlug, teamId) =>
  generatePath(ADMIN_ORG_TEAM, { organizationSlug, teamId })

export const getAdminOrganizationRoute = organizationId =>
  generatePath(ADMIN_ORGANIZATION, { organizationId })

export const getAdminOrganizationDashboardRoute = organizationSlug =>
  generatePath(ADMIN_ORGANIZATION_DASHBOARD, { organizationSlug })

export const getAdminOrgCompetitionsRoute = organizationSlug =>
  generatePath(ADMIN_COMPETITIONS, { organizationSlug })

export const getAdminOrgCompetitionRoute = (organizationSlug, competitionId) =>
  generatePath(ADMIN_COMPETITION, { organizationSlug, competitionId })

export const getAdminOrgSponsorsRoute = organizationSlug =>
  generatePath(ADMIN_SPONSORS, { organizationSlug })
export const getAdminOrgSponsorRoute = (organizationSlug, sponsorId) =>
  generatePath(ADMIN_SPONSOR, { organizationSlug, sponsorId })

export const getAdminOrgSeasonsRoute = organizationSlug =>
  generatePath(ADMIN_SEASONS, { organizationSlug })

export const getAdminOrgSeasonRoute = (organizationSlug, seasonId) =>
  generatePath(ADMIN_SEASON, { organizationSlug, seasonId })

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

export const getAdminOrgPersonsRoute = organizationSlug =>
  generatePath(ADMIN_ORG_PERSONS, { organizationSlug })

export const getAdminOrgPersonRoute = (organizationSlug, personId) =>
  generatePath(ADMIN_ORG_PERSON, { organizationSlug, personId })

export const getAdminUserRoute = userId => generatePath(ADMIN_USER, { userId })
export const getAdminGameRoute = gameId => generatePath(ADMIN_GAME, { gameId })
export const getAdminStarRoute = starId => generatePath(ADMIN_STAR, { starId })
export const getAdminEventRoute = eventId =>
  generatePath(ADMIN_EVENT, { eventId })
