import { Error, LinkButton, Loader } from 'components'
import React from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgSeasonRoute } from 'router/routes'
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

export const GET_ALL_SEASONS = gql`
  query getSeasons {
    seasons {
      seasonId
      name
    }
  }
`

type TRelations = {
  venueId: string
  updateVenue: MutationFunction
  venue: Venue
}

type TSeasonsParams = {
  organizationSlug: string
}

const Seasons: React.FC<TRelations> = props => {
  const { venueId, venue, updateVenue } = props

  const { organizationSlug } = useParams<TSeasonsParams>()
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
  ] = useLazyQuery(GET_ALL_SEASONS, {
    fetchPolicy: 'cache-and-network',
  })

  const handleOpenAddVenue = React.useCallback(() => {
    if (!queryAllVenuesData) {
      getAllVenues()
    }
    setOpenAddVenue(true)
  }, [])

  const venueSeasonsColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'seasonId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgSeasonRoute(organizationSlug, params.value)}
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
              dialogTitle={'Do you really want to detach season from venue?'}
              dialogDescription={
                'Season will remain in the database. You can add him to any venue later.'
              }
              dialogNegativeText={'No, keep season'}
              dialogPositiveText={'Yes, detach season'}
              onDialogClosePositive={() => {
                updateVenue({
                  variables: {
                    where: {
                      venueId,
                    },
                    update: {
                      seasons: {
                        disconnect: {
                          where: {
                            node: {
                              seasonId: params.row.seasonId,
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

  const allSeasonsColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 300,
      },

      {
        field: 'seasonId',
        headerName: 'Membership',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewSeason
              seasonId={params.value}
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
        aria-controls="seasons-content"
        id="seasons-header"
      >
        <Typography>Seasons</Typography>
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
              Add Season
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
            columns={venueSeasonsColumns}
            rows={setIdFromEntityId(venue.seasons, 'seasonId')}
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
            <DialogTitle id="alert-dialog-title">{`Add ${venue?.name} to new season`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600, width: '100%' }}>
                <DataGridPro
                  columns={allSeasonsColumns}
                  rows={setIdFromEntityId(
                    queryAllVenuesData.seasons,
                    'seasonId'
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

type TToggleNewSeason = {
  venueId: string
  seasonId: string
  venue: Venue
  updateVenue: MutationFunction
}

const ToggleNewSeason: React.FC<TToggleNewSeason> = props => {
  const { venueId, seasonId, venue, updateVenue } = props
  const [isMember, setIsMember] = React.useState(
    !!venue.seasons.find(p => p.seasonId === seasonId)
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
              seasons: {
                ...(isMember
                  ? {
                      disconnect: {
                        where: {
                          node: {
                            seasonId,
                          },
                        },
                      },
                    }
                  : {
                      connect: {
                        where: {
                          node: { seasonId },
                        },
                      },
                    }),
              },
            },
          },
        })
        setIsMember(!isMember)
      }}
      name="seasonMember"
      color="primary"
    />
  )
}

export { Seasons }
