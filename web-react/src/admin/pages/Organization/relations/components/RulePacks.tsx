import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
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
import { Error } from '../../../../../components/Error'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { getAdminOrgRulePackRoute } from '../../../../../router/routes'
import { setIdFromEntityId } from '../../../../../utils'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { useStyles } from '../../../commonComponents/styled'

export const GET_ALL_RULEPACKS = gql`
  query getRulePacks {
    rulePacks {
      rulePackId
      name
    }
  }
`

type TRulePacks = {
  organizationId: string
  organization: Organization
  updateOrganization: MutationFunction
}
type TParams = {
  organizationSlug: string
}

const RulePacks: React.FC<TRulePacks> = props => {
  const { organizationId, organization, updateOrganization } = props

  const classes = useStyles()
  const { organizationSlug } = useParams<TParams>()
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
  ] = useLazyQuery(GET_ALL_RULEPACKS)

  const handleOpenAddOrganization = useCallback(() => {
    if (!queryAllOrganizationsData) {
      getAllOrganizations()
    }
    setOpenAddOrganization(true)
  }, [])

  const organizationRulePacksColumns = useMemo<GridColumns>(
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
                updateOrganization({
                  variables: {
                    where: {
                      organizationId,
                    },
                    update: {
                      rulePacks: {
                        disconnect: {
                          where: {
                            node: {
                              rulePackId: params.row.rulePackId,
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
    [organizationSlug, updateOrganization]
  )

  const allRulePacksColumns = useMemo<GridColumns>(
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
          return <ToggleNew rulePackId={params.value} {...props} />
        },
      },
    ],
    [props]
  )

  return (
    <Accordion>
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

type TToggleNew = {
  organization: Organization
  organizationId: string
  rulePackId: string
  updateOrganization: MutationFunction
}

const ToggleNew: React.FC<TToggleNew> = React.memo(props => {
  const { organizationId, rulePackId, organization, updateOrganization } = props
  const [isMember, setIsMember] = useState(
    !!organization.rulePacks.find(p => p.rulePackId === rulePackId)
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
              rulePacks: {
                ...(!isMember
                  ? {
                      connect: {
                        where: {
                          node: {
                            rulePackId,
                          },
                        },
                      },
                    }
                  : {
                      disconnect: {
                        where: {
                          node: {
                            rulePackId,
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
      name="rulePackMember"
      color="primary"
    />
  )
})

export { RulePacks }
