import { Error, LinkButton, Loader } from 'components'
import React from 'react'
import { getAdminGroupRoute } from 'router/routes'
import { setIdFromEntityId } from 'utils'
import { Venue } from 'utils/types'
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
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

export const GET_ALL_GROUPS = gql`
  query getGroups {
    groups {
      groupId
      name
      competition {
        name
      }
    }
  }
`
type TRelations = {
  venueId: string
  updateVenue: MutationFunction
  venue: Venue
}

const Groups: React.FC<TRelations> = props => {
  const { venueId, venue, updateVenue } = props

  const [openAddVenue, setOpenAddVenue] = React.useState(false)

  const handleCloseAddVenue = React.useCallback(() => {
    setOpenAddVenue(false)
  }, [])

  const [
    getAllVenues,
    {
      loading: queryAllVenuesLoading,
      error: queryAllVenuesError,
      data: queryAllVenuesData,
    },
  ] = useLazyQuery(GET_ALL_GROUPS, {
    fetchPolicy: 'cache-and-network',
  })

  const handleOpenAddVenue = React.useCallback(() => {
    if (!queryAllVenuesData) {
      getAllVenues()
    }
    setOpenAddVenue(true)
  }, [])

  const venueGroupsColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
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
              text={'Remove'}
              textLoading={'Removing...'}
              dialogTitle={'Do you really want to detach group from venue?'}
              dialogDescription={
                'Group will remain in the database. You can add him to any venue later.'
              }
              dialogNegativeText={'No, keep group'}
              dialogPositiveText={'Yes, detach group'}
              onDialogClosePositive={() => {
                updateVenue({
                  variables: {
                    where: {
                      venueId,
                    },
                    update: {
                      groups: {
                        disconnect: {
                          where: {
                            node: {
                              groupId: params.row?.groupId,
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
        width: 200,
      },

      {
        field: 'competition',
        headerName: 'Competition',
        width: 200,
        valueGetter: params => params?.row?.competition?.name,
      },

      {
        field: 'groupId',
        headerName: 'Membership',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewGroup
              groupId={params.value}
              venueId={venueId}
              venue={venue}
              updateVenue={updateVenue}
            />
          )
        },
      },
    ],
    [venue]
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
              onClick={handleOpenAddVenue}
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
            columns={venueGroupsColumns}
            rows={setIdFromEntityId(venue.groups, 'groupId')}
            loading={queryAllVenuesLoading}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddVenue}
        onClose={handleCloseAddVenue}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllVenuesLoading && !queryAllVenuesError && <Loader />}
        {queryAllVenuesError && !queryAllVenuesLoading && (
          <Error message={queryAllVenuesError.message} />
        )}
        {queryAllVenuesData && !queryAllVenuesLoading && !queryAllVenuesError && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add ${venue?.name} to new group`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600, width: '100%' }}>
                <DataGridPro
                  columns={allGroupsColumns}
                  rows={setIdFromEntityId(queryAllVenuesData.groups, 'groupId')}
                  disableSelectionOnClick
                  loading={queryAllVenuesLoading}
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
              handleCloseAddVenue()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

type TToggleNewGroup = {
  venueId: string
  groupId: string
  venue: Venue
  updateVenue: MutationFunction
}

const ToggleNewGroup: React.FC<TToggleNewGroup> = props => {
  const { venueId, groupId, venue, updateVenue } = props
  const [isMember, setIsMember] = React.useState(
    !!venue.groups.find(p => p.groupId === groupId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updateVenue({
          variables: {
            where: {
              venueId,
            },
            update: {
              groups: {
                ...(isMember
                  ? {
                      disconnect: {
                        where: {
                          node: {
                            groupId,
                          },
                        },
                      },
                    }
                  : {
                      connect: {
                        where: {
                          node: { groupId },
                        },
                      },
                    }),
              },
            },
          },
        })

        setIsMember(!isMember)
      }}
      name="groupMember"
      color="primary"
    />
  )
}

export { Groups }
