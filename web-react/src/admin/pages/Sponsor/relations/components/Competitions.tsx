import React from 'react'
import { useParams } from 'react-router-dom'
import { setIdFromEntityId } from 'utils'
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
import { getAdminOrgCompetitionRoute } from '../../../../../router/routes'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

export const GET_ALL_COMPETITIONS = gql`
  query getCompetitions {
    competitions {
      competitionId
      name
      nick
    }
  }
`
type TRelations = {
  sponsorId: string
  sponsor: Sponsor
  updateSponsor: MutationFunction
}

type TParams = {
  organizationSlug: string
}

const Competitions: React.FC<TRelations> = props => {
  const { sponsorId, sponsor, updateSponsor } = props

  const { organizationSlug } = useParams<TParams>()
  const [openAddCompetition, setOpenAddCompetition] = React.useState(false)

  const handleCloseAddCompetition = React.useCallback(() => {
    setOpenAddCompetition(false)
  }, [])

  const [
    getAllCompetitions,
    {
      loading: queryAllCompetitionsLoading,
      error: queryAllCompetitionsError,
      data: queryAllCompetitionsData,
    },
  ] = useLazyQuery(GET_ALL_COMPETITIONS)

  const handleOpenAddCompetition = React.useCallback(() => {
    if (!queryAllCompetitionsData) {
      getAllCompetitions()
    }
    setOpenAddCompetition(true)
  }, [])

  const sponsorCompetitionsColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'nick',
        headerName: 'Nick',
        width: 300,
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
              to={getAdminOrgCompetitionRoute(organizationSlug, params.value)}
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
                'Do you really want to detach competition from the sponsor?'
              }
              dialogNegativeText={'No, keep competition'}
              dialogPositiveText={'Yes, detach competition'}
              onDialogClosePositive={() => {
                updateSponsor({
                  variables: {
                    where: {
                      sponsorId,
                    },
                    update: {
                      competitions: {
                        disconnect: {
                          where: {
                            node: {
                              competitionId: params.row.competitionId,
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

  const allCompetitionsColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'nick',
        headerName: 'Nick',
        width: 300,
      },

      {
        field: 'competitionId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewCompetition
              competitionId={params.value}
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
        aria-controls="competitions-content"
        id="competitions-header"
      >
        <Typography>Competitions</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Toolbar
          disableGutters
          sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
        >
          <div />
          <div>
            <Button
              onClick={handleOpenAddCompetition}
              variant={'outlined'}
              size="small"
              startIcon={<AddIcon />}
            >
              Add Competition
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
            columns={sponsorCompetitionsColumns}
            rows={setIdFromEntityId(sponsor.competitions, 'competitionId')}
            loading={queryAllCompetitionsLoading}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddCompetition}
        onClose={handleCloseAddCompetition}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-nick"
      >
        {queryAllCompetitionsLoading && !queryAllCompetitionsError && (
          <Loader />
        )}
        {queryAllCompetitionsError && !queryAllCompetitionsLoading && (
          <Error message={queryAllCompetitionsError.message} />
        )}
        {queryAllCompetitionsData &&
          !queryAllCompetitionsLoading &&
          !queryAllCompetitionsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add competition to ${
                sponsor && sponsor.name
              }`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600, width: '100%' }}>
                  <DataGridPro
                    columns={allCompetitionsColumns}
                    rows={setIdFromEntityId(
                      queryAllCompetitionsData.competitions,
                      'competitionId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllCompetitionsLoading}
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
              handleCloseAddCompetition()
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
  competitionId: string
  sponsorId: string
  sponsor: Sponsor
  updateSponsor: MutationFunction
}

const ToggleNewCompetition: React.FC<TToggleNew> = React.memo(props => {
  const { competitionId, sponsorId, sponsor, updateSponsor } = props
  const [isMember, setIsMember] = React.useState(
    !!sponsor.competitions.find(p => p.competitionId === competitionId)
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
                  competitions: {
                    disconnect: {
                      where: {
                        node: {
                          competitionId,
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
                  competitions: {
                    connect: {
                      where: {
                        node: { competitionId },
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

export { Competitions }
