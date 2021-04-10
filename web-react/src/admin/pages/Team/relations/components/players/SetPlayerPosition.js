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

const MERGE_PLAYER_POSITION = gql`
  mutation mergePlayerPosition($playerId: ID!, $positionId: ID!) {
    mergePlayerPosition: MergePlayerPositions(
      from: { playerId: $playerId }
      to: { positionId: $positionId }
    ) {
      from {
        playerId
        firstName
        lastName
        name
        positions {
          positionId
          name
        }
      }
      to {
        positionId
        name
      }
    }
  }
`

const REMOVE_PLAYER_POSITION = gql`
  mutation removePlayerPosition($playerId: ID!, $positionId: ID!) {
    removePlayerPosition: RemovePlayerPositions(
      from: { playerId: $playerId }
      to: { positionId: $positionId }
    ) {
      from {
        playerId
        firstName
        lastName
        name
        positions {
          positionId
          name
        }
      }
      to {
        positionId
        name
      }
    }
  }
`

export const SetPlayerPosition = props => {
  const { player } = props
  const classes = useStyles()

  const { setPlayerPositionDialogOpen, setPlayerPositionData } = useContext(
    TeamPlayersContext
  )

  return (
    <Button
      type="button"
      onClick={() => {
        setPlayerPositionData(player)
        setPlayerPositionDialogOpen(true)
      }}
      variant={'outlined'}
      size="small"
      className={classes.submit}
      startIcon={<AddIcon />}
    >
      Set Position
    </Button>
  )
}

export const PlayerPositionDialog = props => {
  const { teamId, team } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const {
    playerPositionDialogOpen,
    setPlayerPositionDialogOpen,
    playerPositionData: player,
    setPlayerPositionData,
  } = useContext(TeamPlayersContext)

  const handleCloseDialog = useCallback(() => {
    setPlayerPositionDialogOpen(false)
    setPlayerPositionData(null)
  }, [])

  const [mergePlayerPosition] = useMutation(MERGE_PLAYER_POSITION, {
    update(cache, { data: { mergePlayerPosition } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_PLAYERS,
          variables: {
            teamId,
          },
        })

        const existingData = queryResult?.team?.[0].players
        const updatedPlayer = mergePlayerPosition.from

        let updatedData = []
        if (existingData.find(ed => ed.positionId === updatedPlayer.playerId)) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.playerId === updatedPlayer.positionId ? updatedPlayer : ed
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
        `${data.mergePlayerPosition.from.name} now is ${data.mergePlayerPosition.to.name} for ${team?.name}!`,
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

  const [removePlayerPosition] = useMutation(REMOVE_PLAYER_POSITION, {
    update(cache, { data: { removePlayerPosition } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_PLAYERS,
          variables: {
            teamId,
          },
        })
        const existingData = queryResult?.team?.[0].players
        const updatedPlayer = removePlayerPosition.from

        let updatedData = []
        if (existingData.find(ed => ed.positionId === updatedPlayer.playerId)) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.playerId === updatedPlayer.positionId ? updatedPlayer : ed
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
        `${data?.removePlayerPosition?.from?.name} not anymore ${data?.removePlayerPosition?.to?.name} for ${team?.name}!`,
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

  const teamPositionsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'positionId',
        headerName: 'Has Position',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <TogglePosition
              positionId={params.value}
              player={player}
              merge={mergePlayerPosition}
              remove={removePlayerPosition}
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
      open={playerPositionDialogOpen}
      onClose={handleCloseDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {team?.positions && (
        <>
          <DialogTitle id="alert-dialog-title">{`Set ${player?.name} positions for ${team?.name}`}</DialogTitle>
          <DialogContent>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={teamPositionsColumns}
                rows={setIdFromEntityId(team?.positions, 'positionId')}
                disableSelectionOnClick
                // loading={queryTeamPositionsLoading}
                components={{
                  Toolbar: GridToolbar,
                }}
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

const TogglePosition = props => {
  const { positionId, player, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!player?.positions?.find(p => p.positionId === positionId)
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
                    positionId,
                    playerId: player.playerId,
                  },
                })
              : merge({
                  variables: {
                    positionId,
                    playerId: player.playerId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="teamMember"
          color="primary"
        />
      }
      label={isMember ? 'In position' : 'No position'}
    />
  )
}
TogglePosition.propTypes = {
  playerId: PropTypes.string,
  teamId: PropTypes.string,
  team: PropTypes.object,
  remove: PropTypes.func,
  merge: PropTypes.func,
}

SetPlayerPosition.propTypes = {
  teamId: PropTypes.string,
}
