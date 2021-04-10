import React, { useCallback, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AccountBox from '@material-ui/icons/AccountBox'
import CreateIcon from '@material-ui/icons/Create'
import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../../commonComponents/ButtonDialog'
import { getAdminPlayerRoute } from '../../../../../../routes'
import { LinkButton } from '../../../../../../components/LinkButton'
import { Loader } from '../../../../../../components/Loader'
import { Error } from '../../../../../../components/Error'
import { useStyles } from '../../../../commonComponents/styled'
import {
  setIdFromEntityId,
  getXGridValueFromArray,
} from '../../../../../../utils'
import { AddPlayer } from './AddPlayer'
import { SetPlayerPosition, PlayerPositionDialog } from './SetPlayerPosition'
import { TeamPlayersProvider } from './context/Provider'

export const GET_PLAYERS = gql`
  query getTeam($teamId: ID) {
    team: Team(teamId: $teamId) {
      teamId
      name
      positions {
        positionId
        name
      }
      players {
        playerId
        firstName
        lastName
        name
        positions {
          positionId
          name
        }
        jerseys {
          jerseyId
          name
          number
        }
      }
    }
  }
`

const REMOVE_TEAM_PLAYER = gql`
  mutation removeTeamPlayer($teamId: ID!, $playerId: ID!) {
    teamPlayer: RemoveTeamPlayers(
      from: { playerId: $playerId }
      to: { teamId: $teamId }
    ) {
      from {
        playerId
        firstName
        lastName
        name
      }
    }
  }
`

const Players = props => {
  const { teamId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_PLAYERS, {
    fetchPolicy: 'cache-and-network',
  })

  const team = queryData?.team?.[0]

  const [removeTeamPlayer, { loading: mutationLoadingRemove }] = useMutation(
    REMOVE_TEAM_PLAYER,
    {
      update(cache, { data: { teamPlayer } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_PLAYERS,
            variables: {
              teamId,
            },
          })
          const updatedPlayers = queryResult.team[0].players.filter(
            p => p.playerId !== teamPlayer.from.playerId
          )

          const updatedResult = {
            team: [
              {
                ...queryResult.team[0],
                players: updatedPlayers,
              },
            ],
          }
          cache.writeQuery({
            query: GET_PLAYERS,
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
          `${data.teamPlayer.from.name} removed from ${team.name}!`,
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
    }
  )

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { teamId } })
    }
  }, [])

  const teamPlayersColumns = useMemo(
    () => [
      {
        field: 'firstName',
        headerName: 'First name',
        width: 150,
      },
      {
        field: 'lastName',
        headerName: 'Last name',
        width: 150,
      },
      {
        field: 'positions',
        headerName: 'Positions',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.positions, 'name')
        },
      },
      {
        field: 'setPlayerPosition',
        headerName: 'Set Position',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return <SetPlayerPosition player={params.row} />
        },
      },
      {
        field: 'jerseys',
        headerName: 'Jerseys',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.teams, 'name')
        },
      },
      {
        field: 'playerId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminPlayerRoute(params.value)}
              target="_blank"
            >
              Profile
            </LinkButton>
          )
        },
      },
      {
        field: 'removeButton',
        headerName: 'Remove',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ButtonDialog
              text={'Remove'}
              textLoading={'Removing...'}
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={'Do you really want to remove player from the team?'}
              dialogDescription={
                'The player will remain in the database. You can add him to any team later.'
              }
              dialogNegativeText={'No, keep the player'}
              dialogPositiveText={'Yes, remove player'}
              onDialogClosePositive={() => {
                removeTeamPlayer({
                  variables: {
                    teamId,
                    playerId: params.row.playerId,
                  },
                })
              }}
            />
          )
        },
      },
    ],
    [team, teamId]
  )

  return (
    <TeamPlayersProvider>
      <Accordion onChange={openAccordion}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="players-content"
          id="players-header"
        >
          <Typography className={classes.accordionFormTitle}>
            Players
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {queryLoading && !queryError && <Loader />}
          {queryError && !queryLoading && (
            <Error message={queryError.message} />
          )}
          {queryData && (
            <>
              <Toolbar disableGutters className={classes.toolbarForm}>
                <div />
                <div>
                  <AddPlayer
                    team={team}
                    teamId={teamId}
                    removeTeamPlayer={removeTeamPlayer}
                  />

                  <LinkButton
                    startIcon={<CreateIcon />}
                    to={getAdminPlayerRoute('new')}
                    target="_blank"
                  >
                    Create
                  </LinkButton>
                </div>
              </Toolbar>
              <div style={{ height: 600 }} className={classes.xGridDialog}>
                <XGrid
                  columns={teamPlayersColumns}
                  rows={setIdFromEntityId(team.players, 'playerId')}
                  loading={queryLoading}
                  components={{
                    Toolbar: GridToolbar,
                  }}
                />
              </div>
            </>
          )}
        </AccordionDetails>
      </Accordion>
      <PlayerPositionDialog teamId={teamId} team={team} />
    </TeamPlayersProvider>
  )
}

Players.propTypes = {
  teamId: PropTypes.string,
}

export { Players }
