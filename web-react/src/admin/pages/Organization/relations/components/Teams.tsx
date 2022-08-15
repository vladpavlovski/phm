import { Error, LinkButton, Loader } from 'components'
import React, { useCallback, useMemo, useState } from 'react'
import { getAdminOrgTeamRoute } from 'router/routes'
import { setIdFromEntityId } from 'utils'
import { Organization } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import AccountBox from '@mui/icons-material/AccountBox'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LinkOffIcon from '@mui/icons-material/LinkOff'
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
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

export const GET_ALL_TEAMS = gql`
  query getTeams {
    teams {
      teamId
      name
    }
  }
`
type TTeams = {
  organizationId: string
  organization: Organization
  updateOrganization: MutationFunction
}

const Teams: React.FC<TTeams> = props => {
  const { organizationId, organization, updateOrganization } = props

  const [openAddOrganization, setOpenAddOrganization] = useState(false)

  const handleCloseAddOrganization = useCallback(() => {
    setOpenAddOrganization(false)
  }, [])

  const [
    getAllOrganizations,
    {
      loading: queryAllOrganizationsLoading,
      error: queryAllOrganizationsError,
      data: queryAllOrganizationsData,
    },
  ] = useLazyQuery(GET_ALL_TEAMS)

  const handleOpenAddOrganization = useCallback(() => {
    if (!queryAllOrganizationsData) {
      getAllOrganizations()
    }
    setOpenAddOrganization(true)
  }, [])

  const organizationTeamsColumns = useMemo<GridColumns>(
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
              to={getAdminOrgTeamRoute(organization?.urlSlug, params.value)}
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
              dialogTitle={
                'Do you really want to detach team from organization?'
              }
              dialogDescription={
                'Team will remain in the database. You can add him to any organization later.'
              }
              dialogNegativeText={'No, keep team'}
              dialogPositiveText={'Yes, detach team'}
              onDialogClosePositive={() => {
                updateOrganization({
                  variables: {
                    where: {
                      organizationId,
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
    [organization, updateOrganization]
  )

  const allTeamsColumns = useMemo<GridColumns>(
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
          return <ToggleNewTeam teamId={params.value} {...props} />
        },
      },
    ],
    [props]
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
              onClick={handleOpenAddOrganization}
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
            columns={organizationTeamsColumns}
            rows={setIdFromEntityId(organization?.teams, 'teamId')}
            loading={queryAllOrganizationsLoading}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddOrganization}
        onClose={handleCloseAddOrganization}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllOrganizationsLoading && !queryAllOrganizationsError && (
          <Loader />
        )}
        {queryAllOrganizationsError && !queryAllOrganizationsLoading && (
          <Error message={queryAllOrganizationsError.message} />
        )}
        {queryAllOrganizationsData &&
          !queryAllOrganizationsLoading &&
          !queryAllOrganizationsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add ${organization?.name} to new team`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600, width: '100%' }}>
                  <DataGridPro
                    columns={allTeamsColumns}
                    rows={setIdFromEntityId(
                      queryAllOrganizationsData.teams,
                      'teamId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllOrganizationsLoading}
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
              handleCloseAddOrganization()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

type TToggleNewTeam = {
  organization: Organization
  organizationId: string
  teamId: string
  updateOrganization: MutationFunction
}

const ToggleNewTeam: React.FC<TToggleNewTeam> = React.memo(props => {
  const { organizationId, teamId, organization, updateOrganization } = props
  const [isMember, setIsMember] = useState(
    !!organization.teams.find(p => p.teamId === teamId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updateOrganization({
          variables: {
            where: {
              organizationId,
            },
            update: {
              teams: {
                ...(!isMember
                  ? {
                      connect: {
                        where: {
                          node: {
                            teamId,
                          },
                        },
                      },
                    }
                  : {
                      disconnect: {
                        where: {
                          node: {
                            teamId,
                          },
                        },
                      },
                    }),
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
})

export { Teams }
