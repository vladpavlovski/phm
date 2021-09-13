import React from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'

import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/core/Autocomplete'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import { PlayerSelect, RemainingTime } from './components'
import GameEventFormContext from '../../context'

import { sortByPriority } from '../../../../../../utils'

const formInitialState = {
  remainingTime: '00:00',
  scoredBy: null,
  firstAssist: null,
  secondAssist: null,
  goalType: null,
  goalSubType: null,
  shotType: null,
  shotSubType: null,
}

const GoalForm = props => {
  const {
    gameEventSettings,
    activeStep,
    players,
    gameSettings,
    handleNextStep,
  } = props

  const { setNextButtonDisabled, gameEventData, setGameEventData } =
    React.useContext(GameEventFormContext)

  const activeStepData = React.useMemo(
    () => gameEventSettings.steps[activeStep],
    [gameEventSettings, activeStep]
  )
  // console.log('GF~ gameEventData:', gameEventData)
  React.useEffect(() => {
    if (!gameEventData)
      setGameEventData({ ...formInitialState, timestamp: dayjs().format() })
  }, [])

  React.useEffect(() => {
    switch (activeStep) {
      case 0:
        setNextButtonDisabled(gameEventData?.remainingTime === '')
        break
      case 1:
        setNextButtonDisabled(!gameEventData?.scoredBy)
        break
    }
  }, [gameEventData, activeStep])

  return gameEventData ? (
    <Grid container spacing={2}>
      {activeStep === 0 && (
        <Grid item xs={12}>
          <RemainingTime
            gameEventData={gameEventData}
            setGameEventData={setGameEventData}
            activeStepData={activeStepData}
          />
        </Grid>
      )}
      {activeStep === 1 && (
        <Grid item xs={12}>
          <PlayerSelect
            players={players}
            onClick={scoredBy => {
              setGameEventData(state => ({ ...state, scoredBy }))
              setNextButtonDisabled(false)
              handleNextStep()
            }}
            selected={gameEventData?.scoredBy}
          />
        </Grid>
      )}
      {activeStep === 2 && (
        <Grid item xs={12}>
          <PlayerSelect
            players={players.filter(
              p => p.node.playerId !== gameEventData.scoredBy.node.playerId
            )}
            onClick={firstAssist => {
              setGameEventData(state => ({ ...state, firstAssist }))
              handleNextStep()
            }}
            selected={gameEventData?.firstAssist}
          />
        </Grid>
      )}
      {activeStep === 3 && (
        <Grid item xs={12}>
          <PlayerSelect
            players={players.filter(
              p => p.node.playerId !== gameEventData.scoredBy.node.playerId
            )}
            onClick={secondAssist => {
              setGameEventData(state => ({ ...state, secondAssist }))
              handleNextStep()
            }}
            selected={gameEventData?.secondAssist}
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
              // isOptionEqualToValue={(option, value) =>
              //   option.type === value.type
              // }
              getOptionSelected={(option, value) => option.type === value.type}
              onChange={(_, goalType) => {
                setGameEventData(state => ({ ...state, goalType }))
              }}
            />
          </Grid>

          {gameEventData?.goalType?.subTypes?.length > 0 && (
            <Grid item xs={6}>
              <Autocomplete
                disableClearable
                id="combo-box-goal-sub-type"
                options={[...gameEventData?.goalType?.subTypes].sort(
                  sortByPriority
                )}
                value={gameEventData?.goalSubType}
                renderInput={params => (
                  <TextField {...params} label="Goal Sub type" />
                )}
                getOptionLabel={option => option.name}
                // isOptionEqualToValue={(option, value) =>
                //   option.type === value.type
                // }
                getOptionSelected={(option, value) =>
                  option.type === value.type
                }
                onChange={(_, goalSubType) => {
                  setGameEventData(state => ({ ...state, goalSubType }))
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
              // isOptionEqualToValue={(option, value) =>
              //   option.type === value.type
              // }
              getOptionSelected={(option, value) => option.type === value.type}
              onChange={(_, shotType) => {
                setGameEventData(state => ({ ...state, shotType }))
              }}
            />
          </Grid>

          {gameEventData?.shotType?.subTypes?.length > 0 && (
            <Grid item xs={6}>
              <Autocomplete
                // disablePortal
                disableClearable
                id="combo-box-shot-sub-type"
                options={[...gameEventData?.shotType?.subTypes].sort(
                  sortByPriority
                )}
                value={gameEventData?.shotSubType}
                renderInput={params => (
                  <TextField {...params} label="Shot Sub type" />
                )}
                getOptionLabel={option => option.name}
                // isOptionEqualToValue={(option, value) =>
                //   option.type === value.type
                // }
                getOptionSelected={(option, value) =>
                  option.type === value.type
                }
                onChange={(_, shotSubType) => {
                  setGameEventData(state => ({ ...state, shotSubType }))
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

GoalForm.propTypes = {
  gameEventSettings: PropTypes.object,
  activeStep: PropTypes.number,
}

export { GoalForm }
