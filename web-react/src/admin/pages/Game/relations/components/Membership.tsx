import { Error } from 'components/Error'
import { Loader } from 'components/Loader'
import { useSnackbar } from 'notistack'
import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Competition, Game, Group, Phase, Season } from 'utils/types'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

const GET_MEMBERSHIP = gql`
  query getMembership(
    $whereGame: GameWhere
    $whereCompetition: CompetitionWhere
  ) {
    games(where: $whereGame) {
      gameId
      name
      phase {
        phaseId
      }
      group {
        groupId
      }
    }
    competitions(where: $whereCompetition) {
      competitionId
      name
      phases(where: { status: RUNNING }) {
        phaseId
        name
        season {
          nick
        }
      }
      groups(where: { status: RUNNING }) {
        groupId
        name
        season {
          nick
        }
      }
      seasons {
        seasonId
        name
      }
    }
  }
`

const UPDATE_GAME = gql`
  mutation updateGame($where: GameWhere, $update: GameUpdateInput) {
    updateGame: updateGames(where: $where, update: $update) {
      games {
        gameId
      }
    }
  }
`

const sortBySeasonNick = (a: { season: Season }, b: { season: Season }) => {
  if (a?.season && a?.season?.nick < b?.season?.nick) {
    return 1
  }
  if (a?.season && a?.season?.nick > b?.season?.nick) {
    return -1
  }
  return 0
}

type TParams = {
  organizationSlug: string
}

type TMembership = {
  gameId: string
}

const Membership: React.FC<TMembership> = props => {
  const { gameId } = props
  const { organizationSlug } = useParams<TParams>()
  const [
    getData,
    {
      loading: queryLoading,
      error: queryError,
      data: { games: [game], competitions } = { games: [], competitions: [] },
    },
  ] = useLazyQuery(GET_MEMBERSHIP)

  const handleOnChange = useCallback(() => {
    if (!game) {
      getData({
        variables: {
          whereGame: {
            gameId,
          },
          whereCompetition: {
            org: {
              urlSlug: organizationSlug,
            },
            status: 'RUNNING',
          },
        },
      })
    }
  }, [])

  return (
    <Accordion onChange={handleOnChange}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="membership-content"
        id="membership-header"
      >
        <Typography>Membership</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
        {game && (
          <>
            <TableContainer>
              <Typography variant="h6" gutterBottom component="div">
                Competitions
              </Typography>
              <Table
                aria-label="competitions"
                style={{ background: '#fafafc' }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Phases</TableCell>
                    <TableCell align="right">Groups</TableCell>
                    <TableCell align="right">Seasons</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {competitions.map((competition: Competition) => (
                    <CompetitionRow
                      key={competition.competitionId}
                      game={game}
                      competition={competition}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

type TCompetitionRow = {
  competition: Competition
  game: Game
}

const CompetitionRow: React.FC<TCompetitionRow> = props => {
  const { competition, game } = props
  const [competitionOpen, setCompetitionOpen] = useState(false)
  const [selectedPhaseId, setSelectedPhaseId] = useState(
    game?.phase?.phaseId || ''
  )
  const [selectedGroupId, setSelectedGroupId] = useState(
    game?.group?.groupId || ''
  )
  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setCompetitionOpen(!competitionOpen)}
          >
            {competitionOpen ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {competition.name}
        </TableCell>
        <TableCell align="right">{competition.phases.length}</TableCell>
        <TableCell align="right">{competition.groups.length}</TableCell>
        <TableCell align="right">{competition.seasons.length}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={competitionOpen} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Phases
              </Typography>
              <Table aria-label="phases" style={{ background: '#f8f8fe' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="left">Season</TableCell>
                    <TableCell align="left">Member</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...competition.phases].sort(sortBySeasonNick).map(phase => (
                    <PhaseRow
                      key={phase.phaseId}
                      game={game}
                      phase={phase}
                      selectedPhaseId={selectedPhaseId}
                      setSelectedPhaseId={setSelectedPhaseId}
                    />
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Groups
              </Typography>
              <Table aria-label="phases" style={{ background: '#fff' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="left">Season</TableCell>
                    <TableCell align="left">Member</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...competition.groups].sort(sortBySeasonNick).map(group => (
                    <GroupRow
                      key={group.groupId}
                      game={game}
                      group={group}
                      selectedGroupId={selectedGroupId}
                      setSelectedGroupId={setSelectedGroupId}
                    />
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

type TPhaseRow = {
  game: Game
  phase: Phase
  selectedPhaseId: string
  setSelectedPhaseId: React.Dispatch<React.SetStateAction<string>>
}

const PhaseRow: React.FC<TPhaseRow> = props => {
  const { game, phase, selectedPhaseId, setSelectedPhaseId } = props
  const { enqueueSnackbar } = useSnackbar()

  const [isMember, setIsMember] = useState(
    game?.phase?.phaseId === phase?.phaseId
  )

  const [updateGame] = useMutation(UPDATE_GAME, {
    onCompleted: () => {
      enqueueSnackbar('Game updated!', { variant: 'success' })
      setIsMember(!isMember)
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
    },
  })

  const isDisabled = React.useMemo(() => {
    if (selectedPhaseId === phase?.phaseId) return false
    return game?.phase === null && !selectedPhaseId ? false : true
  }, [selectedPhaseId, phase])

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {phase?.name}
      </TableCell>
      <TableCell align="left">{phase?.season?.nick}</TableCell>
      <TableCell align="left">
        <Switch
          checked={isMember}
          disabled={isDisabled}
          onChange={() => {
            setSelectedPhaseId(isMember ? '' : phase?.phaseId)

            updateGame({
              variables: {
                where: {
                  gameId: game?.gameId,
                },
                update: {
                  phase: {
                    ...(!isMember && {
                      connect: {
                        where: {
                          node: { phaseId: phase?.phaseId },
                        },
                      },
                    }),
                    ...(isMember && {
                      disconnect: {
                        where: {
                          node: {
                            phaseId: phase?.phaseId,
                          },
                        },
                      },
                    }),
                  },
                },
              },
            })
          }}
          name="isMember"
          color="primary"
        />
      </TableCell>
    </TableRow>
  )
}

type TGroupRow = {
  game: Game
  group: Group
  selectedGroupId: string
  setSelectedGroupId: React.Dispatch<React.SetStateAction<string>>
}

const GroupRow: React.FC<TGroupRow> = props => {
  const { game, group, selectedGroupId, setSelectedGroupId } = props
  const { enqueueSnackbar } = useSnackbar()

  const [isMember, setIsMember] = useState(
    game?.group?.groupId === group?.groupId
  )

  const [updateGame] = useMutation(UPDATE_GAME, {
    onCompleted: () => {
      enqueueSnackbar('Game updated!', { variant: 'success' })
      setIsMember(!isMember)
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
    },
  })

  const isDisabled = React.useMemo(() => {
    if (selectedGroupId === group?.groupId) return false
    return game?.group === null && !selectedGroupId ? false : true
  }, [selectedGroupId, group])

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {group.name}
      </TableCell>
      <TableCell align="left">{group?.season?.nick}</TableCell>
      <TableCell align="left">
        <Switch
          checked={isMember}
          disabled={isDisabled}
          onChange={() => {
            setSelectedGroupId(isMember ? '' : group?.groupId)
            updateGame({
              variables: {
                where: {
                  gameId: game?.gameId,
                },
                update: {
                  group: {
                    ...(!isMember && {
                      connect: {
                        where: {
                          node: { groupId: group.groupId },
                        },
                      },
                    }),
                    ...(isMember && {
                      disconnect: {
                        where: {
                          node: {
                            groupId: group.groupId,
                          },
                        },
                      },
                    }),
                  },
                },
              },
            })
          }}
          name="isMember"
          color="primary"
        />
      </TableCell>
    </TableRow>
  )
}

export { Membership }
