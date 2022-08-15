import { PlayerLevel } from 'admin/pages/Player/components/PlayerLevel'
import { Error, LinkButton, Loader, QuickSearchToolbar, Title } from 'components'
import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgPlayerRoute } from 'router/routes'
import { getXGridValueFromArray, setIdFromEntityId, setXGridForRelation, sortByStatus } from 'utils'
import { useXGridSearch } from 'utils/hooks'
import { Game, GameEventSimple, Jersey, Player, Position, Team } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import AccountBox from '@mui/icons-material/AccountBox'
import AddIcon from '@mui/icons-material/Add'
import AddReactionIcon from '@mui/icons-material/AddReaction'
import BalconyIcon from '@mui/icons-material/Balcony'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Switch from '@mui/material/Switch'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'
import placeholderPerson from '../../../../../../img/placeholderPerson.jpg'
import { ButtonDialog } from '../../../../commonComponents/ButtonDialog'
import { XGridLogo } from '../../../../commonComponents/XGridLogo'
import { SetLineupJersey } from './SetLineupJersey'
import { SetLineupPosition } from './SetLineupPosition'

const GET_TEAM_PLAYERS = gql`
  query getTeamPlayers($where: TeamWhere) {
    teams(where: $where) {
      teamId
      name
      players {
        playerId
        avatar
        name
        firstName
        lastName
        levelCode
        activityStatus
        jerseys {
          jerseyId
          name
          number
          team {
            teamId
          }
        }
        positions {
          positionId
          name
          team {
            teamId
          }
        }
      }
    }
  }
`

type Props = {
  gameId: string
  teams: {
    host: boolean
    node: Team
  }[]
  players: {
    node: Player
    host: boolean
  }[]
  updateGame: MutationFunction
  gameData: Game
}

const countPlayerStatistics = (
  player: { node: Player; host: boolean },
  events: GameEventSimple[]
) => {
  const playerId = player.node.playerId
  let ts = {
    scoredByCount: 0,
    assistsCount: 0,
    points: 0,
    penaltyMinutesCount: 0,
  }

  events
    .filter(e => e.eventTypeCode === 'goal' || e.eventTypeCode === 'penalty')
    .forEach(event => {
      if (event.eventTypeCode === 'goal') {
        if (event.scoredBy?.player?.playerId === playerId) {
          ts.scoredByCount++
          ts.points++
        }

        if (event.firstAssist?.player?.playerId === playerId) {
          ts.assistsCount++
          ts.points++
        }
        if (event.secondAssist?.player?.playerId === playerId) {
          ts.assistsCount++
          ts.points++
        }
      }
      if (event.eventTypeCode === 'penalty') {
        if (event.penalized?.player?.playerId === playerId) {
          ts.penaltyMinutesCount += parseFloat(event.duration)
        }
      }
    })

  return { ...player, ...ts }
}

const Lineups: React.FC<Props> = React.memo(props => {
  const { gameId, teams, players, updateGame, gameData } = props

  const teamHost = teams.find(t => t.host)?.node || null
  const teamGuest = teams.find(t => !t.host)?.node || null

  const playersHost =
    players
      .filter(p => p.host)
      .map(p => countPlayerStatistics(p, gameData.gameEventsSimple)) || null
  const playersGuest =
    players
      .filter(p => !p.host)
      .map(p => countPlayerStatistics(p, gameData.gameEventsSimple)) || null

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <LineupList
          host
          team={teamHost}
          gameId={gameId}
          players={playersHost}
          updateGame={updateGame}
        />
      </Grid>

      <Grid item xs={12}>
        <LineupList
          host={false}
          team={teamGuest}
          gameId={gameId}
          players={playersGuest}
          updateGame={updateGame}
        />
      </Grid>
    </Grid>
  )
})

type TLineupList = {
  gameId: string
  team: Team | null
  host: boolean
  players: {
    node: Player
    host: boolean
    scoredByCount: number
    assistsCount: number
    points: number
    penaltyMinutesCount: number
  }[]
  updateGame: MutationFunction
}

type TParams = {
  organizationSlug: string
}

const LineupList: React.FC<TLineupList> = React.memo(props => {
  const { gameId, team, host = false, players, updateGame } = props
  const [playerDialog, setPlayerDialog] = useState(false)
  const { organizationSlug } = useParams<TParams>()

  const [
    getTeamPlayers,
    {
      loading: queryTeamPlayersLoading,
      error: queryTeamPlayersError,
      data: { teams: [queryTeam] } = { teams: [] },
    },
  ] = useLazyQuery(GET_TEAM_PLAYERS, {
    variables: {
      where: { teamId: team?.teamId },
    },
  })

  const openPlayerDialog = useCallback(() => {
    if (!players) {
      getTeamPlayers()
    }
    setPlayerDialog(true)
  }, [])

  const addAllTeamPlayersToGame = useCallback(() => {
    const allPlayers: Player[] = queryTeam?.players

    const dataToConnect = allPlayers.map(player => {
      const position =
        player?.positions?.filter(p => p.team?.teamId === team?.teamId)?.[0]
          ?.name || ''

      const firstJersey = player?.jerseys?.filter(
        p => p.team?.teamId === team?.teamId
      )?.[0]

      const jersey =
        typeof firstJersey?.number === 'string'
          ? parseInt(firstJersey.number)
          : firstJersey?.number || null

      // typeof firstJersey?.number === 'object'
      //   ? firstJersey?.number?.low
      //   : firstJersey?.number || null

      return {
        where: {
          node: { playerId: player.playerId },
        },
        edge: {
          host,
          position,
          jersey,
          captain: false,
          goalkeeper: false,
          teamId: team?.teamId,
        },
      }
    })

    updateGame({
      variables: {
        where: {
          gameId,
        },
        update: {
          players: {
            connect: dataToConnect,
          },
        },
      },
    })
  }, [team, host, gameId, queryTeam])

  const handleClosePlayerDialog = useCallback(() => {
    setPlayerDialog(false)
  }, [])

  const lineupPlayers = setXGridForRelation(players, 'playerId', 'node')

  const teamPlayersColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'avatar',
        headerName: 'Photo',
        width: 80,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <XGridLogo
              src={params.value}
              placeholder={placeholderPerson}
              alt={params.row.name}
            />
          )
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'positions',
        headerName: 'Positions',
        width: 150,
        valueGetter: params => {
          const positions: Position[] =
            params?.row?.positions?.filter(
              (p: Position) => p.team?.teamId === team?.teamId
            ) || []
          return getXGridValueFromArray(positions, 'name')
        },
      },

      {
        field: 'jerseys',
        headerName: 'Jerseys',
        width: 100,
        valueGetter: params => {
          const jerseys: Jersey[] =
            params.row?.jerseys?.filter(
              (p: Jersey) => p.team?.teamId === team?.teamId
            ) || []
          return getXGridValueFromArray(jerseys, 'number')
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
        field: 'activityStatus',
        headerName: 'Status',
        width: 120,
        disableColumnMenu: true,
        sortable: true,
      },
      {
        field: 'playerId',
        headerName: 'Member',
        width: 250,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <TogglePlayerGame
              gameId={gameId}
              player={params.row}
              team={team}
              host={host}
              lineupPlayers={lineupPlayers}
              updateGame={updateGame}
            />
          )
        },
      },
    ],
    [gameId, host, team, lineupPlayers]
  )

  const setCaptain = React.useCallback(({ playerId, captain }) => {
    updateGame({
      variables: {
        where: {
          gameId,
        },
        update: {
          players: {
            where: {
              node: {
                playerId,
              },
            },
            update: {
              edge: {
                captain,
              },
            },
          },
        },
      },
    })
  }, [])

  const setGoalkeeper = React.useCallback(({ playerId, goalkeeper }) => {
    updateGame({
      variables: {
        where: {
          gameId,
        },
        update: {
          players: {
            where: {
              node: {
                playerId,
              },
            },
            update: {
              edge: {
                goalkeeper,
              },
            },
          },
        },
      },
    })
  }, [])

  const setStar = React.useCallback(({ playerId, star }) => {
    updateGame({
      variables: {
        where: {
          gameId,
        },
        update: {
          players: {
            where: {
              node: {
                playerId,
              },
            },
            update: {
              edge: {
                star,
              },
            },
          },
        },
      },
    })
  }, [])

  const gameLineupColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'actions',
        headerName: 'Actions',
        width: 200,
        sortable: false,
        disableColumnMenu: true,
        renderCell: params => {
          const isCaptain = !!params?.row?.captain
          const teamHasCaptain = !!lineupPlayers.find(
            (p: { captain: boolean }) => p.captain
          )
          const isGoalkeeper = !!params?.row?.goalkeeper
          const teamHasGoalkeeper = !!lineupPlayers.find(
            (p: { goalkeeper: boolean }) => p.goalkeeper
          )
          const isStar = !!params?.row?.star

          return (
            <>
              <LinkButton
                to={getAdminOrgPlayerRoute(
                  organizationSlug,
                  params.row.playerId
                )}
                target="_blank"
                icon
              >
                <Tooltip arrow title="Profile" placement="top">
                  <AccountBox />
                </Tooltip>
              </LinkButton>
              <ButtonDialog
                icon={
                  <Tooltip arrow title="Remove Player" placement="top">
                    <RemoveCircleOutlineIcon />
                  </Tooltip>
                }
                size="small"
                dialogTitle={'Do you want to remove player from this lineup?'}
                dialogDescription={'You can add player to lineup later'}
                dialogNegativeText={'No, keep player'}
                dialogPositiveText={'Yes, remove player'}
                onDialogClosePositive={() => {
                  updateGame({
                    variables: {
                      where: {
                        gameId,
                      },
                      update: {
                        players: {
                          disconnect: {
                            where: {
                              node: {
                                playerId: params.row.playerId,
                              },
                            },
                          },
                        },
                      },
                    },
                  })
                }}
              />
              {!teamHasCaptain ? (
                <IconButton
                  onClick={() => {
                    setCaptain({ playerId: params.row.playerId, captain: true })
                  }}
                >
                  <Tooltip arrow title="Set Captain" placement="top">
                    <HowToRegIcon />
                  </Tooltip>
                </IconButton>
              ) : (
                !isCaptain && (
                  <span
                    style={{
                      padding: '1.25rem',
                    }}
                  />
                )
              )}
              {isCaptain && (
                <IconButton
                  onClick={() => {
                    setCaptain({
                      playerId: params.row.playerId,
                      captain: false,
                    })
                  }}
                >
                  <Tooltip arrow title="Remove Captain" placement="top">
                    <VerifiedUserIcon />
                  </Tooltip>
                </IconButton>
              )}
              <IconButton
                onClick={() => {
                  setStar({
                    playerId: params.row.playerId,
                    star: !isStar,
                  })
                }}
              >
                <Tooltip
                  arrow
                  title={isStar ? 'Remove Star' : 'Set Star'}
                  placement="top"
                >
                  {isStar ? (
                    <StarIcon sx={{ color: 'rgb(250, 175, 0)' }} />
                  ) : (
                    <StarOutlineIcon />
                  )}
                </Tooltip>
              </IconButton>
              {!teamHasGoalkeeper && (
                <IconButton
                  onClick={() => {
                    setGoalkeeper({
                      playerId: params.row.playerId,
                      goalkeeper: true,
                    })
                  }}
                >
                  <Tooltip arrow title="Set Goalkeeper" placement="top">
                    <AddReactionIcon />
                  </Tooltip>
                </IconButton>
              )}
              {isGoalkeeper && (
                <IconButton
                  onClick={() => {
                    setGoalkeeper({
                      playerId: params.row.playerId,
                      goalkeeper: false,
                    })
                  }}
                >
                  <Tooltip arrow title="Remove Goalkeeper" placement="top">
                    <BalconyIcon />
                  </Tooltip>
                </IconButton>
              )}
            </>
          )
        },
      },
      {
        field: 'avatar',
        headerName: 'Photo',
        width: 80,
        sortable: false,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <XGridLogo
              src={params.value}
              placeholder={placeholderPerson}
              alt={params.row.name}
            />
          )
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },
      {
        field: 'jersey',
        headerName: 'Jersey',
        width: 100,
        renderCell: params => {
          return (
            <>
              <SetLineupJersey
                player={params.row}
                gameId={gameId}
                updateGame={updateGame}
              />
              <span style={{ marginRight: '4px' }}>{params.value}</span>
            </>
          )
        },
      },
      {
        field: 'position',
        headerName: 'Position',
        width: 120,
        renderCell: params => {
          return (
            <>
              <SetLineupPosition
                player={params.row}
                gameId={gameId}
                updateGame={updateGame}
              />
              <span style={{ marginRight: '4px' }}>{params.value}</span>
            </>
          )
        },
      },
      {
        field: 'levelCode',
        headerName: 'Level',
        width: 150,
        renderCell: params => {
          return <PlayerLevel code={params.row.levelCode} />
        },
      },
      {
        field: 'scoredByCount',
        headerName: 'G',
        width: 20,
        disableColumnMenu: true,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'assistsCount',
        headerName: 'A',
        width: 20,
        disableColumnMenu: true,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'points',
        headerName: 'PTS',
        width: 60,
        disableColumnMenu: true,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'penaltyMinutesCount',
        headerName: 'PIM',
        width: 60,
        disableColumnMenu: true,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'info',
        headerName: 'Info',
        width: 120,
        disableColumnMenu: true,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        renderCell: params => {
          const isHattrick = params.row?.scoredByCount >= 3
          const is3Points = params.row?.points >= 3
          return (
            <>
              {isHattrick && (
                <Typography
                  sx={{
                    textTransform: 'uppercase',
                    backgroundColor: '#0faf00',
                    color: '#fff',
                    padding: 1,
                  }}
                  variant="button"
                  display="block"
                >
                  Hattrick!
                </Typography>
              )}
              {!isHattrick && is3Points && (
                <Typography
                  sx={{
                    textTransform: 'uppercase',
                    backgroundColor: '#0672b1',
                    color: '#fff',
                    padding: 1,
                  }}
                  variant="button"
                  display="block"
                >
                  3+ Points!
                </Typography>
              )}
            </>
          )
        },
      },
    ],
    [gameId, lineupPlayers]
  )

  const searchIndexes = React.useMemo(() => ['name', 'status'], [])

  const teamPlayersData = useMemo(
    () =>
      queryTeam ? setIdFromEntityId(queryTeam?.players || [], 'playerId') : [],
    [queryTeam]
  )

  const [searchText, searchData, requestSearch] = useXGridSearch({
    searchIndexes,
    data: teamPlayersData,
  })

  const [anchorEl, setAnchorEl] =
    React.useState<React.SetStateAction<Element>>()

  return (
    <>
      <Paper sx={{ p: '16px' }}>
        <Toolbar
          disableGutters
          sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
        >
          <div>
            <Title>{`${host ? 'Host' : 'Guest'} lineup${
              team ? `: ${team?.name}` : ''
            }`}</Title>
          </div>
          <div>
            <ButtonGroup
              variant="contained"
              aria-label="contained button group"
            >
              <Button
                aria-controls="add-players-menu"
                aria-haspopup="true"
                type="button"
                size="small"
                startIcon={<AddIcon />}
                onClick={event => {
                  getTeamPlayers()
                  setAnchorEl(event.currentTarget)
                }}
              >
                Add Players
              </Button>
              {players.length > 0 && (
                <ButtonDialog
                  text={'Remove Players'}
                  textLoading={'Removing...'}
                  size="small"
                  startIcon={<RemoveCircleOutlineIcon />}
                  dialogTitle={'Do you want to remove all players from lineup?'}
                  dialogDescription={'You can add players to lineup later'}
                  dialogNegativeText={'No, keep players'}
                  dialogPositiveText={'Yes, remove players'}
                  onDialogClosePositive={() => {
                    const dataToDisconnect = players.map(player => {
                      return {
                        where: {
                          node: {
                            playerId: player?.node?.playerId,
                          },
                        },
                      }
                    })
                    updateGame({
                      variables: {
                        where: {
                          gameId,
                        },
                        update: {
                          players: {
                            disconnect: dataToDisconnect,
                          },
                        },
                      },
                    })
                  }}
                />
              )}
            </ButtonGroup>
            <Menu
              id="add-players-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={() => {
                setAnchorEl(undefined)
              }}
            >
              <MenuItem
                onClick={() => {
                  openPlayerDialog()
                  setAnchorEl(undefined)
                }}
              >
                Choose specific
              </MenuItem>
              <MenuItem
                disabled={!queryTeam}
                onClick={() => {
                  addAllTeamPlayersToGame()
                  setAnchorEl(undefined)
                }}
              >
                All
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
            density="compact"
            columns={gameLineupColumns}
            rows={lineupPlayers}
            disableSelectionOnClick
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </Paper>
      {playerDialog && (
        <Dialog
          fullWidth
          maxWidth="lg"
          open={playerDialog}
          onClose={handleClosePlayerDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          {queryTeamPlayersLoading && <Loader />}

          <Error message={queryTeamPlayersError?.message} />
          {queryTeam && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add player to game`}</DialogTitle>
              <DialogContent>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="body1" gutterBottom>
                    {`Total players selected: ${lineupPlayers.length}`}
                  </Typography>
                </div>
                <div style={{ height: 1000, width: '100%' }}>
                  <DataGridPro
                    density="compact"
                    columns={teamPlayersColumns}
                    rows={sortByStatus(searchData, 'activityStatus')}
                    disableSelectionOnClick
                    loading={queryTeamPlayersLoading}
                    components={{
                      Toolbar: QuickSearchToolbar,
                    }}
                    componentsProps={{
                      toolbar: {
                        value: searchText,
                        onChange: (
                          event: React.ChangeEvent<HTMLInputElement>
                        ): void => requestSearch(event.target.value),
                        clearSearch: () => requestSearch(''),
                      },
                    }}
                  />
                </div>
              </DialogContent>
            </>
          )}
          <DialogActions>
            <Button type="button" onClick={handleClosePlayerDialog}>
              {'Done'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
})

type TTogglePlayerGame = {
  gameId: string
  team: Team | null
  player: Player
  host: boolean
  updateGame: MutationFunction
  lineupPlayers: Player[]
}

const TogglePlayerGame: React.FC<TTogglePlayerGame> = React.memo(props => {
  const { gameId, team, player, host, updateGame, lineupPlayers } = props
  const [isMember, setIsMember] = useState(
    !!lineupPlayers?.find(p => p.playerId === player.playerId)
  )

  const position = useMemo(
    () =>
      player?.positions?.filter(p => p.team?.teamId === team?.teamId)?.[0]
        ?.name || null,
    []
  )

  const jersey = useMemo(() => {
    const jersey = player?.jerseys?.filter(
      p => p.team?.teamId === team?.teamId
    )?.[0]
    const number = jersey?.number

    // typeof jersey?.number === 'string'
    //   ? jersey?.number
    //   : jersey?.number?.low || null
    return parseInt(number + '')
  }, [])

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updateGame({
          variables: {
            where: {
              gameId,
            },
            update: {
              players: {
                ...(isMember
                  ? {
                      disconnect: {
                        where: {
                          node: {
                            playerId: player.playerId,
                          },
                        },
                      },
                    }
                  : {
                      connect: {
                        where: {
                          node: { playerId: player.playerId },
                        },
                        edge: {
                          host,
                          position,
                          jersey,
                          teamId: team?.teamId,
                        },
                      },
                    }),
              },
            },
          },
        })

        setIsMember(!isMember)
      }}
    />
  )
})

export { Lineups }
