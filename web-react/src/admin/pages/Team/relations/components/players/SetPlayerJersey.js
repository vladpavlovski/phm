import React, { useCallback, useState, useMemo, useContext } from 'react'
import { gql, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import AddIcon from '@material-ui/icons/Add'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { useStyles } from '../../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../../utils'
import { GET_PLAYERS } from './index'
import TeamPlayersContext from './context'

const MERGE_PLAYER_JERSEY = gql`
  mutation mergePlayerJersey($playerId: ID!, $jerseyId: ID!) {
    mergePlayerJersey: MergePlayerJerseys(
      from: { playerId: $playerId }
      to: { jerseyId: $jerseyId }
    ) {
      from {
        playerId
        firstName
        lastName
        name
        jerseys {
          jerseyId
          name
          number
        }
      }
      to {
        jerseyId
        name
        number
      }
    }
  }
`

const REMOVE_PLAYER_JERSEY = gql`
  mutation removePlayerJersey($playerId: ID!, $jerseyId: ID!) {
    removePlayerJersey: RemovePlayerJerseys(
      from: { playerId: $playerId }
      to: { jerseyId: $jerseyId }
    ) {
      from {
        playerId
        firstName
        lastName
        name
        jerseys {
          jerseyId
          name
          number
        }
      }
      to {
        jerseyId
        name
        number
      }
    }
  }
`

export const SetPlayerJersey = props => {
  const { player } = props
  const classes = useStyles()

  const { setPlayerJerseyDialogOpen, setPlayerData } = useContext(
    TeamPlayersContext
  )

  return (
    <Button
      type="button"
      onClick={() => {
        setPlayerData(player)
        setPlayerJerseyDialogOpen(true)
      }}
      variant={'outlined'}
      size="small"
      className={classes.submit}
      startIcon={<AddIcon />}
    >
      Set Jersey
    </Button>
  )
}

export const PlayerJerseyDialog = props => {
  const { teamId, team } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const {
    playerJerseyDialogOpen,
    setPlayerJerseyDialogOpen,
    playerData: player,
    setPlayerData,
  } = useContext(TeamPlayersContext)

  const handleCloseDialog = useCallback(() => {
    setPlayerJerseyDialogOpen(false)
    setPlayerData(null)
  }, [])

  const [mergePlayerJersey] = useMutation(MERGE_PLAYER_JERSEY, {
    update(cache, { data: { mergePlayerJersey } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_PLAYERS,
          variables: {
            teamId,
          },
        })

        const existingData = queryResult?.team?.[0].players
        const updatedPlayer = mergePlayerJersey.from

        let updatedData = []
        if (existingData.find(ed => ed.playerId === updatedPlayer.playerId)) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.playerId === updatedPlayer.playerId ? updatedPlayer : ed
          )
        }

        const updatedResult = {
          team: [
            {
              ...queryResult.team[0],
              players: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_PLAYERS,
          data: updatedResult,
          variables: {
            teamId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.mergePlayerJersey.from.name} now is ${data.mergePlayerJersey.to.name} for ${team?.name}!`,
        {
          variant: 'success',
        }
      )
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const [removePlayerJersey] = useMutation(REMOVE_PLAYER_JERSEY, {
    update(cache, { data: { removePlayerJersey } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_PLAYERS,
          variables: {
            teamId,
          },
        })
        const existingData = queryResult?.team?.[0].players
        const updatedPlayer = removePlayerJersey.from

        let updatedData = []
        if (existingData.find(ed => ed.playerId === updatedPlayer.playerId)) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.playerId === updatedPlayer.playerId ? updatedPlayer : ed
          )
        }

        const updatedResult = {
          team: [
            {
              ...queryResult.team[0],
              players: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_PLAYERS,
          data: updatedResult,
          variables: {
            teamId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data?.removePlayerJersey?.from?.name} not anymore ${data?.removePlayerJersey?.to?.name} for ${team?.name}!`,
        {
          variant: 'info',
        }
      )
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const teamJerseysColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'number',
        headerName: 'Number',
        width: 150,
      },
      {
        field: 'jerseyId',
        headerName: 'Has Jersey',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleJersey
              jerseyId={params.value}
              player={player}
              merge={mergePlayerJersey}
              remove={removePlayerJersey}
            />
          )
        },
      },
    ],
    [player]
  )

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={playerJerseyDialogOpen}
      onClose={handleCloseDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {team?.jerseys && (
        <>
          <DialogTitle id="alert-dialog-title">{`Set ${player?.name} jerseys for ${team?.name}`}</DialogTitle>
          <DialogContent>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={teamJerseysColumns}
                rows={setIdFromEntityId(team?.jerseys, 'jerseyId')}
                disableSelectionOnClick
                components={{
                  Toolbar: GridToolbar,
                }}
                sortModel={[
                  {
                    field: 'number',
                    sort: 'asc',
                  },
                ]}
              />
            </div>
          </DialogContent>
        </>
      )}
      <DialogActions>
        <Button onClick={handleCloseDialog}>{'Done'}</Button>
      </DialogActions>
    </Dialog>
  )
}

const ToggleJersey = props => {
  const { jerseyId, player, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!player?.jerseys?.find(p => p.jerseyId === jerseyId)
  )

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            isMember
              ? remove({
                  variables: {
                    jerseyId,
                    playerId: player.playerId,
                  },
                })
              : merge({
                  variables: {
                    jerseyId,
                    playerId: player.playerId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="teamMember"
          color="primary"
        />
      }
      label={isMember ? 'Has jersey' : 'No jersey'}
    />
  )
}
ToggleJersey.propTypes = {
  playerId: PropTypes.string,
  teamId: PropTypes.string,
  team: PropTypes.object,
  remove: PropTypes.func,
  merge: PropTypes.func,
}

SetPlayerJersey.propTypes = {
  teamId: PropTypes.string,
}
