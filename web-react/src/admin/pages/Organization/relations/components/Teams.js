import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AccountBox from '@mui/icons-material/AccountBox'
import AddIcon from '@mui/icons-material/Add'

import Toolbar from '@mui/material/Toolbar'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'

import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminOrgTeamRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_TEAMS = gql`
  query getOrganizationTeams($organizationId: ID!) {
    organization: Organization(organizationId: $organizationId) {
      organizationId
      name
      urlSlug
      teams {
        teamId
        name
      }
    }
  }
`

const REMOVE_ORGANIZATION_TEAM = gql`
  mutation removeOrganizationTeam($organizationId: ID!, $teamId: ID!) {
    organizationTeam: RemoveOrganizationTeams(
      from: { teamId: $teamId }
      to: { organizationId: $organizationId }
    ) {
      from {
        teamId
        name
      }
      to {
        organizationId
        name
      }
    }
  }
`

export const GET_ALL_TEAMS = gql`
  query getTeams {
    teams: Team {
      teamId
      name
    }
  }
`

const MERGE_ORGANIZATION_TEAM = gql`
  mutation mergeOrganizationTeams($organizationId: ID!, $teamId: ID!) {
    organizationTeam: MergeOrganizationTeams(
      from: { teamId: $teamId }
      to: { organizationId: $organizationId }
    ) {
      from {
        teamId
        name
      }
      to {
        organizationId
        name
      }
    }
  }
`

const Teams = props => {
  const { organizationId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()

  const [openAddOrganization, setOpenAddOrganization] = useState(false)

  const handleCloseAddOrganization = useCallback(() => {
    setOpenAddOrganization(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_TEAMS, {
    fetchPolicy: 'cache-and-network',
  })

  const organization = queryData?.organization?.[0]

  const [
    getAllOrganizations,
    {
      loading: queryAllOrganizationsLoading,
      error: queryAllOrganizationsError,
      data: queryAllOrganizationsData,
    },
  ] = useLazyQuery(GET_ALL_TEAMS, {
    fetchPolicy: 'cache-and-network',
  })

  const [removeTeamOrganization, { loading: mutationLoadingRemove }] =
    useMutation(REMOVE_ORGANIZATION_TEAM, {
      update(cache, { data: { organizationTeam } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_TEAMS,
            variables: {
              organizationId,
            },
          })
          const updatedData = queryResult?.organization?.[0]?.teams.filter(
            p => p.teamId !== organizationTeam.from.teamId
          )

          const updatedResult = {
            organization: [
              {
                ...queryResult?.organization?.[0],
                teams: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_TEAMS,
            data: updatedResult,
            variables: {
              organizationId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data.organizationTeam.from.name} not participate in ${organization.name}!`,
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

  const [mergeTeamOrganization] = useMutation(MERGE_ORGANIZATION_TEAM, {
    update(cache, { data: { organizationTeam } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_TEAMS,
          variables: {
            organizationId,
          },
        })
        const existingData = queryResult?.organization?.[0]?.teams
        const newItem = organizationTeam.from
        const updatedResult = {
          organization: [
            {
              ...queryResult?.organization?.[0],
              teams: [newItem, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_TEAMS,
          data: updatedResult,
          variables: {
            organizationId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.organizationTeam.from.name} participate in ${organization.name}!`,
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
      getData({ variables: { organizationId } })
    }
  }, [])

  const handleOpenAddOrganization = useCallback(() => {
    if (!queryAllOrganizationsData) {
      getAllOrganizations()
    }
    setOpenAddOrganization(true)
  }, [])

  const organizationTeamsColumns = useMemo(
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
              loading={mutationLoadingRemove}
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
                removeTeamOrganization({
                  variables: {
                    organizationId,
                    teamId: params.row.teamId,
                  },
                })
              }}
            />
          )
        },
      },
    ],
    [organization]
  )

  const allTeamsColumns = useMemo(
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
              organizationId={organizationId}
              organization={organization}
              merge={mergeTeamOrganization}
              remove={removeTeamOrganization}
            />
          )
        },
      },
    ],
    [organization]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="teams-content"
        id="teams-header"
      >
        <Typography className={classes.accordionFormTitle}>Teams</Typography>
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
                  onClick={handleOpenAddOrganization}
                  variant={'outlined'}
                  size="small"
                  className={classes.submit}
                  startIcon={<AddIcon />}
                >
                  Add Team
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <DataGridPro
                columns={organizationTeamsColumns}
                rows={setIdFromEntityId(organization.teams, 'teamId')}
                loading={queryAllOrganizationsLoading}
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
                <div style={{ height: 600 }} className={classes.xGridDialog}>
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

const ToggleNewTeam = props => {
  const { organizationId, teamId, organization, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!organization.teams.find(p => p.teamId === teamId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        isMember
          ? remove({
              variables: {
                organizationId,
                teamId,
              },
            })
          : merge({
              variables: {
                organizationId,
                teamId,
              },
            })
        setIsMember(!isMember)
      }}
      name="teamMember"
      color="primary"
      label={isMember ? 'Member' : 'Not Member'}
    />
  )
}

ToggleNewTeam.propTypes = {
  organizationId: PropTypes.string,
  teamId: PropTypes.string,
  team: PropTypes.object,
  removeTeamOrganization: PropTypes.func,
  mergeTeamOrganization: PropTypes.func,
  loading: PropTypes.bool,
}

Teams.propTypes = {
  organizationId: PropTypes.string,
}

export { Teams }
