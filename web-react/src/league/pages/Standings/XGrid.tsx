import { Error } from 'components/Error'
import { Loader } from 'components/Loader'
import dayjs from 'dayjs'
import React from 'react'
import { useParams } from 'react-router-dom'
import createPersistedState from 'use-persisted-state'
import { setIdFromEntityId } from 'utils'
import { useXGridSearch } from 'utils/hooks'
import { Game, Group, ResultPoint, SystemSettings, Team } from 'utils/types'
import { gql, useQuery } from '@apollo/client'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import {
  DataGridPro,
  GridColumns,
  GridRowModel,
  GridSortApi,
  useGridApiRef,
} from '@mui/x-data-grid-pro'

type TStandings = {
  gamesTotal: number
  win: number
  lost: number
  draw: number
  score: number
  allowed: number
  points: number
}

type TStandingsTeam = {
  teamId?: string
  name?: string
  logo?: string
  standings: TStandings
}

type TResultPointsTemp = {
  win: number
  lost: number
  draw: number
}

const countStandingsByTeam = (
  data: TGamesData,
  systemSettings: SystemSettings[]
) => {
  try {
    const resultPoints: TResultPointsTemp =
      systemSettings?.[0]?.rulePack?.resultPoints?.reduce(
        (acc, resultPoint: ResultPoint): TResultPointsTemp => {
          const { code, points } = resultPoint
          const rulePoint = {
            [code.toLowerCase()]: points,
          }

          return { ...acc, ...rulePoint }
        },
        { win: 0, lost: 0, draw: 0 }
      )

    const standingsTemplate = {
      gamesTotal: 0,
      win: 0,
      lost: 0,
      draw: 0,
      score: 0,
      allowed: 0,
      points: 0,
    }

    // object to return
    let standings: TStandingsTeam[] = []

    const getTeamStandings = ({
      game,
      host,
      team,
    }: {
      game: Game
      host: boolean
      team: Team
    }) => {
      const prefix = host ? 'host' : 'guest'
      const prefixRival = !host ? 'host' : 'guest'

      const teamExistsInStandings = !!standings.find(
        t => t.teamId === team?.teamId
      )

      if (!teamExistsInStandings) {
        standings = [...standings, { ...team, standings: standingsTemplate }]
      }

      const teamStandings =
        standings.find(t => t.teamId === team.teamId)?.standings ||
        standingsTemplate

      // count standings

      const newTeamStandings: TStandings = { ...teamStandings }

      newTeamStandings.gamesTotal += 1

      const teamWinGame = game?.gameResult?.[`${prefix}Win`]

      newTeamStandings.win = teamWinGame
        ? newTeamStandings.win + 1
        : newTeamStandings.win

      newTeamStandings.lost = game?.gameResult?.draw
        ? newTeamStandings.lost
        : teamWinGame
        ? newTeamStandings.lost
        : newTeamStandings.lost + 1

      newTeamStandings.draw = game?.gameResult?.draw
        ? newTeamStandings.draw + 1
        : newTeamStandings.draw

      newTeamStandings.score = game?.gameResult
        ? newTeamStandings.score + game?.gameResult?.[`${prefix}Goals`]
        : newTeamStandings.score

      newTeamStandings.allowed = game?.gameResult
        ? newTeamStandings.allowed + game?.gameResult?.[`${prefixRival}Goals`]
        : newTeamStandings.allowed

      newTeamStandings.points = teamWinGame
        ? newTeamStandings.points + resultPoints.win
        : teamStandings.points - resultPoints?.lost

      newTeamStandings.points = game?.gameResult?.draw
        ? newTeamStandings.points + resultPoints.draw
        : newTeamStandings.points

      const teamFromStandings = standings.find(t => t.teamId === team.teamId)

      if (teamFromStandings) teamFromStandings.standings = newTeamStandings
    }

    // iterate each game, count standings for host nad guest teams
    data.games.forEach(game => {
      const host = game.teamsConnection.edges.find(t => t.host)?.node
      const guest = game.teamsConnection.edges.find(t => !t.host)?.node

      !!host &&
        getTeamStandings({
          game,
          team: host,
          host: true,
        })
      !!guest &&
        getTeamStandings({
          game,
          team: guest,
          host: false,
        })
    })

    return standings
  } catch (e) {
    console.error(e)
  }
}

const GET_GAMES = gql`
  query getGames(
    $whereGames: GameWhere
    $whereSystemSettings: SystemSettingsWhere
    $whereGroups: GroupWhere
  ) {
    games(where: $whereGames) {
      gameId
      name
      type
      teamsConnection {
        edges {
          host
          node {
            teamId
            name
            nick
            logo
          }
        }
      }
      gameResult {
        gameResultId
        hostWin
        guestWin
        draw
        gameStartedAt
        gameStatus
        hostGoals
        guestGoals
        hostPenalties
        guestPenalties
        hostPenaltyShots
        guestPenaltyShots
        hostInjuries
        guestInjuries
        hostSaves
        guestSaves
        hostFaceOffs
        guestFaceOffs
      }
    }
    systemSettings(where: $whereSystemSettings) {
      rulePack {
        resultPoints {
          resultPointId
          name
          code
          points
        }
      }
    }
    groups(where: $whereGroups) {
      groupId
      name
    }
  }
`

type TGroup = GridRowModel & Group

type TStandingsParams = {
  organizationSlug: string
}

type TGamesData = {
  games: Game[]
  systemSettings: SystemSettings[]
  groups: TGroup[]
}

const useLeagueGroupState = createPersistedState('HMS-LeagueStandingsGroup')

const XGridTable: React.FC = () => {
  const { organizationSlug } = useParams<TStandingsParams>()
  const [selectedGroup, setSelectedGroup] = useLeagueGroupState<Group | null>()
  const theme = useTheme()
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))

  const { error, loading, data } = useQuery<TGamesData>(GET_GAMES, {
    variables: {
      whereGames: {
        startDate_LT: dayjs().format('YYYY-MM-DD'),
        org: {
          urlSlug: organizationSlug,
        },
        phase: {
          name: 'Základní část 21-22',
        },
        ...(selectedGroup && {
          group: {
            groupId: selectedGroup?.groupId,
          },
        }),
      },
      whereSystemSettings: { systemSettingsId: 'system-settings' },
      whereGroups: {
        season: {
          name: '2021-2022',
          org: {
            urlSlug: organizationSlug,
          },
        },
      },
    },
  })

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
        width: upSm ? 200 : 160,
        sortable: upSm,
        disableColumnMenu: !upSm,
        renderCell: params => {
          return (
            <Chip
              size="small"
              avatar={
                <Avatar alt={params?.row?.name} src={params?.row?.logo} />
              }
              label={params?.value}
              color="info"
            />
          )
        },
      },
      {
        field: 'gamesTotal',
        headerName: 'GT',
        headerAlign: 'center',
        align: 'center',
        headerClassName: upSm ? '' : 'hms-iframe--header',
        cellClassName: upSm ? '' : 'hms-iframe--cell',
        width: upSm ? 70 : 20,
        sortable: upSm,
        disableColumnMenu: true,
        valueGetter: params => params?.row?.standings?.gamesTotal,
      },
      {
        field: 'win',
        headerName: 'W',
        align: 'center',
        headerAlign: 'center',
        headerClassName: upSm ? '' : 'hms-iframe--header',
        cellClassName: upSm ? '' : 'hms-iframe--cell',
        width: upSm ? 70 : 30,
        sortable: upSm,
        disableColumnMenu: true,
        valueGetter: params => params?.row?.standings?.win,
      },
      {
        field: 'lost',
        headerName: 'L',
        align: 'center',
        headerAlign: 'center',
        headerClassName: upSm ? '' : 'hms-iframe--header',
        cellClassName: upSm ? '' : 'hms-iframe--cell',
        width: upSm ? 70 : 30,
        sortable: upSm,
        disableColumnMenu: true,
        valueGetter: params => params?.row?.standings?.lost,
      },
      {
        field: 'draw',
        headerName: 'R',
        align: 'center',
        headerAlign: 'center',
        headerClassName: upSm ? '' : 'hms-iframe--header',
        cellClassName: upSm ? '' : 'hms-iframe--cell',
        width: upSm ? 70 : 30,
        sortable: upSm,
        disableColumnMenu: true,
        valueGetter: params => params?.row?.standings?.draw,
      },
      {
        field: 'score',
        headerName: 'S',
        align: 'center',
        headerAlign: 'center',
        headerClassName: upSm ? '' : 'hms-iframe--header',
        cellClassName: upSm ? '' : 'hms-iframe--cell',
        width: upSm ? 70 : 30,
        sortable: upSm,
        disableColumnMenu: true,
        valueGetter: params => params?.row?.standings?.score,
        renderCell: params => (
          <>{`${params?.row?.standings?.score}:${params?.row?.standings?.allowed}`}</>
        ),
      },
      {
        field: 'points',
        headerName: 'P',
        align: 'center',
        headerAlign: 'center',
        headerClassName: upSm ? '' : 'hms-iframe--header',
        cellClassName: upSm ? '' : 'hms-iframe--cell',
        width: upSm ? 70 : 30,
        sortable: upSm,
        disableColumnMenu: true,
        valueGetter: params => params?.row?.standings?.points,
      },
    ],
    [upSm]
  )

  const teamsData = React.useMemo(() => {
    const preparedData = data
      ? setIdFromEntityId(
          countStandingsByTeam(data, data.systemSettings),
          'teamId'
        )
      : []

    return preparedData
  }, [data])

  const searchIndexes = React.useMemo(() => ['name'], [])

  const [searchText, searchData, requestSearch] = useXGridSearch({
    searchIndexes,
    data: teamsData,
  })

  return (
    <Container maxWidth={false} disableGutters={!upSm}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          {data?.groups && (
            <>
              <Stack>
                <ButtonGroup
                  size={upSm ? 'medium' : 'small'}
                  aria-label="outlined button group"
                  variant="outlined"
                >
                  {data?.groups?.map(g => {
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
              </Stack>
            </>
          )}
          {error && !loading ? (
            <Error message={error.message} />
          ) : searchData ? (
            <div
              style={{
                height: 800,
              }}
              // className={classes.xGridWrapper}
            >
              <DataGridPro
                apiRef={apiRef}
                disableSelectionOnClick
                disableMultipleSelection
                hideFooter
                density="compact"
                columns={columns}
                rows={searchData}
                loading={loading}
                componentsProps={{
                  toolbar: {
                    value: searchText,
                    onChange: (
                      event: React.ChangeEvent<HTMLInputElement>
                    ): void => requestSearch(event.target.value),
                    clearSearch: () => requestSearch(''),
                  },
                }}
                sortModel={[
                  {
                    field: 'points',
                    sort: 'desc',
                  },
                ]}
              />
            </div>
          ) : (
            loading && <Loader />
          )}
        </Grid>
      </Grid>
    </Container>
  )
}

export { XGridTable as default }
