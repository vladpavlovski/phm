import { Error, LinkButton, Loader } from 'components'
import React from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgCompetitionRoute } from 'router/routes'
import { setIdFromEntityId } from 'utils'
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

export const GET_ALL_COMPETITIONS = gql`
  query getCompetitions {
    competitions {
      competitionId
      name
    }
  }
`

type TRelations = {
  venueId: string
  updateVenue: MutationFunction
  venue: Venue
}

type TCompetitionsParams = {
  organizationSlug: string
}

const Competitions: React.FC<TRelations> = props => {
  const { venueId, venue, updateVenue } = props
  const { organizationSlug } = useParams<TCompetitionsParams>()
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
  ] = useLazyQuery(GET_ALL_COMPETITIONS, {
    fetchPolicy: 'cache-and-network',
  })

  const handleOpenAddVenue = React.useCallback(() => {
    if (!queryAllVenuesData) {
      getAllVenues()
    }
    setOpenAddVenue(true)
  }, [])

  const venueCompetitionsColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'competitionId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgCompetitionRoute(organizationSlug, params.value)}
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
              dialogTitle={
                'Do you really want to detach competition from venue?'
              }
              dialogDescription={
                'Competition will remain in the database. You can add him to any venue later.'
              }
              dialogNegativeText={'No, keep competition'}
              dialogPositiveText={'Yes, detach competition'}
              onDialogClosePositive={() => {
                updateVenue({
                  variables: {
                    where: {
                      venueId,
                    },
                    update: {
                      competitions: {
                        disconnect: {
                          where: {
                            node: {
                              competitionId: params.row.competitionId,
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

  const allCompetitionsColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 300,
      },

      {
        field: 'competitionId',
        headerName: 'Membership',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewCompetition
              competitionId={params.value}
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
        aria-controls="competitions-content"
        id="competitions-header"
      >
        <Typography>Competitions</Typography>
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
              Add Competition
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
            columns={venueCompetitionsColumns}
            rows={setIdFromEntityId(venue.competitions, 'competitionId')}
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
            <DialogTitle id="alert-dialog-title">{`Add ${venue?.name} to new competition`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600, width: '100%' }}>
                <DataGridPro
                  columns={allCompetitionsColumns}
                  rows={setIdFromEntityId(
                    queryAllVenuesData.competitions,
                    'competitionId'
                  )}
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

type TToggleNewCompetition = {
  venueId: string
  competitionId: string
  venue: Venue
  updateVenue: MutationFunction
}

const ToggleNewCompetition: React.FC<TToggleNewCompetition> = props => {
  const { venueId, competitionId, venue, updateVenue } = props
  const [isMember, setIsMember] = React.useState(
    !!venue.competitions.find(p => p.competitionId === competitionId)
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
              competitions: {
                ...(isMember
                  ? {
                      disconnect: {
                        where: {
                          node: {
                            competitionId,
                          },
                        },
                      },
                    }
                  : {
                      connect: {
                        where: {
                          node: { competitionId },
                        },
                      },
                    }),
              },
            },
          },
        })
        setIsMember(!isMember)
      }}
      name="competitionMember"
      color="primary"
    />
  )
}

export { Competitions }
