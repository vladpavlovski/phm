import React, { useState, useCallback, useMemo } from 'react'

import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

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
import Checkbox from '@material-ui/core/Checkbox'
import IconButton from '@material-ui/core/IconButton'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'

const READ_MEMBERSHIP = gql`
  query getMembership($teamId: ID) {
    team: Team(teamId: $teamId) {
      teamId
      name
      associations {
        associationId
        name
      }
      competitions {
        competitionId
        name
        association {
          associationId
        }
        phases {
          phaseId
          name
        }
        groups {
          groupId
          name
        }
        seasons {
          seasonId
          name
        }
      }
      phases {
        phaseId
        name
      }
      groups {
        groupId
        name
      }
      seasons {
        seasonId
        name
      }
    }
    associations: Association {
      associationId
      name
      competitions {
        competitionId
        name
        phases {
          phaseId
          name
        }
        groups {
          groupId
          name
        }
        seasons {
          seasonId
          name
        }
      }
    }
  }
`
const MERGE_TEAM_ASSOCIATION = gql`
  mutation mergeTeamAssociation($teamId: ID!, $associationId: ID!) {
    teamAssociation: MergeTeamAssociations(
      from: { teamId: $teamId }
      to: { associationId: $associationId }
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

const REMOVE_TEAM_ASSOCIATION = gql`
  mutation removeTeamAssociation($teamId: ID!, $associationId: ID!) {
    teamAssociation: RemoveTeamAssociations(
      from: { teamId: $teamId }
      to: { associationId: $associationId }
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

const MERGE_TEAM_COMPETITION = gql`
  mutation mergeTeamCompetition($teamId: ID!, $competitionId: ID!) {
    teamCompetition: MergeTeamCompetitions(
      from: { teamId: $teamId }
      to: { competitionId: $competitionId }
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
const REMOVE_TEAM_COMPETITION = gql`
  mutation removeTeamCompetition($teamId: ID!, $competitionId: ID!) {
    teamCompetition: RemoveTeamCompetitions(
      from: { teamId: $teamId }
      to: { competitionId: $competitionId }
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

const MERGE_TEAM_PHASE = gql`
  mutation mergeTeamPhase($teamId: ID!, $phaseId: ID!) {
    teamPhase: MergeTeamPhases(
      from: { teamId: $teamId }
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

const REMOVE_TEAM_PHASE = gql`
  mutation removeTeamPhase($teamId: ID!, $phaseId: ID!) {
    teamPhase: RemoveTeamPhases(
      from: { teamId: $teamId }
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

const MERGE_TEAM_GROUP = gql`
  mutation mergeTeamGroup($teamId: ID!, $groupId: ID!) {
    teamGroup: MergeTeamGroups(
      from: { teamId: $teamId }
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

const REMOVE_TEAM_GROUP = gql`
  mutation removeTeamGroup($teamId: ID!, $groupId: ID!) {
    teamGroup: RemoveTeamGroups(
      from: { teamId: $teamId }
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

const MERGE_TEAM_SEASON = gql`
  mutation mergeTeamSeason($teamId: ID!, $seasonId: ID!) {
    teamSeason: MergeTeamSeasons(
      from: { teamId: $teamId }
      to: { seasonId: $seasonId }
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

const REMOVE_TEAM_SEASON = gql`
  mutation removeTeamSeasons($teamId: ID!, $seasonId: ID!) {
    teamSeason: RemoveTeamSeasons(
      from: { teamId: $teamId }
      to: { seasonId: $seasonId }
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

const Membership = props => {
  const { teamId } = props
  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(READ_MEMBERSHIP)

  const team = useMemo(() => queryData && queryData.team && queryData.team[0], [
    queryData,
  ])

  const handleOnChange = useCallback(() => {
    if (!queryData) {
      getData({ variables: { teamId } })
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
                Associations
              </Typography>
              <Table aria-label="collapsible table">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Name</TableCell>
                    <TableCell align="left">Member</TableCell>
                    <TableCell align="right">Competitions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {queryData.associations.map(row => (
                    <AssociationRow
                      key={row.associationId}
                      association={row}
                      team={team}
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

const AssociationRow = props => {
  const { association, team } = props
  const { enqueueSnackbar } = useSnackbar()

  const [isMember, setIsMember] = useState(
    !!team.associations.find(a => a.associationId === association.associationId)
  )
  const [associationOpen, setAssociationOpen] = useState(false)

  const [mergeTeamAssociation, { loading }] = useMutation(
    isMember ? REMOVE_TEAM_ASSOCIATION : MERGE_TEAM_ASSOCIATION,
    {
      onCompleted: data => {
        const { teamAssociation } = data
        const phrase = isMember
          ? `${teamAssociation.from.name} is not in ${teamAssociation.to.name} association`
          : `${teamAssociation.from.name} participate in ${teamAssociation.to.name} association`

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
  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setAssociationOpen(!associationOpen)}
          >
            {associationOpen ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {association.name}
        </TableCell>
        <TableCell align="left">
          <FormControlLabel
            control={
              <Checkbox
                checked={isMember}
                onChange={() => {
                  mergeTeamAssociation({
                    variables: {
                      teamId: team.teamId,
                      associationId: association.associationId,
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
        <TableCell align="right">{association.competitions.length}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={associationOpen} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
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
                    <TableCell align="left">Member</TableCell>
                    <TableCell align="right">Phases</TableCell>
                    <TableCell align="right">Groups</TableCell>
                    <TableCell align="right">Seasons</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {association.competitions.map(competition => (
                    <CompetitionRow
                      key={competition.competitionId}
                      team={team}
                      competition={competition}
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

const CompetitionRow = props => {
  const { competition, team } = props
  const { enqueueSnackbar } = useSnackbar()

  const [isMember, setIsMember] = useState(
    !!team.competitions.find(c => c.competitionId === competition.competitionId)
  )
  const [competitionOpen, setCompetitionOpen] = useState(false)

  const [mergeTeamCompetition, { loading }] = useMutation(
    isMember ? REMOVE_TEAM_COMPETITION : MERGE_TEAM_COMPETITION,
    {
      onCompleted: data => {
        const { teamCompetition } = data
        const phrase = isMember
          ? `${teamCompetition.from.name} is not in ${teamCompetition.to.name} competition`
          : `${teamCompetition.from.name} participate in ${teamCompetition.to.name} competition`

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
        <TableCell align="left">
          <FormControlLabel
            control={
              <Checkbox
                checked={isMember}
                onChange={() => {
                  mergeTeamCompetition({
                    variables: {
                      teamId: team.teamId,
                      competitionId: competition.competitionId,
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
                    <TableCell align="left">Member</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {competition.phases.map(phase => (
                    <PhaseRow key={phase.phaseId} team={team} phase={phase} />
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
                    <TableCell align="left">Member</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {competition.groups.map(group => (
                    <GroupRow key={group.groupId} team={team} group={group} />
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Seasons
              </Typography>
              <Table aria-label="phases" style={{ background: '#f8f8fe' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="left">Member</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {competition.seasons.map(season => (
                    <SeasonRow
                      key={season.seasonId}
                      team={team}
                      season={season}
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
  const { team, phase } = props
  const { enqueueSnackbar } = useSnackbar()

  const [isMember, setIsMember] = useState(
    !!team.phases.find(p => p.phaseId === phase.phaseId)
  )

  const [mergeTeamPhase, { loading }] = useMutation(
    isMember ? REMOVE_TEAM_PHASE : MERGE_TEAM_PHASE,
    {
      onCompleted: data => {
        const { teamPhase } = data
        const phrase = isMember
          ? `${teamPhase.from.name} is not in ${teamPhase.to.name} phase`
          : `${teamPhase.from.name} participate in ${teamPhase.to.name} phase`
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

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {phase.name}
      </TableCell>
      <TableCell align="left">
        <FormControlLabel
          control={
            <Checkbox
              checked={isMember}
              onChange={() => {
                mergeTeamPhase({
                  variables: {
                    teamId: team.teamId,
                    phaseId: phase.phaseId,
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
  const { team, group } = props
  const { enqueueSnackbar } = useSnackbar()

  const [isMember, setIsMember] = useState(
    !!team.groups.find(g => g.groupId === group.groupId)
  )

  const [mergeTeamGroup, { loading }] = useMutation(
    isMember ? REMOVE_TEAM_GROUP : MERGE_TEAM_GROUP,
    {
      onCompleted: data => {
        const { teamGroup } = data
        const phrase = isMember
          ? `${teamGroup.from.name} is not in ${teamGroup.to.name} group`
          : `${teamGroup.from.name} participate in ${teamGroup.to.name} group`
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

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {group.name}
      </TableCell>
      <TableCell align="left">
        <FormControlLabel
          control={
            <Checkbox
              checked={isMember}
              onChange={() => {
                mergeTeamGroup({
                  variables: {
                    teamId: team.teamId,
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

const SeasonRow = props => {
  const { team, season } = props
  const { enqueueSnackbar } = useSnackbar()

  const [isMember, setIsMember] = useState(
    !!team.seasons.find(g => g.seasonId === season.seasonId)
  )

  const [mergeTeamGroup, { loading }] = useMutation(
    isMember ? REMOVE_TEAM_SEASON : MERGE_TEAM_SEASON,
    {
      onCompleted: data => {
        const { teamSeason } = data
        const phrase = isMember
          ? `${teamSeason.from.name} is not in ${teamSeason.to.name} season`
          : `${teamSeason.from.name} participate in ${teamSeason.to.name} season`
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

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {season.name}
      </TableCell>
      <TableCell align="left">
        <FormControlLabel
          control={
            <Checkbox
              checked={isMember}
              onChange={() => {
                mergeTeamGroup({
                  variables: {
                    teamId: team.teamId,
                    seasonId: season.seasonId,
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
  teamId: PropTypes.string,
}

export { Membership }
