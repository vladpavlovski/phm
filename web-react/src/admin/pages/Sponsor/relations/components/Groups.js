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
  query getSponsor($sponsorId: ID) {
    sponsor: Sponsor(sponsorId: $sponsorId) {
      _id
      sponsorId
      name
      groups {
        groupId
        name
        nick
        competition {
          name
        }
      }
    }
  }
`

const REMOVE_SPONSOR_GROUP = gql`
  mutation removeSponsorGroup($sponsorId: ID!, $groupId: ID!) {
    sponsorGroup: RemoveSponsorGroups(
      from: { groupId: $groupId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        groupId
        name
        nick
        competition {
          name
        }
      }
    }
  }
`

export const GET_ALL_GROUPS = gql`
  query getGroups {
    groups: Group {
      groupId
      name
      nick
      competition {
        name
      }
    }
  }
`

const MERGE_SPONSOR_GROUP = gql`
  mutation mergeSponsorGroup($sponsorId: ID!, $groupId: ID!) {
    sponsorGroup: MergeSponsorGroups(
      from: { groupId: $groupId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        groupId
        name
        nick
        short
        teamsLimit
        competition {
          name
        }
      }
    }
  }
`

const Groups = props => {
  const { sponsorId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddGroup, setOpenAddGroup] = useState(false)

  const handleCloseAddGroup = useCallback(() => {
    setOpenAddGroup(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_GROUPS, {
    fetchPolicy: 'cache-and-network',
  })

  const sponsor = queryData && queryData.sponsor && queryData.sponsor[0]

  const [
    getAllGroups,
    {
      loading: queryAllGroupsLoading,
      error: queryAllGroupsError,
      data: queryAllGroupsData,
    },
  ] = useLazyQuery(GET_ALL_GROUPS, {
    fetchPolicy: 'cache-and-network',
  })

  const [removeSponsorGroup, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_SPONSOR_GROUP,
    {
      update(cache, { data: { sponsorGroup } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_GROUPS,
            variables: {
              sponsorId,
            },
          })
          const updatedGroups = queryResult.sponsor[0].groups.filter(
            p => p.groupId !== sponsorGroup.from.groupId
          )

          const updatedResult = {
            sponsor: [
              {
                ...queryResult.sponsor[0],
                groups: updatedGroups,
              },
            ],
          }
          cache.writeQuery({
            query: GET_GROUPS,
            data: updatedResult,
            variables: {
              sponsorId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data.sponsorGroup.from.name} not sponsored by ${sponsor.name}!`,
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

  const [mergeSponsorGroup] = useMutation(MERGE_SPONSOR_GROUP, {
    update(cache, { data: { sponsorGroup } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_GROUPS,
          variables: {
            sponsorId,
          },
        })
        const existingGroups = queryResult.sponsor[0].groups
        const newGroup = sponsorGroup.from
        const updatedResult = {
          sponsor: [
            {
              ...queryResult.sponsor[0],
              groups: [newGroup, ...existingGroups],
            },
          ],
        }
        cache.writeQuery({
          query: GET_GROUPS,
          data: updatedResult,
          variables: {
            sponsorId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.sponsorGroup.from.name} sponsored by ${sponsor.name}!`,
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
      getData({ variables: { sponsorId } })
    }
  }, [])

  const handleOpenAddGroup = useCallback(() => {
    if (!queryAllGroupsData) {
      getAllGroups()
    }
    setOpenAddGroup(true)
  }, [])

  const sponsorGroupsColumns = useMemo(
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
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={
                'Do you really want to detach group from the sponsor?'
              }
              dialogNick={'You can add him to sponsor later.'}
              dialogNegativeText={'No, keep group'}
              dialogPositiveText={'Yes, detach group'}
              onDialogClosePositive={() => {
                removeSponsorGroup({
                  variables: {
                    sponsorId,
                    groupId: params.row.groupId,
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
              merge={mergeSponsorGroup}
              remove={removeSponsorGroup}
            />
          )
        },
      },
    ],
    [sponsor]
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
              <XGrid
                columns={sponsorGroupsColumns}
                rows={setIdFromEntityId(sponsor.groups, 'groupId')}
                loading={queryAllGroupsLoading}
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
                <XGrid
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
  const { groupId, sponsorId, sponsor, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!sponsor.groups.find(p => p.groupId === groupId)
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
                    sponsorId,
                    groupId,
                  },
                })
              : merge({
                  variables: {
                    sponsorId,
                    groupId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="sponsorMember"
          color="primary"
        />
      }
      label={isMember ? 'Sponsored' : 'Not sponsored'}
    />
  )
}

ToggleNewGroup.propTypes = {
  groupId: PropTypes.string,
  sponsorId: PropTypes.string,
  sponsor: PropTypes.object,
  removeSponsorGroup: PropTypes.func,
  mergeSponsorGroup: PropTypes.func,
}

Groups.propTypes = {
  sponsorId: PropTypes.string,
}

export { Groups }
