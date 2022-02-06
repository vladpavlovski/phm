import React from 'react'
import { useQuery, gql } from '@apollo/client'
import { useParams } from 'react-router-dom'
import createPersistedState from 'use-persisted-state'

import { useTheme } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import {
  DataGridPro,
  GridColumns,
  GridRowModel,
  GridRowsProp,
} from '@mui/x-data-grid-pro'
import { useStyles } from 'admin/pages/commonComponents/styled'
import { Error } from 'components/Error'
import dayjs from 'dayjs'
import { useWindowSize, useXGridSearch } from 'utils/hooks'

import { QuickSearchToolbar } from 'components/QuickSearchToolbar'
import { getXGridHeight } from 'utils'
import useMediaQuery from '@mui/material/useMediaQuery'

import { Player, Group, Phase, Competition, Season, Team } from 'utils/types'

const GET_PLAYERS_STATISTICS = gql`
  query getPlayersStatistics(
    $whereGames: GameWhere
    $whereSeason: SeasonWhere
  ) {
    players(where: { games: $whereGames }) {
      playerId
      name
      firstName
      lastName
      avatar
      gamesConnection(where: { node: $whereGames }) {
        totalCount
        edges {
          star
          teamId
        }
      }
      teams {
        teamId
        name
        logo
      }
      meta {
        eventsGoalConnection(where: { node: { game: $whereGames } }) {
          totalCount
          edges {
            node {
              team {
                teamId
              }
            }
          }
        }
        eventsFirstAssistConnection(where: { node: { game: $whereGames } }) {
          totalCount
          edges {
            node {
              team {
                teamId
              }
            }
          }
        }
        eventsSecondAssistConnection(where: { node: { game: $whereGames } }) {
          totalCount
          edges {
            node {
              team {
                teamId
              }
            }
          }
        }
      }
    }
    seasons(where: $whereSeason) {
      seasonId
      competitions {
        competitionId
        name
      }
      phases {
        phaseId
        name
      }
      groups {
        groupId
        name
      }
    }
  }
`

type TPlayer = GridRowModel & Player

type PlayersData = {
  players: TPlayer[]
  seasons: Season[]
}

const countPlayersStatisticsData = (data: PlayersData | undefined) => {
  if (!data) return []
  const output = [...data?.players]
    .reduce((acc: GridRowModel[], p: GridRowModel) => {
      let rowForm
      if (p?.teams.length > 1) {
        rowForm = p.teams.map((t: Team) => {
          function countValues(data: {
            totalCount: number
            edges: {
              node: {
                team: {
                  teamId: string
                }
              }
            }[]
          }) {
            return data.edges?.filter(
              edge => edge.node.team.teamId === t.teamId
            ).length
          }

          const goalsForTeam = countValues(p.meta.eventsGoalConnection)
          const firstAssistsForTeam = countValues(
            p.meta.eventsFirstAssistConnection
          )

          const secondAssistsForTeam = countValues(
            p.meta.eventsSecondAssistConnection
          )

          const starsForTeam = p?.gamesConnection?.edges.filter(
            (edge: { star: boolean | null; teamId: string }) =>
              edge.teamId === t.teamId && edge.star
          ).length

          return {
            name: p?.name,
            playerId: p?.playerId,
            id: p?.playerId + t.teamId,
            avatar: p?.avatar,
            team: t,
            teamName: t.name,
            gamesPlayed: p?.gamesConnection?.totalCount,
            goals: goalsForTeam,
            assists: firstAssistsForTeam + secondAssistsForTeam,
            points: goalsForTeam + firstAssistsForTeam + secondAssistsForTeam,
            stars: starsForTeam,
          }
        })
      } else {
        rowForm = [
          {
            name: p?.name,
            playerId: p?.playerId,
            id: p?.playerId,
            avatar: p?.avatar,
            team: p?.teams?.[0],
            teamName: p?.teams?.[0]?.name,
            gamesPlayed: p?.gamesConnection?.totalCount,
            goals: p?.meta?.eventsGoalConnection?.totalCount,
            assists:
              p?.meta?.eventsFirstAssistConnection?.totalCount +
              p?.meta?.eventsSecondAssistConnection?.totalCount,
            points:
              p?.meta?.eventsFirstAssistConnection?.totalCount +
              p?.meta?.eventsSecondAssistConnection?.totalCount +
              p?.meta?.eventsGoalConnection?.totalCount,
            stars: p?.gamesConnection?.edges?.filter(
              (e: { star: boolean | null }) => e?.star
            )?.length,
          },
        ]
      }

      return [...acc, ...rowForm]
    }, [])
    .sort((a, b) => b.points - a.points)

  return output
}

type TPlayersStatisticsParams = {
  organizationSlug: string
}

const useLeaguePlayerStatGroup = createPersistedState<Group | null>(
  'HMS-LeaguePlayerStatGroup'
)
const useLeaguePlayerStatPhase = createPersistedState<Phase | null>(
  'HMS-LeaguePlayerStatPhase'
)
const useLeaguePlayerStatCompetition = createPersistedState<Competition | null>(
  'HMS-LeaguePlayerStatCompetition'
)

const XGridTable: React.FC = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams<TPlayersStatisticsParams>()

  const [selectedGroup, setSelectedGroup] = useLeaguePlayerStatGroup(null)
  const [selectedPhase, setSelectedPhase] = useLeaguePlayerStatPhase(null)
  const [selectedCompetition, setSelectedCompetition] =
    useLeaguePlayerStatCompetition(null)

  const [actualSeason, setActualSeason] = React.useState<Season | null>(null)
  const windowSize = useWindowSize()
  const toolbarRef = React.useRef()
  const theme = useTheme()
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))

  const { error, loading, data } = useQuery<PlayersData>(
    GET_PLAYERS_STATISTICS,
    {
      variables: {
        whereGames: {
          startDate_GTE: '2021-09-01',
          startDate_LTE: dayjs().format('YYYY-MM-DD'),
          org: {
            urlSlug: organizationSlug,
          },
          ...(selectedPhase && {
            phase: {
              phaseId: selectedPhase.phaseId,
            },
          }),
          ...(selectedGroup && {
            group: {
              groupId: selectedGroup.groupId,
            },
          }),
          ...(selectedCompetition && {
            OR: [
              {
                phase: {
                  competition: {
                    competitionId: selectedCompetition.competitionId,
                  },
                },
              },
              {
                group: {
                  competition: {
                    competitionId: selectedCompetition.competitionId,
                  },
                },
              },
            ],
          }),
        },
        whereSeason: {
          name: '2021-2022',
          org: {
            urlSlug: organizationSlug,
          },
        },
      },
    }
  )

  React.useEffect(() => {
    data?.seasons && setActualSeason(data?.seasons?.[0] || null)
  }, [data])

  const columns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 160,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <Chip
              size="small"
              avatar={
                <Avatar alt={params?.row?.name} src={params?.row?.avatar} />
              }
              label={params?.value}
              color="info"
            />
          )
        },
      },
      {
        field: 'team',
        headerName: 'Team',
        width: 160,
        disableColumnMenu: true,
        valueGetter: params => params?.row?.team?.name,
        renderCell: params => {
          const team = params.row?.team
          return (
            <Stack spacing={1} direction="row">
              <Chip
                size="small"
                avatar={<Avatar alt={team?.name} src={team?.logo} />}
                label={team?.name}
                color="info"
              />
            </Stack>
          )
        },
      },
      {
        field: 'gamesPlayed',
        headerName: 'GP',
        width: 50,
        headerAlign: 'center',
        align: 'center',
        headerClassName: upSm ? '' : 'hms-iframe--header',
        cellClassName: upSm ? '' : 'hms-iframe--cell',
        disableColumnMenu: true,
      },
      {
        field: 'goals',
        headerName: 'G',
        width: 50,
        headerAlign: 'center',
        align: 'center',
        headerClassName: upSm ? '' : 'hms-iframe--header',
        cellClassName: upSm ? '' : 'hms-iframe--cell',
        disableColumnMenu: true,
      },
      {
        field: 'assists',
        headerName: 'A',
        width: 50,
        headerAlign: 'center',
        align: 'center',
        headerClassName: upSm ? '' : 'hms-iframe--header',
        cellClassName: upSm ? '' : 'hms-iframe--cell',
        disableColumnMenu: true,
      },
      {
        field: 'points',
        headerName: 'PTS',
        width: 50,
        headerAlign: 'center',
        align: 'center',
        headerClassName: upSm ? '' : 'hms-iframe--header',
        cellClassName: upSm ? '' : 'hms-iframe--cell',
        disableColumnMenu: true,
      },
      {
        field: 'stars',
        headerName: 'Star',
        width: 50,
        headerAlign: 'center',
        align: 'center',
        headerClassName: upSm ? '' : 'hms-iframe--header',
        cellClassName: upSm ? '' : 'hms-iframe--cell',
        disableColumnMenu: true,
      },
    ],
    [upSm]
  )

  const playersData = React.useMemo((): GridRowsProp[] => {
    const preparedData = countPlayersStatisticsData(data)
    return preparedData as GridRowsProp[]
  }, [data])

  const searchIndexes = React.useMemo(() => ['name', 'teamName'], [])

  const [searchText, searchData, requestSearch] = useXGridSearch({
    searchIndexes,
    data: playersData,
  })

  return (
    <Container maxWidth={false} className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Error message={error?.message} />

          <>
            <Stack>
              <ButtonGroup
                size={upSm ? 'medium' : 'small'}
                aria-label="outlined button group"
                variant="outlined"
              >
                {actualSeason?.competitions?.map(g => {
                  return (
                    <Button
                      key={g.competitionId}
                      type="button"
                      color="primary"
                      variant={
                        selectedCompetition?.competitionId === g?.competitionId
                          ? 'contained'
                          : 'outlined'
                      }
                      onClick={() => {
                        setSelectedCompetition(
                          g?.competitionId ===
                            selectedCompetition?.competitionId
                            ? null
                            : g
                        )
                      }}
                    >
                      {g?.name}
                    </Button>
                  )
                })}
              </ButtonGroup>
              <ButtonGroup
                size={upSm ? 'medium' : 'small'}
                aria-label="outlined button group"
                variant="outlined"
              >
                {actualSeason?.groups?.map(g => {
                  return (
                    <Button
                      key={g.groupId}
                      type="button"
                      color="primary"
                      variant={
                        selectedGroup?.groupId === g?.groupId
                          ? 'contained'
                          : 'outlined'
                      }
                      onClick={() => {
                        setSelectedGroup(
                          g?.groupId === selectedGroup?.groupId ? null : g
                        )
                      }}
                    >
                      {g?.name}
                    </Button>
                  )
                })}
              </ButtonGroup>
              <ButtonGroup
                size={upSm ? 'medium' : 'small'}
                aria-label="outlined button group"
                variant="outlined"
              >
                {actualSeason?.phases?.map(g => {
                  return (
                    <Button
                      key={g.phaseId}
                      type="button"
                      color="primary"
                      variant={
                        selectedPhase?.phaseId === g?.phaseId
                          ? 'contained'
                          : 'outlined'
                      }
                      onClick={() => {
                        setSelectedPhase(
                          g?.phaseId === selectedPhase?.phaseId ? null : g
                        )
                      }}
                    >
                      {g?.name}
                    </Button>
                  )
                })}
              </ButtonGroup>
            </Stack>

            <div
              style={{
                height: getXGridHeight(toolbarRef.current, windowSize),
              }}
              className={classes.xGridWrapper}
            >
              <DataGridPro
                disableSelectionOnClick
                disableMultipleSelection
                density="compact"
                columns={columns}
                rows={searchData}
                loading={loading}
                components={{
                  Toolbar: QuickSearchToolbar,
                }}
                componentsProps={{
                  toolbar: {
                    value: searchText,
                    onChange: (
                      event: React.ChangeEvent<HTMLInputElement>
                    ): void => {
                      requestSearch(event.target.value)
                    },
                    clearSearch: () => {
                      requestSearch('')
                    },
                  },
                }}
              />
            </div>
          </>
        </Grid>
      </Grid>
    </Container>
  )
}

export { XGridTable as default }
