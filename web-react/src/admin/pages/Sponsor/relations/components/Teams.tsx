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
import { getAdminOrgTeamRoute } from '../../../../../router/routes'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

export const GET_ALL_TEAMS = gql`
  query getTeams {
    teams {
      teamId
      name
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

const Teams: React.FC<TRelations> = props => {
  const { sponsorId, sponsor, updateSponsor } = props

  const [openAddSponsor, setOpenAddSponsor] = React.useState(false)
  const { organizationSlug } = useParams<TParams>()
  const handleCloseAddSponsor = React.useCallback(() => {
    setOpenAddSponsor(false)
  }, [])

  const [
    getAllTeams,
    {
      loading: queryAllSponsorsLoading,
      error: queryAllSponsorsError,
      data: queryAllSponsorsData,
    },
  ] = useLazyQuery(GET_ALL_TEAMS, {
    fetchPolicy: 'cache-and-network',
  })

  const handleOpenAddSponsor = React.useCallback(() => {
    if (!queryAllSponsorsData) {
      getAllTeams()
    }
    setOpenAddSponsor(true)
  }, [])

  const sponsorTeamsColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'teamId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgTeamRoute(organizationSlug, params.value)}
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
              dialogTitle={'Do you really want to detach team from sponsor?'}
              dialogDescription={'You can add it to sponsor later.'}
              dialogNegativeText={'No, keep team'}
              dialogPositiveText={'Yes, detach team'}
              onDialogClosePositive={() => {
                updateSponsor({
                  variables: {
                    where: {
                      sponsorId,
                    },
                    update: {
                      teams: {
                        disconnect: {
                          where: {
                            node: {
                              teamId: params.row.teamId,
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

  const allTeamsColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 300,
      },

      {
        field: 'teamId',
        headerName: 'Membership',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewTeam
              teamId={params.value}
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
        aria-controls="teams-content"
        id="teams-header"
      >
        <Typography>Teams</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Toolbar
          disableGutters
          sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
        >
          <div />
          <div>
            <Button
              onClick={handleOpenAddSponsor}
              variant={'outlined'}
              size="small"
              startIcon={<AddIcon />}
            >
              Add Team
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
            columns={sponsorTeamsColumns}
            rows={setIdFromEntityId(sponsor.teams, 'teamId')}
            loading={queryAllSponsorsLoading}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddSponsor}
        onClose={handleCloseAddSponsor}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllSponsorsLoading && <Loader />}

        <Error message={queryAllSponsorsError?.message} />

        {queryAllSponsorsData && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add ${sponsor?.name} to team`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600, width: '100%' }}>
                <DataGridPro
                  columns={allTeamsColumns}
                  rows={setIdFromEntityId(queryAllSponsorsData.teams, 'teamId')}
                  disableSelectionOnClick
                  loading={queryAllSponsorsLoading}
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
              handleCloseAddSponsor()
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
  teamId: string
  sponsorId: string
  sponsor: Sponsor
  updateSponsor: MutationFunction
}

const ToggleNewTeam: React.FC<TToggleNew> = props => {
  const { sponsorId, teamId, sponsor, updateSponsor } = props
  const [isMember, setIsMember] = React.useState(
    !!sponsor.teams.find(p => p.teamId === teamId)
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
                  teams: {
                    disconnect: {
                      where: {
                        node: {
                          teamId,
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
                  teams: {
                    connect: {
                      where: {
                        node: { teamId },
                      },
                    },
                  },
                },
              },
            })
        setIsMember(!isMember)
      }}
      name="teamMember"
      color="primary"
    />
  )
}

export { Teams }
