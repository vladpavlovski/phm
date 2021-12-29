import React from 'react'
import { gql, useLazyQuery, MutationFunction } from '@apollo/client'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import GavelIcon from '@mui/icons-material/Gavel'
import AddIcon from '@mui/icons-material/Add'

import Toolbar from '@mui/material/Toolbar'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import { getAdminOrgRulePackRoute } from 'router/routes'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { LinkButton, Error, Loader } from 'components'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from 'utils'
import { SystemSettings } from 'utils/types'
export const GET_ALL_RULEPACKS = gql`
  query getRulePacks {
    rulePacks {
      rulePackId
      name
    }
  }
`

type TRelations = {
  systemSettingsId: string
  systemSettings: SystemSettings
  updateSystemSettings: MutationFunction
}
const RulePack: React.FC<TRelations> = props => {
  const { systemSettingsId, systemSettings, updateSystemSettings } = props
  const classes = useStyles()
  const [openAddSystemSettings, setOpenAddSystemSettings] =
    React.useState(false)

  const handleCloseAddSystemSettings = React.useCallback(() => {
    setOpenAddSystemSettings(false)
  }, [])

  const [
    getAllSystemSettings,
    {
      loading: queryAllSystemSettingsLoading,
      error: queryAllSystemSettingsError,
      data: queryAllSystemSettingsData,
    },
  ] = useLazyQuery(GET_ALL_RULEPACKS)

  const handleOpenAddSystemSettings = React.useCallback(() => {
    if (!queryAllSystemSettingsData) {
      getAllSystemSettings()
    }
    setOpenAddSystemSettings(true)
  }, [])

  const systemSettingsRulePackColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'rulePackId',
        headerName: 'Edit',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<GavelIcon />}
              to={getAdminOrgRulePackRoute('phm', params.value)}
            >
              Rule Pack
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
              dialogTitle={
                'Do you really want to detach rulePack from System Settings?'
              }
              dialogDescription={
                'RulePack will remain in the database. You can add it to any System Settings later.'
              }
              dialogNegativeText={'No, keep rulePack'}
              dialogPositiveText={'Yes, detach rulePack'}
              onDialogClosePositive={() => {
                updateSystemSettings({
                  variables: {
                    where: {
                      systemSettingsId,
                    },
                    update: {
                      rulePack: {
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
    []
  )

  const allRulePackColumns = React.useMemo<GridColumns>(
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
              systemSettingsId={systemSettingsId}
              systemSettings={systemSettings}
              updateSystemSettings={updateSystemSettings}
            />
          )
        },
      },
    ],
    [systemSettings]
  )

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="rulePacks-content"
        id="rulePacks-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Default Rule Pack
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Toolbar disableGutters className={classes.toolbarForm}>
          <div />
          <div>
            <Button
              onClick={handleOpenAddSystemSettings}
              variant={'outlined'}
              size="small"
              className={classes.submit}
              startIcon={<AddIcon />}
            >
              Add RulePack
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 110 }} className={classes.xGridDialog}>
          <DataGridPro
            columns={systemSettingsRulePackColumns}
            rows={setIdFromEntityId(
              systemSettings?.rulePack ? [systemSettings?.rulePack] : [],
              'rulePackId'
            )}
            loading={queryAllSystemSettingsLoading}
            hideFooter
          />
        </div>
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddSystemSettings}
        onClose={handleCloseAddSystemSettings}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllSystemSettingsLoading && <Loader />}

        <Error message={queryAllSystemSettingsError?.message} />

        {queryAllSystemSettingsData && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add default rulePack to ${systemSettings?.name}`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600 }} className={classes.xGridDialog}>
                <DataGridPro
                  columns={allRulePackColumns}
                  rows={setIdFromEntityId(
                    queryAllSystemSettingsData.rulePacks,
                    'rulePackId'
                  )}
                  disableSelectionOnClick
                  loading={queryAllSystemSettingsLoading}
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
              handleCloseAddSystemSettings()
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
  systemSettingsId: string
  rulePackId: string
  systemSettings: SystemSettings
  updateSystemSettings: MutationFunction
}

const ToggleNewRulePack: React.FC<TToggleNew> = React.memo(props => {
  const { systemSettingsId, rulePackId, systemSettings, updateSystemSettings } =
    props
  const [isMember, setIsMember] = React.useState(
    systemSettings?.rulePack?.rulePackId === rulePackId
  )

  return !systemSettings?.rulePack || isMember ? (
    <Switch
      checked={isMember}
      onChange={() => {
        isMember
          ? updateSystemSettings({
              variables: {
                where: {
                  systemSettingsId,
                },
                update: {
                  rulePack: {
                    disconnect: {
                      where: {
                        node: {
                          rulePackId,
                        },
                      },
                    },
                  },
                },
              },
            })
          : updateSystemSettings({
              variables: {
                where: {
                  systemSettingsId,
                },
                update: {
                  rulePack: {
                    connect: {
                      where: {
                        node: { rulePackId },
                      },
                    },
                  },
                },
              },
            })

        setIsMember(!isMember)
      }}
      name="rulePackMember"
      color="primary"
    />
  ) : (
    <></>
  )
})

export { RulePack }
