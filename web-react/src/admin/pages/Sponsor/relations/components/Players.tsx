import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getXGridValueFromArray, setIdFromEntityId } from 'utils'
import { Sponsor } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import AccountBox from '@mui/icons-material/AccountBox'
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
import { Error } from '../../../../../components/Error'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { getAdminOrgPlayerRoute } from '../../../../../router/routes'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

export const GET_ALL_PLAYERS = gql`
  query getPlayers {
    players {
      playerId
      firstName
      lastName
      name
      teams {
        name
      }
      positions {
        name
      }
    }
  }
`

type TRelations = {
  sponsorId: string
  sponsor: Sponsor
  updateSponsor: MutationFunction
}

type TParams = {
  organizationSlug: string
}

const Players: React.FC<TRelations> = props => {
  const { sponsorId, sponsor, updateSponsor } = props

  const [openAddPlayer, setOpenAddPlayer] = useState(false)
  const { organizationSlug } = useParams<TParams>()
  const handleCloseAddPlayer = useCallback(() => {
    setOpenAddPlayer(false)
  }, [])

  const [
    getAllPlayers,
    {
      loading: queryAllPlayersLoading,
      error: queryAllPlayersError,
      data: queryAllPlayersData,
    },
  ] = useLazyQuery(GET_ALL_PLAYERS, {
    fetchPolicy: 'cache-and-network',
  })

  const handleOpenAddPlayer = useCallback(() => {
    if (!queryAllPlayersData) {
      getAllPlayers()
    }
    setOpenAddPlayer(true)
  }, [])

  const sponsorPlayersColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'teams',
        headerName: 'Teams',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.teams, 'name')
        },
      },

      {
        field: 'positions',
        headerName: 'Positions',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.positions, 'name')
        },
      },

      {
        field: 'playerId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgPlayerRoute(organizationSlug, params.value)}
            >
              Profile
            </LinkButton>
          )
        },
      },
      {
        field: 'removeButton',
        headerName: 'Remove',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ButtonDialog
              text={'Detach'}
              textLoading={'Detaching...'}
              dialogTitle={
                'Do you really want to detach player from the sponsor?'
              }
              dialogNegativeText={'No, keep player'}
              dialogPositiveText={'Yes, detach player'}
              onDialogClosePositive={() => {
                updateSponsor({
                  variables: {
                    where: {
                      sponsorId,
                    },
                    update: {
                      players: {
                        disconnect: {
                          where: {
                            node: {
                              playerId: params.row.playerId,
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
    [organizationSlug]
  )

  const allPlayersColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'teams',
        headerName: 'Teams',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.teams, 'name')
        },
      },
      {
        field: 'positions',
        headerName: 'Positions',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.positions, 'name')
        },
      },

      {
        field: 'playerId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewPlayer
              playerId={params.value}
              sponsorId={sponsorId}
              sponsor={sponsor}
              updateSponsor={updateSponsor}
            />
          )
        },
      },
    ],
    [sponsor]
  )

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="players-content"
        id="players-header"
      >
        <Typography>Players</Typography>
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
              Add Player
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
            columns={sponsorPlayersColumns}
            rows={setIdFromEntityId(sponsor?.players, 'playerId')}
            loading={queryAllPlayersLoading}
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
        {queryAllPlayersLoading && !queryAllPlayersError && <Loader />}
        {queryAllPlayersError && !queryAllPlayersLoading && (
          <Error message={queryAllPlayersError.message} />
        )}
        {queryAllPlayersData &&
          !queryAllPlayersLoading &&
          !queryAllPlayersError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add player to ${
                sponsor && sponsor.name
              }`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600, width: '100%' }}>
                  <DataGridPro
                    columns={allPlayersColumns}
                    rows={setIdFromEntityId(
                      queryAllPlayersData.players,
                      'playerId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllPlayersLoading}
                    components={{
                      Toolbar: GridToolbar,
                    }}
                  />
                </div>
              </DialogContent>
            </>
          )}
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

type TToggleNew = {
  playerId: string
  sponsorId: string
  sponsor: Sponsor
  updateSponsor: MutationFunction
}

const ToggleNewPlayer: React.FC<TToggleNew> = props => {
  const { playerId, sponsorId, sponsor, updateSponsor } = props
  const [isMember, setIsMember] = useState(
    !!sponsor.players.find(p => p.playerId === playerId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        isMember
          ? updateSponsor({
              variables: {
                where: {
                  sponsorId,
                },
                update: {
                  players: {
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
          : updateSponsor({
              variables: {
                where: {
                  sponsorId,
                },
                update: {
                  players: {
                    connect: {
                      where: {
                        node: { playerId },
                      },
                    },
                  },
                },
              },
            })

        setIsMember(!isMember)
      }}
      name="sponsorMember"
      color="primary"
    />
  )
}

export { Players }
