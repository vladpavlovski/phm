import React, { useState, useCallback } from 'react'

import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'

import Switch from '@mui/material/Switch'
import IconButton from '@mui/material/IconButton'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'

const GET_MEMBERSHIP = gql`
  query getMembership(
    $whereGame: GameWhere
    $whereCompetition: CompetitionWhere
  ) {
    game: games(where: $whereGame) {
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
      phases {
        phaseId
        name
        season {
          nick
        }
      }
      groups {
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

const sortBySeasonNick = (a, b) => {
  if (a?.season && a?.season?.nick < b?.season?.nick) {
    return 1
  }
  if (a?.season && a?.season?.nick > b?.season?.nick) {
    return -1
  }
  return 0
}
const Membership = props => {
  const { gameId } = props
  const classes = useStyles()
  const { organizationSlug } = useParams()
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_MEMBERSHIP)

  const game = queryData?.game?.[0] || {}

  const handleOnChange = useCallback(() => {
    if (!queryData) {
      getData({
        variables: {
          whereGame: {
            gameId,
          },
          whereCompetition: {
            org: {
              urlSlug: organizationSlug,
            },
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
        <Typography className={classes.accordionFormTitle}>
          Membership
        </Typography>
        <Typography className={classes.accordionFormDescription}></Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
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
                  {queryData?.competitions.map(competition => (
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

const CompetitionRow = props => {
  const { competition, game } = props
  const [competitionOpen, setCompetitionOpen] = useState(false)
  const [selectedPhaseId, setSelectedPhaseId] = useState(
    game?.phase?.phaseId || null
  )
  const [selectedGroupId, setSelectedGroupId] = useState(
    game?.group?.groupId || null
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

const PhaseRow = props => {
  const { game, phase, selectedPhaseId, setSelectedPhaseId } = props
  const { enqueueSnackbar } = useSnackbar()

  const [isMember, setIsMember] = useState(
    game?.phase?.phaseId === phase?.phaseId
  )

  const [updateGame, { loading }] = useMutation(UPDATE_GAME, {
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
            setSelectedPhaseId(isMember ? null : phase?.phaseId)

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
          label={loading ? 'thinking...' : isMember ? 'Member' : 'Not member'}
        />
      </TableCell>
    </TableRow>
  )
}

const GroupRow = props => {
  const { game, group, selectedGroupId, setSelectedGroupId } = props
  const { enqueueSnackbar } = useSnackbar()

  const [isMember, setIsMember] = useState(
    game?.group?.groupId === group?.groupId
  )

  const [updateGame, { loading }] = useMutation(UPDATE_GAME, {
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
            setSelectedGroupId(isMember ? null : group?.groupId)
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
          label={loading ? 'thinking...' : isMember ? 'Member' : 'Not member'}
        />
      </TableCell>
    </TableRow>
  )
}

Membership.propTypes = {
  gameId: PropTypes.string,
}

export { Membership }
