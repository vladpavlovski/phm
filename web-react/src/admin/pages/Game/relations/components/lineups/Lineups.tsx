import { PlayerLevel } from 'admin/pages/Player/components/PlayerLevel'
import { LinkButton, Title } from 'components'
import * as R from 'ramda'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgPlayerRoute } from 'router/routes'
import { addFieldToObjectWithoutDiacritics, setIdFromEntity, setXGridForRelation } from 'utils'
import { useSearch } from 'utils/hooks'
import { Game, GameEventSimple, Player, Team } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import AccountBox from '@mui/icons-material/AccountBox'
import AddReactionIcon from '@mui/icons-material/AddReaction'
import BalconyIcon from '@mui/icons-material/Balcony'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { Avatar, Box, Chip, Divider, TextField } from '@mui/material'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'
import placeholderPerson from '../../../../../../img/placeholderPerson.jpg'
import { ButtonDialog } from '../../../../commonComponents/ButtonDialog'
import { XGridLogo } from '../../../../commonComponents/XGridLogo'
import { SetLineupJersey } from './SetLineupJersey'
import { SetLineupPosition } from './SetLineupPosition'

const GET_TEAM_PLAYERS = gql`
  query getTeamPlayers($where: TeamWhere) {
    teams(where: $where) {
      teamId
      name
      players {
        playerId
        avatar
        name
        firstName
        lastName
        levelCode
        activityStatus
        jerseys {
          jerseyId
          name
          number
          team {
            teamId
          }
        }
        positions {
          positionId
          name
          team {
            teamId
          }
        }
      }
    }
  }
`

type Props = {
  gameId: string
  teams: {
    host: boolean
    node: Team
  }[]
  players: {
    node: Player
    host: boolean
  }[]
  updateGame: MutationFunction
  gameData: Game
}

const countPlayerStatistics = (
  player: { node: Player; host: boolean },
  events: GameEventSimple[]
) => {
  const playerId = player.node.playerId
  let ts = {
    scoredByCount: 0,
    assistsCount: 0,
    points: 0,
    penaltyMinutesCount: 0,
  }

  events
    .filter(e => e.eventTypeCode === 'goal' || e.eventTypeCode === 'penalty')
    .forEach(event => {
      if (event.eventTypeCode === 'goal') {
        if (event.scoredBy?.player?.playerId === playerId) {
          ts.scoredByCount++
          ts.points++
        }

        if (event.firstAssist?.player?.playerId === playerId) {
          ts.assistsCount++
          ts.points++
        }
        if (event.secondAssist?.player?.playerId === playerId) {
          ts.assistsCount++
          ts.points++
        }
      }
      if (event.eventTypeCode === 'penalty') {
        if (event.penalized?.player?.playerId === playerId) {
          ts.penaltyMinutesCount += parseFloat(event.duration)
        }
      }
    })

  return { ...player, ...ts }
}

const Lineups: React.FC<Props> = props => {
  const { gameId, teams, players, updateGame, gameData } = props

  const teamHost = teams.find(t => t.host)?.node || null
  const teamGuest = teams.find(t => !t.host)?.node || null

  const playersHost =
    players
      .filter(p => p.host)
      .map(p => countPlayerStatistics(p, gameData.gameEventsSimple)) || null
  const playersGuest =
    players
      .filter(p => !p.host)
      .map(p => countPlayerStatistics(p, gameData.gameEventsSimple)) || null

  return (
    <Grid container>
      <Grid item xs={12}>
        <LineupList
          host
          team={teamHost}
          gameId={gameId}
          players={playersHost}
          updateGame={updateGame}
        />
      </Grid>

      <Grid item xs={12}>
        <LineupList
          host={false}
          team={teamGuest}
          gameId={gameId}
          players={playersGuest}
          updateGame={updateGame}
        />
      </Grid>
    </Grid>
  )
}

type TLineupList = {
  gameId: string
  team: Team | null
  host: boolean
  players: {
    node: Player
    host: boolean
    scoredByCount: number
    assistsCount: number
    points: number
    penaltyMinutesCount: number
  }[]
  updateGame: MutationFunction
}

type TParams = {
  organizationSlug: string
}
interface TabPanelProps {
  children?: React.ReactNode
  dir?: string
  index: number
  value: number
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

const LineupList: React.FC<TLineupList> = props => {
  const { gameId, team, host = false, players, updateGame } = props
  const { organizationSlug } = useParams<TParams>()

  const [getTeamPlayers, { data: { teams: [queryTeam] } = { teams: [] } }] =
    useLazyQuery(GET_TEAM_PLAYERS, {
      variables: {
        where: { teamId: team?.teamId },
      },
    })

  // const addAllTeamPlayersToGame = useCallback(() => {
  //   const allPlayers: Player[] = queryTeam?.players

  //   const dataToConnect = allPlayers.map(player => {
  //     const position =
  //       player?.positions?.filter(p => p.team?.teamId === team?.teamId)?.[0]
  //         ?.name || ''

  //     const firstJersey = player?.jerseys?.filter(
  //       p => p.team?.teamId === team?.teamId
  //     )?.[0]

  //     const jersey =
  //       typeof firstJersey?.number === 'string'
  //         ? parseInt(firstJersey.number)
  //         : firstJersey?.number || null

  //     return {
  //       where: {
  //         node: { playerId: player.playerId },
  //       },
  //       edge: {
  //         host,
  //         position,
  //         jersey,
  //         captain: false,
  //         goalkeeper: false,
  //         teamId: team?.teamId,
  //       },
  //     }
  //   })

  //   updateGame({
  //     variables: {
  //       where: {
  //         gameId,
  //       },
  //       update: {
  //         players: {
  //           connect: dataToConnect,
  //         },
  //       },
  //     },
  //   })
  // }, [team, host, gameId, queryTeam])

  const lineupPlayers = setXGridForRelation(players, 'playerId', 'node')

  const setCaptain = React.useCallback(({ playerId, captain }) => {
    updateGame({
      variables: {
        where: {
          gameId,
        },
        update: {
          players: {
            where: {
              node: {
                playerId,
              },
            },
            update: {
              edge: {
                captain,
              },
            },
          },
        },
      },
    })
  }, [])

  const setGoalkeeper = React.useCallback(({ playerId, goalkeeper }) => {
    updateGame({
      variables: {
        where: {
          gameId,
        },
        update: {
          players: {
            where: {
              node: {
                playerId,
              },
            },
            update: {
              edge: {
                goalkeeper,
              },
            },
          },
        },
      },
    })
  }, [])

  const setStar = React.useCallback(({ playerId, star }) => {
    updateGame({
      variables: {
        where: {
          gameId,
        },
        update: {
          players: {
            where: {
              node: {
                playerId,
              },
            },
            update: {
              edge: {
                star,
              },
            },
          },
        },
      },
    })
  }, [])

  const gameLineupColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'actions',
        headerName: 'Actions',
        width: 200,
        sortable: false,
        disableColumnMenu: true,
        renderCell: params => {
          const isCaptain = !!params?.row?.captain
          const teamHasCaptain = !!lineupPlayers.find(
            (p: { captain: boolean }) => p.captain
          )
          const isGoalkeeper = !!params?.row?.goalkeeper
          const teamHasGoalkeeper = !!lineupPlayers.find(
            (p: { goalkeeper: boolean }) => p.goalkeeper
          )
          const isStar = !!params?.row?.star

          return (
            <>
              <LinkButton
                to={getAdminOrgPlayerRoute(
                  organizationSlug,
                  params.row.playerId
                )}
                target="_blank"
                icon
              >
                <Tooltip arrow title="Profile" placement="top">
                  <AccountBox />
                </Tooltip>
              </LinkButton>
              <ButtonDialog
                icon={
                  <Tooltip arrow title="Remove Player" placement="top">
                    <RemoveCircleOutlineIcon />
                  </Tooltip>
                }
                size="small"
                dialogTitle={'Do you want to remove player from this lineup?'}
                dialogDescription={'You can add player to lineup later'}
                dialogNegativeText={'No, keep player'}
                dialogPositiveText={'Yes, remove player'}
                onDialogClosePositive={() => {
                  updateGame({
                    variables: {
                      where: {
                        gameId,
                      },
                      update: {
                        players: {
                          disconnect: {
                            where: {
                              node: {
                                playerId: params.row.playerId,
                              },
                            },
                          },
                        },
                      },
                    },
                  })
                }}
              />
              {!teamHasCaptain ? (
                <IconButton
                  onClick={() => {
                    setCaptain({ playerId: params.row.playerId, captain: true })
                  }}
                >
                  <Tooltip arrow title="Set Captain" placement="top">
                    <HowToRegIcon />
                  </Tooltip>
                </IconButton>
              ) : (
                !isCaptain && (
                  <span
                    style={{
                      padding: '1.25rem',
                    }}
                  />
                )
              )}
              {isCaptain && (
                <IconButton
                  onClick={() => {
                    setCaptain({
                      playerId: params.row.playerId,
                      captain: false,
                    })
                  }}
                >
                  <Tooltip arrow title="Remove Captain" placement="top">
                    <VerifiedUserIcon />
                  </Tooltip>
                </IconButton>
              )}
              <IconButton
                onClick={() => {
                  setStar({
                    playerId: params.row.playerId,
                    star: !isStar,
                  })
                }}
              >
                <Tooltip
                  arrow
                  title={isStar ? 'Remove Star' : 'Set Star'}
                  placement="top"
                >
                  {isStar ? (
                    <StarIcon sx={{ color: 'rgb(250, 175, 0)' }} />
                  ) : (
                    <StarOutlineIcon />
                  )}
                </Tooltip>
              </IconButton>
              {!teamHasGoalkeeper && (
                <IconButton
                  onClick={() => {
                    setGoalkeeper({
                      playerId: params.row.playerId,
                      goalkeeper: true,
                    })
                  }}
                >
                  <Tooltip arrow title="Set Goalkeeper" placement="top">
                    <AddReactionIcon />
                  </Tooltip>
                </IconButton>
              )}
              {isGoalkeeper && (
                <IconButton
                  onClick={() => {
                    setGoalkeeper({
                      playerId: params.row.playerId,
                      goalkeeper: false,
                    })
                  }}
                >
                  <Tooltip arrow title="Remove Goalkeeper" placement="top">
                    <BalconyIcon />
                  </Tooltip>
                </IconButton>
              )}
            </>
          )
        },
      },
      {
        field: 'avatar',
        headerName: 'Photo',
        width: 80,
        sortable: false,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <XGridLogo
              src={params.value}
              placeholder={placeholderPerson}
              alt={params.row.name}
            />
          )
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },
      {
        field: 'jersey',
        headerName: 'Jersey',
        width: 100,
        renderCell: params => {
          return (
            <>
              <SetLineupJersey
                player={params.row}
                gameId={gameId}
                updateGame={updateGame}
              />
              <span style={{ marginRight: '4px' }}>{params.value}</span>
            </>
          )
        },
      },
      {
        field: 'position',
        headerName: 'Position',
        width: 120,
        renderCell: params => {
          return (
            <>
              <SetLineupPosition
                player={params.row}
                gameId={gameId}
                updateGame={updateGame}
              />
              <span style={{ marginRight: '4px' }}>{params.value}</span>
            </>
          )
        },
      },
      {
        field: 'levelCode',
        headerName: 'Level',
        width: 150,
        renderCell: params => {
          return <PlayerLevel code={params.row.levelCode} />
        },
      },
      {
        field: 'scoredByCount',
        headerName: 'G',
        width: 20,
        disableColumnMenu: true,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'assistsCount',
        headerName: 'A',
        width: 20,
        disableColumnMenu: true,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'points',
        headerName: 'PTS',
        width: 60,
        disableColumnMenu: true,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'penaltyMinutesCount',
        headerName: 'PIM',
        width: 60,
        disableColumnMenu: true,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'info',
        headerName: 'Info',
        width: 120,
        disableColumnMenu: true,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        renderCell: params => {
          const isHattrick = params.row?.scoredByCount >= 3
          const is3Points = params.row?.points >= 3
          return (
            <>
              {isHattrick && (
                <Typography
                  sx={{
                    textTransform: 'uppercase',
                    backgroundColor: '#0faf00',
                    color: '#fff',
                    padding: 1,
                  }}
                  variant="button"
                  display="block"
                >
                  Hattrick!
                </Typography>
              )}
              {!isHattrick && is3Points && (
                <Typography
                  sx={{
                    textTransform: 'uppercase',
                    backgroundColor: '#0672b1',
                    color: '#fff',
                    padding: 1,
                  }}
                  variant="button"
                  display="block"
                >
                  3+ Points!
                </Typography>
              )}
            </>
          )
        },
      },
    ],
    [gameId, lineupPlayers]
  )

  const [tabIndex, setTabIndex] = React.useState(0)

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue)
  }
  return (
    <>
      <Divider sx={{ mt: 2 }}>
        <Title>{`${host ? 'Host' : 'Guest'} lineup${
          team ? `: ${team?.name}` : ''
        }`}</Title>
      </Divider>
      <Tabs
        value={tabIndex}
        onChange={handleChangeTab}
        indicatorColor="primary"
        textColor="inherit"
        variant="fullWidth"
      >
        <Tab label="View lineup" />
        <Tab
          label="Select players for lineup"
          onClick={() => {
            getTeamPlayers()
          }}
        />
      </Tabs>
      <TabPanel value={tabIndex} index={0} dir={'x'}>
        {players.length > 0 && (
          <ButtonDialog
            sx={{ my: 2 }}
            text={'Remove All Players'}
            textLoading={'Removing...'}
            size="small"
            startIcon={<RemoveCircleOutlineIcon />}
            dialogTitle={'Do you want to remove all players from lineup?'}
            dialogDescription={'You can add players to lineup later'}
            dialogNegativeText={'No, keep players'}
            dialogPositiveText={'Yes, remove players'}
            onDialogClosePositive={() => {
              const dataToDisconnect = players.map(player => {
                return {
                  where: {
                    node: {
                      playerId: player?.node?.playerId,
                    },
                  },
                }
              })
              updateGame({
                variables: {
                  where: {
                    gameId,
                  },
                  update: {
                    players: {
                      disconnect: dataToDisconnect,
                    },
                  },
                },
              })
            }}
          />
        )}
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
            density="compact"
            columns={gameLineupColumns}
            rows={lineupPlayers}
            disableSelectionOnClick
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </TabPanel>
      <TabPanel value={tabIndex} index={1} dir={'x'}>
        <TeamPlayersByLastName
          players={queryTeam?.players
            ?.map((p: Player) => addFieldToObjectWithoutDiacritics(p, 'name'))
            .map((p: Player) => setIdFromEntity(p, 'playerId'))}
          gameId={gameId}
          team={team}
          host={host}
          updateGame={updateGame}
          lineupPlayers={lineupPlayers}
        />
      </TabPanel>
    </>
  )
}

const addGroupName = (player: Player) => ({
  ...player,
  groupName: player.lastName.charAt(0),
})
const sortGroupByJersey = (groupArray: any) =>
  R.sort(
    (a: Player, b: Player) =>
      a.jerseys[0] && b.jerseys[0]
        ? a.jerseys[0].number - b.jerseys[0].number
        : -1,
    groupArray
  )

const transform = R.pipe(
  R.map(addGroupName),
  R.groupBy(R.prop('groupName')),
  R.mapObjIndexed(sortGroupByJersey),
  R.toPairs,
  R.sort(R.ascend(R.head))
)

type TeamPlayersByLastNameProps = {
  gameId: string
  team: Team | null
  host: boolean
  updateGame: MutationFunction
  players?: Player[]
  lineupPlayers: Player[]
}

const TeamPlayersByLastName = ({
  players,
  gameId,
  team,
  host,
  updateGame,
  lineupPlayers,
}: TeamPlayersByLastNameProps) => {
  if (!players) return null
  const searchIndexes = ['nameWithoutDiacritics', 'firstName', 'lastName']
  const [searchText, searchData, requestSearch] = useSearch({
    searchIndexes,
    data: players,
  })

  const data = transform(searchData)

  const addPlayerToLineup = (isMember: boolean, player: Player) => {
    const position =
      player?.positions?.filter(p => p.team?.teamId === team?.teamId)?.[0]
        ?.name || null

    const jersey = parseInt(
      player?.jerseys
        ?.filter(p => p.team?.teamId === team?.teamId)?.[0]
        ?.number.toString()
    )

    updateGame({
      variables: {
        where: {
          gameId,
        },
        update: {
          players: {
            ...(isMember
              ? {
                  disconnect: {
                    where: {
                      node: {
                        playerId: player.playerId,
                      },
                    },
                  },
                }
              : {
                  connect: {
                    where: {
                      node: { playerId: player.playerId },
                    },
                    edge: {
                      host,
                      position,
                      jersey,
                      teamId: team?.teamId,
                    },
                  },
                }),
          },
        },
      },
    })
  }

  return (
    <Box sx={{ my: 2 }}>
      <TextField
        fullWidth
        label="Search player"
        variant="standard"
        value={searchText}
        onFocus={event => {
          const target = event.target
          target.select()
        }}
        onChange={e => {
          requestSearch(e.target.value)
        }}
        sx={{ mb: 2 }}
      />
      <Box sx={{ height: '30rem', maxHeight: '30rem', overflow: 'auto' }}>
        {data.map(group => {
          const name = group[0] as string
          const groupPlayers = group[1] as Player[]
          return (
            <div key={name}>
              <Divider>
                <Chip label={name} color="primary" />
              </Divider>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  py: 1,
                }}
              >
                {groupPlayers.map(player => {
                  const isMember = !!lineupPlayers?.find(
                    p => p.playerId === player.playerId
                  )
                  return (
                    <Button
                      type="button"
                      size="medium"
                      key={player.playerId}
                      variant={isMember ? 'outlined' : 'contained'}
                      color="primary"
                      onClick={() => {
                        addPlayerToLineup(isMember, player)
                      }}
                      //  disabled=
                    >
                      <Avatar
                        alt={player.name}
                        src={player.avatar}
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="h5" component="div" sx={{ mr: 1 }}>
                        {player.jerseys.length > 0
                          ? player.jerseys[0].number
                          : ''}
                      </Typography>
                      <Typography variant="body1" component="div">
                        {player.name}
                      </Typography>
                    </Button>
                  )
                })}
              </Box>
            </div>
          )
        })}
      </Box>
    </Box>
  )
}

export { Lineups }
