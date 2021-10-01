import React, { useState, useCallback } from 'react'

import { gql, useLazyQuery } from '@apollo/client'
import PropTypes from 'prop-types'
// import { useSnackbar } from 'notistack'

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
  query getMembership($where: TeamWhere) {
    teams(where: $where) {
      teamId
      name
      orgs {
        organizationId
        name
      }
      competitions {
        competitionId
        name
        org {
          organizationId
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
    organizations {
      organizationId
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
// const MERGE_TEAM_ORGANIZATION = gql`
//   mutation mergeTeamOrganization($teamId: ID!, $organizationId: ID!) {
//     teamOrganization: MergeTeamOrganizations(
//       from: { teamId: $teamId }
//       to: { organizationId: $organizationId }
//     ) {
//       from {
//         name
//       }
//       to {
//         name
//       }
//     }
//   }
// `

// const REMOVE_TEAM_ORGANIZATION = gql`
//   mutation removeTeamOrganization($teamId: ID!, $organizationId: ID!) {
//     teamOrganization: RemoveTeamOrganizations(
//       from: { teamId: $teamId }
//       to: { organizationId: $organizationId }
//     ) {
//       from {
//         name
//       }
//       to {
//         name
//       }
//     }
//   }
// `

// const MERGE_TEAM_COMPETITION = gql`
//   mutation mergeTeamCompetition($teamId: ID!, $competitionId: ID!) {
//     teamCompetition: MergeTeamCompetitions(
//       from: { teamId: $teamId }
//       to: { competitionId: $competitionId }
//     ) {
//       from {
//         name
//       }
//       to {
//         name
//       }
//     }
//   }
// `
// const REMOVE_TEAM_COMPETITION = gql`
//   mutation removeTeamCompetition($teamId: ID!, $competitionId: ID!) {
//     teamCompetition: RemoveTeamCompetitions(
//       from: { teamId: $teamId }
//       to: { competitionId: $competitionId }
//     ) {
//       from {
//         name
//       }
//       to {
//         name
//       }
//     }
//   }
// `

// const MERGE_TEAM_PHASE = gql`
//   mutation mergeTeamPhase($teamId: ID!, $phaseId: ID!) {
//     teamPhase: MergeTeamPhases(
//       from: { teamId: $teamId }
//       to: { phaseId: $phaseId }
//     ) {
//       from {
//         name
//       }
//       to {
//         name
//       }
//     }
//   }
// `

// const REMOVE_TEAM_PHASE = gql`
//   mutation removeTeamPhase($teamId: ID!, $phaseId: ID!) {
//     teamPhase: RemoveTeamPhases(
//       from: { teamId: $teamId }
//       to: { phaseId: $phaseId }
//     ) {
//       from {
//         name
//       }
//       to {
//         name
//       }
//     }
//   }
// `

// const MERGE_TEAM_GROUP = gql`
//   mutation mergeTeamGroup($teamId: ID!, $groupId: ID!) {
//     teamGroup: MergeTeamGroups(
//       from: { teamId: $teamId }
//       to: { groupId: $groupId }
//     ) {
//       from {
//         name
//       }
//       to {
//         name
//       }
//     }
//   }
// `

// const REMOVE_TEAM_GROUP = gql`
//   mutation removeTeamGroup($teamId: ID!, $groupId: ID!) {
//     teamGroup: RemoveTeamGroups(
//       from: { teamId: $teamId }
//       to: { groupId: $groupId }
//     ) {
//       from {
//         name
//       }
//       to {
//         name
//       }
//     }
//   }
// `

// const MERGE_TEAM_SEASON = gql`
//   mutation mergeTeamSeason($teamId: ID!, $seasonId: ID!) {
//     teamSeason: MergeTeamSeasons(
//       from: { teamId: $teamId }
//       to: { seasonId: $seasonId }
//     ) {
//       from {
//         name
//       }
//       to {
//         name
//       }
//     }
//   }
// `

// const REMOVE_TEAM_SEASON = gql`
//   mutation removeTeamSeasons($teamId: ID!, $seasonId: ID!) {
//     teamSeason: RemoveTeamSeasons(
//       from: { teamId: $teamId }
//       to: { seasonId: $seasonId }
//     ) {
//       from {
//         name
//       }
//       to {
//         name
//       }
//     }
//   }
// `

const Membership = props => {
  const { teamId, updateTeam } = props
  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_MEMBERSHIP, {
    variables: { where: { teamId } },
  })

  // const team = useMemo(() => queryData && queryData.team && queryData.team[0], [
  //   queryData,
  // ])

  const handleOnChange = useCallback(() => {
    if (!queryData) {
      getData()
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
                Organizations
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
                  {queryData.organizations.map(row => (
                    <OrganizationRow
                      key={row.organizationId}
                      organization={row}
                      team={queryData?.teams?.[0]}
                      updateTeam={updateTeam}
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

const OrganizationRow = props => {
  const { organization, team, updateTeam } = props
  // const { enqueueSnackbar } = useSnackbar()

  const [isMember, setIsMember] = useState(
    !!team.orgs.find(a => a.organizationId === organization.organizationId)
  )
  const [organizationOpen, setOrganizationOpen] = useState(false)

  // const [mergeTeamOrganization, { loading }] = useMutation(
  //   isMember ? REMOVE_TEAM_ORGANIZATION : MERGE_TEAM_ORGANIZATION,
  //   {
  //     onCompleted: data => {
  //       const { teamOrganization } = data
  //       const phrase = isMember
  //         ? `${teamOrganization.from.name} is not in ${teamOrganization.to.name} organization`
  //         : `${teamOrganization.from.name} participate in ${teamOrganization.to.name} organization`

  //       enqueueSnackbar(phrase, {
  //         variant: isMember ? 'info' : 'success',
  //       })
  //       setIsMember(!isMember)
  //     },
  //     onError: error => {
  //       enqueueSnackbar(`Error happened :( ${error}`, {
  //         variant: 'error',
  //       })
  //     },
  //   }
  // )
  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOrganizationOpen(!organizationOpen)}
          >
            {organizationOpen ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {organization.name}
        </TableCell>
        <TableCell align="left">
          <Switch
            checked={isMember}
            onChange={() => {
              setIsMember(!isMember)
              updateTeam({
                variables: {
                  where: {
                    teamId: team.teamId,
                  },
                  update: {
                    orgs: {
                      ...(!isMember
                        ? {
                            connect: {
                              where: {
                                node: {
                                  organizationId: organization.organizationId,
                                },
                              },
                            },
                          }
                        : {
                            disconnect: {
                              where: {
                                node: {
                                  organizationId: organization.organizationId,
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
            label={isMember ? 'Member' : 'Not member'}
          />
        </TableCell>
        <TableCell align="right">{organization.competitions.length}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={organizationOpen} timeout="auto" unmountOnExit>
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
                  {organization.competitions.map(competition => (
                    <CompetitionRow
                      key={competition.competitionId}
                      team={team}
                      competition={competition}
                      updateTeam={updateTeam}
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
  const { competition, team, updateTeam } = props
  // const { enqueueSnackbar } = useSnackbar()

  const [isMember, setIsMember] = useState(
    !!team.competitions.find(c => c.competitionId === competition.competitionId)
  )
  const [competitionOpen, setCompetitionOpen] = useState(false)

  // const [mergeTeamCompetition, { loading }] = useMutation(
  //   isMember ? REMOVE_TEAM_COMPETITION : MERGE_TEAM_COMPETITION,
  //   {
  //     onCompleted: data => {
  //       const { teamCompetition } = data
  //       const phrase = isMember
  //         ? `${teamCompetition.from.name} is not in ${teamCompetition.to.name} competition`
  //         : `${teamCompetition.from.name} participate in ${teamCompetition.to.name} competition`

  //       enqueueSnackbar(phrase, {
  //         variant: isMember ? 'info' : 'success',
  //       })
  //       setIsMember(!isMember)
  //     },
  //     onError: error => {
  //       enqueueSnackbar(`Error happened :( ${error}`, {
  //         variant: 'error',
  //       })
  //     },
  //   }
  // )
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
          <Switch
            checked={isMember}
            onChange={() => {
              setIsMember(!isMember)
              updateTeam({
                variables: {
                  where: {
                    teamId: team.teamId,
                  },
                  update: {
                    competitions: {
                      ...(!isMember
                        ? {
                            connect: {
                              where: {
                                node: {
                                  competitionId: competition.competitionId,
                                },
                              },
                            },
                          }
                        : {
                            disconnect: {
                              where: {
                                node: {
                                  competitionId: competition.competitionId,
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
            label={isMember ? 'Member' : 'Not member'}
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
                    <PhaseRow
                      key={phase.phaseId}
                      team={team}
                      phase={phase}
                      updateTeam={updateTeam}
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
                    <TableCell align="left">Member</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {competition.groups.map(group => (
                    <GroupRow
                      key={group.groupId}
                      team={team}
                      group={group}
                      updateTeam={updateTeam}
                    />
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
                      updateTeam={updateTeam}
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
  const { team, phase, updateTeam } = props

  const [isMember, setIsMember] = useState(
    !!team.phases.find(p => p.phaseId === phase.phaseId)
  )

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {phase.name}
      </TableCell>
      <TableCell align="left">
        <Switch
          checked={isMember}
          onChange={() => {
            setIsMember(!isMember)
            updateTeam({
              variables: {
                where: {
                  teamId: team.teamId,
                },
                update: {
                  phases: {
                    ...(!isMember
                      ? {
                          connect: {
                            where: {
                              node: {
                                phaseId: phase.phaseId,
                              },
                            },
                          },
                        }
                      : {
                          disconnect: {
                            where: {
                              node: {
                                phaseId: phase.phaseId,
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
          label={isMember ? 'Member' : 'Not member'}
        />
      </TableCell>
    </TableRow>
  )
}

const GroupRow = props => {
  const { team, group, updateTeam } = props
  // const { enqueueSnackbar } = useSnackbar()

  const [isMember, setIsMember] = useState(
    !!team.groups.find(g => g.groupId === group.groupId)
  )

  // const [mergeTeamGroup, { loading }] = useMutation(
  //   isMember ? REMOVE_TEAM_GROUP : MERGE_TEAM_GROUP,
  //   {
  //     onCompleted: data => {
  //       const { teamGroup } = data
  //       const phrase = isMember
  //         ? `${teamGroup.from.name} is not in ${teamGroup.to.name} group`
  //         : `${teamGroup.from.name} participate in ${teamGroup.to.name} group`
  //       enqueueSnackbar(phrase, {
  //         variant: isMember ? 'info' : 'success',
  //       })
  //       setIsMember(!isMember)
  //     },
  //     onError: error => {
  //       enqueueSnackbar(`Error happened :( ${error}`, {
  //         variant: 'error',
  //       })
  //     },
  //   }
  // )

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {group.name}
      </TableCell>
      <TableCell align="left">
        <Switch
          checked={isMember}
          onChange={() => {
            setIsMember(!isMember)
            updateTeam({
              variables: {
                where: {
                  teamId: team.teamId,
                },
                update: {
                  groups: {
                    ...(!isMember
                      ? {
                          connect: {
                            where: {
                              node: {
                                groupId: group.groupId,
                              },
                            },
                          },
                        }
                      : {
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
          label={isMember ? 'Member' : 'Not member'}
        />
      </TableCell>
    </TableRow>
  )
}

const SeasonRow = props => {
  const { team, season, updateTeam } = props

  const [isMember, setIsMember] = useState(
    !!team.seasons.find(g => g.seasonId === season.seasonId)
  )

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {season.name}
      </TableCell>
      <TableCell align="left">
        <Switch
          checked={isMember}
          onChange={() => {
            setIsMember(!isMember)
            updateTeam({
              variables: {
                where: {
                  teamId: team.teamId,
                },
                update: {
                  seasons: {
                    ...(!isMember
                      ? {
                          connect: {
                            where: {
                              node: {
                                seasonId: season.seasonId,
                              },
                            },
                          },
                        }
                      : {
                          disconnect: {
                            where: {
                              node: {
                                seasonId: season.seasonId,
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
          label={isMember ? 'Member' : 'Not member'}
        />
      </TableCell>
    </TableRow>
  )
}

Membership.propTypes = {
  teamId: PropTypes.string,
}

export { Membership }
