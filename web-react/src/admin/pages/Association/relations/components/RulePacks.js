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
import { getAdminRulePackRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_RULEPACKS = gql`
  query getAssociationRulePacks($associationId: ID) {
    association: Association(associationId: $associationId) {
      associationId
      name
      rulePacks {
        rulePackId
        name
      }
    }
  }
`

const REMOVE_ASSOCIATION_RULEPACK = gql`
  mutation removeAssociationRulePack($associationId: ID!, $rulePackId: ID!) {
    associationRulePack: RemoveAssociationRulePacks(
      from: { associationId: $associationId }
      to: { rulePackId: $rulePackId }
    ) {
      from {
        associationId
        name
      }
      to {
        rulePackId
        name
      }
    }
  }
`

export const GET_ALL_RULEPACKS = gql`
  query getRulePacks {
    rulePacks: RulePack {
      rulePackId
      name
    }
  }
`

const MERGE_ASSOCIATION_RULEPACK = gql`
  mutation mergeAssociationRulePacks($associationId: ID!, $rulePackId: ID!) {
    associationRulePack: MergeAssociationRulePacks(
      from: { associationId: $associationId }
      to: { rulePackId: $rulePackId }
    ) {
      from {
        associationId
        name
      }
      to {
        rulePackId
        name
      }
    }
  }
`

const RulePacks = props => {
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
  ] = useLazyQuery(GET_RULEPACKS, {
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
  ] = useLazyQuery(GET_ALL_RULEPACKS, {
    fetchPolicy: 'cache-and-network',
  })

  const [
    removeRulePackAssociation,
    { loading: mutationLoadingRemove },
  ] = useMutation(REMOVE_ASSOCIATION_RULEPACK, {
    update(cache, { data: { associationRulePack } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_RULEPACKS,
          variables: {
            associationId,
          },
        })
        const updatedData = queryResult?.association?.[0]?.rulePacks.filter(
          p => p.rulePackId !== associationRulePack.to.rulePackId
        )

        const updatedResult = {
          association: [
            {
              ...queryResult?.association?.[0],
              rulePacks: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_RULEPACKS,
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
        `${association.name} not guided by ${data.associationRulePack.to.name}!`,
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

  const [mergeRulePackAssociation] = useMutation(MERGE_ASSOCIATION_RULEPACK, {
    update(cache, { data: { associationRulePack } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_RULEPACKS,
          variables: {
            associationId,
          },
        })
        const existingData = queryResult?.association?.[0]?.rulePacks
        const newItem = associationRulePack.to
        const updatedResult = {
          association: [
            {
              ...queryResult?.association?.[0],
              rulePacks: [newItem, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_RULEPACKS,
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
        `${association.name} guided by ${data.associationRulePack.to.name}!`,
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
      getData({ variables: { associationId } })
    }
  }, [])

  const handleOpenAddAssociation = useCallback(() => {
    if (!queryAllAssociationsData) {
      getAllAssociations()
    }
    setOpenAddAssociation(true)
  }, [])

  const associationRulePacksColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'rulePackId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminRulePackRoute(params.value)}
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
                'Do you really want to detach rulePack from association?'
              }
              dialogDescription={
                'RulePack will remain in the database. You can add him to any association later.'
              }
              dialogNegativeText={'No, keep rulePack'}
              dialogPositiveText={'Yes, detach rulePack'}
              onDialogClosePositive={() => {
                removeRulePackAssociation({
                  variables: {
                    associationId,
                    rulePackId: params.row.rulePackId,
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

  const allRulePacksColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 300,
      },

      {
        field: 'rulePackId',
        headerName: 'Guidance',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewRulePack
              rulePackId={params.value}
              associationId={associationId}
              association={association}
              merge={mergeRulePackAssociation}
              remove={removeRulePackAssociation}
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
        aria-controls="rulePacks-content"
        id="rulePacks-header"
      >
        <Typography className={classes.accordionFormTitle}>
          RulePacks
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
                  Add RulePack
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={associationRulePacksColumns}
                rows={setIdFromEntityId(association.rulePacks, 'rulePackId')}
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
              <DialogTitle id="alert-dialog-title">{`Add ${association?.name} to new rulePack`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allRulePacksColumns}
                    rows={setIdFromEntityId(
                      queryAllAssociationsData.rulePacks,
                      'rulePackId'
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

const ToggleNewRulePack = props => {
  const { associationId, rulePackId, association, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!association.rulePacks.find(p => p.rulePackId === rulePackId)
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
                    rulePackId,
                  },
                })
              : merge({
                  variables: {
                    associationId,
                    rulePackId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="rulePackMember"
          color="primary"
        />
      }
      label={isMember ? 'Guided' : 'Not Guided'}
    />
  )
}

ToggleNewRulePack.propTypes = {
  associationId: PropTypes.string,
  rulePackId: PropTypes.string,
  rulePack: PropTypes.object,
  removeRulePackAssociation: PropTypes.func,
  mergeRulePackAssociation: PropTypes.func,
  loading: PropTypes.bool,
}

RulePacks.propTypes = {
  associationId: PropTypes.string,
}

export { RulePacks }
