import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AccountBox from '@material-ui/icons/AccountBox'
import AddIcon from '@material-ui/icons/Add'

import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminOrgTeamRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_TEAMS = gql`
  query getCompetitionTeams($where: CompetitionWhere) {
    competition: competitions(where: $where) {
      competitionId
      name
      teams {
        teamId
        name
      }
    }
  }
`

const UPDATE_TEAM = gql`
  mutation updateTeam($where: TeamWhere, $update: TeamUpdateInput) {
    updateTeams(where: $where, update: $update) {
      teams {
        teamId
        name
        competitions {
          competitionId
          name
        }
      }
    }
  }
`

export const GET_ALL_TEAMS = gql`
  query getTeams {
    teams {
      teamId
      name
    }
  }
`

const Teams = props => {
  const { competitionId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const { organizationSlug } = useParams()
  const [openAddCompetition, setOpenAddCompetition] = useState(false)
  const updateStatus = React.useRef()

  const handleCloseAddCompetition = useCallback(() => {
    setOpenAddCompetition(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_TEAMS, {
    fetchPolicy: 'cache-and-network',
  })

  const competition = queryData?.competition?.[0]

  const [updateTeam, { loading: mutationLoadingUpdate }] = useMutation(
    UPDATE_TEAM,
    {
      update(
        cache,
        {
          data: {
            updateTeams: { teams },
          },
        }
      ) {
        try {
          const queryResult = cache.readQuery({
            query: GET_TEAMS,
            variables: {
              where: { competitionId },
            },
          })

          const updatedData =
            updateStatus.current === 'disconnect'
              ? queryResult?.competition?.[0]?.teams?.filter(
                  p => p.teamId !== teams?.[0]?.teamId
                )
              : [...(queryResult?.competition?.[0]?.teams || []), ...teams]

          const updatedResult = {
            competition: [
              {
                ...queryResult?.competition?.[0],
                teams: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_TEAMS,
            data: updatedResult,
            variables: {
              where: { competitionId },
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        updateStatus.current = null
        enqueueSnackbar('Team updated!', { variant: 'success' })
      },
    }
  )

  const [
    getAllCompetitions,
    {
      loading: queryAllCompetitionsLoading,
      error: queryAllCompetitionsError,
      data: queryAllCompetitionsData,
    },
  ] = useLazyQuery(GET_ALL_TEAMS, {
    fetchPolicy: 'cache-and-network',
  })

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { where: { competitionId } } })
    }
  }, [])

  const handleOpenAddCompetition = useCallback(() => {
    if (!queryAllCompetitionsData) {
      getAllCompetitions()
    }
    setOpenAddCompetition(true)
  }, [])

  const competitionTeamsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 250,
      },

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
        headerName: 'Detach',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ButtonDialog
              text={'Detach'}
              textLoading={'Detaching...'}
              loading={mutationLoadingUpdate}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={
                'Do you really want to detach team from competition?'
              }
              dialogDescription={
                'Team will remain in the database. You can add it to any competition later.'
              }
              dialogNegativeText={'No, keep team'}
              dialogPositiveText={'Yes, detach team'}
              onDialogClosePositive={() => {
                updateStatus.current = 'disconnect'
                updateTeam({
                  variables: {
                    where: {
                      teamId: params.row?.teamId,
                    },
                    update: {
                      competitions: {
                        disconnect: {
                          where: {
                            node: {
                              competitionId,
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
    ],
    []
  )

  const allTeamsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 300,
      },

      {
        field: 'teamId',
        headerName: 'Membership',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewTeam
              teamId={params.value}
              competitionId={competitionId}
              competition={competition}
              update={updateTeam}
              updateStatus={updateStatus}
            />
          )
        },
      },
    ],
    [competition]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="teams-content"
        id="teams-header"
      >
        <Typography className={classes.accordionFormTitle}>Teams</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
            <Toolbar disableGutters className={classes.toolbarForm}>
              <div />
              <div>
                <Button
                  onClick={handleOpenAddCompetition}
                  variant={'outlined'}
                  size="small"
                  className={classes.submit}
                  startIcon={<AddIcon />}
                >
                  Add Team
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={competitionTeamsColumns}
                rows={setIdFromEntityId(competition.teams, 'teamId')}
                loading={queryAllCompetitionsLoading}
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </div>
          </>
        )}
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddCompetition}
        onClose={handleCloseAddCompetition}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllCompetitionsLoading && !queryAllCompetitionsError && (
          <Loader />
        )}
        {queryAllCompetitionsError && !queryAllCompetitionsLoading && (
          <Error message={queryAllCompetitionsError.message} />
        )}
        {queryAllCompetitionsData &&
          !queryAllCompetitionsLoading &&
          !queryAllCompetitionsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add ${competition?.name} to new team`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allTeamsColumns}
                    rows={setIdFromEntityId(
                      queryAllCompetitionsData.teams,
                      'teamId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllCompetitionsLoading}
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
              handleCloseAddCompetition()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

const ToggleNewTeam = props => {
  const { competitionId, teamId, competition, update, updateStatus } = props
  const [isMember, setIsMember] = useState(
    !!competition.teams.find(p => p.teamId === teamId)
  )

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            isMember
              ? update({
                  variables: {
                    where: {
                      teamId,
                    },
                    update: {
                      competitions: {
                        disconnect: {
                          where: {
                            node: {
                              competitionId,
                            },
                          },
                        },
                      },
                    },
                  },
                })
              : update({
                  variables: {
                    where: {
                      teamId,
                    },
                    update: {
                      competitions: {
                        connect: {
                          where: {
                            competitionId,
                          },
                        },
                      },
                    },
                  },
                })
            updateStatus.current = isMember ? 'disconnect' : null
            setIsMember(!isMember)
          }}
          name="teamMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not Member'}
    />
  )
}

ToggleNewTeam.propTypes = {
  competitionId: PropTypes.string,
  teamId: PropTypes.string,
  team: PropTypes.object,
  update: PropTypes.func,
}

Teams.propTypes = {
  competitionId: PropTypes.string,
}

export { Teams }
