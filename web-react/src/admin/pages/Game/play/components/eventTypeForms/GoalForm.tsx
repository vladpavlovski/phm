import { GridButtonSelect } from 'admin/pages/Game/play/components/eventTypeForms/components/GridButtonSelect'
import dayjs from 'dayjs'
import React from 'react'
import { sortByPriority } from 'utils'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { GameEventFormContext } from '../../components/GameEventWizard'
import { PlayerSelect, RemainingTime } from './components'
import { TEventTypeForm } from './index'

const GoalForm: React.FC<TEventTypeForm> = props => {
  const {
    gameEventSettings,
    activeStep,
    players,
    playersRival,
    gameSettings,
    handleNextStep,
  } = props

  const {
    state: { gameEventData, tempRemainingTime },
    update,
  } = React.useContext(GameEventFormContext)
  const activeStepData = gameEventSettings.steps[activeStep]

  React.useEffect(() => {
    if (!gameEventData) {
      // get goalkeeper from another team to set allowed goal
      const goalkeeperTeamRival = playersRival.find(p => p.goalkeeper)

      update(state => ({
        ...state,
        gameEventData: {
          timestamp: dayjs().format(),
          remainingTime: tempRemainingTime,
          ...(goalkeeperTeamRival && { allowedBy: goalkeeperTeamRival }),
        },
      }))
    }
  }, [])

  React.useEffect(() => {
    switch (activeStep) {
      case 0:
        update(state => ({
          ...state,
          nextButtonDisabled: gameEventData?.remainingTime === '',
        }))
        break
      case 1:
        update(state => ({
          ...state,
          nextButtonDisabled: !gameEventData?.scoredBy,
        }))
        break
    }
  }, [gameEventData, activeStep])

  return gameEventData ? (
    <Grid container spacing={2}>
      {activeStep === 0 && (
        <Grid item xs={12}>
          <RemainingTime activeStepData={activeStepData} />
        </Grid>
      )}
      {activeStep === 1 && (
        <Grid item xs={12}>
          <PlayerSelect
            players={players}
            onClick={scoredBy => {
              update(state => ({
                ...state,
                nextButtonDisabled: false,
                gameEventData: {
                  ...state.gameEventData,
                  ...(scoredBy && { scoredBy }),
                },
              }))
              handleNextStep()
            }}
            selected={gameEventData?.scoredBy || null}
          />
        </Grid>
      )}
      {activeStep === 2 && (
        <Grid item xs={12}>
          <PlayerSelect
            players={
              gameEventData?.scoredBy
                ? players.filter(
                    p =>
                      p.node.playerId !==
                      gameEventData?.scoredBy?.node?.playerId
                  )
                : players
            }
            onClick={firstAssist => {
              update(state => ({
                ...state,
                gameEventData: {
                  ...state.gameEventData,
                  ...(firstAssist && { firstAssist }),
                },
              }))
              handleNextStep()
            }}
            selected={gameEventData?.firstAssist || null}
          />
        </Grid>
      )}
      {activeStep === 3 && (
        <Grid item xs={12}>
          <PlayerSelect
            players={
              gameEventData?.scoredBy
                ? players.filter(
                    p =>
                      p.node.playerId !==
                      gameEventData?.scoredBy?.node?.playerId
                  )
                : players
            }
            onClick={secondAssist => {
              update(state => ({
                ...state,
                gameEventData: {
                  ...state.gameEventData,
                  ...(secondAssist && { secondAssist }),
                },
              }))
              handleNextStep()
            }}
            selected={gameEventData?.secondAssist || null}
          />
        </Grid>
      )}
      {activeStep === 4 && (
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
                    ...(goalType && { goalType }),
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
                        ...(goalSubType && { goalSubType }),
                      },
                    }))
                  }}
                />
              </Grid>
            )}
        </>
      )}
      {activeStep === 5 && (
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
                    ...(shotType && { shotType }),
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
                        ...(shotSubType && { shotSubType }),
                      },
                    }))
                  }}
                />
              </Grid>
            )}
        </>
      )}
      {activeStep === gameEventSettings?.steps.length && (
        <Grid item xs={12}>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - recapitulation
          </Typography>
          <TableContainer>
            <Table
              sx={{ minWidth: 650 }}
              aria-label="event recapitulation table"
            >
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
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
    </Grid>
  ) : null
}

export { GoalForm }
