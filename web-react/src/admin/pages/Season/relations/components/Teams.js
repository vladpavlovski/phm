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
import { getAdminTeamRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_TEAMS = gql`
  query getSeasonTeams($seasonId: ID) {
    season: Season(seasonId: $seasonId) {
      seasonId
      name
      teams {
        teamId
        name
      }
    }
  }
`

const REMOVE_ORGANIZATION_TEAM = gql`
  mutation removeSeasonTeam($seasonId: ID!, $teamId: ID!) {
    seasonTeam: RemoveSeasonTeams(
      from: { teamId: $teamId }
      to: { seasonId: $seasonId }
    ) {
      from {
        teamId
        name
      }
      to {
        seasonId
        name
      }
    }
  }
`

export const GET_ALL_TEAMS = gql`
  query getTeams {
    teams: Team {
      teamId
      name
    }
  }
`

const MERGE_ORGANIZATION_TEAM = gql`
  mutation mergeSeasonTeams($seasonId: ID!, $teamId: ID!) {
    seasonTeam: MergeSeasonTeams(
      from: { teamId: $teamId }
      to: { seasonId: $seasonId }
    ) {
      from {
        teamId
        name
      }
      to {
        seasonId
        name
      }
    }
  }
`

const Teams = props => {
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
  ] = useLazyQuery(GET_TEAMS, {
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
  ] = useLazyQuery(GET_ALL_TEAMS, {
    fetchPolicy: 'cache-and-network',
  })

  const [removeTeamSeason, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_ORGANIZATION_TEAM,
    {
      update(cache, { data: { seasonTeam } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_TEAMS,
            variables: {
              seasonId,
            },
          })
          const updatedData = queryResult?.season?.[0]?.teams.filter(
            p => p.teamId !== seasonTeam.from.teamId
          )

          const updatedResult = {
            season: [
              {
                ...queryResult?.season?.[0],
                teams: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_TEAMS,
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
          `${data.seasonTeam.from.name} not participate in ${season.name}!`,
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

  const [mergeTeamSeason] = useMutation(MERGE_ORGANIZATION_TEAM, {
    update(cache, { data: { seasonTeam } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_TEAMS,
          variables: {
            seasonId,
          },
        })
        const existingData = queryResult?.season?.[0]?.teams
        const newItem = seasonTeam.from
        const updatedResult = {
          season: [
            {
              ...queryResult?.season?.[0],
              teams: [newItem, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_TEAMS,
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
        `${data.seasonTeam.from.name} participate in ${season.name}!`,
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

  const seasonTeamsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'teamId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminTeamRoute(params.value)}
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
              dialogTitle={'Do you really want to detach team from season?'}
              dialogDescription={
                'Team will remain in the database. You can add him to any season later.'
              }
              dialogNegativeText={'No, keep team'}
              dialogPositiveText={'Yes, detach team'}
              onDialogClosePositive={() => {
                removeTeamSeason({
                  variables: {
                    seasonId,
                    teamId: params.row.teamId,
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

  const allTeamsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 300,
      },

      {
        field: 'teamId',
        headerName: 'Membership',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewTeam
              teamId={params.value}
              seasonId={seasonId}
              season={season}
              merge={mergeTeamSeason}
              remove={removeTeamSeason}
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
        aria-controls="teams-content"
        id="teams-header"
      >
        <Typography className={classes.accordionFormTitle}>Teams</Typography>
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
                  Add Team
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={seasonTeamsColumns}
                rows={setIdFromEntityId(season.teams, 'teamId')}
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
              <DialogTitle id="alert-dialog-title">{`Add ${season?.name} to new team`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allTeamsColumns}
                    rows={setIdFromEntityId(
                      queryAllSeasonsData.teams,
                      'teamId'
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

const ToggleNewTeam = props => {
  const { seasonId, teamId, season, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!season.teams.find(p => p.teamId === teamId)
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
                    teamId,
                  },
                })
              : merge({
                  variables: {
                    seasonId,
                    teamId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="teamMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not Member'}
    />
  )
}

ToggleNewTeam.propTypes = {
  seasonId: PropTypes.string,
  teamId: PropTypes.string,
  team: PropTypes.object,
  removeTeamSeason: PropTypes.func,
  mergeTeamSeason: PropTypes.func,
  loading: PropTypes.bool,
}

Teams.propTypes = {
  seasonId: PropTypes.string,
}

export { Teams }
