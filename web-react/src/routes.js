import { generatePath } from 'react-router'

// ADMIN:
export const SIGN_UP = '/signup'
export const LOG_IN = '/login'
export const LOG_OUT = '/logout'
export const NOT_FOUND = '/notfound'
export const NETWORK_ERROR = '/network-error'

export const ADMIN_DASHBOARD = '/admin/dashboard'

export const ADMIN_USERS = '/admin/users'
export const ADMIN_USER = '/admin/user/:userId'
export const ADMIN_SYSTEM_SETTINGS = '/admin/systemSettings'

export const ADMIN_ORG_PLAYERS = '/admin/players/:organizationSlug'
export const ADMIN_ORG_PLAYER = '/admin/player/:organizationSlug/:playerId'
export const ADMIN_ORG_TEAMS = '/admin/teams/:organizationSlug'
export const ADMIN_ORG_TEAM = '/admin/team/:organizationSlug/:teamId'
export const ADMIN_ORGANIZATIONS = '/admin/organizations'
export const ADMIN_ORGANIZATION = '/admin/organization/:organizationSlug'
export const ADMIN_ORGANIZATION_DASHBOARD = '/admin/dashboard/:organizationSlug'
export const ADMIN_ORG_COMPETITIONS = '/admin/competitions/:organizationSlug'
export const ADMIN_ORG_COMPETITION =
  '/admin/competition/:organizationSlug/:competitionId'
export const ADMIN_ORG_SPONSORS = '/admin/sponsors/:organizationSlug'
export const ADMIN_ORG_SPONSOR = '/admin/sponsor/:organizationSlug/:sponsorId'
export const ADMIN_ORG_SEASONS = '/admin/seasons/:organizationSlug'
export const ADMIN_ORG_SEASON = '/admin/season/:organizationSlug/:seasonId'
export const ADMIN_ORG_VENUES = '/admin/venues/:organizationSlug'
export const ADMIN_ORG_VENUE = '/admin/venue/:organizationSlug/:venueId'
export const ADMIN_PHASE = '/admin/phase/:phaseId'
export const ADMIN_PHASES = '/admin/phases'
export const ADMIN_GROUP = '/admin/group/:groupId'
export const ADMIN_GROUPS = '/admin/groups'
export const ADMIN_STARS = '/admin/stars'
export const ADMIN_STAR = '/admin/star/:starId'
export const ADMIN_ORG_PERSONS = '/admin/persons/:organizationSlug'
export const ADMIN_ORG_PERSON = '/admin/person/:organizationSlug/:personId'
export const ADMIN_ORG_AWARD = '/admin/award/:organizationSlug/:awardId'
export const ADMIN_ORG_AWARDS = '/admin/awards/:organizationSlug'
export const ADMIN_ORG_RULEPACK =
  '/admin/rulePack/:organizationSlug/:rulePackId'
export const ADMIN_ORG_RULEPACKS = '/admin/rulePacks/:organizationSlug'
export const ADMIN_ORG_EVENTS = '/admin/events/:organizationSlug'
export const ADMIN_ORG_EVENT = '/admin/event/:organizationSlug/:eventId'
export const ADMIN_ORG_GAMES = '/admin/games/:organizationSlug'
export const ADMIN_ORG_GAME = '/admin/game/:organizationSlug/:gameId'
export const ADMIN_ORG_GAME_PLAY = '/admin/game/:organizationSlug/:gameId/play'

export const WEB_LEAGUE_GAMES = '/web/league/:organizationSlug/games'

export const getAdminOrgPlayersRoute = organizationSlug =>
  generatePath(ADMIN_ORG_PLAYERS, { organizationSlug })
export const getAdminOrgPlayerRoute = (organizationSlug, playerId) =>
  generatePath(ADMIN_ORG_PLAYER, { organizationSlug, playerId })

export const getAdminOrgTeamsRoute = organizationSlug =>
  generatePath(ADMIN_ORG_TEAMS, { organizationSlug })
export const getAdminOrgTeamRoute = (organizationSlug, teamId) =>
  generatePath(ADMIN_ORG_TEAM, { organizationSlug, teamId })

export const getAdminOrganizationRoute = organizationSlug =>
  generatePath(ADMIN_ORGANIZATION, { organizationSlug })

export const getAdminOrganizationDashboardRoute = organizationSlug =>
  generatePath(ADMIN_ORGANIZATION_DASHBOARD, { organizationSlug })

export const getAdminOrgCompetitionsRoute = organizationSlug =>
  generatePath(ADMIN_ORG_COMPETITIONS, { organizationSlug })

export const getAdminOrgCompetitionRoute = (organizationSlug, competitionId) =>
  generatePath(ADMIN_ORG_COMPETITION, { organizationSlug, competitionId })

export const getAdminOrgSponsorsRoute = organizationSlug =>
  generatePath(ADMIN_ORG_SPONSORS, { organizationSlug })
export const getAdminOrgSponsorRoute = (organizationSlug, sponsorId) =>
  generatePath(ADMIN_ORG_SPONSOR, { organizationSlug, sponsorId })

export const getAdminOrgSeasonsRoute = organizationSlug =>
  generatePath(ADMIN_ORG_SEASONS, { organizationSlug })

export const getAdminOrgSeasonRoute = (organizationSlug, seasonId) =>
  generatePath(ADMIN_ORG_SEASON, { organizationSlug, seasonId })

export const getAdminOrgVenuesRoute = organizationSlug =>
  generatePath(ADMIN_ORG_VENUES, { organizationSlug })

export const getAdminOrgVenueRoute = (organizationSlug, venueId) =>
  generatePath(ADMIN_ORG_VENUE, { organizationSlug, venueId })

export const getAdminOrgRulePacksRoute = organizationSlug =>
  generatePath(ADMIN_ORG_RULEPACKS, { organizationSlug })

export const getAdminOrgRulePackRoute = (organizationSlug, rulePackId) =>
  generatePath(ADMIN_ORG_RULEPACK, { organizationSlug, rulePackId })

export const getAdminOrgAwardsRoute = organizationSlug =>
  generatePath(ADMIN_ORG_AWARDS, { organizationSlug })

export const getAdminOrgAwardRoute = (organizationSlug, awardId) =>
  generatePath(ADMIN_ORG_AWARD, { organizationSlug, awardId })

export const getAdminPhaseRoute = phaseId =>
  generatePath(ADMIN_PHASE, { phaseId })

export const getAdminGroupRoute = groupId =>
  generatePath(ADMIN_GROUP, { groupId })

export const getAdminOrgPersonsRoute = organizationSlug =>
  generatePath(ADMIN_ORG_PERSONS, { organizationSlug })

export const getAdminOrgPersonRoute = (organizationSlug, personId) =>
  generatePath(ADMIN_ORG_PERSON, { organizationSlug, personId })

export const getAdminUserRoute = userId => generatePath(ADMIN_USER, { userId })
export const getAdminStarRoute = starId => generatePath(ADMIN_STAR, { starId })
export const getAdminOrgEventsRoute = organizationSlug =>
  generatePath(ADMIN_ORG_EVENTS, { organizationSlug })

export const getAdminOrgEventRoute = (organizationSlug, eventId) =>
  generatePath(ADMIN_ORG_EVENT, { organizationSlug, eventId })

export const getAdminOrgGamesRoute = organizationSlug =>
  generatePath(ADMIN_ORG_GAMES, { organizationSlug })

export const getAdminOrgGameRoute = (organizationSlug, gameId) =>
  generatePath(ADMIN_ORG_GAME, { organizationSlug, gameId })

export const getAdminOrgGamePlayRoute = (organizationSlug, gameId) =>
  generatePath(ADMIN_ORG_GAME_PLAY, { organizationSlug, gameId })

export const getLeagueOrgGamesRoute = organizationSlug =>
  generatePath(WEB_LEAGUE_GAMES, { organizationSlug })
