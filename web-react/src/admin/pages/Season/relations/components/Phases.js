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
  query getSeasonPhases($seasonId: ID) {
    season: Season(seasonId: $seasonId) {
      seasonId
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

const REMOVE_SEASON_PHASE = gql`
  mutation removeSeasonPhase($seasonId: ID!, $phaseId: ID!) {
    seasonPhase: RemoveSeasonPhases(
      from: { phaseId: $phaseId }
      to: { seasonId: $seasonId }
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
        seasonId
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

const MERGE_SEASON_PHASE = gql`
  mutation mergeSeasonPhases($seasonId: ID!, $phaseId: ID!) {
    seasonPhase: MergeSeasonPhases(
      from: { phaseId: $phaseId }
      to: { seasonId: $seasonId }
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
        seasonId
        name
      }
    }
  }
`

const Phases = props => {
  const { seasonId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddSeason, setOpenAddSeason] = useState(false)

  const handleCloseAddSeason = useCallback(() => {
    setOpenAddSeason(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_PHASES, {
    fetchPolicy: 'cache-and-network',
  })

  const season = queryData?.season?.[0]

  const [
    getAllSeasons,
    {
      loading: queryAllSeasonsLoading,
      error: queryAllSeasonsError,
      data: queryAllSeasonsData,
    },
  ] = useLazyQuery(GET_ALL_PHASES, {
    fetchPolicy: 'cache-and-network',
  })

  const [removePhaseSeason, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_SEASON_PHASE,
    {
      update(cache, { data: { seasonPhase } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_PHASES,
            variables: {
              seasonId,
            },
          })
          const updatedData = queryResult?.season?.[0]?.phases.filter(
            p => p.phaseId !== seasonPhase.from.phaseId
          )

          const updatedResult = {
            season: [
              {
                ...queryResult?.season?.[0],
                phases: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_PHASES,
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
          `${data.seasonPhase.from.name} not owned by ${season.name}!`,
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

  const [mergePhaseSeason] = useMutation(MERGE_SEASON_PHASE, {
    update(cache, { data: { seasonPhase } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_PHASES,
          variables: {
            seasonId,
          },
        })
        const existingData = queryResult?.season?.[0]?.phases
        const newItem = seasonPhase.from
        const updatedResult = {
          season: [
            {
              ...queryResult?.season?.[0],
              phases: [newItem, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_PHASES,
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
        `${data.seasonPhase.from.name} owned by ${season.name}!`,
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
      getData({ variables: { seasonId } })
    }
  }, [])

  const handleOpenAddSeason = useCallback(() => {
    if (!queryAllSeasonsData) {
      getAllSeasons()
    }
    setOpenAddSeason(true)
  }, [])

  const seasonPhasesColumns = useMemo(
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
              dialogTitle={'Do you really want to detach phase from season?'}
              dialogDescription={
                'Phase will remain in the database. You can add him to any season later.'
              }
              dialogNegativeText={'No, keep phase'}
              dialogPositiveText={'Yes, detach phase'}
              onDialogClosePositive={() => {
                removePhaseSeason({
                  variables: {
                    seasonId,
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
              seasonId={seasonId}
              season={season}
              merge={mergePhaseSeason}
              remove={removePhaseSeason}
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
                  onClick={handleOpenAddSeason}
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
                columns={seasonPhasesColumns}
                rows={setIdFromEntityId(season.phases, 'phaseId')}
                loading={queryAllSeasonsLoading}
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
        open={openAddSeason}
        onClose={handleCloseAddSeason}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllSeasonsLoading && !queryAllSeasonsError && <Loader />}
        {queryAllSeasonsError && !queryAllSeasonsLoading && (
          <Error message={queryAllSeasonsError.message} />
        )}
        {queryAllSeasonsData &&
          !queryAllSeasonsLoading &&
          !queryAllSeasonsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add ${season?.name} to new phase`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allPhasesColumns}
                    rows={setIdFromEntityId(
                      queryAllSeasonsData.phases,
                      'phaseId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllSeasonsLoading}
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
              handleCloseAddSeason()
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
  const { seasonId, phaseId, season, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!season.phases.find(p => p.phaseId === phaseId)
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
                    seasonId,
                    phaseId,
                  },
                })
              : merge({
                  variables: {
                    seasonId,
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
  seasonId: PropTypes.string,
  phaseId: PropTypes.string,
  phase: PropTypes.object,
  removePhaseSeason: PropTypes.func,
  mergePhaseSeason: PropTypes.func,
  loading: PropTypes.bool,
}

Phases.propTypes = {
  seasonId: PropTypes.string,
}

export { Phases }
