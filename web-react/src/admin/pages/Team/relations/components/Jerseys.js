import React, { useCallback, useMemo, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import CreateIcon from '@material-ui/icons/Create'
import Toolbar from '@material-ui/core/Toolbar'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import LoadingButton from '@material-ui/lab/LoadingButton'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_JERSEYS = gql`
  query getTeam($teamId: ID) {
    team: Team(teamId: $teamId) {
      teamId
      name
      jerseys {
        jerseyId
        name
        number
        player {
          playerId
          name
          firstName
          lastName
        }
      }
    }
  }
`

const CREATE_JERSEYS = gql`
  mutation createJerseys($teamId: ID!, $nameBase: String!) {
    jerseys: CreateJerseys(teamId: $teamId, nameBase: $nameBase) {
      jerseyId
      name
      number
    }
  }
`

const GET_TEAM_PLAYERS = gql`
  query getTeamPlayers($teamId: ID) {
    team: Team(teamId: $teamId) {
      teamId
      players {
        playerId
        name
        firstName
        lastName
        jerseys {
          jerseyId
        }
      }
    }
  }
`

const MERGE_JERSEY_PLAYER = gql`
  mutation mergeJerseyPlayer($jerseyId: ID!, $playerId: ID!) {
    jerseyPlayer: MergeJerseyPlayer(
      from: { playerId: $playerId }
      to: { jerseyId: $jerseyId }
    ) {
      from {
        playerId
        name
        firstName
        lastName
      }
      to {
        jerseyId
        name
        number
        player {
          playerId
          name
          firstName
          lastName
        }
      }
    }
  }
`

const REMOVE_JERSEY_PLAYER = gql`
  mutation removeJerseyPlayer($jerseyId: ID!, $playerId: ID!) {
    jerseyPlayer: RemoveJerseyPlayer(
      from: { playerId: $playerId }
      to: { jerseyId: $jerseyId }
    ) {
      from {
        playerId
        name
        firstName
        lastName
      }
      to {
        jerseyId
        name
        name
        number
      }
    }
  }
`

const Jerseys = props => {
  const { teamId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddPlayer, setOpenAddPlayer] = useState(false)

  const modalJerseyId = useRef()

  const handleCloseAddJersey = useCallback(() => {
    setOpenAddPlayer(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_JERSEYS, {
    fetchPolicy: 'cache-and-network',
  })

  const team = queryData && queryData.team && queryData.team[0]

  const [
    getTeamPlayers,
    {
      loading: queryTeamPlayersLoading,
      error: queryTeamPlayersError,
      data: queryTeamPlayersData,
    },
  ] = useLazyQuery(GET_TEAM_PLAYERS, {
    variables: {
      teamId,
    },
    fetchPolicy: 'cache-and-network',
  })

  const [createJerseys, { loading: queryCreateLoading }] = useMutation(
    CREATE_JERSEYS,
    {
      variables: {
        teamId,
        nameBase: team?.name,
      },

      update(cache, { data: { jerseys } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_JERSEYS,
            variables: {
              teamId,
            },
          })

          const updatedResult = {
            team: [
              {
                ...queryResult.team[0],
                jerseys,
              },
            ],
          }
          cache.writeQuery({
            query: GET_JERSEYS,
            data: updatedResult,
            variables: {
              teamId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        enqueueSnackbar(`Jerseys added to ${team.name}!`, {
          variant: 'success',
        })
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  const handleOpenAddPlayer = useCallback(jerseyId => {
    if (!queryTeamPlayersData) {
      getTeamPlayers()
    }
    modalJerseyId.current = jerseyId
    setOpenAddPlayer(true)
  }, [])

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { teamId } })
    }
  }, [])

  const teamJerseysColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'number',
        headerName: 'Number',
        width: 140,
      },
      {
        field: 'playerName',
        headerName: 'Player Name',
        width: 200,
        valueGetter: params => params.row?.player?.name,
      },
      {
        field: 'jerseyId',
        headerName: 'Edit',
        width: 170,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <Button
              type="button"
              onClick={() => {
                handleOpenAddPlayer(params.value)
              }}
              variant={'outlined'}
              size="small"
              className={classes.submit}
              startIcon={<AddIcon />}
            >
              Set Player
            </Button>
          )
        },
      },
    ],
    []
  )

  const teamPlayersColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'playerId',
        headerName: 'Owner',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <TogglePlayerJersey
              playerId={params.value}
              teamId={teamId}
              player={params.row}
              jerseyId={modalJerseyId.current}
            />
          )
        },
      },
    ],
    [queryTeamPlayersData]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="jerseys-content"
        id="jerseys-header"
      >
        <Typography className={classes.accordionFormTitle}>Jerseys</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
            {team?.jerseys?.length === 0 && (
              <Toolbar disableGutters className={classes.toolbarForm}>
                <div />
                <div>
                  {/* <Button
                    onClick={handleOpenAddJersey}
                    variant={'outlined'}
                    size="small"
                    className={classes.submit}
                    startIcon={<AddIcon />}
                  >
                    Add Jersey
                  </Button> */}
                  {/* TODO: MAKE Modal */}

                  {/* <LinkButton
                  startIcon={<CreateIcon />}
                  // to={getAdminJerseyRoute('new')}
                >
                  
                </LinkButton> */}
                  <LoadingButton
                    type="button"
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={createJerseys}
                    className={classes.submit}
                    startIcon={<CreateIcon />}
                    loading={queryCreateLoading}
                    loadingPosition="start"
                  >
                    {queryCreateLoading ? 'Creating...' : 'Create'}
                  </LoadingButton>
                  {/* <Button
                    onClick={() => {
                      createJerseys()
                    }}
                    variant={'outlined'}
                    size="small"
                    className={classes.submit}
                    startIcon={<CreateIcon />}
                  >
                    Create
                  </Button> */}
                </div>
              </Toolbar>
            )}
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={teamJerseysColumns}
                rows={setIdFromEntityId(team.jerseys, 'jerseyId')}
                loading={queryLoading}
                components={{
                  Toolbar: GridToolbar,
                }}
                sortModel={[
                  {
                    field: 'number',
                    sort: 'asc',
                  },
                ]}
              />
            </div>
          </>
        )}
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddPlayer}
        onClose={handleCloseAddJersey}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryTeamPlayersLoading && !queryTeamPlayersError && <Loader />}
        {queryTeamPlayersError && !queryTeamPlayersLoading && (
          <Error message={queryTeamPlayersError.message} />
        )}
        {queryTeamPlayersData &&
          !queryTeamPlayersLoading &&
          !queryTeamPlayersError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add jersey to player`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={teamPlayersColumns}
                    rows={setIdFromEntityId(
                      queryTeamPlayersData.team[0].players,
                      'playerId'
                    )}
                    disableSelectionOnClick
                    loading={queryTeamPlayersLoading}
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
              handleCloseAddJersey()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

const TogglePlayerJersey = props => {
  const { jerseyId, teamId, player, playerId } = props
  const { enqueueSnackbar } = useSnackbar()
  const [isOwner, setIsOwner] = useState(
    !!player?.jerseys?.find(j => j?.jerseyId === jerseyId)
  )

  const [mergeJerseyPlayer] = useMutation(MERGE_JERSEY_PLAYER, {
    update(cache, { data: { jerseyPlayer } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_JERSEYS,
          variables: {
            teamId,
          },
        })
        const existingData = queryResult.team[0].jerseys
        const newData = jerseyPlayer.to
        const updatedResult = {
          team: [
            {
              ...queryResult.team[0],
              jerseys: [newData, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_JERSEYS,
          data: updatedResult,
          variables: {
            teamId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.jerseyPlayer.from.name} added to ${data.jerseyPlayer.to.name}!`,
        {
          variant: 'success',
        }
      )
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const [removeJerseyPlayer] = useMutation(REMOVE_JERSEY_PLAYER, {
    update(cache, { data: { jerseyPlayer } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_JERSEYS,
          variables: {
            teamId,
          },
        })
        const existingData = queryResult?.team[0].jerseys
        const newData = jerseyPlayer.to
        const updatedResult = {
          team: [
            {
              ...queryResult?.team[0],
              jerseys: [newData, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_JERSEYS,
          data: updatedResult,
          variables: {
            teamId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.jerseyPlayer.from.name} removed from ${data.jerseyPlayer.to.name}!`,
        {
          variant: 'info',
        }
      )
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isOwner}
          onChange={() => {
            isOwner
              ? removeJerseyPlayer({
                  variables: {
                    playerId,
                    jerseyId,
                  },
                })
              : mergeJerseyPlayer({
                  variables: {
                    playerId,
                    jerseyId,
                  },
                })
            setIsOwner(!isOwner)
          }}
          name="teamMember"
          color="primary"
        />
      }
      label={isOwner ? 'Owner' : 'Not owner'}
    />
  )
}

Jerseys.propTypes = {
  teamId: PropTypes.string,
}

export { Jerseys }
