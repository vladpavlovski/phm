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
import Checkbox from '@material-ui/core/Checkbox'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminTeamRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_TEAMS = gql`
  query getAssociationTeams($associationId: ID) {
    association: Association(associationId: $associationId) {
      associationId
      name
      teams {
        teamId
        name
      }
    }
  }
`

const REMOVE_ASSOCIATION_TEAM = gql`
  mutation removeAssociationTeam($associationId: ID!, $teamId: ID!) {
    associationTeam: RemoveAssociationTeams(
      from: { teamId: $teamId }
      to: { associationId: $associationId }
    ) {
      from {
        teamId
        name
      }
      to {
        associationId
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

const MERGE_ASSOCIATION_TEAM = gql`
  mutation mergeAssociationTeams($associationId: ID!, $teamId: ID!) {
    associationTeam: MergeAssociationTeams(
      from: { teamId: $teamId }
      to: { associationId: $associationId }
    ) {
      from {
        teamId
        name
      }
      to {
        associationId
        name
      }
    }
  }
`

const Teams = props => {
  const { associationId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddAssociation, setOpenAddAssociation] = useState(false)

  const handleCloseAddAssociation = useCallback(() => {
    setOpenAddAssociation(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_TEAMS, {
    fetchPolicy: 'cache-and-network',
  })

  const association = queryData?.association?.[0]

  const [
    getAllAssociations,
    {
      loading: queryAllAssociationsLoading,
      error: queryAllAssociationsError,
      data: queryAllAssociationsData,
    },
  ] = useLazyQuery(GET_ALL_TEAMS, {
    fetchPolicy: 'cache-and-network',
  })

  const [
    removeTeamAssociation,
    { loading: mutationLoadingRemove },
  ] = useMutation(REMOVE_ASSOCIATION_TEAM, {
    update(cache, { data: { associationTeam } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_TEAMS,
          variables: {
            associationId,
          },
        })
        const updatedData = queryResult?.association?.[0]?.teams.filter(
          p => p.teamId !== associationTeam.from.teamId
        )

        const updatedResult = {
          association: [
            {
              ...queryResult?.association?.[0],
              teams: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_TEAMS,
          data: updatedResult,
          variables: {
            associationId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.associationTeam.from.name} not participate in ${association.name}!`,
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

  const [mergeTeamAssociation, { loading: mutationLoadingMerge }] = useMutation(
    MERGE_ASSOCIATION_TEAM,
    {
      update(cache, { data: { associationTeam } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_TEAMS,
            variables: {
              associationId,
            },
          })
          const existingData = queryResult?.association?.[0]?.teams
          const newItem = associationTeam.from
          const updatedResult = {
            association: [
              {
                ...queryResult?.association?.[0],
                teams: [newItem, ...existingData],
              },
            ],
          }
          cache.writeQuery({
            query: GET_TEAMS,
            data: updatedResult,
            variables: {
              associationId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data.associationTeam.from.name} participate in ${association.name}!`,
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
    }
  )

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { associationId } })
    }
  }, [])

  const handleOpenAddAssociation = useCallback(() => {
    if (!queryAllAssociationsData) {
      getAllAssociations()
    }
    setOpenAddAssociation(true)
  }, [])

  const associationTeamsColumns = useMemo(
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
              to={getAdminTeamRoute(params.value)}
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
                'Do you really want to detach team from association?'
              }
              dialogDescription={
                'Team will remain in the database. You can add him to any association later.'
              }
              dialogNegativeText={'No, keep team'}
              dialogPositiveText={'Yes, detach team'}
              onDialogClosePositive={() => {
                removeTeamAssociation({
                  variables: {
                    associationId,
                    teamId: params.row.teamId,
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

  const allTeamsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
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
              associationId={associationId}
              association={association}
              merge={mergeTeamAssociation}
              remove={removeTeamAssociation}
              loading={mutationLoadingMerge || mutationLoadingRemove}
            />
          )
        },
      },
    ],
    [association]
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
                  onClick={handleOpenAddAssociation}
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
              <XGrid
                columns={associationTeamsColumns}
                rows={setIdFromEntityId(association.teams, 'teamId')}
                loading={queryAllAssociationsLoading}
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
        open={openAddAssociation}
        onClose={handleCloseAddAssociation}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllAssociationsLoading && !queryAllAssociationsError && (
          <Loader />
        )}
        {queryAllAssociationsError && !queryAllAssociationsLoading && (
          <Error message={queryAllAssociationsError.message} />
        )}
        {queryAllAssociationsData &&
          !queryAllAssociationsLoading &&
          !queryAllAssociationsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add ${association?.name} to new team`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allTeamsColumns}
                    rows={setIdFromEntityId(
                      queryAllAssociationsData.teams,
                      'teamId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllAssociationsLoading}
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
              handleCloseAddAssociation()
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
  const { associationId, teamId, association, remove, merge, loading } = props
  const [isMember, setIsMember] = useState(
    !!association.teams.find(p => p.teamId === teamId)
  )

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={isMember}
          onChange={() => {
            isMember
              ? remove({
                  variables: {
                    associationId,
                    teamId,
                  },
                })
              : merge({
                  variables: {
                    associationId,
                    teamId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="teamMember"
          color="primary"
        />
      }
      label={loading ? 'thinking' : isMember ? 'Member' : 'Not Member'}
    />
  )
}

ToggleNewTeam.propTypes = {
  associationId: PropTypes.string,
  teamId: PropTypes.string,
  team: PropTypes.object,
  removeTeamAssociation: PropTypes.func,
  mergeTeamAssociation: PropTypes.func,
  loading: PropTypes.bool,
}

Teams.propTypes = {
  associationId: PropTypes.string,
}

export { Teams }
