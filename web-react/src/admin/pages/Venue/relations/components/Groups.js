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
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminGroupRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_GROUPS = gql`
  query getVenueGroups($venueId: ID) {
    venue: Venue(venueId: $venueId) {
      venueId
      name
      groups {
        groupId
        name
        competition {
          name
        }
      }
    }
  }
`

const REMOVE_VENUE_GROUP = gql`
  mutation removeVenueGroup($venueId: ID!, $groupId: ID!) {
    venueGroup: RemoveVenueGroups(
      from: { groupId: $groupId }
      to: { venueId: $venueId }
    ) {
      from {
        groupId
        name
        competition {
          name
        }
      }
      to {
        venueId
        name
      }
    }
  }
`

export const GET_ALL_GROUPS = gql`
  query getGroups {
    groups: Group {
      groupId
      name
      competition {
        name
      }
    }
  }
`

const MERGE_VENUE_GROUP = gql`
  mutation mergeVenueGroups($venueId: ID!, $groupId: ID!) {
    venueGroup: MergeVenueGroups(
      from: { groupId: $groupId }
      to: { venueId: $venueId }
    ) {
      from {
        groupId
        name
        competition {
          name
        }
      }
      to {
        venueId
        name
      }
    }
  }
`

const Groups = props => {
  const { venueId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddVenue, setOpenAddVenue] = useState(false)

  const handleCloseAddVenue = useCallback(() => {
    setOpenAddVenue(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_GROUPS, {
    fetchPolicy: 'cache-and-network',
  })

  const venue = queryData?.venue?.[0]

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

  const [removeGroupVenue, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_VENUE_GROUP,
    {
      update(cache, { data: { venueGroup } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_GROUPS,
            variables: {
              venueId,
            },
          })
          const updatedData = queryResult?.venue?.[0]?.groups.filter(
            p => p.groupId !== venueGroup.from.groupId
          )

          const updatedResult = {
            venue: [
              {
                ...queryResult?.venue?.[0],
                groups: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_GROUPS,
            data: updatedResult,
            variables: {
              venueId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data.venueGroup.from.name} not takes plays on ${venue.name}!`,
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
    }
  )

  const [mergeGroupVenue] = useMutation(MERGE_VENUE_GROUP, {
    update(cache, { data: { venueGroup } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_GROUPS,
          variables: {
            venueId,
          },
        })
        const existingData = queryResult?.venue?.[0]?.groups
        const newItem = venueGroup.from
        const updatedResult = {
          venue: [
            {
              ...queryResult?.venue?.[0],
              groups: [newItem, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_GROUPS,
          data: updatedResult,
          variables: {
            venueId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.venueGroup.from.name} takes plays on ${venue.name}!`,
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
      getData({ variables: { venueId } })
    }
  }, [])

  const handleOpenAddVenue = useCallback(() => {
    if (!queryAllVenuesData) {
      getAllVenues()
    }
    setOpenAddVenue(true)
  }, [])

  const venueGroupsColumns = useMemo(
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
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={'Do you really want to detach group from venue?'}
              dialogDescription={
                'Group will remain in the database. You can add him to any venue later.'
              }
              dialogNegativeText={'No, keep group'}
              dialogPositiveText={'Yes, detach group'}
              onDialogClosePositive={() => {
                removeGroupVenue({
                  variables: {
                    venueId,
                    groupId: params.row?.groupId,
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

  const allGroupsColumns = useMemo(
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
              merge={mergeGroupVenue}
              remove={removeGroupVenue}
            />
          )
        },
      },
    ],
    [venue]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="groups-content"
        id="groups-header"
      >
        <Typography className={classes.accordionFormTitle}>Groups</Typography>
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
                  onClick={handleOpenAddVenue}
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
              <XGrid
                columns={venueGroupsColumns}
                rows={setIdFromEntityId(venue.groups, 'groupId')}
                loading={queryAllVenuesLoading}
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
              <div style={{ height: 600 }} className={classes.xGridDialog}>
                <XGrid
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

const ToggleNewGroup = props => {
  const { venueId, groupId, venue, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!venue.groups.find(p => p.groupId === groupId)
  )

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            isMember
              ? remove({
                  variables: {
                    venueId,
                    groupId,
                  },
                })
              : merge({
                  variables: {
                    venueId,
                    groupId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="groupMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not Member'}
    />
  )
}

ToggleNewGroup.propTypes = {
  venueId: PropTypes.string,
  groupId: PropTypes.string,
  group: PropTypes.object,
  removeGroupVenue: PropTypes.func,
  mergeGroupVenue: PropTypes.func,
  loading: PropTypes.bool,
}

Groups.propTypes = {
  venueId: PropTypes.string,
}

export { Groups }
