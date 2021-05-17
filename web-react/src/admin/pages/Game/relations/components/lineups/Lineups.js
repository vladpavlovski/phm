import React, { useCallback, useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { gql, useLazyQuery, useMutation } from '@apollo/client'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Toolbar from '@material-ui/core/Toolbar'
import AddIcon from '@material-ui/icons/Add'

import AccountBox from '@material-ui/icons/AccountBox'
import LinkOffIcon from '@material-ui/icons/LinkOff'

import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { LinkButton } from '../../../../../../components/LinkButton'
import { Title } from '../../../../../../components/Title'
import { Loader } from '../../../../../../components/Loader'
import { Error } from '../../../../../../components/Error'
import { getAdminOrgPlayerRoute } from '../../../../../../routes'
import {
  setIdFromEntityId,
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

const GET_TEAM_PLAYERS = gql`
  query getTeamPlayers($teamId: ID!) {
    team: Team(teamId: $teamId) {
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

const MERGE_GAME_PLAYER = gql`
  mutation mergeGamePlayer(
    $gameId: ID!
    $playerId: ID!
    $host: Boolean
    $jersey: Int
    $position: String
  ) {
    gamePlayer: MergePlayerGames(
      game: { gameId: $gameId }
      player: { playerId: $playerId }
      data: { host: $host, jersey: $jersey, position: $position }
    ) {
      game {
        gameId
        name
      }
      player {
        playerId
        firstName
        lastName
        name
        avatar
      }
      host
      jersey
      position
    }
  }
`

const REMOVE_GAME_PLAYER = gql`
  mutation removeGamePlayer($gameId: ID!, $playerId: ID!) {
    gamePlayer: RemovePlayerGames(
      game: { gameId: $gameId }
      player: { playerId: $playerId }
    ) {
      game {
        gameId
        name
      }
      player {
        playerId
        name
      }
    }
  }
`

const Lineups = props => {
  const { gameId, teams, players } = props

  const teamHost = useMemo(() => teams.find(t => t.host)?.team || null, [teams])
  const teamGuest = useMemo(() => teams.find(t => !t.host)?.team || null, [
    teams,
  ])
  const playersHost = useMemo(() => players.filter(p => p.host) || null, [
    players,
  ])
  const playersGuest = useMemo(() => players.filter(p => !p.host) || null, [
    players,
  ])

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
      teamId: team?.teamId,
    },
    fetchPolicy: 'cache-and-network',
  })

  const openPlayerDialog = useCallback(() => {
    if (!queryTeamPlayersData) {
      getTeamPlayers()
    }
    // isHost.current = asHost
    setPlayerDialog(true)
  }, [])

  const handleClosePlayerDialog = useCallback(() => {
    setPlayerDialog(false)
  }, [])

  const [mergeGamePlayer, { loading: loadingMergeGamePlayer }] = useMutation(
    MERGE_GAME_PLAYER,
    {
      update(cache, { data: { gamePlayer } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_GAME,
            variables: {
              gameId,
            },
          })

          const updatedData = [...queryResult.game?.[0].players, gamePlayer]

          const updatedResult = {
            game: [
              {
                ...queryResult.game?.[0],
                players: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_GAME,
            data: updatedResult,
            variables: {
              gameId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data?.gamePlayer?.player?.name} added to lineup ${data?.gamePlayer?.game?.name}!`,
          {
            variant: 'success',
          }
        )
      },
      onError: error => {
        enqueueSnackbar(`${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  const [removeGamePlayer, { loading: loadingRemoveGamePlayer }] = useMutation(
    REMOVE_GAME_PLAYER,
    {
      update(cache, { data: { gamePlayer } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_GAME,
            variables: {
              gameId,
            },
          })

          const updatedData = queryResult.game?.[0].players.filter(
            p => p?.player?.playerId !== gamePlayer?.player?.playerId
          )

          const updatedResult = {
            game: [
              {
                ...queryResult.game?.[0],
                players: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_GAME,
            data: updatedResult,
            variables: {
              gameId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data?.gamePlayer?.player?.name} removed lineup ${data?.gamePlayer?.game?.name}!`,
          {
            variant: 'info',
          }
        )
      },
      onError: error => {
        enqueueSnackbar(`${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
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
          const positions = params.row.positions.filter(
            p => p.team?.teamId === team?.teamId
          )
          return getXGridValueFromArray(positions, 'name')
        },
      },

      {
        field: 'jerseys',
        headerName: 'Jerseys',
        width: 200,
        valueGetter: params => {
          const jerseys = params.row.jerseys.filter(
            p => p.team?.teamId === team?.teamId
          )
          return getXGridValueFromArray(jerseys, 'name')
        },
      },

      {
        field: 'playerId',
        headerName: 'Member',
        width: 250,
        disableColumnMenu: true,
        renderCell: params => {
          const position =
            params.row.positions.filter(
              p => p.team?.teamId === team?.teamId
            )?.[0]?.name || ''

          const jersey = params.row.jerseys.filter(
            p => p.team?.teamId === team?.teamId
          )?.[0]?.number

          return (
            <Button
              variant={'outlined'}
              size="small"
              className={classes.submit}
              startIcon={<AddIcon />}
              type="button"
              onClick={() => {
                mergeGamePlayer({
                  variables: {
                    gameId,
                    host,
                    position,
                    jersey,
                    playerId: params.value,
                  },
                })
              }}
            >
              {loadingMergeGamePlayer
                ? 'Adding...'
                : `Add as ${host ? 'Host' : 'Guest'} player`}
            </Button>
          )
        },
      },
    ],
    [gameId, host, team]
  )

  const gameLineupColumns = useMemo(
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
        width: 200,
      },
      {
        field: 'position',
        headerName: 'Position',
        width: 120,
      },
      {
        field: 'jersey',
        headerName: 'Jersey',
        width: 100,
      },
      {
        field: 'removeButton',
        headerName: 'Remove',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ButtonDialog
              text={'Remove'}
              textLoading={'Removing...'}
              loading={loadingRemoveGamePlayer}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={'Do you want to remove player from this lineup?'}
              dialogDescription={'You can add player to lineup later'}
              dialogNegativeText={'No, keep player'}
              dialogPositiveText={'Yes, remove player'}
              onDialogClosePositive={() => {
                removeGamePlayer({
                  variables: {
                    gameId,
                    playerId: params.row.playerId,
                  },
                })
              }}
            />
          )
        },
      },

      {
        field: 'setPlayerPosition',
        headerName: 'Set Position',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <SetLineupPosition
              player={params.row}
              gameId={gameId}
              mergeGamePlayer={mergeGamePlayer}
            />
          )
        },
      },

      {
        field: 'setPlayerJersey',
        headerName: 'Set Jersey',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <SetLineupJersey
              player={params.row}
              gameId={gameId}
              mergeGamePlayer={mergeGamePlayer}
            />
          )
        },
      },
      {
        field: 'playerId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgPlayerRoute(organizationSlug, params.value)}
              target="_blank"
            >
              Profile
            </LinkButton>
          )
        },
      },
    ],
    [gameId]
  )

  const lineupPlayers = useMemo(
    () => setXGridForRelation(players, 'playerId', 'player'),
    [players]
  )

  const teamPlayers = useMemo(
    () =>
      queryTeamPlayersData &&
      setIdFromEntityId(
        queryTeamPlayersData?.team?.[0]?.players,
        'playerId'
      ).filter(p => !lineupPlayers.find(lp => lp.playerId === p.playerId)),
    [queryTeamPlayersData, lineupPlayers]
  )

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
            <Button
              type="button"
              variant={'outlined'}
              size="small"
              className={classes.submit}
              startIcon={<AddIcon />}
              onClick={() => openPlayerDialog({ asHost: host })}
            >
              Add Player
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600 }} className={classes.xGridDialog}>
          <XGrid
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
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={teamPlayersColumns}
                    rows={teamPlayers}
                    disableSelectionOnClick
                    loading={queryTeamPlayersLoading}
                    components={{
                      Toolbar: GridToolbar,
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

export { Lineups }
