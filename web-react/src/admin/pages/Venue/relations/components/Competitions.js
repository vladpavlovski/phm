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
import Checkbox from '@material-ui/core/Checkbox'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminCompetitionRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_COMPETITIONS = gql`
  query getVenueCompetitions($venueId: ID) {
    venue: Venue(venueId: $venueId) {
      venueId
      name
      competitions {
        competitionId
        name
      }
    }
  }
`

const REMOVE_VENUE_COMPETITION = gql`
  mutation removeVenueCompetition($venueId: ID!, $competitionId: ID!) {
    venueCompetition: RemoveVenueCompetitions(
      from: { competitionId: $competitionId }
      to: { venueId: $venueId }
    ) {
      from {
        competitionId
        name
      }
      to {
        venueId
        name
      }
    }
  }
`

export const GET_ALL_COMPETITIONS = gql`
  query getCompetitions {
    competitions: Competition {
      competitionId
      name
    }
  }
`

const MERGE_VENUE_COMPETITION = gql`
  mutation mergeVenueCompetitions($venueId: ID!, $competitionId: ID!) {
    venueCompetition: MergeVenueCompetitions(
      from: { competitionId: $competitionId }
      to: { venueId: $venueId }
    ) {
      from {
        competitionId
        name
      }
      to {
        venueId
        name
      }
    }
  }
`

const Competitions = props => {
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
  ] = useLazyQuery(GET_COMPETITIONS, {
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
  ] = useLazyQuery(GET_ALL_COMPETITIONS, {
    fetchPolicy: 'cache-and-network',
  })

  const [
    removeCompetitionVenue,
    { loading: mutationLoadingRemove },
  ] = useMutation(REMOVE_VENUE_COMPETITION, {
    update(cache, { data: { venueCompetition } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_COMPETITIONS,
          variables: {
            venueId,
          },
        })
        const updatedData = queryResult?.venue?.[0]?.competitions.filter(
          p => p.competitionId !== venueCompetition.from.competitionId
        )

        const updatedResult = {
          venue: [
            {
              ...queryResult?.venue?.[0],
              competitions: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_COMPETITIONS,
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
        `${data.venueCompetition.from.name} not takes plays on ${venue.name}!`,
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
  })

  const [mergeCompetitionVenue] = useMutation(MERGE_VENUE_COMPETITION, {
    update(cache, { data: { venueCompetition } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_COMPETITIONS,
          variables: {
            venueId,
          },
        })
        const existingData = queryResult?.venue?.[0]?.competitions
        const newItem = venueCompetition.from
        const updatedResult = {
          venue: [
            {
              ...queryResult?.venue?.[0],
              competitions: [newItem, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_COMPETITIONS,
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
        `${data.venueCompetition.from.name} takes plays on ${venue.name}!`,
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

  const venueCompetitionsColumns = useMemo(
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
              to={getAdminCompetitionRoute(params.value)}
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
              dialogTitle={
                'Do you really want to detach competition from venue?'
              }
              dialogDescription={
                'Competition will remain in the database. You can add him to any venue later.'
              }
              dialogNegativeText={'No, keep competition'}
              dialogPositiveText={'Yes, detach competition'}
              onDialogClosePositive={() => {
                removeCompetitionVenue({
                  variables: {
                    venueId,
                    competitionId: params.row.competitionId,
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

  const allCompetitionsColumns = useMemo(
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
              merge={mergeCompetitionVenue}
              remove={removeCompetitionVenue}
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
        aria-controls="competitions-content"
        id="competitions-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Competitions
        </Typography>
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
                  Add Competition
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={venueCompetitionsColumns}
                rows={setIdFromEntityId(venue.competitions, 'competitionId')}
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
            <DialogTitle id="alert-dialog-title">{`Add ${venue?.name} to new competition`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600 }} className={classes.xGridDialog}>
                <XGrid
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

const ToggleNewCompetition = props => {
  const { venueId, competitionId, venue, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!venue.competitions.find(p => p.competitionId === competitionId)
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
                    venueId,
                    competitionId,
                  },
                })
              : merge({
                  variables: {
                    venueId,
                    competitionId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="competitionMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not Member'}
    />
  )
}

ToggleNewCompetition.propTypes = {
  venueId: PropTypes.string,
  competitionId: PropTypes.string,
  competition: PropTypes.object,
  removeCompetitionVenue: PropTypes.func,
  mergeCompetitionVenue: PropTypes.func,
  loading: PropTypes.bool,
}

Competitions.propTypes = {
  venueId: PropTypes.string,
}

export { Competitions }
