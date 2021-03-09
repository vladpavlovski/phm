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
import { getAdminGroupRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_GROUPS = gql`
  query getSeasonGroups($seasonId: ID) {
    season: Season(seasonId: $seasonId) {
      seasonId
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

const REMOVE_SEASON_GROUP = gql`
  mutation removeSeasonGroup($seasonId: ID!, $groupId: ID!) {
    seasonGroup: RemoveSeasonGroups(
      from: { groupId: $groupId }
      to: { seasonId: $seasonId }
    ) {
      from {
        groupId
        name
        competition {
          name
        }
      }
      to {
        seasonId
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

const MERGE_SEASON_GROUP = gql`
  mutation mergeSeasonGroups($seasonId: ID!, $groupId: ID!) {
    seasonGroup: MergeSeasonGroups(
      from: { groupId: $groupId }
      to: { seasonId: $seasonId }
    ) {
      from {
        groupId
        name
        competition {
          name
        }
      }
      to {
        seasonId
        name
      }
    }
  }
`

const Groups = props => {
  const { seasonId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddSeason, setOpenAddSeason] = useState(false)

  const handleCloseAddSeason = useCallback(() => {
    setOpenAddSeason(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_GROUPS, {
    fetchPolicy: 'cache-and-network',
  })

  const season = queryData?.season?.[0]

  const [
    getAllSeasons,
    {
      loading: queryAllSeasonsLoading,
      error: queryAllSeasonsError,
      data: queryAllSeasonsData,
    },
  ] = useLazyQuery(GET_ALL_GROUPS, {
    fetchPolicy: 'cache-and-network',
  })

  const [removeGroupSeason, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_SEASON_GROUP,
    {
      update(cache, { data: { seasonGroup } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_GROUPS,
            variables: {
              seasonId,
            },
          })
          const updatedData = queryResult?.season?.[0]?.groups.filter(
            p => p.groupId !== seasonGroup.from.groupId
          )

          const updatedResult = {
            season: [
              {
                ...queryResult?.season?.[0],
                groups: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_GROUPS,
            data: updatedResult,
            variables: {
              seasonId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data.seasonGroup.from.name} not owned by ${season.name}!`,
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

  const [mergeGroupSeason] = useMutation(MERGE_SEASON_GROUP, {
    update(cache, { data: { seasonGroup } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_GROUPS,
          variables: {
            seasonId,
          },
        })
        const existingData = queryResult?.season?.[0]?.groups
        const newItem = seasonGroup.from
        const updatedResult = {
          season: [
            {
              ...queryResult?.season?.[0],
              groups: [newItem, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_GROUPS,
          data: updatedResult,
          variables: {
            seasonId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.seasonGroup.from.name} owned by ${season.name}!`,
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
      getData({ variables: { seasonId } })
    }
  }, [])

  const handleOpenAddSeason = useCallback(() => {
    if (!queryAllSeasonsData) {
      getAllSeasons()
    }
    setOpenAddSeason(true)
  }, [])

  const seasonGroupsColumns = useMemo(
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
              dialogTitle={'Do you really want to detach group from season?'}
              dialogDescription={
                'Group will remain in the database. You can add him to any season later.'
              }
              dialogNegativeText={'No, keep group'}
              dialogPositiveText={'Yes, detach group'}
              onDialogClosePositive={() => {
                removeGroupSeason({
                  variables: {
                    seasonId,
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
              seasonId={seasonId}
              season={season}
              merge={mergeGroupSeason}
              remove={removeGroupSeason}
            />
          )
        },
      },
    ],
    [season]
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
                  onClick={handleOpenAddSeason}
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
                columns={seasonGroupsColumns}
                rows={setIdFromEntityId(season.groups, 'groupId')}
                loading={queryAllSeasonsLoading}
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
        open={openAddSeason}
        onClose={handleCloseAddSeason}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllSeasonsLoading && !queryAllSeasonsError && <Loader />}
        {queryAllSeasonsError && !queryAllSeasonsLoading && (
          <Error message={queryAllSeasonsError.message} />
        )}
        {queryAllSeasonsData &&
          !queryAllSeasonsLoading &&
          !queryAllSeasonsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add ${season?.name} to new group`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allGroupsColumns}
                    rows={setIdFromEntityId(
                      queryAllSeasonsData.groups,
                      'groupId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllSeasonsLoading}
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
              handleCloseAddSeason()
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
  const { seasonId, groupId, season, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!season.groups.find(p => p.groupId === groupId)
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
                    seasonId,
                    groupId,
                  },
                })
              : merge({
                  variables: {
                    seasonId,
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
  seasonId: PropTypes.string,
  groupId: PropTypes.string,
  group: PropTypes.object,
  removeGroupSeason: PropTypes.func,
  mergeGroupSeason: PropTypes.func,
  loading: PropTypes.bool,
}

Groups.propTypes = {
  seasonId: PropTypes.string,
}

export { Groups }
