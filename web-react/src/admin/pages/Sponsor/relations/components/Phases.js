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
  query getSponsor($sponsorId: ID) {
    sponsor: Sponsor(sponsorId: $sponsorId) {
      _id
      sponsorId
      name
      phases {
        phaseId
        name
        nick
        status
        startDate {
          formatted
        }
        endDate {
          formatted
        }
        competition {
          name
        }
      }
    }
  }
`

const REMOVE_SPONSOR_PHASE = gql`
  mutation removeSponsorPhase($sponsorId: ID!, $phaseId: ID!) {
    sponsorPhase: RemoveSponsorPhases(
      from: { phaseId: $phaseId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        phaseId
        name
        nick
        status
        startDate {
          formatted
        }
        endDate {
          formatted
        }
        competition {
          name
        }
      }
    }
  }
`

export const GET_ALL_PHASES = gql`
  query getPhases {
    phases: Phase {
      phaseId
      name
      nick
      status
      startDate {
        formatted
      }
      endDate {
        formatted
      }
      competition {
        name
      }
    }
  }
`

const MERGE_SPONSOR_PHASE = gql`
  mutation mergeSponsorPhase($sponsorId: ID!, $phaseId: ID!) {
    sponsorPhase: MergeSponsorPhases(
      from: { phaseId: $phaseId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        phaseId
        name
        nick
        status
        startDate {
          formatted
        }
        endDate {
          formatted
        }
        competition {
          name
        }
      }
    }
  }
`

const Phases = props => {
  const { sponsorId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddPhase, setOpenAddPhase] = useState(false)

  const handleCloseAddPhase = useCallback(() => {
    setOpenAddPhase(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_PHASES, {
    fetchPolicy: 'cache-and-network',
  })

  const sponsor = queryData && queryData.sponsor && queryData.sponsor[0]

  const [
    getAllPhases,
    {
      loading: queryAllPhasesLoading,
      error: queryAllPhasesError,
      data: queryAllPhasesData,
    },
  ] = useLazyQuery(GET_ALL_PHASES, {
    fetchPolicy: 'cache-and-network',
  })

  const [removeSponsorPhase, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_SPONSOR_PHASE,
    {
      update(cache, { data: { sponsorPhase } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_PHASES,
            variables: {
              sponsorId,
            },
          })
          const updatedPhases = queryResult.sponsor[0].phases.filter(
            p => p.phaseId !== sponsorPhase.from.phaseId
          )

          const updatedResult = {
            sponsor: [
              {
                ...queryResult.sponsor[0],
                phases: updatedPhases,
              },
            ],
          }
          cache.writeQuery({
            query: GET_PHASES,
            data: updatedResult,
            variables: {
              sponsorId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data.sponsorPhase.from.name} not sponsored by ${sponsor.name}!`,
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

  const [mergeSponsorPhase] = useMutation(MERGE_SPONSOR_PHASE, {
    update(cache, { data: { sponsorPhase } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_PHASES,
          variables: {
            sponsorId,
          },
        })
        const existingPhases = queryResult.sponsor[0].phases
        const newPhase = sponsorPhase.from
        const updatedResult = {
          sponsor: [
            {
              ...queryResult.sponsor[0],
              phases: [newPhase, ...existingPhases],
            },
          ],
        }
        cache.writeQuery({
          query: GET_PHASES,
          data: updatedResult,
          variables: {
            sponsorId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.sponsorPhase.from.name} sponsored by ${sponsor.name}!`,
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
      getData({ variables: { sponsorId } })
    }
  }, [])

  const handleOpenAddPhase = useCallback(() => {
    if (!queryAllPhasesData) {
      getAllPhases()
    }
    setOpenAddPhase(true)
  }, [])

  const sponsorPhasesColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'nick',
        headerName: 'Nick',
        width: 150,
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
        valueGetter: params => params.row.startDate.formatted,
        valueFormatter: params => formatDate(params.value),
      },
      {
        field: 'endDate',
        headerName: 'End Date',
        width: 180,
        valueGetter: params => params.row.endDate.formatted,
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
              text={'Detach'}
              textLoading={'Detaching...'}
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={
                'Do you really want to detach phase from the sponsor?'
              }
              dialogNick={'You can add him to sponsor later.'}
              dialogNegativeText={'No, keep phase'}
              dialogPositiveText={'Yes, detach phase'}
              onDialogClosePositive={() => {
                removeSponsorPhase({
                  variables: {
                    sponsorId,
                    phaseId: params.row.phaseId,
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
        width: 150,
      },
      {
        field: 'nick',
        headerName: 'Nick',
        width: 150,
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
        valueGetter: params => params.row.startDate.formatted,
        valueFormatter: params => formatDate(params.value),
      },
      {
        field: 'endDate',
        headerName: 'End Date',
        width: 180,
        valueGetter: params => params.row.endDate.formatted,
        valueFormatter: params => formatDate(params.value),
      },

      {
        field: 'phaseId',
        headerName: 'Sponsor',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewPhase
              phaseId={params.value}
              sponsorId={sponsorId}
              sponsor={sponsor}
              merge={mergeSponsorPhase}
              remove={removeSponsorPhase}
            />
          )
        },
      },
    ],
    [sponsor]
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
                  onClick={handleOpenAddPhase}
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
                columns={sponsorPhasesColumns}
                rows={setIdFromEntityId(sponsor.phases, 'phaseId')}
                loading={queryAllPhasesLoading}
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
        open={openAddPhase}
        onClose={handleCloseAddPhase}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-nick"
      >
        {queryAllPhasesLoading && !queryAllPhasesError && <Loader />}
        {queryAllPhasesError && !queryAllPhasesLoading && (
          <Error message={queryAllPhasesError.message} />
        )}
        {queryAllPhasesData && !queryAllPhasesLoading && !queryAllPhasesError && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add phase to ${
              sponsor && sponsor.name
            }`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600 }} className={classes.xGridDialog}>
                <XGrid
                  columns={allPhasesColumns}
                  rows={setIdFromEntityId(queryAllPhasesData.phases, 'phaseId')}
                  disableSelectionOnClick
                  loading={queryAllPhasesLoading}
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
              handleCloseAddPhase()
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
  const { phaseId, sponsorId, sponsor, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!sponsor.phases.find(p => p.phaseId === phaseId)
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
                    sponsorId,
                    phaseId,
                  },
                })
              : merge({
                  variables: {
                    sponsorId,
                    phaseId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="sponsorMember"
          color="primary"
        />
      }
      label={isMember ? 'Sponsored' : 'Not sponsored'}
    />
  )
}

ToggleNewPhase.propTypes = {
  phaseId: PropTypes.string,
  sponsorId: PropTypes.string,
  sponsor: PropTypes.object,
  removeSponsorPhase: PropTypes.func,
  mergeSponsorPhase: PropTypes.func,
}

Phases.propTypes = {
  sponsorId: PropTypes.string,
}

export { Phases }
