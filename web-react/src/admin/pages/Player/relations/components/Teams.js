import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import PropTypes from 'prop-types'

import { useParams } from 'react-router-dom'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AccountBox from '@mui/icons-material/AccountBox'
import AddIcon from '@mui/icons-material/Add'
import CreateIcon from '@mui/icons-material/Create'
import Toolbar from '@mui/material/Toolbar'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'

import Switch from '@mui/material/Switch'
import { QuickSearchToolbar } from 'components/QuickSearchToolbar'
import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminOrgTeamRoute } from 'router/routes'
import { LinkButton } from 'components/LinkButton'
import { Error } from 'components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId, sortByStatus } from 'utils'
import { useXGridSearch } from 'utils/hooks'

export const GET_ALL_TEAMS = gql`
  query getTeams($where: TeamWhere) {
    teams(where: $where) {
      teamId
      name
      status
    }
  }
`

const TeamsComponent = props => {
  const { playerId, player, updatePlayer } = props

  const classes = useStyles()
  const { organizationSlug } = useParams()
  const [openAddPlayer, setOpenAddPlayer] = useState(false)

  const handleCloseAddPlayer = useCallback(() => {
    setOpenAddPlayer(false)
  }, [])

  const [
    getAllTeams,
    {
      loading: queryAllPlayersLoading,
      error: queryAllPlayersError,
      data: queryAllPlayersData,
    },
  ] = useLazyQuery(GET_ALL_TEAMS, {
    variables: {
      where: {
        orgs: {
          urlSlug: organizationSlug,
        },
      },
    },
    fetchPolicy: 'cache-and-network',
  })

  const handleOpenAddPlayer = useCallback(() => {
    if (!queryAllPlayersData) {
      getAllTeams()
    }
    setOpenAddPlayer(true)
  }, [])

  const playerTeamsColumns = useMemo(
    () => [
      {
        field: 'teamId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgTeamRoute(organizationSlug, params.value)}
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
              dialogTitle={'Do you really want to remove player from the team?'}
              dialogDescription={
                'The player will remain in the database. You can add him to any team later.'
              }
              dialogNegativeText={'No, keep the player'}
              dialogPositiveText={'Yes, remove player'}
              onDialogClosePositive={() => {
                updatePlayer({
                  variables: {
                    where: {
                      playerId,
                    },
                    update: {
                      teams: {
                        disconnect: {
                          where: {
                            node: {
                              teamId: params.row.teamId,
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
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
    ],
    []
  )

  const allTeamsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        sortable: true,
        disableColumnMenu: true,
      },
      {
        field: 'teamId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewTeam
              teamId={params.value}
              playerId={playerId}
              player={player}
              updatePlayer={updatePlayer}
            />
          )
        },
      },
    ],
    [player]
  )

  const teamsData = useMemo(
    () =>
      queryAllPlayersData
        ? setIdFromEntityId(queryAllPlayersData?.teams || [], 'teamId')
        : [],
    [queryAllPlayersData]
  )

  const searchIndexes = React.useMemo(() => ['name', 'status'], [])

  const [searchText, searchData, requestSearch] = useXGridSearch({
    searchIndexes,
    data: teamsData,
  })

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="teams-content"
        id="teams-header"
      >
        <Typography className={classes.accordionFormTitle}>Teams</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <>
          <Toolbar disableGutters className={classes.toolbarForm}>
            <div />
            <div>
              <Button
                onClick={handleOpenAddPlayer}
                variant={'outlined'}
                size="small"
                className={classes.submit}
                startIcon={<AddIcon />}
              >
                Add To Team
              </Button>

              <LinkButton
                startIcon={<CreateIcon />}
                to={getAdminOrgTeamRoute(organizationSlug, 'new')}
              >
                Create
              </LinkButton>
            </div>
          </Toolbar>
          <div style={{ height: 600 }} className={classes.xGridDialog}>
            <DataGridPro
              columns={playerTeamsColumns}
              rows={setIdFromEntityId(player.teams, 'teamId')}
              loading={queryAllPlayersLoading}
              components={{
                Toolbar: GridToolbar,
              }}
            />
          </div>
        </>
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddPlayer}
        onClose={handleCloseAddPlayer}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllPlayersError && (
          <Error message={queryAllPlayersError.message} />
        )}
        {queryAllPlayersData && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add ${player?.name} to new team`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 1000 }} className={classes.xGridDialog}>
                <DataGridPro
                  columns={allTeamsColumns}
                  rows={sortByStatus(searchData, 'status')}
                  disableSelectionOnClick
                  loading={queryAllPlayersLoading}
                  components={{
                    Toolbar: QuickSearchToolbar,
                  }}
                  componentsProps={{
                    toolbar: {
                      value: searchText,
                      onChange: event => requestSearch(event.target.value),
                      clearSearch: () => requestSearch(''),
                    },
                  }}
                />
              </div>
            </DialogContent>
          </>
        )}
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseAddPlayer()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

const ToggleNewTeamComponent = props => {
  const { playerId, teamId, player, updatePlayer } = props
  const [isMember, setIsMember] = useState(
    !!player.teams.find(p => p.teamId === teamId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        isMember
          ? updatePlayer({
              variables: {
                where: {
                  playerId,
                },
                update: {
                  teams: {
                    disconnect: {
                      where: {
                        node: {
                          teamId,
                        },
                      },
                    },
                  },
                },
              },
            })
          : updatePlayer({
              variables: {
                where: {
                  playerId,
                },
                update: {
                  teams: {
                    connect: {
                      where: {
                        node: { teamId },
                      },
                    },
                  },
                },
              },
            })

        setIsMember(!isMember)
      }}
      name="teamMember"
      color="primary"
      label={isMember ? 'Member' : 'Not member'}
    />
  )
}

const ToggleNewTeam = React.memo(ToggleNewTeamComponent)

ToggleNewTeamComponent.propTypes = {
  playerId: PropTypes.string,
  teamId: PropTypes.string,
  team: PropTypes.object,
  removeTeamPlayer: PropTypes.func,
  mergeTeamPlayer: PropTypes.func,
}

TeamsComponent.propTypes = {
  playerId: PropTypes.string,
}

const Teams = React.memo(TeamsComponent)

export { Teams }
