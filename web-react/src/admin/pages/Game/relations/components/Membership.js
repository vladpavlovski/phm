import React, { useState, useCallback } from 'react'

import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Box from '@material-ui/core/Box'
import Collapse from '@material-ui/core/Collapse'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import IconButton from '@material-ui/core/IconButton'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'

const GET_MEMBERSHIP = gql`
  query getMembership($gameId: ID!, $organizationSlug: String!) {
    game: Game(gameId: $gameId) {
      gameId
      name
      phase {
        phaseId
      }
      group {
        groupId
      }
    }
    competitions: competitionsByOrganization(
      organizationSlug: $organizationSlug
    ) {
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

const MERGE_GAME_PHASE = gql`
  mutation mergeGamePhase($gameId: ID!, $phaseId: ID!) {
    gamePhase: MergeGamePhase(
      from: { gameId: $gameId }
      to: { phaseId: $phaseId }
    ) {
      from {
        name
      }
      to {
        name
      }
    }
  }
`

const REMOVE_GAME_PHASE = gql`
  mutation removeGamePhase($gameId: ID!, $phaseId: ID!) {
    gamePhase: RemoveGamePhase(
      from: { gameId: $gameId }
      to: { phaseId: $phaseId }
    ) {
      from {
        name
      }
      to {
        name
      }
    }
  }
`

const MERGE_GAME_GROUP = gql`
  mutation mergeGameGroup($gameId: ID!, $groupId: ID!) {
    gameGroup: MergeGameGroup(
      from: { gameId: $gameId }
      to: { groupId: $groupId }
    ) {
      from {
        name
      }
      to {
        name
      }
    }
  }
`

const REMOVE_GAME_GROUP = gql`
  mutation removeGameGroup($gameId: ID!, $groupId: ID!) {
    gameGroup: RemoveGameGroup(
      from: { gameId: $gameId }
      to: { groupId: $groupId }
    ) {
      from {
        name
      }
      to {
        name
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
      getData({ variables: { organizationSlug, gameId } })
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

  const [mergeGamePhase, { loading }] = useMutation(
    isMember ? REMOVE_GAME_PHASE : MERGE_GAME_PHASE,
    {
      onCompleted: data => {
        const { gamePhase } = data
        const phrase = isMember
          ? `${gamePhase.from.name} is not in ${gamePhase.to.name} phase`
          : `${gamePhase.from.name} participate in ${gamePhase.to.name} phase`
        enqueueSnackbar(phrase, {
          variant: isMember ? 'info' : 'success',
        })
        setIsMember(!isMember)
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
      },
    }
  )

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
        <FormControlLabel
          control={
            <Switch
              checked={isMember}
              disabled={isDisabled}
              onChange={() => {
                setSelectedPhaseId(isMember ? null : phase?.phaseId)
                mergeGamePhase({
                  variables: {
                    gameId: game?.gameId,
                    phaseId: phase?.phaseId,
                  },
                })
              }}
              name="isMember"
              color="primary"
            />
          }
          label={loading ? 'thinking...' : isMember ? 'Member' : 'Not member'}
        />
      </TableCell>
    </TableRow>
  )
}

const GroupRow = props => {
  const { game, group, selectedGroupId, setSelectedGroupId } = props
  const { enqueueSnackbar } = useSnackbar()
  // !!game.groups.find(g => g.groupId === group.groupId)
  const [isMember, setIsMember] = useState(
    game?.group?.groupId === group?.groupId
  )

  const [mergeGameGroup, { loading }] = useMutation(
    isMember ? REMOVE_GAME_GROUP : MERGE_GAME_GROUP,
    {
      onCompleted: data => {
        const { gameGroup } = data
        const phrase = isMember
          ? `${gameGroup.from.name} is not in ${gameGroup.to.name} group`
          : `${gameGroup.from.name} participate in ${gameGroup.to.name} group`
        enqueueSnackbar(phrase, {
          variant: isMember ? 'info' : 'success',
        })
        setIsMember(!isMember)
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
      },
    }
  )

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
        <FormControlLabel
          control={
            <Switch
              checked={isMember}
              disabled={isDisabled}
              onChange={() => {
                setSelectedGroupId(isMember ? null : group?.groupId)
                mergeGameGroup({
                  variables: {
                    gameId: game.gameId,
                    groupId: group.groupId,
                  },
                })
              }}
              name="isMember"
              color="primary"
            />
          }
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
