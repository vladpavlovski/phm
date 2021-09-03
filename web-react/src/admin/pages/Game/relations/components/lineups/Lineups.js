import React, { useCallback, useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { gql, useLazyQuery, useMutation } from '@apollo/client'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Toolbar from '@material-ui/core/Toolbar'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import AddIcon from '@material-ui/icons/Add'
import AccountBox from '@material-ui/icons/AccountBox'
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import HowToRegIcon from '@material-ui/icons/HowToReg'
import ClearIcon from '@material-ui/icons/Clear'

import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { LinkButton } from '../../../../../../components/LinkButton'
import { Title } from '../../../../../../components/Title'
import { Loader } from '../../../../../../components/Loader'
import { Error } from '../../../../../../components/Error'
import { QuickSearchToolbar } from '../../../../../../components/QuickSearchToolbar'
import { getAdminOrgPlayerRoute } from '../../../../../../routes'
import {
  setIdFromEntityId,
  escapeRegExp,
  getXGridValueFromArray,
  setXGridForRelation,
} from '../../../../../../utils'
import { ButtonDialog } from '../../../../commonComponents/ButtonDialog'
import { useStyles } from '../../../../commonComponents/styled'
import { XGridLogo } from '../../../../commonComponents/XGridLogo'
import placeholderPerson from '../../../../../../img/placeholderPerson.jpg'
import { GET_GAME } from '../../../index'
import { SetLineupPosition } from './SetLineupPosition'
import { SetLineupJersey } from './SetLineupJersey'

import { UPDATE_GAME } from '../../../index'

const GET_TEAM_PLAYERS = gql`
  query getTeamPlayers($where: TeamWhere) {
    team: teams(where: $where) {
      teamId
      name
      players {
        playerId
        avatar
        name
        firstName
        lastName
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

const Lineups = props => {
  const { gameId, teams, players } = props

  const teamHost = useMemo(() => teams.find(t => t.host)?.node || null, [teams])
  const teamGuest = useMemo(
    () => teams.find(t => !t.host)?.node || null,
    [teams]
  )
  const playersHost = useMemo(
    () => players.filter(p => p.host) || null,
    [players]
  )
  const playersGuest = useMemo(
    () => players.filter(p => !p.host) || null,
    [players]
  )

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={6}>
          <LineupList
            host
            team={teamHost}
            gameId={gameId}
            players={playersHost}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={6}>
          <LineupList
            host={false}
            team={teamGuest}
            gameId={gameId}
            players={playersGuest}
          />
        </Grid>
      </Grid>
    </>
  )
}

const LineupList = props => {
  const { gameId, team, host = false, players } = props
  const [playerDialog, setPlayerDialog] = useState(false)
  const { organizationSlug } = useParams()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const [
    getTeamPlayers,
    {
      loading: queryTeamPlayersLoading,
      error: queryTeamPlayersError,
      data: queryTeamPlayersData,
    },
  ] = useLazyQuery(GET_TEAM_PLAYERS, {
    variables: {
      where: { teamId: team?.teamId },
    },
    fetchPolicy: 'cache-and-network',
  })

  const openPlayerDialog = useCallback(() => {
    if (!queryTeamPlayersData) {
      getTeamPlayers()
    }
    setPlayerDialog(true)
  }, [])

  const addAllTeamPlayersToGame = useCallback(() => {
    const allPlayers = queryTeamPlayersData?.team?.[0]?.players

    const dataToConnect = allPlayers.map(player => {
      const position =
        player?.positions?.filter(p => p.team?.teamId === team?.teamId)?.[0]
          ?.name || ''

      const jersey =
        player?.jerseys?.filter(p => p.team?.teamId === team?.teamId)?.[0]
          ?.number?.low || ''
      return {
        where: {
          node: { playerId: player.playerId },
        },
        edge: {
          host,
          position,
          jersey,
          captain: false,
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
  }, [team, host, gameId, queryTeamPlayersData])

  const handleClosePlayerDialog = useCallback(() => {
    setPlayerDialog(false)
  }, [])

  const [updateGame, { loading: loadingUpdateGameTeam }] = useMutation(
    UPDATE_GAME,
    {
      update(cache, { data: { updateGame } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_GAME,
            variables: {
              where: { gameId },
            },
          })
          const updatedData = updateGame?.games?.find(
            g => g.gameId === gameId
          )?.playersConnection

          const updatedResult = {
            games: [
              {
                ...queryResult.games?.find(g => g.gameId === gameId),
                playersConnection: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_GAME,
            data: updatedResult,
            variables: {
              where: { gameId },
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        enqueueSnackbar(`Game updated`, {
          variant: 'success',
        })
      },
      onError: error => {
        enqueueSnackbar(`${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  const lineupPlayers = useMemo(
    () => setXGridForRelation(players, 'playerId', 'node'),
    [players]
  )

  const teamPlayersColumns = useMemo(
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
          const positions =
            params?.row?.positions?.filter(
              p => p.team?.teamId === team?.teamId
            ) || []
          return getXGridValueFromArray(positions, 'name')
        },
      },

      {
        field: 'jerseys',
        headerName: 'Jerseys',
        width: 200,
        valueGetter: params => {
          const jerseys =
            params.row?.jerseys?.filter(p => p.team?.teamId === team?.teamId) ||
            []
          return getXGridValueFromArray(jerseys, 'name')
        },
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

  const gameLineupColumns = useMemo(
    () => [
      {
        field: 'actions',
        headerName: 'Actions',
        width: 100,
        disableColumnMenu: true,
        renderCell: params => {
          const isCaptain = !!params?.row?.captain
          const teamHasCaptain = !!lineupPlayers.find(p => p.captain)
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
              {!teamHasCaptain && (
                <LinkButton
                  onClick={() => {
                    updateGame({
                      variables: {
                        where: {
                          gameId,
                        },
                        update: {
                          players: {
                            where: {
                              node: {
                                playerId: params.row.playerId,
                              },
                            },
                            update: {
                              edge: {
                                captain: true,
                              },
                            },
                          },
                        },
                      },
                    })
                  }}
                  icon
                >
                  <Tooltip arrow title="Set Captain" placement="top">
                    <HowToRegIcon />
                  </Tooltip>
                </LinkButton>
              )}
              {isCaptain && (
                <LinkButton
                  onClick={() => {
                    updateGame({
                      variables: {
                        where: {
                          gameId,
                        },
                        update: {
                          players: {
                            where: {
                              node: {
                                playerId: params.row.playerId,
                              },
                            },
                            update: {
                              edge: {
                                captain: false,
                              },
                            },
                          },
                        },
                      },
                    })
                  }}
                  icon
                >
                  <Tooltip arrow title="Remove Captain" placement="top">
                    <ClearIcon />
                  </Tooltip>
                </LinkButton>
              )}
            </>
          )
        },
      },
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
        width: 200,
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
    ],
    [gameId, lineupPlayers]
  )

  const teamPlayersData = useMemo(
    () =>
      queryTeamPlayersData &&
      setIdFromEntityId(queryTeamPlayersData?.team?.[0]?.players, 'playerId'),
    [queryTeamPlayersData]
  )

  const [searchText, setSearchText] = React.useState('')
  const [teamPlayers, setTeamPlayers] = React.useState([])

  const requestSearch = useCallback(
    searchValue => {
      setSearchText(searchValue)
      const searchRegex = new RegExp(escapeRegExp(searchValue), 'i')
      const filteredRows = teamPlayersData.filter(row => {
        return Object.keys(row).some(field => {
          return searchRegex.test(row[field]?.toString())
        })
      })
      setTeamPlayers(filteredRows)
    },
    [teamPlayersData]
  )

  React.useEffect(() => {
    teamPlayersData && setTeamPlayers(teamPlayersData)
  }, [teamPlayersData])

  const [anchorEl, setAnchorEl] = React.useState(null)

  return (
    <>
      <Paper className={classes.paper}>
        <Toolbar disableGutters className={classes.toolbarForm}>
          <div>
            <Title>{`Lineup ${team?.name ? 'for' : ''}${
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
                  loading={loadingUpdateGameTeam}
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
                setAnchorEl(null)
              }}
            >
              <MenuItem
                onClick={() => {
                  openPlayerDialog()
                  setAnchorEl(null)
                }}
              >
                Choose specific
              </MenuItem>
              <MenuItem
                disabled={!queryTeamPlayersData}
                onClick={() => {
                  addAllTeamPlayersToGame()
                  setAnchorEl(null)
                }}
              >
                All
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
        <div style={{ height: 600 }} className={classes.xGridDialog}>
          <XGrid
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
      <Dialog
        fullWidth
        maxWidth="md"
        open={playerDialog}
        onClose={handleClosePlayerDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryTeamPlayersLoading && !queryTeamPlayersError && <Loader />}
        {queryTeamPlayersError && !queryTeamPlayersLoading && (
          <Error message={queryTeamPlayersError.message} />
        )}
        {queryTeamPlayersData &&
          !queryTeamPlayersLoading &&
          !queryTeamPlayersError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add player to game`}</DialogTitle>
              <DialogContent>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="body1" gutterBottom>
                    {`Total players selected: ${lineupPlayers.length}`}
                  </Typography>
                </div>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    density="compact"
                    columns={teamPlayersColumns}
                    rows={teamPlayers}
                    disableSelectionOnClick
                    loading={queryTeamPlayersLoading}
                    components={{
                      Toolbar: QuickSearchToolbar,
                    }}
                    componentsProps={{
                      toolbar: {
                        value: searchText,
                        onChange: event => requestSearch(event.target.value),
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
    </>
  )
}

Lineups.propTypes = {
  players: PropTypes.array,
}

const TogglePlayerGame = props => {
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

  const jersey = useMemo(
    () =>
      player?.jerseys?.filter(p => p.team?.teamId === team?.teamId)?.[0]?.number
        ?.low || null,
    []
  )

  return (
    <FormControlLabel
      control={
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
                            },
                          },
                        }),
                  },
                },
              },
            })

            setIsMember(!isMember)
          }}
          name="phaseMember"
          color="primary"
        />
      }
    />
  )
}

TogglePlayerGame.propTypes = {
  playerId: PropTypes.string,
  awardId: PropTypes.string,
  award: PropTypes.object,
  remove: PropTypes.func,
  merge: PropTypes.func,
}

export { Lineups }
