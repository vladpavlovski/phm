import { LinkButton } from 'components/LinkButton'
import { useSnackbar } from 'notistack'
import React from 'react'
import { setIdFromEntityId } from 'utils'
import { Player, Team } from 'utils/types'
import { MutationFunction, useMutation } from '@apollo/client'
import EditIcon from '@mui/icons-material/Edit'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'
import { TeamPlayersContext } from './index'
import { UPDATE_PLAYER } from './SetPlayerJersey'

type TSetPlayerPosition = {
  player: Player
}

const SetPlayerPosition: React.FC<TSetPlayerPosition> = React.memo(props => {
  const { player } = props
  const { update } = React.useContext(TeamPlayersContext)

  return (
    <LinkButton
      component={ButtonBase}
      variant="text"
      icon
      onClick={() => {
        update(state => ({
          ...state,
          playerPositionDialogOpen: true,
          playerData: player,
        }))
      }}
    >
      <Tooltip arrow title="Set Position" placement="top">
        <EditIcon />
      </Tooltip>
    </LinkButton>
  )
})

type TPlayerPositionDialog = {
  team: Team
}

const PlayerPositionDialog: React.FC<TPlayerPositionDialog> = React.memo(
  props => {
    const { team } = props
    const { enqueueSnackbar } = useSnackbar()
    const { state, update } = React.useContext(TeamPlayersContext)

    const handleCloseDialog = React.useCallback(() => {
      update(state => ({
        ...state,
        playerPositionDialogOpen: false,
        playerData: null,
      }))
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

    const teamPositionsColumns = React.useMemo<GridColumns>(
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
              state.playerData && (
                <TogglePosition
                  positionId={params.value}
                  player={state.playerData}
                  updatePlayer={updatePlayer}
                />
              )
            )
          },
        },
      ],
      [state]
    )

    return (
      <Dialog
        fullWidth
        maxWidth="md"
        open={state?.playerPositionDialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {team?.positions && (
          <>
            <DialogTitle id="alert-dialog-title">{`Set ${state?.playerData?.name} positions for ${team?.name}`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600, width: '100%' }}>
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
)

type TTogglePosition = {
  positionId: string
  player: Player
  updatePlayer: MutationFunction
}

const TogglePosition: React.FC<TTogglePosition> = React.memo(props => {
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
    />
  )
})

export { PlayerPositionDialog, SetPlayerPosition }
