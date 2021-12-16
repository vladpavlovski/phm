export type Player = {
  playerId: string
  name: string
  firstName: string
  lastName: string
  avatar: string
  teams: Team[]
  gamesConnection: { totalCount: number; edges: { star: boolean | null }[] }
  meta: MetaConnection[]
  jerseys: Jersey[]
  positions: Position[]
}

export type Group = {
  groupId: string
  name: string
}

export type Phase = {
  phaseId: string
  name: string
}

export type Competition = {
  competitionId: string
  name: string
}

export type Season = {
  groups: Group[]
  phases: Phase[]
  competitions: Competition[]
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

export type Team = {
  teamId: string
  name: string
  logo: string
  groups: Group[]
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
  teamsConnection: GameTeamsConnection
  gameResult: GameResult
}

type GameTeamsConnection = {
  edges: GameTeamsRelationship[]
}

type GameTeamsRelationship = {
  host: boolean
  node: Team
}

type GameResult = {
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

export type ResultPoint = {
  resultPointId: string
  name: string
  code: string
  points: number
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
