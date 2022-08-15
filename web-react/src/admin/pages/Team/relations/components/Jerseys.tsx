import { useSnackbar } from 'notistack'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { setIdFromEntityId } from 'utils'
import { Player, Team } from 'utils/types'
import { gql, useMutation } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import CreateIcon from '@mui/icons-material/Create'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LoadingButton from '@mui/lab/LoadingButton'
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
import { GET_TEAM, TGetTeam } from '../../index'

const CREATE_JERSEYS = gql`
  mutation createJerseys($teamId: ID!, $nameBase: String!) {
    jerseys: CreateJerseys(teamId: $teamId, nameBase: $nameBase) {
      jerseyId
      name
      number
    }
  }
`

const UPDATE_JERSEY = gql`
  mutation updateJersey($where: JerseyWhere, $update: JerseyUpdateInput) {
    updateJerseys(where: $where, update: $update) {
      jerseys {
        jerseyId
        name
        number
        player {
          playerId
          firstName
          lastName
          name
          jerseys {
            jerseyId
          }
        }
      }
    }
  }
`

type TJerseys = {
  teamId: string
  team: Team
}

const Jerseys: React.FC<TJerseys> = React.memo(props => {
  const { teamId, team } = props
  const { enqueueSnackbar } = useSnackbar()

  const [openAddPlayer, setOpenAddPlayer] = useState(false)

  const modalJerseyId = useRef(null)

  const handleCloseAddJersey = useCallback(() => {
    setOpenAddPlayer(false)
  }, [])

  const [createJerseys, { loading: queryCreateLoading }] = useMutation(
    CREATE_JERSEYS,
    {
      variables: {
        teamId,
        nameBase: team?.name,
      },

      update(cache, { data: { jerseys } }) {
        try {
          const queryResult: TGetTeam | null = cache.readQuery({
            query: GET_TEAM,
            variables: { where: { teamId } },
          })

          const updatedResult = {
            team: [
              {
                ...queryResult?.teams[0],
                jerseys,
              },
            ],
          }
          cache.writeQuery({
            data: updatedResult,
            query: GET_TEAM,
            variables: { where: { teamId } },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        enqueueSnackbar(`Jerseys added to ${team.name}!`, {
          variant: 'success',
        })
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  const handleOpenAddPlayer = useCallback(jerseyId => {
    modalJerseyId.current = jerseyId
    setOpenAddPlayer(true)
  }, [])

  const teamJerseysColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'number',
        headerName: 'Number',
        width: 140,
      },
      {
        field: 'playerName',
        headerName: 'Player Name',
        width: 200,
        valueGetter: params => params.row?.player?.name,
      },
      {
        field: 'jerseyId',
        headerName: 'Edit',
        width: 170,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <Button
              type="button"
              onClick={() => {
                handleOpenAddPlayer(params.value)
              }}
              variant={'outlined'}
              size="small"
              startIcon={<AddIcon />}
            >
              Set Player
            </Button>
          )
        },
      },
    ],
    []
  )

  const teamPlayersColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'playerId',
        headerName: 'Owner',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <TogglePlayerJersey
              playerId={params.value}
              teamId={teamId}
              player={params.row}
              jerseyId={modalJerseyId.current}
            />
          )
        },
      },
    ],
    []
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
        {team?.jerseys?.length === 0 && (
          <Toolbar
            disableGutters
            sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
          >
            <div />
            <div>
              {/* <Button
                    onClick={handleOpenAddJersey}
                    variant={'outlined'}
                    size="small"
                    
                    startIcon={<AddIcon />}
                  >
                    Add Jersey
                  </Button> */}
              {/* TODO: MAKE Modal */}
              <LoadingButton
                type="button"
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => {
                  createJerseys()
                }}
                startIcon={<CreateIcon />}
                loading={queryCreateLoading}
              >
                {'Create'}
              </LoadingButton>
            </div>
          </Toolbar>
        )}
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
            columns={teamJerseysColumns}
            rows={setIdFromEntityId(team.jerseys, 'jerseyId')}
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
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddPlayer}
        onClose={handleCloseAddJersey}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{`Add jersey to player`}</DialogTitle>
        <DialogContent>
          <div style={{ height: 600, width: '100%' }}>
            <DataGridPro
              columns={teamPlayersColumns}
              rows={setIdFromEntityId(team.players, 'playerId')}
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
              handleCloseAddJersey()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
})

type TTogglePlayerJersey = {
  jerseyId: string | null
  teamId: string
  player: Player
  playerId: string
}

const TogglePlayerJersey: React.FC<TTogglePlayerJersey> = React.memo(props => {
  const { jerseyId, teamId, player, playerId } = props
  const { enqueueSnackbar } = useSnackbar()

  const [isOwner, setIsOwner] = useState(
    !!player?.jerseys?.find(j => j?.jerseyId === jerseyId)
  )

  const [updateJersey] = useMutation(UPDATE_JERSEY, {
    update(cache, { data }) {
      try {
        const queryResult: TGetTeam | null = cache.readQuery({
          query: GET_TEAM,
          variables: { where: { teamId } },
        })

        const newData = data?.updateJerseys?.jerseys?.[0]

        const updatedData = queryResult?.teams?.[0]?.jerseys?.map(j => {
          if (j.jerseyId === newData?.jerseyId) {
            return { ...j, player: newData?.player }
          }
          return j
        })

        cache.writeQuery({
          query: GET_TEAM,
          data: {
            teams: [{ ...queryResult?.teams[0], jerseys: updatedData }],
          },
          variables: { where: { teamId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      enqueueSnackbar('Jersey updated!', { variant: 'success' })
    },
    onError: error => {
      enqueueSnackbar(`Error: ${error}`, {
        variant: 'error',
      })
    },
  })

  return (
    <Switch
      checked={isOwner}
      onChange={() => {
        isOwner
          ? updateJersey({
              variables: {
                where: {
                  jerseyId,
                },
                update: {
                  player: {
                    disconnect: {
                      where: {
                        node: {
                          playerId,
                        },
                      },
                    },
                  },
                },
              },
            })
          : updateJersey({
              variables: {
                where: {
                  jerseyId,
                },
                update: {
                  player: {
                    connect: {
                      where: {
                        node: { playerId },
                      },
                    },
                  },
                },
              },
            })
        setIsOwner(!isOwner)
      }}
      name="teamMember"
      color="primary"
    />
  )
})

export { Jerseys }
