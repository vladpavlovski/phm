export type Player = {
  playerId: string
  name: string
  firstName: string
  lastName: string
  avatar: string
  teams: Team[]
  gamesConnection?: { totalCount: number; edges: { star: boolean }[] }
  meta: Meta
  jerseys: Jersey[]
  positions: Position[]
  sponsors: Sponsor[]
}

export type Team = {
  teamId: string
  name: string
  logo: string
  groups: Group[]
  phases: Phase[]
  orgs: Organization[]
  competitions: Competition[]
  seasons: Season[]
  occupations: Occupation[]
  positions: Position[]
  sponsors: Sponsor[]
  jerseys: Jersey[]
  players: Player[]
  persons: Person[]
}

type ActivityStatus = 'ACTIVE' | 'INACTIVE' | 'RETIRED' | 'UNKNOWN'

export type Person = {
  personId: string
  name: string
  firstName: string
  lastName: string
  birthday: Date
  userName: string
  phone: string
  email: string
  gender: string
  height: string
  weight: string
  externalId: string
  activityStatus: ActivityStatus
  countryBirth: string
  cityBirth: string
  country: string
  city: string
  avatar: string
  occupations: Occupation[]
}

export type Group = {
  groupId: string
  name: string
  competition: Competition
}

export type Phase = {
  phaseId: string
  name: string
  competition: Competition
}

export type Competition = {
  competitionId: string
  name: string
  phases: Phase[]
  groups: Group[]
  seasons: Season[]
}

export type Season = {
  seasonId: string
  name: string
  groups: Group[]
  phases: Phase[]
  competitions: Competition[]
  teams: Team[]
  venues: Venue[]
}

type Meta = {
  metaPlayerId: string
}

export type MetaConnection = {
  [key: string]: {
    totalCount: number
    edges: {
      node: {
        team: {
          teamId: string
        }
      }
    }
  }
}

export type Game = {
  gameId: string
  name: string
  type: string
  startDate: Date
  endDate: Date
  startTime: string
  endTime: string
  foreignId: string
  info: string
  description: string
  timekeeper: string
  referee: string
  status: string
  flickrAlbum: string
  report: string
  headline: string
  perex: string
  body: string
  group: Group
  phase: Phase
  teams: Team[]
  venue: Venue
  teamsConnection: GameTeamsConnection
  playersConnection: GamePlayersConnection
  gameResult: GameResult
  gameEventsSimple: GameEventSimple[]
}

type GameTeamsConnection = {
  edges: GameTeamsRelationship[]
}

export type GameTeamsRelationship = {
  host: boolean
  node: Team
}

export type GamePlayersConnection = {
  edges: GamePlayersRelationship[]
}

export type GamePlayersRelationship = {
  node: Player
  host: boolean
  jersey: number
  position: string
  captain: boolean
  goalkeeper: boolean
  star: boolean
  teamId: string
}

export type GameResult = {
  gameResultId: string
  periodActive: string
  gameStatus: string
  hostGoals: number
  guestGoals: number
  hostPenalties: number
  guestPenalties: number
  hostPenaltyShots: number
  guestPenaltyShots: number
  hostInjuries: number
  guestInjuries: number
  hostSaves: number
  guestSaves: number
  hostFaceOffs: number
  guestFaceOffs: number
  hostWin: boolean
  guestWin: boolean
  draw: boolean
  periodStatistics: PeriodStatistic[]
  game: Game
}

type PeriodStatistic = {
  periodStatisticId: string
  period: string
  hostGoals: number
  guestGoals: number
  hostPenalties: number
  guestPenalties: number
  hostPenaltyShots: number
  guestPenaltyShots: number
  hostInjuries: number
  guestInjuries: number
  hostSaves: number
  guestSaves: number
  hostFaceOffs: number
  guestFaceOffs: number
  gameResult: GameResult
}

export type SystemSettings = {
  systemSettingsId: string
  name: string
  language: string
  rulePack: RulePack
}

export type RulePack = {
  rulePackId: string
  name: string
  resultPoints: ResultPoint[]
}

export type Jersey = {
  jerseyId: string
  name: string
  number: number
  player: Player
  team: Team
}
export type Position = {
  positionId: string
  name: string
  short: string
  description: string
  players: Player[]
  team: Team
}

export type Venue = {
  venueId: string
  name: string
  nick: string
  short: string
  web: string
  description: string
  location: string
  foundDate: Date
  capacity: number
  logo: string
  competitions: Competition[]
  groups: Group[]
  phases: Phase[]
  seasons: Season[]
}

export type GameEventSimple = {
  gameEventSimpleId: string
  timestamp: string
  location: string
  period: string
  remainingTime: string
  eventType: string
  eventTypeCode: string
}

export type Organization = {
  organizationId: string
  name: string
  nick: string
  short: string
  status: string
  foundDate: Date
  legalName: string
  logo: string
  urlSlug: string
  urlGameLinks: string
  ownerId: string
  competitions: Competition[]
  persons: Person[]
  occupations: Occupation
}

export type Occupation = {
  occupationId: string
  name: string
  description: string
}

export type Sponsor = {
  sponsorId: string
  name: string
  nick: string
  short: string
  claim: string
  web: string
  description: string
  legalName: string
  logo: string
  awards: Award[]
  competitions: Competition[]
  groups: Group[]
  phases: Phase[]
  players: Player[]
  teams: Team[]
}

export type Award = {
  awardId: string
  name: string
  nick: string
  short: string
  description: string
  type: string
  foundDate: Date
  sponsors: Sponsor[]
}

export type PositionType = {
  positionTypeId: string
  name: string
  short: string
  description: string
  priority: number
  rulePack: RulePack
}

export type Period = {
  periodId: string
  name: string
  code: string
  duration: number
  priority: number
  rulePack: RulePack
}

export type ShotType = {
  shotTypeId: string
  name: string
  code: string
  priority: number
  rulePack: RulePack
  subTypes: ShotSubType[]
}

export type ShotSubType = {
  shotSubTypeId: string
  name: string
  code: string
  priority: number
  shotType?: ShotType
}

export type ShotTarget = {
  shotTargetId: string
  name: string
  code: string
  priority: number
  rulePack: RulePack
}

export type ShotStyle = {
  shotStyleId: string
  name: string
  code: string
  priority: number
  rulePack: RulePack
}

export type GoalType = {
  goalTypeId: string
  name: string
  code: string
  priority: number
  rulePack: RulePack
  subTypes: GoalSubType[]
}

export type GoalSubType = {
  goalSubTypeId: string
  name: string
  code: string
  priority: number
  goalType?: GoalType
}

export type PenaltyType = {
  penaltyTypeId: string
  name: string
  code: string
  duration: number
  priority: number
  rulePack: RulePack
  subTypes: PenaltySubType[]
}

export type PenaltySubType = {
  penaltySubTypeId: string
  name: string
  code: string
  duration: number
  priority: number
  penaltyType?: PenaltyType
}

export type PenaltyShotStatus = {
  penaltyShotStatusId: string
  name: string
  code: string
  priority: number
  rulePack: RulePack
}

export type InjuryType = {
  injuryTypeId: string
  name: string
  code: string
  priority: number
  rulePack: RulePack
}

export type ResultType = {
  resultTypeId: string
  name: string
  rulePack: RulePack
}

export type ResultPoint = {
  resultPointId: string
  name: string
  code: string
  points: number
  rulePack: RulePack
}

export type GameEventLocation = {
  gameEventLocationId: string
  name: string
  fieldX: string
  fieldY: string
  priority: number
  rulePack: RulePack
}
