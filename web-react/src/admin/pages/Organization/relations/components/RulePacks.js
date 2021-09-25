import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'
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
import { getAdminOrgRulePackRoute } from '../../../../../router/routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_RULEPACKS = gql`
  query getOrganizationRulePacks($organizationId: ID) {
    organization: Organization(organizationId: $organizationId) {
      organizationId
      name
      rulePacks {
        rulePackId
        name
      }
    }
  }
`

const REMOVE_ORGANIZATION_RULEPACK = gql`
  mutation removeOrganizationRulePack($organizationId: ID!, $rulePackId: ID!) {
    organizationRulePack: RemoveOrganizationRulePacks(
      from: { organizationId: $organizationId }
      to: { rulePackId: $rulePackId }
    ) {
      from {
        organizationId
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

const MERGE_ORGANIZATION_RULEPACK = gql`
  mutation mergeOrganizationRulePacks($organizationId: ID!, $rulePackId: ID!) {
    organizationRulePack: MergeOrganizationRulePacks(
      from: { organizationId: $organizationId }
      to: { rulePackId: $rulePackId }
    ) {
      from {
        organizationId
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
  const { organizationId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const { organizationSlug } = useParams()
  const [openAddOrganization, setOpenAddOrganization] = useState(false)

  const handleCloseAddOrganization = useCallback(() => {
    setOpenAddOrganization(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_RULEPACKS, {
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
  ] = useLazyQuery(GET_ALL_RULEPACKS, {
    fetchPolicy: 'cache-and-network',
  })

  const [removeRulePackOrganization, { loading: mutationLoadingRemove }] =
    useMutation(REMOVE_ORGANIZATION_RULEPACK, {
      update(cache, { data: { organizationRulePack } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_RULEPACKS,
            variables: {
              organizationId,
            },
          })
          const updatedData = queryResult?.organization?.[0]?.rulePacks.filter(
            p => p.rulePackId !== organizationRulePack.to.rulePackId
          )

          const updatedResult = {
            organization: [
              {
                ...queryResult?.organization?.[0],
                rulePacks: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_RULEPACKS,
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
          `${organization.name} not guided by ${data.organizationRulePack.to.name}!`,
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

  const [mergeRulePackOrganization] = useMutation(MERGE_ORGANIZATION_RULEPACK, {
    update(cache, { data: { organizationRulePack } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_RULEPACKS,
          variables: {
            organizationId,
          },
        })
        const existingData = queryResult?.organization?.[0]?.rulePacks
        const newItem = organizationRulePack.to
        const updatedResult = {
          organization: [
            {
              ...queryResult?.organization?.[0],
              rulePacks: [newItem, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_RULEPACKS,
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
        `${organization.name} guided by ${data.organizationRulePack.to.name}!`,
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

  const organizationRulePacksColumns = useMemo(
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
              to={getAdminOrgRulePackRoute(organizationSlug, params.value)}
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
                'Do you really want to detach rulePack from organization?'
              }
              dialogDescription={
                'RulePack will remain in the database. You can add him to any organization later.'
              }
              dialogNegativeText={'No, keep rulePack'}
              dialogPositiveText={'Yes, detach rulePack'}
              onDialogClosePositive={() => {
                removeRulePackOrganization({
                  variables: {
                    organizationId,
                    rulePackId: params.row.rulePackId,
                  },
                })
              }}
            />
          )
        },
      },
    ],
    [organizationSlug]
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
              organizationId={organizationId}
              organization={organization}
              merge={mergeRulePackOrganization}
              remove={removeRulePackOrganization}
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
                  onClick={handleOpenAddOrganization}
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
              <DataGridPro
                columns={organizationRulePacksColumns}
                rows={setIdFromEntityId(organization.rulePacks, 'rulePackId')}
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
              <DialogTitle id="alert-dialog-title">{`Add ${organization?.name} to new rulePack`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <DataGridPro
                    columns={allRulePacksColumns}
                    rows={setIdFromEntityId(
                      queryAllOrganizationsData.rulePacks,
                      'rulePackId'
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

const ToggleNewRulePack = props => {
  const { organizationId, rulePackId, organization, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!organization.rulePacks.find(p => p.rulePackId === rulePackId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        isMember
          ? remove({
              variables: {
                organizationId,
                rulePackId,
              },
            })
          : merge({
              variables: {
                organizationId,
                rulePackId,
              },
            })
        setIsMember(!isMember)
      }}
      name="rulePackMember"
      label={isMember ? 'Guided' : 'Not Guided'}
      color="primary"
    />
  )
}

ToggleNewRulePack.propTypes = {
  organizationId: PropTypes.string,
  rulePackId: PropTypes.string,
  rulePack: PropTypes.object,
  removeRulePackOrganization: PropTypes.func,
  mergeRulePackOrganization: PropTypes.func,
  loading: PropTypes.bool,
}

RulePacks.propTypes = {
  organizationId: PropTypes.string,
}

export { RulePacks }
