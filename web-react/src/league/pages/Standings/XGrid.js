import React from 'react'
import { useQuery, useLazyQuery, gql } from '@apollo/client'
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
import { DataGridPro } from '@mui/x-data-grid-pro'
import { useStyles } from 'admin/pages/commonComponents/styled'
import { Error } from 'components/Error'
import { Loader } from 'components/Loader'

import { useWindowSize, useXGridSearch } from 'utils/hooks'

// import { QuickSearchToolbar } from 'components/QuickSearchToolbar'
import { setIdFromEntityId, getXGridHeight } from 'utils'
import useMediaQuery from '@mui/material/useMediaQuery'
import dayjs from 'dayjs'

const GET_GROUPS = gql`
  query getGroups($whereGroups: GroupWhere) {
    groups(where: $whereGroups) {
      groupId
      name
    }
  }
`

const countStandingsByTeam = (data = [], systemSettings) => {
  try {
    const resultPoints = systemSettings?.[0]?.rulePack?.resultPoints?.reduce(
      (acc, resultPoint) => {
        const { code, points } = resultPoint
        switch (code.toLowerCase()) {
          case 'win':
            return { ...acc, win: points }
          case 'lost':
            return { ...acc, lost: points }
          case 'draw':
            return { ...acc, draw: points }
        }
      },
      {}
    )

    const standingsTemplate = {
      gamesTotal: 0,
      win: 0,
      lost: 0,
      draw: 0,
      score: 0,
      points: 0,
    }

    let standings = []

    const getTeamStandings = ({ game, host, team }) => {
      const prefix = host ? 'host' : 'guest'
      const teamExistsInStandings = !!standings.find(
        t => t.teamId === team?.teamId
      )

      if (!teamExistsInStandings) {
        standings = [...standings, { ...team, standings: standingsTemplate }]
      }

      const teamStandings = standings.find(
        t => t.teamId === team.teamId
      )?.standings

      // count standings

      let newTeamStandings = { ...teamStandings }

      newTeamStandings.gamesTotal += 1

      const teamWinGame = game?.gameResult?.[`${prefix}Win`]

      newTeamStandings.win = teamWinGame
        ? newTeamStandings.win + 1
        : newTeamStandings.win

      newTeamStandings.lost = teamWinGame
        ? newTeamStandings.lost
        : newTeamStandings.lost + 1

      newTeamStandings.draw = game?.gameResult?.draw
        ? newTeamStandings.draw + 1
        : newTeamStandings.draw

      newTeamStandings.score =
        newTeamStandings.score + game?.gameResult?.[`${prefix}Goals`] || 0

      newTeamStandings.points = teamWinGame
        ? newTeamStandings.points + resultPoints.win
        : teamStandings.points - resultPoints.lost

      newTeamStandings.points = game?.gameResult?.draw
        ? newTeamStandings.points + resultPoints.draw
        : newTeamStandings.points

      const teamFromStandings = standings.find(t => t.teamId === team.teamId)

      teamFromStandings.standings = newTeamStandings
    }

    data.forEach(game => {
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
  }
`

const useLeagueGroupState = createPersistedState('HMS-LeagueStandingsGroup')

const XGridTable = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams()

  const windowSize = useWindowSize()
  const toolbarRef = React.useRef()
  const [selectedGroup, setSelectedGroup] = useLeagueGroupState()
  const theme = useTheme()
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))

  const { data: groupsData } = useQuery(GET_GROUPS, {
    variables: {
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

  const [getGames, { error, loading, data }] = useLazyQuery(GET_GAMES, {
    variables: {
      whereGames: {
        startDate_LT: dayjs().format('YYYY-MM-DD'),
        org: {
          urlSlug: organizationSlug,
        },
        group: {
          groupId: selectedGroup?.groupId,
        },
      },
      whereSystemSettings: { systemSettingsId: 'system-settings' },
    },
  })

  React.useEffect(() => {
    if (selectedGroup) {
      getGames()
    }
  }, [selectedGroup])

  const columns = React.useMemo(
    () => [
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
        cellClassName: 'hms-iframe--cell',
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
        cellClassName: 'hms-iframe--cell',
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
        cellClassName: 'hms-iframe--cell',
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
        cellClassName: 'hms-iframe--cell',
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
        cellClassName: 'hms-iframe--cell',
        width: upSm ? 70 : 30,
        sortable: upSm,
        disableColumnMenu: true,
        valueGetter: params => params?.row?.standings?.score,
      },
      {
        field: 'points',
        headerName: 'P',
        align: 'center',
        headerAlign: 'center',
        headerClassName: upSm ? '' : 'hms-iframe--header',
        cellClassName: 'hms-iframe--cell',
        width: upSm ? 70 : 30,
        sortable: upSm,
        disableColumnMenu: true,
        valueGetter: params => params?.row?.standings?.points,
      },
    ],
    [upSm]
  )

  const teamsData = React.useMemo(() => {
    const preparedData = setIdFromEntityId(
      countStandingsByTeam(data?.games, data?.systemSettings) || [],
      'teamId'
    )

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
          {groupsData && (
            <>
              <Stack ref={toolbarRef}>
                <ButtonGroup
                  size={upSm ? 'medium' : 'small'}
                  aria-label="outlined button group"
                  variant="outlined"
                >
                  {groupsData?.groups?.map(g => {
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
                height: getXGridHeight(toolbarRef.current, windowSize),
              }}
              className={classes.xGridWrapper}
            >
              <DataGridPro
                disableSelectionOnClick
                disableMultipleSelection
                hideFooter
                density="compact"
                columns={columns}
                rows={searchData}
                loading={loading}
                // components={{
                //   Toolbar: QuickSearchToolbar,
                // }}
                componentsProps={{
                  toolbar: {
                    value: searchText,
                    onChange: event => requestSearch(event.target.value),
                    clearSearch: () => requestSearch(''),
                  },
                }}
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
