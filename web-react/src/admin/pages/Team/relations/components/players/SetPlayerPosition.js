import React from 'react'
import { useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'

import Switch from '@mui/material/Switch'
import EditIcon from '@mui/icons-material/Edit'
import Tooltip from '@mui/material/Tooltip'
import ButtonBase from '@mui/material/ButtonBase'
import { LinkButton } from '../../../../../../components/LinkButton'

import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'
import { useStyles } from '../../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../../utils'
import TeamPlayersContext from './context'
import { UPDATE_PLAYER } from './SetPlayerJersey'

const SetPlayerPositionComponent = props => {
  const { player } = props

  const { setPlayerPositionDialogOpen, setPlayerData } =
    React.useContext(TeamPlayersContext)

  return (
    <LinkButton
      component={ButtonBase}
      variant="text"
      icon
      onClick={() => {
        setPlayerData(player)
        setPlayerPositionDialogOpen(true)
      }}
    >
      <Tooltip arrow title="Set Position" placement="top">
        <EditIcon />
      </Tooltip>
    </LinkButton>
  )
}

const PlayerPositionDialogComponent = props => {
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
              <DataGridPro
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

SetPlayerPositionComponent.propTypes = {
  teamId: PropTypes.string,
}

const PlayerPositionDialog = React.memo(PlayerPositionDialogComponent)
const SetPlayerPosition = React.memo(SetPlayerPositionComponent)
export { PlayerPositionDialog, SetPlayerPosition }
