import { PlayerLevel } from 'admin/pages/Player/components/PlayerLevel'
import { Error } from 'components/Error'
import { QuickSearchToolbar } from 'components/QuickSearchToolbar'
import { useLeagueSeasonState } from 'league/pages/Players/XGrid'
import React from 'react'
import { useParams } from 'react-router-dom'
import createPersistedState from 'use-persisted-state'
import { getXGridHeight } from 'utils'
import { useWindowSize, useXGridSearch } from 'utils/hooks'
import { Competition, Group, Phase, Player, Season, Team } from 'utils/types'
import { gql, useQuery } from '@apollo/client'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import {
  DataGridPro,
  GridColumns,
  GridRowModel,
  GridRowsProp,
  GridSortApi,
  useGridApiRef,
} from '@mui/x-data-grid-pro'

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
      levelCode
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
      name
      status
      startDate
      endDate
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

          const gamesForTeam = p?.gamesConnection?.edges.filter(
            (edge: { star: boolean | null; teamId: string }) =>
              edge.teamId === t.teamId
          ).length

          return {
            name: p?.name,
            playerId: p?.playerId,
            id: p?.playerId + t.teamId,
            avatar: p?.avatar,
            levelCode: p?.levelCode,
            team: t,
            teamName: t.name,
            gamesPlayed: gamesForTeam,
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
            levelCode: p?.levelCode,
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

const useLeaguePlayerStatGroup = createPersistedState(
  'HMS-LeaguePlayerStatGroup'
)
const useLeaguePlayerStatPhase = createPersistedState(
  'HMS-LeaguePlayerStatPhase'
)
const useLeaguePlayerStatCompetition = createPersistedState(
  'HMS-LeaguePlayerStatCompetition'
)

const XGridTable = () => {
  const { organizationSlug } = useParams<TPlayersStatisticsParams>()

  const [selectedSeason, setSelectedSeason] =
    useLeagueSeasonState<Season | null>(null)

  const [selectedGroup, setSelectedGroup] =
    useLeaguePlayerStatGroup<Group | null>(null)
  const [selectedPhase, setSelectedPhase] =
    useLeaguePlayerStatPhase<Phase | null>(null)
  const [selectedCompetition, setSelectedCompetition] =
    useLeaguePlayerStatCompetition<Competition | null>(null)

  // const [actualSeason, setActualSeason] = React.useState<Season | null>(null)
  const windowSize = useWindowSize()
  const toolbarRef = React.useRef()
  const theme = useTheme()
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))

  const { error, loading, data } = useQuery<PlayersData>(
    GET_PLAYERS_STATISTICS,
    {
      variables: {
        whereGames: {
          startDate_GTE: selectedSeason?.startDate,
          startDate_LTE: selectedSeason?.endDate,
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
          org: {
            urlSlug: organizationSlug,
          },
        },
      },
    }
  )

  // React.useEffect(() => {
  //   data?.seasons && setActualSeason(data?.seasons?.[0] || null)
  // }, [data])

  const apiRef = useGridApiRef()

  const getRowIndex = React.useCallback<GridSortApi['getRowIndex']>(
    id =>
      apiRef.current ? apiRef.current.getSortedRowIds().indexOf(id) + 1 : 0,
    [apiRef]
  )

  const columns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'index',
        headerName: '',
        width: 5,
        sortable: false,
        disableColumnMenu: true,
        renderCell: params => {
          return <>{getRowIndex(params.row.id)}</>
        },
      },
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
        field: 'levelCode',
        headerName: 'Level',
        width: 150,
        renderCell: params => {
          return <PlayerLevel code={params.value} />
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
    <Container maxWidth={false}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Error message={error?.message} />
          <Stack gap={1}>
            <ButtonGroup
              size={upSm ? 'medium' : 'small'}
              aria-label="outlined button group"
              variant="outlined"
            >
              {data?.seasons?.map(season => {
                return (
                  <Button
                    key={season.seasonId}
                    type="button"
                    color="primary"
                    variant={
                      selectedSeason?.seasonId === season?.seasonId
                        ? 'contained'
                        : 'outlined'
                    }
                    onClick={() => {
                      setSelectedSeason(
                        season?.seasonId === selectedSeason?.seasonId
                          ? null
                          : season
                      )
                    }}
                  >
                    {season?.name}
                  </Button>
                )
              })}
            </ButtonGroup>
            <ButtonGroup
              size={upSm ? 'medium' : 'small'}
              aria-label="outlined button group"
              variant="outlined"
            >
              {selectedSeason?.competitions?.map(g => {
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
                        g?.competitionId === selectedCompetition?.competitionId
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
              {selectedSeason?.groups?.map(g => {
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
              {selectedSeason?.phases?.map(g => {
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

          {selectedSeason ? (
            <div
              style={{
                height: getXGridHeight(toolbarRef.current, windowSize),
              }}
              // className={classes.xGridWrapper}
            >
              <DataGridPro
                apiRef={apiRef}
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
          ) : (
            <Typography variant="h6" component="h6">
              Select season to see players
            </Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}

export { XGridTable as default }
