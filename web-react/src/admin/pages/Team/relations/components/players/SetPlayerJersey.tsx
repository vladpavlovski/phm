import { LinkButton } from 'components/LinkButton'
import { useSnackbar } from 'notistack'
import React from 'react'
import { setIdFromEntityId } from 'utils'
import { Player, Team } from 'utils/types'
import { gql, MutationFunction, useMutation } from '@apollo/client'
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

export const UPDATE_PLAYER = gql`
  mutation updatePlayer($where: PlayerWhere, $update: PlayerUpdateInput) {
    updatePlayers(where: $where, update: $update) {
      players {
        playerId
        firstName
        lastName
        name
        jerseys {
          jerseyId
          name
          number
        }
        positions {
          positionId
          name
        }
      }
    }
  }
`

type TSetPlayerJersey = {
  player: Player
}

const SetPlayerJersey: React.FC<TSetPlayerJersey> = React.memo(props => {
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
          playerJerseyDialogOpen: true,
          playerData: player,
        }))
      }}
    >
      <Tooltip arrow title="Set Jersey" placement="top">
        <EditIcon />
      </Tooltip>
    </LinkButton>
  )
})

type TPlayerJerseyDialog = {
  team: Team
}

const PlayerJerseyDialog: React.FC<TPlayerJerseyDialog> = React.memo(props => {
  const { team } = props
  const { enqueueSnackbar } = useSnackbar()
  const { state, update } = React.useContext(TeamPlayersContext)

  const handleCloseDialog = React.useCallback(() => {
    update(state => ({
      ...state,
      playerJerseyDialogOpen: false,
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

  const teamJerseysColumns = React.useMemo<GridColumns>(
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
            state.playerData && (
              <ToggleJersey
                jerseyId={params.value}
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
      open={state?.playerJerseyDialogOpen}
      onClose={handleCloseDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {team?.jerseys && (
        <>
          <DialogTitle id="alert-dialog-title">{`Set ${state?.playerData?.name} jerseys for ${team?.name}`}</DialogTitle>
          <DialogContent>
            <div style={{ height: 600, width: '100%' }}>
              <DataGridPro
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
})

type TToggleJersey = {
  jerseyId: string
  player: Player
  updatePlayer: MutationFunction
}

const ToggleJersey: React.FC<TToggleJersey> = React.memo(props => {
  const { jerseyId, player, updatePlayer } = props
  const [isMember, setIsMember] = React.useState(
    !!player?.jerseys?.find(p => p.jerseyId === jerseyId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updatePlayer({
          variables: {
            where: {
              playerId: player?.playerId,
            },
            update: {
              jerseys: {
                ...(!isMember
                  ? {
                      connect: {
                        where: {
                          node: {
                            jerseyId,
                          },
                        },
                      },
                    }
                  : {
                      disconnect: {
                        where: {
                          node: {
                            jerseyId,
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

export { PlayerJerseyDialog, SetPlayerJersey }
