import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AddIcon from '@material-ui/icons/Add'

import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import AccountBox from '@material-ui/icons/AccountBox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminVenueRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_VENUES = gql`
  query getVenues($seasonId: ID) {
    season: Season(seasonId: $seasonId) {
      seasonId
      name
      venues {
        venueId
        name
        nick
        capacity
      }
    }
  }
`

const REMOVE_SEASON_VENUE = gql`
  mutation removeSeasonVenue($seasonId: ID!, $venueId: ID!) {
    seasonVenue: RemoveSeasonVenues(
      from: { seasonId: $seasonId }
      to: { venueId: $venueId }
    ) {
      from {
        seasonId
      }
      to {
        venueId
        name
      }
    }
  }
`

export const GET_ALL_VENUES = gql`
  query getVenues {
    venues: Venue {
      venueId
      name
      nick
      capacity
    }
  }
`

const MERGE_SEASON_VENUE = gql`
  mutation mergeSeasonVenue($seasonId: ID!, $venueId: ID!) {
    seasonVenue: MergeSeasonVenues(
      from: { seasonId: $seasonId }
      to: { venueId: $venueId }
    ) {
      from {
        seasonId
      }
      to {
        venueId
        name
        nick
        capacity
      }
    }
  }
`

const Venues = props => {
  const { seasonId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddVenue, setOpenAddVenue] = useState(false)

  const handleCloseAddVenue = useCallback(() => {
    setOpenAddVenue(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_VENUES)

  const [
    getAllVenues,
    {
      loading: queryAllVenuesLoading,
      error: queryAllVenuesError,
      data: queryAllVenuesData,
    },
  ] = useLazyQuery(GET_ALL_VENUES)

  const [mergeSeasonVenue] = useMutation(MERGE_SEASON_VENUE, {
    update(cache, { data: { seasonVenue } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_VENUES,
          variables: {
            seasonId,
          },
        })

        const existingVenues = queryResult.season[0].venues
        const newVenue = seasonVenue.to
        const updatedResult = {
          season: [
            {
              ...queryResult.season[0],
              venues: [newVenue, ...existingVenues],
            },
          ],
        }
        cache.writeQuery({
          query: GET_VENUES,
          data: updatedResult,
          variables: {
            seasonId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${season.name} add to ${data.seasonVenue.to.name} venue!`,
        {
          variant: 'success',
        }
      )
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const season = queryData && queryData.season && queryData.season[0]

  const [removeSeasonVenue, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_SEASON_VENUE,
    {
      update(cache, { data: { seasonVenue } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_VENUES,
            variables: {
              seasonId,
            },
          })

          const updatedVenues = queryResult.season[0].venues.filter(
            p => p.venueId !== seasonVenue.to.venueId
          )

          const updatedResult = {
            season: [
              {
                ...queryResult.season[0],
                venues: updatedVenues,
              },
            ],
          }
          cache.writeQuery({
            query: GET_VENUES,
            data: updatedResult,
            variables: {
              seasonId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${season.name} remove from ${data.seasonVenue.to.name} venue`,
          {
            variant: 'info',
          }
        )
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
      },
    }
  )

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { seasonId } })
    }
  }, [])

  const handleOpenAddVenue = useCallback(() => {
    if (!queryAllVenuesData) {
      getAllVenues()
    }
    setOpenAddVenue(true)
  }, [])

  const seasonVenuesColumns = useMemo(
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
              to={getAdminVenueRoute(params.value)}
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
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={'Do you really want to detach season from venue?'}
              dialogDescription={'You can add season to venue later.'}
              dialogNegativeText={'No, keep in venue'}
              dialogPositiveText={'Yes, detach venue'}
              onDialogClosePositive={() => {
                removeSeasonVenue({
                  variables: {
                    seasonId,
                    venueId: params.row.venueId,
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

  const allVenuesColumns = useMemo(
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
              merge={mergeSeasonVenue}
              remove={removeSeasonVenue}
            />
          )
        },
      },
    ],
    [season]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="venues-content"
        id="venues-header"
      >
        <Typography className={classes.accordionFormTitle}>Venues</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
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
              <XGrid
                columns={seasonVenuesColumns}
                rows={setIdFromEntityId(season.venues, 'venueId')}
                loading={queryLoading}
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </div>
          </>
        )}
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
                <XGrid
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
  const { venueId, seasonId, season, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!season.venues.find(p => p.venueId === venueId)
  )

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={isMember}
          onChange={() => {
            isMember
              ? remove({
                  variables: {
                    seasonId,
                    venueId,
                  },
                })
              : merge({
                  variables: {
                    seasonId,
                    venueId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="venueMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not member'}
    />
  )
}

ToggleNewVenue.propTypes = {
  playerId: PropTypes.string,
  seasonId: PropTypes.string,
  season: PropTypes.object,
  remove: PropTypes.func,
  merge: PropTypes.func,
}

Venues.propTypes = {
  seasonId: PropTypes.string,
}

export { Venues }
