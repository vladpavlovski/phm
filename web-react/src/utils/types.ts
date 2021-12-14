export type Player = {
  playerId: string
  name: string
  firstName: string
  lastName: string
  avatar: string
  teams: Team[]
  gamesConnection: { totalCount: number; edges: { star: boolean | null }[] }
  meta: MetaConnection[]
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
}
