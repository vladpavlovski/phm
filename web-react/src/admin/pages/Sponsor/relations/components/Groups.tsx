import React from 'react'
import { setIdFromEntityId } from 'utils'
import { Sponsor } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import AccountBox from '@mui/icons-material/AccountBox'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
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
import { getAdminGroupRoute } from '../../../../../router/routes'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

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

type TRelations = {
  sponsorId: string
  sponsor: Sponsor
  updateSponsor: MutationFunction
}

const Groups: React.FC<TRelations> = props => {
  const { sponsorId, sponsor, updateSponsor } = props

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

  const sponsorGroupsColumns = React.useMemo<GridColumns>(
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
              dialogTitle={
                'Do you really want to detach group from the sponsor?'
              }
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

  const allGroupsColumns = React.useMemo<GridColumns>(
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
        <Typography>Groups</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Toolbar
          disableGutters
          sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
        >
          <div />
          <div>
            <Button
              onClick={handleOpenAddGroup}
              variant={'outlined'}
              size="small"
              startIcon={<AddIcon />}
            >
              Add Group
            </Button>
          </div>
        </Toolbar>
        <div style={{ height: 600, width: '100%' }}>
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
              <div style={{ height: 600, width: '100%' }}>
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

type TToggleNew = {
  sponsorId: string
  groupId: string
  sponsor: Sponsor
  updateSponsor: MutationFunction
}
const ToggleNewGroup: React.FC<TToggleNew> = props => {
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
    />
  )
}

export { Groups }
