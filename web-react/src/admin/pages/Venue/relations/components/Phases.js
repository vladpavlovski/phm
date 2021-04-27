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
import { getAdminPhaseRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId, formatDate } from '../../../../../utils'

const GET_PHASES = gql`
  query getVenuePhases($venueId: ID) {
    venue: Venue(venueId: $venueId) {
      venueId
      name
      phases {
        phaseId
        name
        status
        startDate {
          formatted
        }
        endDate {
          formatted
        }
        competition {
          competitionId
          name
        }
      }
    }
  }
`

const REMOVE_VENUE_PHASE = gql`
  mutation removeVenuePhase($venueId: ID!, $phaseId: ID!) {
    venuePhase: RemoveVenuePhases(
      from: { phaseId: $phaseId }
      to: { venueId: $venueId }
    ) {
      from {
        phaseId
        name
        status
        startDate {
          formatted
        }
        endDate {
          formatted
        }
        competition {
          competitionId
          name
        }
      }
      to {
        venueId
        name
      }
    }
  }
`

export const GET_ALL_PHASES = gql`
  query getPhases {
    phases: Phase {
      phaseId
      name
      status
      startDate {
        formatted
      }
      endDate {
        formatted
      }
      competition {
        competitionId
        name
      }
    }
  }
`

const MERGE_VENUE_PHASE = gql`
  mutation mergeVenuePhases($venueId: ID!, $phaseId: ID!) {
    venuePhase: MergeVenuePhases(
      from: { phaseId: $phaseId }
      to: { venueId: $venueId }
    ) {
      from {
        phaseId
        name
        status
        startDate {
          formatted
        }
        endDate {
          formatted
        }
        competition {
          competitionId
          name
        }
      }
      to {
        venueId
        name
      }
    }
  }
`

const Phases = props => {
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
  ] = useLazyQuery(GET_PHASES, {
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
  ] = useLazyQuery(GET_ALL_PHASES, {
    fetchPolicy: 'cache-and-network',
  })

  const [removePhaseVenue, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_VENUE_PHASE,
    {
      update(cache, { data: { venuePhase } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_PHASES,
            variables: {
              venueId,
            },
          })
          const updatedData = queryResult?.venue?.[0]?.phases.filter(
            p => p.phaseId !== venuePhase.from.phaseId
          )

          const updatedResult = {
            venue: [
              {
                ...queryResult?.venue?.[0],
                phases: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_PHASES,
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
          `${data.venuePhase.from.name} not takes plays on ${venue.name}!`,
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

  const [mergePhaseVenue] = useMutation(MERGE_VENUE_PHASE, {
    update(cache, { data: { venuePhase } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_PHASES,
          variables: {
            venueId,
          },
        })
        const existingData = queryResult?.venue?.[0]?.phases
        const newItem = venuePhase.from
        const updatedResult = {
          venue: [
            {
              ...queryResult?.venue?.[0],
              phases: [newItem, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_PHASES,
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
        `${data.venuePhase.from.name} takes plays on ${venue.name}!`,
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

  const venuePhasesColumns = useMemo(
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
        valueGetter: params => params?.row?.startDate?.formatted,
        valueFormatter: params => formatDate(params.value),
      },
      {
        field: 'endDate',
        headerName: 'End Date',
        width: 180,
        valueGetter: params => params?.row?.endDate?.formatted,
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
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={'Do you really want to detach phase from venue?'}
              dialogDescription={
                'Phase will remain in the database. You can add him to any venue later.'
              }
              dialogNegativeText={'No, keep phase'}
              dialogPositiveText={'Yes, detach phase'}
              onDialogClosePositive={() => {
                removePhaseVenue({
                  variables: {
                    venueId,
                    phaseId: params.row?.phaseId,
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

  const allPhasesColumns = useMemo(
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
        valueGetter: params => params?.row?.startDate?.formatted,
        valueFormatter: params => formatDate(params.value),
      },
      {
        field: 'endDate',
        headerName: 'End Date',
        width: 180,
        valueGetter: params => params?.row?.endDate?.formatted,
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
              merge={mergePhaseVenue}
              remove={removePhaseVenue}
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
        aria-controls="phases-content"
        id="phases-header"
      >
        <Typography className={classes.accordionFormTitle}>Phases</Typography>
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
                  Add Phase
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={venuePhasesColumns}
                rows={setIdFromEntityId(venue.phases, 'phaseId')}
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
            <DialogTitle id="alert-dialog-title">{`Add ${venue?.name} to new phase`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600 }} className={classes.xGridDialog}>
                <XGrid
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

const ToggleNewPhase = props => {
  const { venueId, phaseId, venue, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!venue.phases.find(p => p.phaseId === phaseId)
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
                    phaseId,
                  },
                })
              : merge({
                  variables: {
                    venueId,
                    phaseId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="phaseMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not Member'}
    />
  )
}

ToggleNewPhase.propTypes = {
  venueId: PropTypes.string,
  phaseId: PropTypes.string,
  phase: PropTypes.object,
  removePhaseVenue: PropTypes.func,
  mergePhaseVenue: PropTypes.func,
  loading: PropTypes.bool,
}

Phases.propTypes = {
  venueId: PropTypes.string,
}

export { Phases }
