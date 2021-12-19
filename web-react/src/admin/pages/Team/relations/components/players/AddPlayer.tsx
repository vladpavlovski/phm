import React from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import { MutationFunction } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'

import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'
import { Loader, Error } from 'components'
import { useStyles } from '../../../../commonComponents/styled'
import { setIdFromEntityId, getXGridValueFromArray } from 'utils'
import { Team } from 'utils/types'

export const GET_ALL_PLAYERS = gql`
  query getPlayers {
    players {
      playerId
      name
      firstName
      lastName
      teams {
        teamId
        name
      }
      positions {
        positionId
        name
      }
    }
  }
`

type TPlayers = {
  teamId: string
  updateTeam: MutationFunction
  team: Team
}

const AddPlayer: React.FC<TPlayers> = React.memo(props => {
  const { teamId, team, updateTeam } = props
  const classes = useStyles()

  const [openAddPlayer, setOpenAddPlayer] = React.useState(false)

  const handleCloseAddPlayer = React.useCallback(() => {
    setOpenAddPlayer(false)
  }, [])

  const [
    getAllPlayers,
    {
      loading: queryAllPlayersLoading,
      error: queryAllPlayersError,
      data: queryAllPlayersData,
    },
  ] = useLazyQuery(GET_ALL_PLAYERS, {
    fetchPolicy: 'cache-and-network',
  })

  const handleOpenAddPlayer = React.useCallback(() => {
    if (!queryAllPlayersData) {
      getAllPlayers()
    }
    setOpenAddPlayer(true)
  }, [])

  const allPlayersColumns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'teams',
        headerName: 'Teams',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.teams, 'name')
        },
      },
      {
        field: 'positions',
        headerName: 'Positions',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.positions, 'name')
        },
      },

      {
        field: 'playerId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewPlayer
              playerId={params.value}
              teamId={teamId}
              team={team}
              updateTeam={updateTeam}
            />
          )
        },
      },
    ],
    [team]
  )

  return (
    <>
      <Button
        type="button"
        onClick={handleOpenAddPlayer}
        variant={'outlined'}
        size="small"
        className={classes.submit}
        startIcon={<AddIcon />}
      >
        Add Player
      </Button>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddPlayer}
        onClose={handleCloseAddPlayer}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllPlayersLoading && <Loader />}
        <Error message={queryAllPlayersError?.message} />
        {queryAllPlayersData && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add new player to ${
              team && team.name
            }`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600 }} className={classes.xGridDialog}>
                <DataGridPro
                  columns={allPlayersColumns}
                  rows={setIdFromEntityId(
                    queryAllPlayersData.players,
                    'playerId'
                  )}
                  disableSelectionOnClick
                  loading={queryAllPlayersLoading}
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
              handleCloseAddPlayer()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
})

type TToggleNewPlayer = TPlayers & {
  playerId: string
}

const ToggleNewPlayer: React.FC<TToggleNewPlayer> = React.memo(props => {
  const { playerId, teamId, team, updateTeam } = props
  const [isMember, setIsMember] = React.useState(
    !!team.players.find(p => p.playerId === playerId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updateTeam({
          variables: {
            where: {
              teamId,
            },
            update: {
              players: {
                ...(!isMember
                  ? {
                      connect: {
                        where: {
                          node: {
                            playerId,
                          },
                        },
                      },
                    }
                  : {
                      disconnect: {
                        where: {
                          node: {
                            playerId,
                          },
                        },
                      },
                    }),
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

export { AddPlayer }
