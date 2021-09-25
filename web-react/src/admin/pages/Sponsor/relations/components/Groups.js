import React from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import PropTypes from 'prop-types'

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
import { getAdminGroupRoute } from '../../../../../router/routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

export const GET_ALL_GROUPS = gql`
  query getGroups {
    groups {
      groupId
      name
      nick
      competition {
        name
      }
    }
  }
`

const Groups = props => {
  const { sponsorId, sponsor, updateSponsor } = props

  const classes = useStyles()
  const [openAddGroup, setOpenAddGroup] = React.useState(false)

  const handleCloseAddGroup = React.useCallback(() => {
    setOpenAddGroup(false)
  }, [])

  const [
    getAllGroups,
    {
      loading: queryAllGroupsLoading,
      error: queryAllGroupsError,
      data: queryAllGroupsData,
    },
  ] = useLazyQuery(GET_ALL_GROUPS)

  const handleOpenAddGroup = React.useCallback(() => {
    if (!queryAllGroupsData) {
      getAllGroups()
    }
    setOpenAddGroup(true)
  }, [])

  const sponsorGroupsColumns = React.useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'nick',
        headerName: 'Nick',
        width: 150,
      },

      {
        field: 'competition',
        headerName: 'Competition',
        width: 200,
        valueGetter: params => params?.row?.competition?.name,
      },

      {
        field: 'groupId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminGroupRoute(params.value)}
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
              text={'Detach'}
              textLoading={'Detaching...'}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={
                'Do you really want to detach group from the sponsor?'
              }
              dialogNick={'You can add him to sponsor later.'}
              dialogNegativeText={'No, keep group'}
              dialogPositiveText={'Yes, detach group'}
              onDialogClosePositive={() => {
                updateSponsor({
                  variables: {
                    where: {
                      sponsorId,
                    },
                    update: {
                      groups: {
                        disconnect: {
                          where: {
                            node: {
                              groupId: params.row.groupId,
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

  const allGroupsColumns = React.useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'nick',
        headerName: 'Nick',
        width: 150,
      },

      {
        field: 'competition',
        headerName: 'Competition',
        width: 200,
        valueGetter: params => params?.row?.competition?.name,
      },

      {
        field: 'groupId',
        headerName: 'Sponsor',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewGroup
              groupId={params.value}
              sponsorId={sponsorId}
              sponsor={sponsor}
              updateSponsor={updateSponsor}
            />
          )
        },
      },
    ],
    [sponsor]
  )

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="groups-content"
        id="groups-header"
      >
        <Typography className={classes.accordionFormTitle}>Groups</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Toolbar disableGutters className={classes.toolbarForm}>
          <div />
          <div>
            <Button
              onClick={handleOpenAddGroup}
              variant={'outlined'}
              size="small"
              className={classes.submit}
              startIcon={<AddIcon />}
            >
              Add Group
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600 }} className={classes.xGridDialog}>
          <DataGridPro
            columns={sponsorGroupsColumns}
            rows={setIdFromEntityId(sponsor?.groups, 'groupId')}
            loading={queryAllGroupsLoading}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddGroup}
        onClose={handleCloseAddGroup}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-nick"
      >
        {queryAllGroupsLoading && !queryAllGroupsError && <Loader />}
        {queryAllGroupsError && !queryAllGroupsLoading && (
          <Error message={queryAllGroupsError.message} />
        )}
        {queryAllGroupsData && !queryAllGroupsLoading && !queryAllGroupsError && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add group to ${
              sponsor && sponsor.name
            }`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600 }} className={classes.xGridDialog}>
                <DataGridPro
                  columns={allGroupsColumns}
                  rows={setIdFromEntityId(queryAllGroupsData.groups, 'groupId')}
                  disableSelectionOnClick
                  loading={queryAllGroupsLoading}
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
              handleCloseAddGroup()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

const ToggleNewGroup = props => {
  const { groupId, sponsorId, sponsor, updateSponsor } = props
  const [isMember, setIsMember] = React.useState(
    !!sponsor.groups.find(p => p.groupId === groupId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        isMember
          ? updateSponsor({
              variables: {
                where: {
                  sponsorId,
                },
                update: {
                  groups: {
                    disconnect: {
                      where: {
                        node: {
                          groupId,
                        },
                      },
                    },
                  },
                },
              },
            })
          : updateSponsor({
              variables: {
                where: {
                  sponsorId,
                },
                update: {
                  groups: {
                    connect: {
                      where: {
                        node: { groupId },
                      },
                    },
                  },
                },
              },
            })

        setIsMember(!isMember)
      }}
      name="sponsorMember"
      color="primary"
      label={isMember ? 'Sponsored' : 'Not sponsored'}
    />
  )
}

ToggleNewGroup.propTypes = {
  groupId: PropTypes.string,
  sponsorId: PropTypes.string,
  sponsor: PropTypes.object,
  updateSponsor: PropTypes.func,
}

Groups.propTypes = {
  sponsorId: PropTypes.string,
  updateSponsor: PropTypes.func,
  sponsor: PropTypes.object,
}

export { Groups }
