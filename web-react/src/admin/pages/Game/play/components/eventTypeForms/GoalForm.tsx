import React from 'react'
import { sortByPriority } from 'utils'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { GameEventFormContext } from '../../components/GameEventWizard'
import {
  EventLocation,
  getPlayerObject,
  GoalLocation,
  GridButtonSelect,
  PlayerSelect,
  TimeInfo,
  TitleDivider,
} from './components'
import { TEventTypeForm } from './index'

const GoalForm: React.FC<TEventTypeForm> = ({
  players,
  playersRival,
  gameSettings,
}) => {
  const {
    state: { gameEventData },
    update,
  } = React.useContext(GameEventFormContext)

  React.useEffect(() => {
    if (!gameEventData) {
      // get goalkeeper from another team to set allowed goal
      const goalkeeperTeamRival = playersRival.find(p => p.goalkeeper)

      update(state => ({
        ...state,
        gameEventData: {
          ...(goalkeeperTeamRival && { allowedBy: goalkeeperTeamRival }),
        },
      }))
    }
  }, [])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TimeInfo />
      </Grid>

      <Grid item xs={12}>
        <PlayerSelect
          title="Scored by"
          players={players}
          onClick={scoredBy => {
            update(state => ({
              ...state,
              gameEventData: {
                ...state.gameEventData,
                ...getPlayerObject({
                  player: scoredBy,
                  playerTitle: 'scoredBy',
                  playerToCheck: gameEventData?.scoredBy,
                }),
              },
            }))
          }}
          selected={gameEventData?.scoredBy}
        />
      </Grid>

      <Grid item xs={12}>
        <PlayerSelect
          title="First Assist"
          players={players}
          onClick={firstAssist => {
            update(state => ({
              ...state,
              gameEventData: {
                ...state.gameEventData,
                ...getPlayerObject({
                  player: firstAssist,
                  playerTitle: 'firstAssist',
                  playerToCheck: gameEventData?.firstAssist,
                }),
              },
            }))
          }}
          selected={gameEventData?.firstAssist}
          disabled={gameEventData?.scoredBy}
        />
      </Grid>

      <Grid item xs={12}>
        <PlayerSelect
          title="Second assist"
          players={players}
          onClick={secondAssist => {
            update(state => ({
              ...state,
              gameEventData: {
                ...state.gameEventData,
                ...getPlayerObject({
                  player: secondAssist,
                  playerTitle: 'secondAssist',
                  playerToCheck: gameEventData?.secondAssist,
                }),
              },
            }))
          }}
          selected={gameEventData?.secondAssist}
          disabled={gameEventData?.scoredBy}
        />
      </Grid>

      <>
        <Grid item xs={12}>
          <GridButtonSelect
            title="Goal type"
            data={[...gameSettings?.goalTypes].sort(sortByPriority)}
            selected={gameEventData?.goalType}
            onClick={goalType => {
              update(state => ({
                ...state,
                gameEventData: {
                  ...state.gameEventData,
                  goalType:
                    goalType.goalTypeId === gameEventData?.goalType?.goalTypeId
                      ? undefined
                      : goalType,
                },
              }))
            }}
          />
        </Grid>

        {gameEventData?.goalType?.subTypes &&
          gameEventData?.goalType?.subTypes?.length > 0 && (
            <Grid item xs={12}>
              <GridButtonSelect
                title="Goal Sub type"
                data={[...gameEventData?.goalType.subTypes].sort(
                  sortByPriority
                )}
                selected={gameEventData?.goalSubType}
                onClick={goalSubType => {
                  update(state => ({
                    ...state,
                    gameEventData: {
                      ...state.gameEventData,
                      goalSubType:
                        goalSubType.goalSubTypeId ===
                        gameEventData?.goalSubType?.goalSubTypeId
                          ? undefined
                          : goalSubType,
                    },
                  }))
                }}
              />
            </Grid>
          )}
      </>

      <>
        <Grid item xs={12}>
          <GridButtonSelect
            title="Shot type"
            data={[...gameSettings?.shotTypes].sort(sortByPriority)}
            selected={gameEventData?.shotType}
            onClick={shotType => {
              update(state => ({
                ...state,
                gameEventData: {
                  ...state.gameEventData,
                  shotType:
                    shotType.shotTypeId === gameEventData?.shotType?.shotTypeId
                      ? undefined
                      : shotType,
                },
              }))
            }}
          />
        </Grid>

        {gameEventData?.shotType?.subTypes &&
          gameEventData?.shotType?.subTypes.length > 0 && (
            <Grid item xs={12}>
              <GridButtonSelect
                title="Shot Sub type"
                data={[...gameEventData?.shotType?.subTypes].sort(
                  sortByPriority
                )}
                selected={gameEventData?.shotSubType}
                onClick={shotSubType => {
                  update(state => ({
                    ...state,
                    gameEventData: {
                      ...state.gameEventData,
                      shotSubType:
                        shotSubType.shotSubTypeId ===
                        gameEventData?.shotSubType?.shotSubTypeId
                          ? undefined
                          : shotSubType,
                    },
                  }))
                }}
              />
            </Grid>
          )}
        <Grid item xs={12}>
          <TitleDivider title={'Location'} />
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-around"
            alignItems="center"
          >
            <EventLocation
              selected={gameEventData?.eventLocation}
              onClick={eventLocation => {
                update(state => ({
                  ...state,
                  gameEventData: {
                    ...state.gameEventData,
                    eventLocation:
                      eventLocation.value ===
                      gameEventData?.eventLocation?.value
                        ? undefined
                        : eventLocation,
                  },
                }))
              }}
            />
            <GoalLocation
              selected={gameEventData?.goalLocation}
              onClick={goalLocation => {
                update(state => ({
                  ...state,
                  gameEventData: {
                    ...state.gameEventData,
                    goalLocation:
                      goalLocation.value === gameEventData?.goalLocation?.value
                        ? undefined
                        : goalLocation,
                  },
                }))
              }}
            />
          </Stack>
        </Grid>
      </>

      <Grid item xs={12}>
        <TitleDivider title="recapitulation" />
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="event recapitulation table">
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell align="right">Remaining Time</TableCell>
                <TableCell align="right">Scored By</TableCell>
                <TableCell align="right">First Assist</TableCell>
                <TableCell align="right">Second Assist</TableCell>
                <TableCell align="right">Goal Type</TableCell>
                <TableCell align="right">Goal SubType</TableCell>
                <TableCell align="right">Shot Type</TableCell>
                <TableCell align="right">Shot SubType</TableCell>
                <TableCell align="right">Event Location</TableCell>
                <TableCell align="right">Goal Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {'Goal'}
                </TableCell>
                <TableCell align="right">
                  {gameEventData?.remainingTime}
                </TableCell>
                <TableCell align="right">
                  {gameEventData?.scoredBy?.jersey}
                </TableCell>
                <TableCell align="right">
                  {gameEventData?.firstAssist?.jersey}
                </TableCell>
                <TableCell align="right">
                  {gameEventData?.secondAssist?.jersey}
                </TableCell>
                <TableCell align="right">
                  {gameEventData?.goalType?.name}
                </TableCell>
                <TableCell align="right">
                  {gameEventData?.goalSubType?.name}
                </TableCell>
                <TableCell align="right">
                  {gameEventData?.shotType?.name}
                </TableCell>
                <TableCell align="right">
                  {gameEventData?.shotSubType?.name}
                </TableCell>
                <TableCell align="right">
                  {gameEventData?.eventLocation?.name}
                </TableCell>
                <TableCell align="right">
                  {gameEventData?.goalLocation?.name}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  )
}

export { GoalForm }
