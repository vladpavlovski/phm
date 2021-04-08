import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import GavelIcon from '@material-ui/icons/Gavel'
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
  query getSystemSettingsRulePack($systemSettingsId: ID) {
    systemSettings: SystemSettings(systemSettingsId: $systemSettingsId) {
      systemSettingsId
      name
      rulePack {
        rulePackId
        name
      }
    }
  }
`

const REMOVE_SYSTEM_SETTINGS_RULEPACK = gql`
  mutation removeSystemSettingsRulePack(
    $systemSettingsId: ID!
    $rulePackId: ID!
  ) {
    systemSettingsRulePack: RemoveSystemSettingsRulePack(
      from: { systemSettingsId: $systemSettingsId }
      to: { rulePackId: $rulePackId }
    ) {
      from {
        systemSettingsId
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

const MERGE_SYSTEM_SETTINGS_RULEPACK = gql`
  mutation mergeSystemSettingsRulePack(
    $systemSettingsId: ID!
    $rulePackId: ID!
  ) {
    systemSettingsRulePack: MergeSystemSettingsRulePack(
      from: { systemSettingsId: $systemSettingsId }
      to: { rulePackId: $rulePackId }
    ) {
      from {
        systemSettingsId
        name
      }
      to {
        rulePackId
        name
      }
    }
  }
`

const RulePack = props => {
  const { systemSettingsId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddSystemSettings, setOpenAddSystemSettings] = useState(false)

  const handleCloseAddSystemSettings = useCallback(() => {
    setOpenAddSystemSettings(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_RULEPACKS, {
    fetchPolicy: 'cache-and-network',
  })

  const systemSettings = queryData?.systemSettings?.[0]

  const [
    getAllSystemSettings,
    {
      loading: queryAllSystemSettingsLoading,
      error: queryAllSystemSettingsError,
      data: queryAllSystemSettingsData,
    },
  ] = useLazyQuery(GET_ALL_RULEPACKS, {
    fetchPolicy: 'cache-and-network',
  })

  const [
    removeRulePackSystemSettings,
    { loading: mutationLoadingRemove },
  ] = useMutation(REMOVE_SYSTEM_SETTINGS_RULEPACK, {
    update(cache) {
      try {
        const queryResult = cache.readQuery({
          query: GET_RULEPACKS,
          variables: {
            systemSettingsId,
          },
        })

        const updatedResult = {
          systemSettings: [
            {
              ...queryResult?.systemSettings?.[0],
              rulePack: null,
            },
          ],
        }
        cache.writeQuery({
          query: GET_RULEPACKS,
          data: updatedResult,
          variables: {
            systemSettingsId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${systemSettings.name} not guided by ${data.systemSettingsRulePack.to.name}!`,
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

  const [mergeRulePackSystemSettings] = useMutation(
    MERGE_SYSTEM_SETTINGS_RULEPACK,
    {
      update(cache, { data: { systemSettingsRulePack } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_RULEPACKS,
            variables: {
              systemSettingsId,
            },
          })

          const newItem = systemSettingsRulePack.to
          const updatedResult = {
            systemSettings: [
              {
                ...queryResult?.systemSettings?.[0],
                rulePack: newItem,
              },
            ],
          }
          cache.writeQuery({
            query: GET_RULEPACKS,
            data: updatedResult,
            variables: {
              systemSettingsId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${systemSettings.name} guided by ${data.systemSettingsRulePack.to.name}!`,
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
      getData({ variables: { systemSettingsId } })
    }
  }, [])

  const handleOpenAddSystemSettings = useCallback(() => {
    if (!queryAllSystemSettingsData) {
      getAllSystemSettings()
    }
    setOpenAddSystemSettings(true)
  }, [])

  const systemSettingsRulePackColumns = useMemo(
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
              to={getAdminRulePackRoute(params.value)}
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
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={
                'Do you really want to detach rulePack from System Settings?'
              }
              dialogDescription={
                'RulePack will remain in the database. You can add it to any System Settings later.'
              }
              dialogNegativeText={'No, keep rulePack'}
              dialogPositiveText={'Yes, detach rulePack'}
              onDialogClosePositive={() => {
                removeRulePackSystemSettings({
                  variables: {
                    systemSettingsId,
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

  const allRulePackColumns = useMemo(
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
              merge={mergeRulePackSystemSettings}
              remove={removeRulePackSystemSettings}
            />
          )
        },
      },
    ],
    [systemSettings]
  )

  return (
    <Accordion onChange={openAccordion}>
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
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
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
              <XGrid
                columns={systemSettingsRulePackColumns}
                rows={setIdFromEntityId(
                  systemSettings.rulePack ? [systemSettings.rulePack] : [],
                  'rulePackId'
                )}
                loading={queryAllSystemSettingsLoading}
                hideFooter
              />
            </div>
          </>
        )}
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddSystemSettings}
        onClose={handleCloseAddSystemSettings}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllSystemSettingsLoading && !queryAllSystemSettingsError && (
          <Loader />
        )}
        {queryAllSystemSettingsError && !queryAllSystemSettingsLoading && (
          <Error message={queryAllSystemSettingsError.message} />
        )}
        {queryAllSystemSettingsData &&
          !queryAllSystemSettingsLoading &&
          !queryAllSystemSettingsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add default rulePack to ${systemSettings?.name}`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
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

const ToggleNewRulePack = props => {
  const { systemSettingsId, rulePackId, systemSettings, remove, merge } = props
  const [isMember, setIsMember] = useState(
    systemSettings?.rulePack?.rulePackId === rulePackId
  )

  return (
    (!systemSettings?.rulePack || isMember) && (
      <FormControlLabel
        control={
          <Checkbox
            checked={isMember}
            onChange={() => {
              isMember
                ? remove({
                    variables: {
                      systemSettingsId,
                      rulePackId,
                    },
                  })
                : merge({
                    variables: {
                      systemSettingsId,
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
  )
}

ToggleNewRulePack.propTypes = {
  systemSettingsId: PropTypes.string,
  rulePackId: PropTypes.string,
  rulePack: PropTypes.object,
  removeRulePackSystemSettings: PropTypes.func,
  mergeRulePackSystemSettings: PropTypes.func,
  loading: PropTypes.bool,
}

RulePack.propTypes = {
  systemSettingsId: PropTypes.string,
}

export { RulePack }
