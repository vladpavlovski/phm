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
      nick
      status
      startDate
      endDate
      competition {
        name
      }
    }
  }
`

const Phases = props => {
  const { sponsorId, sponsor, updateSponsor } = props
  // const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddPhase, setOpenAddPhase] = React.useState(false)

  const handleCloseAddPhase = React.useCallback(() => {
    setOpenAddPhase(false)
  }, [])

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

  const handleOpenAddPhase = React.useCallback(() => {
    if (!queryAllPhasesData) {
      getAllPhases()
    }
    setOpenAddPhase(true)
  }, [])

  const sponsorPhasesColumns = React.useMemo(
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
        valueGetter: params => params.row.startDate,
        valueFormatter: params => formatDate(params.value),
      },
      {
        field: 'endDate',
        headerName: 'End Date',
        width: 180,
        valueGetter: params => params.row.endDate,
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
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={
                'Do you really want to detach phase from the sponsor?'
              }
              dialogNick={'You can add him to sponsor later.'}
              dialogNegativeText={'No, keep phase'}
              dialogPositiveText={'Yes, detach phase'}
              onDialogClosePositive={() => {
                updateSponsor({
                  variables: {
                    where: {
                      sponsorId,
                    },
                    update: {
                      phases: {
                        disconnect: {
                          where: {
                            node: {
                              phaseId: params.row.phaseId,
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
        valueGetter: params => params.row.startDate,
        valueFormatter: params => formatDate(params.value),
      },
      {
        field: 'endDate',
        headerName: 'End Date',
        width: 180,
        valueGetter: params => params.row.endDate,
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
              updateSponsor={updateSponsor}
            />
          )
        },
      },
    ],
    [sponsor]
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
  const { phaseId, sponsorId, sponsor, updateSponsor } = props
  const [isMember, setIsMember] = React.useState(
    !!sponsor.phases.find(p => p.phaseId === phaseId)
  )

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            isMember
              ? updateSponsor({
                  variables: {
                    where: {
                      sponsorId,
                    },
                    update: {
                      phases: {
                        disconnect: {
                          where: {
                            node: {
                              phaseId,
                            },
                          },
                        },
                      },
                    },
                  },
                })
              : updateSponsor({
                  variables: {
                    where: {
                      sponsorId,
                    },
                    update: {
                      phases: {
                        connect: {
                          where: {
                            node: { phaseId },
                          },
                        },
                      },
                    },
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
  updateSponsor: PropTypes.func,
}

Phases.propTypes = {
  sponsorId: PropTypes.string,
  updateSponsor: PropTypes.func,
  sponsor: PropTypes.object,
}

export { Phases }
