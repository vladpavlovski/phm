import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AccountBox from '@material-ui/icons/AccountBox'
import AddIcon from '@material-ui/icons/Add'

import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminSeasonRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_SEASONS = gql`
  query getVenueSeasons($venueId: ID) {
    venue: Venue(venueId: $venueId) {
      venueId
      name
      seasons {
        seasonId
        name
      }
    }
  }
`

const REMOVE_VENUE_SEASON = gql`
  mutation removeVenueSeason($venueId: ID!, $seasonId: ID!) {
    venueSeason: RemoveVenueSeasons(
      from: { seasonId: $seasonId }
      to: { venueId: $venueId }
    ) {
      from {
        seasonId
        name
      }
      to {
        venueId
        name
      }
    }
  }
`

export const GET_ALL_SEASONS = gql`
  query getSeasons {
    seasons: Season {
      seasonId
      name
    }
  }
`

const MERGE_VENUE_SEASON = gql`
  mutation mergeVenueSeasons($venueId: ID!, $seasonId: ID!) {
    venueSeason: MergeVenueSeasons(
      from: { seasonId: $seasonId }
      to: { venueId: $venueId }
    ) {
      from {
        seasonId
        name
      }
      to {
        venueId
        name
      }
    }
  }
`

const Seasons = props => {
  const { venueId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddVenue, setOpenAddVenue] = useState(false)

  const handleCloseAddVenue = useCallback(() => {
    setOpenAddVenue(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_SEASONS, {
    fetchPolicy: 'cache-and-network',
  })

  const venue = queryData?.venue?.[0]

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

  const [removeSeasonVenue, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_VENUE_SEASON,
    {
      update(cache, { data: { venueSeason } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_SEASONS,
            variables: {
              venueId,
            },
          })
          const updatedData = queryResult?.venue?.[0]?.seasons.filter(
            p => p.seasonId !== venueSeason.from.seasonId
          )

          const updatedResult = {
            venue: [
              {
                ...queryResult?.venue?.[0],
                seasons: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_SEASONS,
            data: updatedResult,
            variables: {
              venueId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data.venueSeason.from.name} not takes plays on ${venue.name}!`,
          {
            variant: 'info',
          }
        )
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  const [mergeSeasonVenue] = useMutation(MERGE_VENUE_SEASON, {
    update(cache, { data: { venueSeason } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_SEASONS,
          variables: {
            venueId,
          },
        })
        const existingData = queryResult?.venue?.[0]?.seasons
        const newItem = venueSeason.from
        const updatedResult = {
          venue: [
            {
              ...queryResult?.venue?.[0],
              seasons: [newItem, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_SEASONS,
          data: updatedResult,
          variables: {
            venueId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.venueSeason.from.name} takes plays on ${venue.name}!`,
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

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { venueId } })
    }
  }, [])

  const handleOpenAddVenue = useCallback(() => {
    if (!queryAllVenuesData) {
      getAllVenues()
    }
    setOpenAddVenue(true)
  }, [])

  const venueSeasonsColumns = useMemo(
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
              to={getAdminSeasonRoute(params.value)}
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
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={'Do you really want to detach season from venue?'}
              dialogDescription={
                'Season will remain in the database. You can add him to any venue later.'
              }
              dialogNegativeText={'No, keep season'}
              dialogPositiveText={'Yes, detach season'}
              onDialogClosePositive={() => {
                removeSeasonVenue({
                  variables: {
                    venueId,
                    seasonId: params.row.seasonId,
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

  const allSeasonsColumns = useMemo(
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
              merge={mergeSeasonVenue}
              remove={removeSeasonVenue}
            />
          )
        },
      },
    ],
    [venue]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="seasons-content"
        id="seasons-header"
      >
        <Typography className={classes.accordionFormTitle}>Seasons</Typography>
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
                  Add Season
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={venueSeasonsColumns}
                rows={setIdFromEntityId(venue.seasons, 'seasonId')}
                loading={queryAllVenuesLoading}
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
            <DialogTitle id="alert-dialog-title">{`Add ${venue?.name} to new season`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600 }} className={classes.xGridDialog}>
                <XGrid
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

const ToggleNewSeason = props => {
  const { venueId, seasonId, venue, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!venue.seasons.find(p => p.seasonId === seasonId)
  )

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            isMember
              ? remove({
                  variables: {
                    venueId,
                    seasonId,
                  },
                })
              : merge({
                  variables: {
                    venueId,
                    seasonId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="seasonMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not Member'}
    />
  )
}

ToggleNewSeason.propTypes = {
  venueId: PropTypes.string,
  seasonId: PropTypes.string,
  season: PropTypes.object,
  removeSeasonVenue: PropTypes.func,
  mergeSeasonVenue: PropTypes.func,
  loading: PropTypes.bool,
}

Seasons.propTypes = {
  venueId: PropTypes.string,
}

export { Seasons }
