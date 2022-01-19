import React from 'react'
import dayjs from 'dayjs'

import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import { PlayerSelect, RemainingTime } from './components'
import { GameEventFormContext } from '../../components/GameEventWizard'
import { sortByPriority } from 'utils'
import { TEventTypeForm } from './index'

// const formInitialState = {
//   remainingTime: '00:00',
//   scoredBy: null,
//   firstAssist: null,
//   secondAssist: null,
//   goalType: null,
//   goalSubType: null,
//   shotType: null,
//   shotSubType: null,
// }

const GoalForm: React.FC<TEventTypeForm> = React.memo(props => {
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
    // setNextButtonDisabled,
    // gameEventData,
    // setGameEventData,
    // tempRemainingTime,
  } = React.useContext(GameEventFormContext)

  const activeStepData = React.useMemo(
    () => gameEventSettings.steps[activeStep],
    [gameEventSettings, activeStep]
  )
  React.useEffect(() => {
    if (!gameEventData) {
      // get goalkeeper from another team to set allowed goal
      const goalkeeperTeamRival = playersRival.find(p => p.goalkeeper)
      // setGameEventData({
      //   ...formInitialState,
      //   allowedBy: goalkeeperTeamRival,
      //   timestamp: dayjs().format(),
      //   remainingTime: tempRemainingTime.current,
      // })

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
        // setNextButtonDisabled(gameEventData?.remainingTime === '')
        break
      case 1:
        update(state => ({
          ...state,
          nextButtonDisabled: !gameEventData?.scoredBy,
        }))
        // setNextButtonDisabled(!gameEventData?.scoredBy)
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
                  ...(scoredBy && scoredBy),
                },
              }))
              // setGameEventData(state => ({ ...state, scoredBy }))
              // setNextButtonDisabled(false)
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
                // nextButtonDisabled: false,
                gameEventData: {
                  ...state.gameEventData,
                  firstAssist,
                },
              }))
              // setGameEventData(state => ({ ...state, firstAssist }))
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
                  secondAssist,
                },
              }))
              // setGameEventData(state => ({ ...state, secondAssist }))
              handleNextStep()
            }}
            selected={gameEventData?.secondAssist || null}
          />
        </Grid>
      )}
      {activeStep === 4 && (
        <>
          <Grid item xs={6}>
            <Autocomplete
              disableClearable
              id="combo-box-goal-type"
              options={[...gameSettings?.goalTypes].sort(sortByPriority)}
              value={gameEventData?.goalType}
              renderInput={params => (
                <TextField {...params} autoFocus label="Goal type" />
              )}
              getOptionLabel={option => option.name}
              isOptionEqualToValue={(option, value) =>
                option.name === value.name
              }
              onChange={(_, goalType) => {
                update(state => ({
                  ...state,
                  gameEventData: {
                    ...state.gameEventData,
                    ...(goalType && goalType),
                  },
                }))
                // setGameEventData(state => ({ ...state, goalType }))
              }}
            />
          </Grid>

          {gameEventData?.goalType?.subTypes &&
            gameEventData?.goalType?.subTypes?.length > 0 && (
              <Grid item xs={6}>
                <Autocomplete
                  disableClearable
                  id="combo-box-goal-sub-type"
                  options={[...gameEventData.goalType.subTypes].sort(
                    sortByPriority
                  )}
                  value={gameEventData?.goalSubType}
                  renderInput={params => (
                    <TextField {...params} label="Goal Sub type" />
                  )}
                  getOptionLabel={option => option.name}
                  isOptionEqualToValue={(option, value) =>
                    option.name === value.name
                  }
                  onChange={(_, goalSubType) => {
                    update(state => ({
                      ...state,
                      gameEventData: {
                        ...state.gameEventData,
                        ...(goalSubType && goalSubType),
                      },
                    }))
                    // setGameEventData(state => ({ ...state, goalSubType }))
                  }}
                />
              </Grid>
            )}
        </>
      )}
      {activeStep === 5 && (
        <>
          <Grid item xs={6}>
            <Autocomplete
              disableClearable
              id="combo-box-shot-type"
              options={[...gameSettings?.shotTypes].sort(sortByPriority)}
              value={gameEventData?.shotType}
              renderInput={params => (
                <TextField {...params} autoFocus label="Shot type" />
              )}
              getOptionLabel={option => option.name}
              isOptionEqualToValue={(option, value) =>
                option.name === value.name
              }
              onChange={(_, shotType) => {
                update(state => ({
                  ...state,
                  gameEventData: {
                    ...state.gameEventData,
                    shotType,
                  },
                }))
                // setGameEventData(state => ({ ...state, shotType }))
              }}
            />
          </Grid>

          {gameEventData?.shotType?.subTypes &&
            gameEventData?.shotType?.subTypes.length > 0 && (
              <Grid item xs={6}>
                <Autocomplete
                  disableClearable
                  id="combo-box-shot-sub-type"
                  options={
                    gameEventData?.shotType?.subTypes
                      ? [...gameEventData?.shotType?.subTypes].sort(
                          sortByPriority
                        )
                      : []
                  }
                  value={gameEventData?.shotSubType}
                  renderInput={params => (
                    <TextField {...params} label="Shot Sub type" />
                  )}
                  getOptionLabel={option => option.name}
                  isOptionEqualToValue={(option, value) =>
                    option.name === value.name
                  }
                  onChange={(_, shotSubType) => {
                    update(state => ({
                      ...state,
                      gameEventData: {
                        ...state.gameEventData,
                        shotSubType,
                      },
                    }))
                    // setGameEventData(state => ({ ...state, shotSubType }))
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
})

export { GoalForm }
