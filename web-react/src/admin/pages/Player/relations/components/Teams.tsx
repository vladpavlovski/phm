import { Error } from 'components/Error'
import { LinkButton } from 'components/LinkButton'
import { QuickSearchToolbar } from 'components/QuickSearchToolbar'
import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgTeamRoute } from 'router/routes'
import { setIdFromEntityId, sortByStatus } from 'utils'
import { useXGridSearch } from 'utils/hooks'
import { Player } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import AccountBox from '@mui/icons-material/AccountBox'
import AddIcon from '@mui/icons-material/Add'
import CreateIcon from '@mui/icons-material/Create'
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

export const GET_ALL_TEAMS = gql`
  query getTeams($where: TeamWhere) {
    teams(where: $where) {
      teamId
      name
      status
    }
  }
`

type TTeams = {
  playerId: string
  player: Player
  updatePlayer: MutationFunction
}

type TTeamsParams = {
  organizationSlug: string
}

const Teams: React.FC<TTeams> = React.memo(props => {
  const { playerId, player, updatePlayer } = props
  const { organizationSlug } = useParams<TTeamsParams>()
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

  const playerTeamsColumns = useMemo<GridColumns>(
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

  const allTeamsColumns = useMemo<GridColumns>(
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
        <Typography>Teams</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <>
          <Toolbar
            disableGutters
            sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
          >
            <div />
            <div>
              <Button
                onClick={handleOpenAddPlayer}
                variant={'outlined'}
                size="small"
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
          <div style={{ height: 600, width: '100%' }}>
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
              <div style={{ height: 1000, width: '100%' }}>
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
                      onChange: (
                        event: React.ChangeEvent<HTMLInputElement>
                      ): void => requestSearch(event.target.value),
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
})

type TToggleNewTeam = {
  playerId: string
  teamId: string
  player: Player
  updatePlayer: MutationFunction
}

const ToggleNewTeam: React.FC<TToggleNewTeam> = React.memo(props => {
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
    />
  )
})

export { Teams }
