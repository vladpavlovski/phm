import React from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'

import Toolbar from '@mui/material/Toolbar'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import AccountBox from '@mui/icons-material/AccountBox'

import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminOrgVenueRoute } from '../../../../../router/routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

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

const Venues = props => {
  const { seasonId, season, updateSeason } = props

  const classes = useStyles()
  const { organizationSlug } = useParams()
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

  const seasonVenuesColumns = React.useMemo(
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
              size="small"
              startIcon={<LinkOffIcon />}
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

  const allVenuesColumns = React.useMemo(
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
        <Typography className={classes.accordionFormTitle}>Venues</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Toolbar disableGutters className={classes.toolbarForm}>
          <div />
          <div>
            <Button
              onClick={handleOpenAddVenue}
              variant={'outlined'}
              size="small"
              className={classes.submit}
              startIcon={<AddIcon />}
            >
              Add Venue
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600 }} className={classes.xGridDialog}>
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
        {queryAllVenuesLoading && !queryAllVenuesError && <Loader />}
        {queryAllVenuesError && !queryAllVenuesLoading && (
          <Error message={queryAllVenuesError.message} />
        )}
        {queryAllVenuesData && !queryAllVenuesLoading && !queryAllVenuesError && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add ${
              season && season.name
            } to new venue`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600 }} className={classes.xGridDialog}>
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

const ToggleNewVenue = props => {
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
      label={isMember ? 'Member' : 'Not member'}
    />
  )
}

ToggleNewVenue.propTypes = {
  playerId: PropTypes.string,
  seasonId: PropTypes.string,
  season: PropTypes.object,
  updateSeason: PropTypes.func,
}

Venues.propTypes = {
  seasonId: PropTypes.string,
  updateSeason: PropTypes.func,
  season: PropTypes.object,
}

export { Venues }
