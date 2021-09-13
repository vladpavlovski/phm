import React, { useCallback, useMemo, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { gql, useMutation } from '@apollo/client'
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

import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

import { GET_TEAM } from '../../index'

const CREATE_JERSEYS = gql`
  mutation createJerseys($teamId: ID!, $nameBase: String!) {
    jerseys: CreateJerseys(teamId: $teamId, nameBase: $nameBase) {
      jerseyId
      name
      number
    }
  }
`

const UPDATE_JERSEY = gql`
  mutation updateJersey($where: JerseyWhere, $update: JerseyUpdateInput) {
    updateJerseys(where: $where, update: $update) {
      jerseys {
        jerseyId
        name
        number
        player {
          playerId
          firstName
          lastName
          name
          jerseys {
            jerseyId
          }
        }
      }
    }
  }
`

const Jerseys = props => {
  const { teamId, team } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddPlayer, setOpenAddPlayer] = useState(false)

  const modalJerseyId = useRef()

  const handleCloseAddJersey = useCallback(() => {
    setOpenAddPlayer(false)
  }, [])

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
            query: GET_TEAM,
            variables: { where: { teamId } },
          })

          const updatedResult = {
            team: [
              {
                ...queryResult.teams[0],
                jerseys,
              },
            ],
          }
          cache.writeQuery({
            data: updatedResult,
            query: GET_TEAM,
            variables: { where: { teamId } },
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
    // if (!queryTeamPlayersData) {
    //   getTeamPlayers()
    // }
    modalJerseyId.current = jerseyId
    setOpenAddPlayer(true)
  }, [])

  // const openAccordion = useCallback(() => {
  //   if (!queryData) {
  //     getData({ variables: { teamId } })
  //   }
  // }, [])

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
    []
  )

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="jerseys-content"
        id="jerseys-header"
      >
        <Typography className={classes.accordionFormTitle}>Jerseys</Typography>
      </AccordionSummary>
      <AccordionDetails>
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
                {'Create'}
              </LoadingButton>
            </div>
          </Toolbar>
        )}
        <div style={{ height: 600 }} className={classes.xGridDialog}>
          <XGrid
            columns={teamJerseysColumns}
            rows={setIdFromEntityId(team.jerseys, 'jerseyId')}
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
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddPlayer}
        onClose={handleCloseAddJersey}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{`Add jersey to player`}</DialogTitle>
        <DialogContent>
          <div style={{ height: 600 }} className={classes.xGridDialog}>
            <XGrid
              columns={teamPlayersColumns}
              rows={setIdFromEntityId(team.players, 'playerId')}
              disableSelectionOnClick
              components={{
                Toolbar: GridToolbar,
              }}
            />
          </div>
        </DialogContent>

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
  console.log('player:', player)
  const [isOwner, setIsOwner] = useState(
    !!player?.jerseys?.find(j => j?.jerseyId === jerseyId)
  )

  const [updateJersey] = useMutation(UPDATE_JERSEY, {
    update(cache, { data }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_TEAM,
          variables: { where: { teamId } },
        })

        const newData = data?.updateJerseys?.jerseys?.[0]

        const updatedData = queryResult?.teams?.[0]?.jerseys?.map(j => {
          if (j.jerseyId === newData?.jerseyId) {
            return { ...j, player: newData?.player }
          }
          return j
        })

        cache.writeQuery({
          query: GET_TEAM,
          data: {
            teams: [{ ...queryResult?.teams[0], jerseys: updatedData }],
          },
          variables: { where: { teamId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      enqueueSnackbar('Jersey updated!', { variant: 'success' })
    },
    onError: error => {
      enqueueSnackbar(`Error: ${error}`, {
        variant: 'error',
      })
    },
  })

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isOwner}
          onChange={() => {
            isOwner
              ? updateJersey({
                  variables: {
                    where: {
                      jerseyId,
                    },
                    update: {
                      player: {
                        disconnect: {
                          where: {
                            node: {
                              playerId,
                            },
                          },
                        },
                      },
                    },
                  },
                })
              : updateJersey({
                  variables: {
                    where: {
                      jerseyId,
                    },
                    update: {
                      player: {
                        connect: {
                          where: {
                            node: { playerId },
                          },
                        },
                      },
                    },
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
