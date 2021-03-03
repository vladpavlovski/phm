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
  query getAssociationCompetitions($associationId: ID) {
    association: Association(associationId: $associationId) {
      associationId
      name
      competitions {
        competitionId
        name
      }
    }
  }
`

const REMOVE_ASSOCIATION_COMPETITION = gql`
  mutation removeAssociationCompetition(
    $associationId: ID!
    $competitionId: ID!
  ) {
    associationCompetition: RemoveAssociationCompetitions(
      from: { competitionId: $competitionId }
      to: { associationId: $associationId }
    ) {
      from {
        competitionId
        name
      }
      to {
        associationId
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

const MERGE_ASSOCIATION_COMPETITION = gql`
  mutation mergeAssociationCompetitions(
    $associationId: ID!
    $competitionId: ID!
  ) {
    associationCompetition: MergeAssociationCompetitions(
      from: { competitionId: $competitionId }
      to: { associationId: $associationId }
    ) {
      from {
        competitionId
        name
      }
      to {
        associationId
        name
      }
    }
  }
`

const Competitions = props => {
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
  ] = useLazyQuery(GET_COMPETITIONS, {
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
  ] = useLazyQuery(GET_ALL_COMPETITIONS, {
    fetchPolicy: 'cache-and-network',
  })

  const [
    removeCompetitionAssociation,
    { loading: mutationLoadingRemove },
  ] = useMutation(REMOVE_ASSOCIATION_COMPETITION, {
    update(cache, { data: { associationCompetition } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_COMPETITIONS,
          variables: {
            associationId,
          },
        })
        const updatedData = queryResult?.association?.[0]?.competitions.filter(
          p => p.competitionId !== associationCompetition.from.competitionId
        )

        const updatedResult = {
          association: [
            {
              ...queryResult?.association?.[0],
              competitions: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_COMPETITIONS,
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
        `${data.associationCompetition.from.name} not owned by ${association.name}!`,
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

  const [mergeCompetitionAssociation] = useMutation(
    MERGE_ASSOCIATION_COMPETITION,
    {
      update(cache, { data: { associationCompetition } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_COMPETITIONS,
            variables: {
              associationId,
            },
          })
          const existingData = queryResult?.association?.[0]?.competitions
          const newItem = associationCompetition.from
          const updatedResult = {
            association: [
              {
                ...queryResult?.association?.[0],
                competitions: [newItem, ...existingData],
              },
            ],
          }
          cache.writeQuery({
            query: GET_COMPETITIONS,
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
          `${data.associationCompetition.from.name} owned by ${association.name}!`,
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

  const associationCompetitionsColumns = useMemo(
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
                'Do you really want to detach competition from association?'
              }
              dialogDescription={
                'Competition will remain in the database. You can add him to any association later.'
              }
              dialogNegativeText={'No, keep competition'}
              dialogPositiveText={'Yes, detach competition'}
              onDialogClosePositive={() => {
                removeCompetitionAssociation({
                  variables: {
                    associationId,
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
              associationId={associationId}
              association={association}
              merge={mergeCompetitionAssociation}
              remove={removeCompetitionAssociation}
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
                  onClick={handleOpenAddAssociation}
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
                columns={associationCompetitionsColumns}
                rows={setIdFromEntityId(
                  association.competitions,
                  'competitionId'
                )}
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
              <DialogTitle id="alert-dialog-title">{`Add ${association?.name} to new competition`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allCompetitionsColumns}
                    rows={setIdFromEntityId(
                      queryAllAssociationsData.competitions,
                      'competitionId'
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

const ToggleNewCompetition = props => {
  const { associationId, competitionId, association, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!association.competitions.find(p => p.competitionId === competitionId)
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
                    competitionId,
                  },
                })
              : merge({
                  variables: {
                    associationId,
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
  associationId: PropTypes.string,
  competitionId: PropTypes.string,
  competition: PropTypes.object,
  removeCompetitionAssociation: PropTypes.func,
  mergeCompetitionAssociation: PropTypes.func,
  loading: PropTypes.bool,
}

Competitions.propTypes = {
  associationId: PropTypes.string,
}

export { Competitions }
