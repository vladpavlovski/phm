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
  query getMembership(
    $teamId: ID
    $first: Int
    $offset: Int
    $orderBy: [_AssociationOrdering]
    $filter: _AssociationFilter
  ) {
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
        season {
          seasonId
          name
        }
      }
      phases {
        phaseId
        name
        competition {
          competitionId
        }
      }
      groups {
        groupId
        name
        competition {
          competitionId
        }
      }
      seasons {
        seasonId
        name
        competition {
          competitionId
        }
      }
    }
    associations: Association(
      first: $first
      offset: $offset
      orderBy: $orderBy
      filter: $filter
    ) {
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
        season {
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
        teamId
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
        teamId
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
        teamId
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
        teamId
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
        teamId
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
        teamId
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
        teamId
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
        teamId
      }
    }
  }
`
// TODO: SEASONS!
// const MERGE_TEAM_SEASON = gql`
//   mutation mergeTeamSeason($teamId: ID!, $seasonId: ID!) {
//     teamSeason: MergeTeamSeasons(
//       from: { teamId: $teamId }
//       to: { seasonId: $seasonId }
//     ) {
//       from {
//         teamId
//       }
//     }
//   }
// `

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

  const [associationMember, setAssociationMember] = useState(
    !!team.associations.find(a => a.associationId === association.associationId)
  )
  const [associationOpen, setAssociationOpen] = useState(false)

  const [mergeTeamAssociation, { loading }] = useMutation(
    associationMember ? REMOVE_TEAM_ASSOCIATION : MERGE_TEAM_ASSOCIATION,
    {
      onCompleted: () => {
        enqueueSnackbar('Association membership successfully changed!', {
          variant: 'success',
        })
        setAssociationMember(!associationMember)
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
                checked={associationMember}
                onChange={() => {
                  mergeTeamAssociation({
                    variables: {
                      teamId: team.teamId,
                      associationId: association.associationId,
                    },
                  })
                }}
                name="associationMember"
                color="primary"
              />
            }
            label={
              loading
                ? 'thinking...'
                : associationMember
                ? 'Member'
                : 'Not member'
            }
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

  const [competitionMember, setCompetitionMember] = useState(
    !!team.competitions.find(c => c.competitionId === competition.competitionId)
  )
  const [competitionOpen, setCompetitionOpen] = useState(false)

  const [mergeTeamCompetition, { loading }] = useMutation(
    competitionMember ? REMOVE_TEAM_COMPETITION : MERGE_TEAM_COMPETITION,
    {
      onCompleted: () => {
        enqueueSnackbar('Competition membership successfully changed!', {
          variant: 'success',
        })
        setCompetitionMember(!competitionMember)
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
                checked={competitionMember}
                onChange={() => {
                  mergeTeamCompetition({
                    variables: {
                      teamId: team.teamId,
                      competitionId: competition.competitionId,
                    },
                  })
                }}
                name="competitionMember"
                color="primary"
              />
            }
            label={
              loading
                ? 'thinking...'
                : competitionMember
                ? 'Member'
                : 'Not member'
            }
          />
        </TableCell>
        <TableCell align="right">{competition.phases.length}</TableCell>
        <TableCell align="right">{competition.groups.length}</TableCell>
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
              <Table aria-label="phases" style={{ background: '#f8f8fe' }}>
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
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

const PhaseRow = props => {
  const { team, phase } = props
  const { enqueueSnackbar } = useSnackbar()

  const [phaseMember, setPhaseMember] = useState(
    !!team.phases.find(p => p.phaseId === phase.phaseId)
  )

  const [mergeTeamPhase, { loading }] = useMutation(
    phaseMember ? REMOVE_TEAM_PHASE : MERGE_TEAM_PHASE,
    {
      onCompleted: () => {
        enqueueSnackbar('Phase membership successfully changed!', {
          variant: 'success',
        })
        setPhaseMember(!phaseMember)
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
              checked={phaseMember}
              onChange={() => {
                mergeTeamPhase({
                  variables: {
                    teamId: team.teamId,
                    phaseId: phase.phaseId,
                  },
                })
              }}
              name="competitionMember"
              color="primary"
            />
          }
          label={
            loading ? 'thinking...' : phaseMember ? 'Member' : 'Not member'
          }
        />
      </TableCell>
    </TableRow>
  )
}

const GroupRow = props => {
  const { team, group } = props
  const { enqueueSnackbar } = useSnackbar()

  const [groupMember, setGroupMember] = useState(
    !!team.groups.find(g => g.groupId === group.groupId)
  )

  const [mergeTeamGroup, { loading }] = useMutation(
    groupMember ? REMOVE_TEAM_GROUP : MERGE_TEAM_GROUP,
    {
      onCompleted: () => {
        enqueueSnackbar('Phase membership successfully changed!', {
          variant: 'success',
        })
        setGroupMember(!groupMember)
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
              checked={groupMember}
              onChange={() => {
                mergeTeamGroup({
                  variables: {
                    teamId: team.teamId,
                    groupId: group.groupId,
                  },
                })
              }}
              name="competitionMember"
              color="primary"
            />
          }
          label={
            loading ? 'thinking...' : groupMember ? 'Member' : 'Not member'
          }
        />
      </TableCell>
    </TableRow>
  )
}

Membership.propTypes = {
  teamId: PropTypes.string,
}

export { Membership }
