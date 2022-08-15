import React from 'react'
import { formatDate, setIdFromEntityId } from 'utils'
import { Sponsor } from 'utils/types'
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
import { Error } from '../../../../../components/Error'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { getAdminPhaseRoute } from '../../../../../router/routes'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

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

type TRelations = {
  sponsorId: string
  sponsor: Sponsor
  updateSponsor: MutationFunction
}

const Phases: React.FC<TRelations> = props => {
  const { sponsorId, sponsor, updateSponsor } = props
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

  const sponsorPhasesColumns = React.useMemo<GridColumns>(
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
              dialogTitle={
                'Do you really want to detach phase from the sponsor?'
              }
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

  const allPhasesColumns = React.useMemo<GridColumns>(
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
        <Typography>Phases</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Toolbar
          disableGutters
          sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
        >
          <div />
          <div>
            <Button
              onClick={handleOpenAddPhase}
              variant={'outlined'}
              size="small"
              startIcon={<AddIcon />}
            >
              Add Phase
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
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
        {queryAllPhasesLoading && <Loader />}
        <Error message={queryAllPhasesError?.message} />
        {queryAllPhasesData && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add phase to ${
              sponsor && sponsor.name
            }`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600, width: '100%' }}>
                <DataGridPro
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
type TToggleNew = {
  phaseId: string
  sponsorId: string
  sponsor: Sponsor
  updateSponsor: MutationFunction
}
const ToggleNewPhase: React.FC<TToggleNew> = React.memo(props => {
  const { phaseId, sponsorId, sponsor, updateSponsor } = props
  const [isMember, setIsMember] = React.useState(
    !!sponsor.phases.find(p => p.phaseId === phaseId)
  )

  return (
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
  )
})

export { Phases }
