import { Error, LinkButton, Loader } from 'components'
import React from 'react'
import { getAdminPhaseRoute } from 'router/routes'
import { formatDate, setIdFromEntityId } from 'utils'
import { Venue } from 'utils/types'
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
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

export const GET_ALL_PHASES = gql`
  query getPhases {
    phases {
      phaseId
      name
      status
      startDate
      endDate
      competition {
        competitionId
        name
      }
    }
  }
`

type TRelations = {
  venueId: string
  updateVenue: MutationFunction
  venue: Venue
}

const Phases: React.FC<TRelations> = props => {
  const { venueId, venue, updateVenue } = props

  const [openAddVenue, setOpenAddVenue] = React.useState(false)

  const handleCloseAddVenue = React.useCallback(() => {
    setOpenAddVenue(false)
  }, [])

  const [
    getAllVenues,
    {
      loading: queryAllVenuesLoading,
      error: queryAllVenuesError,
      data: queryAllVenuesData,
    },
  ] = useLazyQuery(GET_ALL_PHASES, {
    fetchPolicy: 'cache-and-network',
  })

  const handleOpenAddVenue = React.useCallback(() => {
    if (!queryAllVenuesData) {
      getAllVenues()
    }
    setOpenAddVenue(true)
  }, [])

  const venuePhasesColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },
      {
        field: 'competition',
        headerName: 'Competition',
        width: 200,
        valueGetter: params => params?.row?.competition?.name,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 200,
      },
      {
        field: 'startDate',
        headerName: 'Start Date',
        width: 180,
        valueGetter: params => params?.row?.startDate,
        valueFormatter: params => formatDate(params.value),
      },
      {
        field: 'endDate',
        headerName: 'End Date',
        width: 180,
        valueGetter: params => params?.row?.endDate,
        valueFormatter: params => formatDate(params.value),
      },
      {
        field: 'phaseId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminPhaseRoute(params.value)}
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
              text={'Remove'}
              textLoading={'Removing...'}
              dialogTitle={'Do you really want to detach phase from venue?'}
              dialogDescription={
                'Phase will remain in the database. You can add him to any venue later.'
              }
              dialogNegativeText={'No, keep phase'}
              dialogPositiveText={'Yes, detach phase'}
              onDialogClosePositive={() => {
                updateVenue({
                  variables: {
                    where: {
                      venueId,
                    },
                    update: {
                      phases: {
                        disconnect: {
                          where: {
                            node: {
                              phaseId: params.row?.phaseId,
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

  const allPhasesColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },

      {
        field: 'competition',
        headerName: 'Competition',
        width: 200,
        valueGetter: params => params?.row?.competition?.name,
      },

      {
        field: 'status',
        headerName: 'Status',
        width: 200,
      },
      {
        field: 'startDate',
        headerName: 'Start Date',
        width: 180,
        valueGetter: params => params?.row?.startDate,
        valueFormatter: params => formatDate(params.value),
      },
      {
        field: 'endDate',
        headerName: 'End Date',
        width: 180,
        valueGetter: params => params?.row?.endDate,
        valueFormatter: params => formatDate(params.value),
      },

      {
        field: 'phaseId',
        headerName: 'Membership',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewPhase
              phaseId={params.value}
              venueId={venueId}
              venue={venue}
              updateVenue={updateVenue}
            />
          )
        },
      },
    ],
    [venue]
  )

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="phases-content"
        id="phases-header"
      >
        <Typography>Phases</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Toolbar
          disableGutters
          sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
        >
          <div />
          <div>
            <Button
              onClick={handleOpenAddVenue}
              variant={'outlined'}
              size="small"
              startIcon={<AddIcon />}
            >
              Add Phase
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
            columns={venuePhasesColumns}
            rows={setIdFromEntityId(venue.phases, 'phaseId')}
            loading={queryAllVenuesLoading}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddVenue}
        onClose={handleCloseAddVenue}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllVenuesLoading && !queryAllVenuesError && <Loader />}
        {queryAllVenuesError && !queryAllVenuesLoading && (
          <Error message={queryAllVenuesError.message} />
        )}
        {queryAllVenuesData && !queryAllVenuesLoading && !queryAllVenuesError && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add ${venue?.name} to new phase`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600, width: '100%' }}>
                <DataGridPro
                  columns={allPhasesColumns}
                  rows={setIdFromEntityId(queryAllVenuesData.phases, 'phaseId')}
                  disableSelectionOnClick
                  loading={queryAllVenuesLoading}
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
              handleCloseAddVenue()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

type TToggleNewPhase = {
  venueId: string
  phaseId: string
  venue: Venue
  updateVenue: MutationFunction
}

const ToggleNewPhase: React.FC<TToggleNewPhase> = React.memo(props => {
  const { venueId, phaseId, venue, updateVenue } = props
  const [isMember, setIsMember] = React.useState(
    !!venue.phases.find(p => p.phaseId === phaseId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updateVenue({
          variables: {
            where: {
              venueId,
            },
            update: {
              phases: {
                ...(isMember
                  ? {
                      disconnect: {
                        where: {
                          node: {
                            phaseId,
                          },
                        },
                      },
                    }
                  : {
                      connect: {
                        where: {
                          node: { phaseId },
                        },
                      },
                    }),
              },
            },
          },
        })

        setIsMember(!isMember)
      }}
      name="phaseMember"
      color="primary"
    />
  )
})

export { Phases }
