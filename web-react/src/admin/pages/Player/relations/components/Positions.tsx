import React, { useCallback, useMemo, useState } from 'react'
import { setIdFromEntityId } from 'utils'
import { Player, Position, Team } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Switch from '@mui/material/Switch'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

type TPositions = {
  playerId: string
  player: Player
  updatePlayer: MutationFunction
}

const Positions: React.FC<TPositions> = props => {
  const { playerId, player, updatePlayer } = props

  const [openAddPlayer, setOpenAddPlayer] = useState(false)

  const handleCloseAddPlayer = useCallback(() => {
    setOpenAddPlayer(false)
  }, [])

  const handleOpenAddPlayer = useCallback(() => {
    setOpenAddPlayer(true)
  }, [])

  const playerPositionsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'teamName',
        headerName: 'Team',
        width: 150,
        valueGetter: params => params.row?.team?.name,
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
              dialogTitle={
                'Do you really want to remove position from the player?'
              }
              dialogDescription={
                'Position will remain in the database. You can use it anytime later.'
              }
              dialogNegativeText={'No, keep position'}
              dialogPositiveText={'Yes, remove position'}
              onDialogClosePositive={() => {
                updatePlayer({
                  variables: {
                    where: {
                      playerId,
                    },
                    update: {
                      positions: {
                        disconnect: {
                          where: {
                            node: {
                              positionId: params.row.positionId,
                            },
                          },
                        },
                      },
                    },
                  },
                })
              }}
            />
          )
        },
      },
    ],
    []
  )

  const allPositionsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'teamName',
        headerName: 'Team',
        width: 150,
      },
      {
        field: 'positionId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewPosition
              positionId={params.value}
              playerId={playerId}
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
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="positions-content"
        id="positions-header"
      >
        <Typography>Positions</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <>
          <Toolbar
            disableGutters
            sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
          >
            <div />
            <div>
              <Button
                onClick={handleOpenAddPlayer}
                variant={'outlined'}
                size="small"
                startIcon={<AddIcon />}
              >
                Add To Position
              </Button>
            </div>
          </Toolbar>
          <div style={{ height: 600, width: '100%' }}>
            <DataGridPro
              columns={playerPositionsColumns}
              rows={setIdFromEntityId(player.positions, 'positionId')}
              components={{
                Toolbar: GridToolbar,
              }}
            />
          </div>
        </>
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddPlayer}
        onClose={handleCloseAddPlayer}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{`Add ${player?.name} to new position`}</DialogTitle>
        <DialogContent>
          <div style={{ height: 600, width: '100%' }}>
            <DataGridPro
              columns={allPositionsColumns}
              rows={setIdFromEntityId(
                composePositions(player?.teams),
                'positionId'
              )}
              disableSelectionOnClick
              components={{
                Toolbar: GridToolbar,
              }}
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              handleCloseAddPlayer()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

const composePositions = (teams: Team[]) =>
  teams.reduce<Position[]>((acc, team) => {
    const teamPositions = team.positions.map(p => ({
      ...p,
      teamName: team?.name,
    }))
    return [...acc, ...teamPositions]
  }, [])

type TToggleNewPosition = {
  playerId: string
  positionId: string
  player: Player
  updatePlayer: MutationFunction
}

const ToggleNewPosition: React.FC<TToggleNewPosition> = React.memo(props => {
  const { playerId, positionId, player, updatePlayer } = props
  const [isMember, setIsMember] = useState(
    !!player.positions.find(p => p.positionId === positionId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        isMember
          ? updatePlayer({
              variables: {
                where: {
                  playerId,
                },
                update: {
                  positions: {
                    disconnect: {
                      where: {
                        node: {
                          positionId,
                        },
                      },
                    },
                  },
                },
              },
            })
          : updatePlayer({
              variables: {
                where: {
                  playerId,
                },
                update: {
                  positions: {
                    connect: {
                      where: {
                        node: { positionId },
                      },
                    },
                  },
                },
              },
            })
        setIsMember(!isMember)
      }}
      name="positionMember"
      color="primary"
    />
  )
})

export { Positions }
