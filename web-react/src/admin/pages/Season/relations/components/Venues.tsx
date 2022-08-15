import { Error, LinkButton, Loader } from 'components'
import React from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgVenueRoute } from 'router/routes'
import { setIdFromEntityId } from 'utils'
import { Season } from 'utils/types'
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

export const GET_ALL_VENUES = gql`
  query getVenues {
    venues {
      venueId
      name
      nick
      capacity
    }
  }
`

type TRelations = {
  seasonId: string
  updateSeason: MutationFunction
  season: Season
}

type TParams = {
  organizationSlug: string
}

const Venues: React.FC<TRelations> = props => {
  const { seasonId, season, updateSeason } = props

  const { organizationSlug } = useParams<TParams>()
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
  ] = useLazyQuery(GET_ALL_VENUES)

  const handleOpenAddVenue = React.useCallback(() => {
    if (!queryAllVenuesData) {
      getAllVenues()
    }
    setOpenAddVenue(true)
  }, [])

  const seasonVenuesColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'nick',
        headerName: 'Nick',
        width: 100,
      },

      {
        field: 'capacity',
        headerName: 'Capacity',
        width: 180,
      },

      {
        field: 'venueId',
        headerName: 'Profile',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgVenueRoute(organizationSlug, params.value)}
            >
              Profile
            </LinkButton>
          )
        },
      },
      {
        field: 'removeButton',
        headerName: 'Detach',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ButtonDialog
              text={'Detach'}
              textLoading={'Detaching...'}
              dialogTitle={'Do you really want to detach season from venue?'}
              dialogDescription={'You can add season to venue later.'}
              dialogNegativeText={'No, keep in venue'}
              dialogPositiveText={'Yes, detach venue'}
              onDialogClosePositive={() => {
                updateSeason({
                  variables: {
                    where: {
                      seasonId,
                    },
                    update: {
                      venus: {
                        disconnect: {
                          where: {
                            node: {
                              venueId: params.row.venueId,
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

  const allVenuesColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },

      {
        field: 'nick',
        headerName: 'Nick',
        width: 100,
      },

      {
        field: 'capacity',
        headerName: 'Capacity',
        width: 180,
      },
      {
        field: 'venueId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewVenue
              venueId={params.value}
              seasonId={seasonId}
              season={season}
              updateSeason={updateSeason}
            />
          )
        },
      },
    ],
    [season]
  )

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="venues-content"
        id="venues-header"
      >
        <Typography>Venues</Typography>
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
              Add Venue
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
            columns={seasonVenuesColumns}
            rows={setIdFromEntityId(season.venues, 'venueId')}
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
        {queryAllVenuesLoading && <Loader />}
        <Error message={queryAllVenuesError?.message} />
        {queryAllVenuesData && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add ${
              season && season.name
            } to new venue`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600, width: '100%' }}>
                <DataGridPro
                  columns={allVenuesColumns}
                  rows={setIdFromEntityId(queryAllVenuesData.venues, 'venueId')}
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
type TToggleNew = {
  seasonId: string
  venueId: string
  season: Season
  updateSeason: MutationFunction
}

const ToggleNewVenue: React.FC<TToggleNew> = React.memo(props => {
  const { venueId, seasonId, season, updateSeason } = props
  const [isMember, setIsMember] = React.useState(
    !!season.venues.find(p => p.venueId === venueId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updateSeason({
          variables: {
            where: {
              seasonId,
            },
            update: {
              venues: {
                ...(isMember
                  ? {
                      disconnect: {
                        where: {
                          node: {
                            venueId,
                          },
                        },
                      },
                    }
                  : {
                      connect: {
                        where: {
                          node: { venueId },
                        },
                      },
                    }),
              },
            },
          },
        })

        setIsMember(!isMember)
      }}
      name="venueMember"
      color="primary"
    />
  )
})

export { Venues }
