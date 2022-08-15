import { Error, Loader } from 'components'
import React, { useCallback, useState } from 'react'
import { Competition, Group, Organization, Phase, Season, Team } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
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

type TMembership = {
  teamId: string
  updateTeam: MutationFunction
  team: Team
}

type TMembershipData = {
  teams: Team[]
  organizations: Organization[]
}

const Membership: React.FC<TMembership> = props => {
  const { teamId, updateTeam } = props

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery<TMembershipData>(GET_MEMBERSHIP, {
    variables: { where: { teamId } },
  })

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
        <Typography>Membership</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
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

type TOrganizationRow = {
  organization: Organization
  updateTeam: MutationFunction
  team: Team
}

const OrganizationRow: React.FC<TOrganizationRow> = props => {
  const { organization, team, updateTeam } = props

  const [isMember, setIsMember] = useState(
    !!team.orgs.find(a => a.organizationId === organization.organizationId)
  )
  const [organizationOpen, setOrganizationOpen] = useState(false)

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

type TCompetitionRow = {
  competition: Competition
  updateTeam: MutationFunction
  team: Team
}

const CompetitionRow: React.FC<TCompetitionRow> = props => {
  const { competition, team, updateTeam } = props

  const [isMember, setIsMember] = useState(
    !!team.competitions.find(c => c.competitionId === competition.competitionId)
  )
  const [competitionOpen, setCompetitionOpen] = useState(false)

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

type TPhaseRow = {
  updateTeam: MutationFunction
  team: Team
  phase: Phase
}

const PhaseRow: React.FC<TPhaseRow> = props => {
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
        />
      </TableCell>
    </TableRow>
  )
}

type TGroupRow = {
  updateTeam: MutationFunction
  team: Team
  group: Group
}

const GroupRow: React.FC<TGroupRow> = props => {
  const { team, group, updateTeam } = props

  const [isMember, setIsMember] = useState(
    !!team.groups.find(g => g.groupId === group.groupId)
  )

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
        />
      </TableCell>
    </TableRow>
  )
}

type TSeasonRow = {
  updateTeam: MutationFunction
  team: Team
  season: Season
}

const SeasonRow: React.FC<TSeasonRow> = props => {
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
        />
      </TableCell>
    </TableRow>
  )
}

export { Membership }
