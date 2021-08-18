import React from 'react'
import { useMutation } from '@apollo/client'
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
import TeamPlayersContext from './context'
import { UPDATE_PLAYER } from './SetPlayerJersey'

export const SetPlayerPosition = props => {
  const { player } = props
  const classes = useStyles()

  const { setPlayerPositionDialogOpen, setPlayerData } =
    React.useContext(TeamPlayersContext)

  return (
    <Button
      type="button"
      onClick={() => {
        setPlayerData(player)
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
  const { team } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const {
    playerPositionDialogOpen,
    setPlayerPositionDialogOpen,
    playerData: player,
    setPlayerData,
  } = React.useContext(TeamPlayersContext)

  const handleCloseDialog = React.useCallback(() => {
    setPlayerPositionDialogOpen(false)
    setPlayerData(null)
  }, [])

  const [updatePlayer] = useMutation(UPDATE_PLAYER, {
    onCompleted: () => {
      enqueueSnackbar(`Player updated!`, {
        variant: 'success',
      })
    },
    onError: error => {
      enqueueSnackbar(`Error: ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const teamPositionsColumns = React.useMemo(
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
              updatePlayer={updatePlayer}
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
  const { positionId, player, updatePlayer } = props
  const [isMember, setIsMember] = React.useState(
    !!player?.positions?.find(p => p.positionId === positionId)
  )

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            updatePlayer({
              variables: {
                where: {
                  playerId: player.playerId,
                },
                update: {
                  positions: {
                    ...(!isMember
                      ? {
                          connect: {
                            where: {
                              node: {
                                positionId,
                              },
                            },
                          },
                        }
                      : {
                          disconnect: {
                            where: {
                              node: {
                                positionId,
                              },
                            },
                          },
                        }),
                  },
                },
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
