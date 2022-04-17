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
  nick: string
  logo: string
  status: string
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
  nick: string
  short: string
  teamsLimit: number
  status: string
  competition: Competition
  season: Season
}

export type Phase = {
  phaseId: string
  name: string
  nick: string
  short: string
  startDate: Date
  endDate: Date
  status: string
  competition: Competition
  season: Season
}

export type Competition = {
  competitionId: string
  name: string
  phases: Phase[]
  groups: Group[]
  seasons: Season[]
  org: Organization
  sponsors: Sponsor[]
  teams: Team[]
  venues: Venue[]
}

export type Season = {
  seasonId: string
  name: string
  nick: string
  groups: Group[]
  phases: Phase[]
  competitions: Competition[]
  teams: Team[]
  venues: Venue[]
}

export type Meta = {
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
  jersey: number | null
  position: string | null
  captain: boolean
  goalkeeper: boolean | null
  star: boolean | null
  teamId: string
  avatar: string
  firstName: string
  id: string
  lastName: string
  name: string
  playerId: string
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
  gameStartedAt: string
  __typename?: string
}

export type PeriodStatistic = {
  periodStatisticId?: string
  period?: string
  hostGoals?: number
  guestGoals?: number
  hostPenalties?: number
  guestPenalties?: number
  hostPenaltyShots?: number
  guestPenaltyShots?: number
  hostInjuries?: number
  guestInjuries?: number
  hostSaves?: number
  guestSaves?: number
  hostFaceOffs?: number
  guestFaceOffs?: number
  gameResult?: GameResult
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
  periods: Period[]
  goalTypes: GoalType[]
  shotTypes: ShotType[]
  injuryTypes: InjuryType[]
  penaltyTypes: PenaltyType[]
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
  team: Team
  game: Game
  scoredBy: Meta
  allowedBy: Meta
  firstAssist: Meta
  secondAssist: Meta
  goalType: string
  goalSubType: string
  shotType: string
  shotSubType: string
  lostBy: Meta
  wonBy: Meta
  penaltyType: string
  penaltySubType: string
  duration: string
  penalized: Meta
  facedAgainst: Meta
  executedBy: Meta
  description: string
  injuryType: string
  suffered: Meta
  savedBy: Meta
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
  bankAccountNumber: string
  bankAccountCurrency: string
  bankCode: string
  competitions: Competition[]
  persons: Person[]
  occupations: Occupation[]
  sponsors: Sponsor[]
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
  competitions: Competition[]
  seasons: Season[]
  phases: Phase[]
  groups: Group[]
  teams: Team[]
  games: Game[]
  players: Player[]
  persons: Person[]
  venues: Venue[]
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
