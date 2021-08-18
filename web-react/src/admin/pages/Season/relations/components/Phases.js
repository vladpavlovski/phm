import React from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import PropTypes from 'prop-types'

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

export const GET_ALL_PHASES = gql`
  query getPhases {
    phases {
      phaseId
      name
      status
      startDate
      endDate
      competition {
        competitionId
        name
      }
    }
  }
`

const Phases = props => {
  const { seasonId, season, updateSeason } = props

  const classes = useStyles()
  const [openAddSeason, setOpenAddSeason] = React.useState(false)

  const handleCloseAddSeason = React.useCallback(() => {
    setOpenAddSeason(false)
  }, [])

  const [
    getAllSeasons,
    {
      loading: queryAllSeasonsLoading,
      error: queryAllSeasonsError,
      data: queryAllSeasonsData,
    },
  ] = useLazyQuery(GET_ALL_PHASES)

  const handleOpenAddSeason = React.useCallback(() => {
    if (!queryAllSeasonsData) {
      getAllSeasons()
    }
    setOpenAddSeason(true)
  }, [])

  const seasonPhasesColumns = React.useMemo(
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
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={'Do you really want to detach phase from season?'}
              dialogDescription={
                'Phase will remain in the database. You can add him to any season later.'
              }
              dialogNegativeText={'No, keep phase'}
              dialogPositiveText={'Yes, detach phase'}
              onDialogClosePositive={() => {
                updateSeason({
                  variables: {
                    where: {
                      seasonId,
                    },
                    update: {
                      phases: {
                        disconnect: {
                          where: {
                            node: {
                              phaseId: params.row?.phaseId,
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

  const allPhasesColumns = React.useMemo(
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
        valueGetter: params => params?.row?.startDate,
        valueFormatter: params => formatDate(params.value),
      },
      {
        field: 'endDate',
        headerName: 'End Date',
        width: 180,
        valueGetter: params => params?.row?.endDate,
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
        aria-controls="phases-content"
        id="phases-header"
      >
        <Typography className={classes.accordionFormTitle}>Phases</Typography>
      </AccordionSummary>
      <AccordionDetails>
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
  const { seasonId, phaseId, season, updateSeason } = props
  const [isMember, setIsMember] = React.useState(
    !!season.phases.find(p => p.phaseId === phaseId)
  )

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            updateSeason({
              variables: {
                where: {
                  seasonId,
                },
                update: {
                  phases: {
                    ...(isMember
                      ? {
                          disconnect: {
                            where: {
                              node: {
                                phaseId,
                              },
                            },
                          },
                        }
                      : {
                          connect: {
                            where: {
                              node: { phaseId },
                            },
                          },
                        }),
                  },
                },
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
  updateSeason: PropTypes.func,
  loading: PropTypes.bool,
}

Phases.propTypes = {
  seasonId: PropTypes.string,
  updateSeason: PropTypes.func,
  season: PropTypes.object,
}

export { Phases }
