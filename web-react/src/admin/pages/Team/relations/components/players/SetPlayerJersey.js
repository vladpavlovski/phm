import React from 'react'
import { gql, useMutation } from '@apollo/client'
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

export const SetPlayerJersey = props => {
  const { player } = props

  const { setPlayerJerseyDialogOpen, setPlayerData } =
    React.useContext(TeamPlayersContext)

  return (
    <LinkButton
      component={ButtonBase}
      variant="text"
      icon
      onClick={() => {
        setPlayerData(player)
        setPlayerJerseyDialogOpen(true)
      }}
    >
      <Tooltip arrow title="Set Jersey" placement="top">
        <EditIcon />
      </Tooltip>
    </LinkButton>
  )
}

export const PlayerJerseyDialog = props => {
  const { team } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const {
    playerJerseyDialogOpen,
    setPlayerJerseyDialogOpen,
    playerData: player,
    setPlayerData,
  } = React.useContext(TeamPlayersContext)

  const handleCloseDialog = React.useCallback(() => {
    setPlayerJerseyDialogOpen(false)
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

  const teamJerseysColumns = React.useMemo(
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
}

const ToggleJersey = props => {
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
              playerId: player.playerId,
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
      label={isMember ? 'Has jersey' : 'No jersey'}
    />
  )
}
ToggleJersey.propTypes = {
  playerId: PropTypes.string,
  teamId: PropTypes.string,
  team: PropTypes.object,
  updatePlayer: PropTypes.func,
}

SetPlayerJersey.propTypes = {
  teamId: PropTypes.string,
}
