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
import { getAdminCompetitionRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_COMPETITIONS = gql`
  query getOrganizationCompetitions($organizationId: ID) {
    organization: Organization(organizationId: $organizationId) {
      organizationId
      name
      competitions {
        competitionId
        name
      }
    }
  }
`

const REMOVE_ORGANIZATION_COMPETITION = gql`
  mutation removeOrganizationCompetition(
    $organizationId: ID!
    $competitionId: ID!
  ) {
    organizationCompetition: RemoveOrganizationCompetitions(
      from: { competitionId: $competitionId }
      to: { organizationId: $organizationId }
    ) {
      from {
        competitionId
        name
      }
      to {
        organizationId
        name
      }
    }
  }
`

export const GET_ALL_COMPETITIONS = gql`
  query getCompetitions {
    competitions: Competition {
      competitionId
      name
    }
  }
`

const MERGE_ORGANIZATION_COMPETITION = gql`
  mutation mergeOrganizationCompetitions(
    $organizationId: ID!
    $competitionId: ID!
  ) {
    organizationCompetition: MergeOrganizationCompetitions(
      from: { competitionId: $competitionId }
      to: { organizationId: $organizationId }
    ) {
      from {
        competitionId
        name
      }
      to {
        organizationId
        name
      }
    }
  }
`

const Competitions = props => {
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
  ] = useLazyQuery(GET_COMPETITIONS, {
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
  ] = useLazyQuery(GET_ALL_COMPETITIONS, {
    fetchPolicy: 'cache-and-network',
  })

  const [
    removeCompetitionOrganization,
    { loading: mutationLoadingRemove },
  ] = useMutation(REMOVE_ORGANIZATION_COMPETITION, {
    update(cache, { data: { organizationCompetition } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_COMPETITIONS,
          variables: {
            organizationId,
          },
        })
        const updatedData = queryResult?.organization?.[0]?.competitions.filter(
          p => p.competitionId !== organizationCompetition.from.competitionId
        )

        const updatedResult = {
          organization: [
            {
              ...queryResult?.organization?.[0],
              competitions: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_COMPETITIONS,
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
        `${data.organizationCompetition.from.name} not owned by ${organization.name}!`,
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

  const [mergeCompetitionOrganization] = useMutation(
    MERGE_ORGANIZATION_COMPETITION,
    {
      update(cache, { data: { organizationCompetition } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_COMPETITIONS,
            variables: {
              organizationId,
            },
          })
          const existingData = queryResult?.organization?.[0]?.competitions
          const newItem = organizationCompetition.from
          const updatedResult = {
            organization: [
              {
                ...queryResult?.organization?.[0],
                competitions: [newItem, ...existingData],
              },
            ],
          }
          cache.writeQuery({
            query: GET_COMPETITIONS,
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
          `${data.organizationCompetition.from.name} owned by ${organization.name}!`,
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
      getData({ variables: { organizationId } })
    }
  }, [])

  const handleOpenAddOrganization = useCallback(() => {
    if (!queryAllOrganizationsData) {
      getAllOrganizations()
    }
    setOpenAddOrganization(true)
  }, [])

  const organizationCompetitionsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
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
              to={getAdminCompetitionRoute(params.value)}
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
                'Do you really want to detach competition from organization?'
              }
              dialogDescription={
                'Competition will remain in the database. You can add him to any organization later.'
              }
              dialogNegativeText={'No, keep competition'}
              dialogPositiveText={'Yes, detach competition'}
              onDialogClosePositive={() => {
                removeCompetitionOrganization({
                  variables: {
                    organizationId,
                    competitionId: params.row.competitionId,
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

  const allCompetitionsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 300,
      },

      {
        field: 'competitionId',
        headerName: 'Membership',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewCompetition
              competitionId={params.value}
              organizationId={organizationId}
              organization={organization}
              merge={mergeCompetitionOrganization}
              remove={removeCompetitionOrganization}
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
        aria-controls="competitions-content"
        id="competitions-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Competitions
        </Typography>
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
                  Add Competition
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={organizationCompetitionsColumns}
                rows={setIdFromEntityId(
                  organization.competitions,
                  'competitionId'
                )}
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
              <DialogTitle id="alert-dialog-title">{`Add ${organization?.name} to new competition`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allCompetitionsColumns}
                    rows={setIdFromEntityId(
                      queryAllOrganizationsData.competitions,
                      'competitionId'
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

const ToggleNewCompetition = props => {
  const { organizationId, competitionId, organization, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!organization.competitions.find(p => p.competitionId === competitionId)
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
                    organizationId,
                    competitionId,
                  },
                })
              : merge({
                  variables: {
                    organizationId,
                    competitionId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="competitionMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not Member'}
    />
  )
}

ToggleNewCompetition.propTypes = {
  organizationId: PropTypes.string,
  competitionId: PropTypes.string,
  competition: PropTypes.object,
  removeCompetitionOrganization: PropTypes.func,
  mergeCompetitionOrganization: PropTypes.func,
  loading: PropTypes.bool,
}

Competitions.propTypes = {
  organizationId: PropTypes.string,
}

export { Competitions }
