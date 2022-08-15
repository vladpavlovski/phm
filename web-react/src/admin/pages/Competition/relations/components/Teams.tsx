import { useSnackbar } from 'notistack'
import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { setIdFromEntityId } from 'utils'
import { Competition } from 'utils/types'
import { gql, MutationFunction, useLazyQuery, useMutation } from '@apollo/client'
import AccountBox from '@mui/icons-material/AccountBox'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Switch from '@mui/material/Switch'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'
import { Error } from '../../../../../components/Error'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { getAdminOrgTeamRoute } from '../../../../../router/routes'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

const GET_TEAMS = gql`
  query getCompetitionTeams($where: CompetitionWhere) {
    competitions(where: $where) {
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

type TRelations = {
  competitionId: string
  competition: Competition
  updateCompetition: MutationFunction
}

type TQueryTypeData = {
  competitions: Competition[]
}

type TQueryTypeVars = {
  where: {
    competitionId: string
  }
}

type TParams = { organizationSlug: string }

const Teams: React.FC<TRelations> = props => {
  const { competitionId } = props
  const { enqueueSnackbar } = useSnackbar()

  const { organizationSlug } = useParams<TParams>()
  const [openAddCompetition, setOpenAddCompetition] = useState(false)
  const updateStatus = React.useRef<string | null>(null)
  const setUpdateStatus = useCallback(value => {
    updateStatus.current = value
  }, [])
  const handleCloseAddCompetition = useCallback(() => {
    setOpenAddCompetition(false)
  }, [])
  const [
    getData,
    {
      loading: queryLoading,
      error: queryError,
      data: { competitions: [competition] } = { competitions: [] },
    },
  ] = useLazyQuery(GET_TEAMS, {
    fetchPolicy: 'cache-and-network',
  })

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
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_TEAMS,
            variables: {
              where: { competitionId },
            },
          })

          const updatedData =
            updateStatus.current === 'disconnect'
              ? queryResult?.competitions?.[0]?.teams?.filter(
                  p => p.teamId !== teams?.[0]?.teamId
                )
              : [...(queryResult?.competitions?.[0]?.teams || []), ...teams]

          const updatedResult = {
            competitions: [
              {
                ...queryResult?.competitions?.[0],
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
    if (!competition) {
      getData({ variables: { where: { competitionId } } })
    }
  }, [])

  const handleOpenAddCompetition = useCallback(() => {
    if (!queryAllCompetitionsData) {
      getAllCompetitions()
    }
    setOpenAddCompetition(true)
  }, [])

  const competitionTeamsColumns = useMemo<GridColumns>(
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

  const allTeamsColumns = useMemo<GridColumns>(
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
              setUpdateStatus={setUpdateStatus}
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
        <Typography>Teams</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
        {competition && (
          <>
            <Toolbar
              disableGutters
              sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
            >
              <div />
              <div>
                <Button
                  onClick={handleOpenAddCompetition}
                  variant={'outlined'}
                  size="small"
                  startIcon={<AddIcon />}
                >
                  Add Team
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600, width: '100%' }}>
              <DataGridPro
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
                <div style={{ height: 600, width: '100%' }}>
                  <DataGridPro
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

type TToggleNew = {
  teamId: string
  competitionId: string
  competition: Competition
  update: MutationFunction
  setUpdateStatus: (value: string | null) => void
}

const ToggleNewTeam: React.FC<TToggleNew> = React.memo(props => {
  const { competitionId, teamId, competition, update, setUpdateStatus } = props
  const [isMember, setIsMember] = useState(
    !!competition.teams.find(p => p.teamId === teamId)
  )

  return (
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
                        node: { competitionId },
                      },
                    },
                  },
                },
              },
            })
        setUpdateStatus(isMember ? 'disconnect' : null)
        setIsMember(!isMember)
      }}
      name="teamMember"
      color="primary"
    />
  )
})

export { Teams }
