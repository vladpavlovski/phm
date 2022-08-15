import React, { useCallback, useMemo, useState } from 'react'
import { setIdFromEntityId } from 'utils'
import { Jersey, Player, Team } from 'utils/types'
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

type TJerseys = {
  playerId: string
  player: Player
  updatePlayer: MutationFunction
}

const Jerseys: React.FC<TJerseys> = props => {
  const { playerId, player, updatePlayer } = props

  const [openAddPlayer, setOpenAddPlayer] = useState(false)

  const handleCloseAddPlayer = useCallback(() => {
    setOpenAddPlayer(false)
  }, [])

  const handleOpenAddPlayer = useCallback(() => {
    setOpenAddPlayer(true)
  }, [])

  const playerJerseysColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 250,
      },
      {
        field: 'teamName',
        headerName: 'Team',
        width: 250,
        valueGetter: params => params.row?.team?.name,
      },
      {
        field: 'number',
        headerName: 'Number',
        width: 150,
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
                'Do you really want to remove jersey from the player?'
              }
              dialogDescription={
                'Jersey will remain in the database. You can use it anytime later.'
              }
              dialogNegativeText={'No, keep jersey'}
              dialogPositiveText={'Yes, remove jersey'}
              onDialogClosePositive={() => {
                updatePlayer({
                  variables: {
                    where: {
                      playerId,
                    },
                    update: {
                      jerseys: {
                        disconnect: {
                          where: {
                            node: {
                              jerseyId: params.row.jerseyId,
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

  const allJerseysColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 250,
      },
      {
        field: 'teamName',
        headerName: 'Team',
        width: 150,
      },
      {
        field: 'number',
        headerName: 'Number',
        width: 150,
      },
      {
        field: 'numberInt',
        headerName: 'NumberInt',
        width: 150,
        hide: true,
      },
      {
        field: 'jerseyId',
        headerName: 'Assignment',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewJersey
              jerseyId={params.value}
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
        aria-controls="jerseys-content"
        id="jerseys-header"
      >
        <Typography>Jerseys</Typography>
      </AccordionSummary>
      <AccordionDetails>
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
              Assign Jersey
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
            columns={playerJerseysColumns}
            rows={setIdFromEntityId(player.jerseys, 'jerseyId')}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddPlayer}
        onClose={handleCloseAddPlayer}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{`Assign new jersey to${player?.name}`}</DialogTitle>
        <DialogContent>
          <div style={{ height: 600, width: '100%' }}>
            <DataGridPro
              columns={allJerseysColumns}
              rows={setIdFromEntityId(
                composeJerseys(player.teams),
                'jerseyId'
              ).map((t: Jersey) => ({ ...t, numberInt: Number(t.number) }))}
              disableSelectionOnClick
              components={{
                Toolbar: GridToolbar,
              }}
              sortModel={[
                {
                  field: 'numberInt',
                  sort: 'asc',
                },
              ]}
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

const composeJerseys = (teams: Team[]) =>
  teams.reduce<Jersey[]>((acc, team) => {
    const teamJerseys = team.jerseys.map(p => ({
      ...p,
      teamName: team?.name,
    }))
    return [...acc, ...teamJerseys]
  }, [])

type TToggleNewJersey = {
  playerId: string
  jerseyId: string
  player: Player
  updatePlayer: MutationFunction
}

const ToggleNewJersey: React.FC<TToggleNewJersey> = React.memo(props => {
  const { playerId, jerseyId, player, updatePlayer } = props
  const [isMember, setIsMember] = useState(
    !!player.jerseys.find(p => p.jerseyId === jerseyId)
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
                  jerseys: {
                    disconnect: {
                      where: {
                        node: {
                          jerseyId,
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
                  jerseys: {
                    connect: {
                      where: {
                        node: { jerseyId },
                      },
                    },
                  },
                },
              },
            })
        setIsMember(!isMember)
      }}
      name="jerseyMember"
      color="primary"
    />
  )
})

export { Jerseys }
