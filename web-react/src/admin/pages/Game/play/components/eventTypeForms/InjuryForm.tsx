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
import { TEventTypeForm } from './index'
import { GameEventFormContext } from '../../components/GameEventWizard'
// const formInitialState = {
//   remainingTime: '00:00',
//   suffered: null,
//   injuryType: null,
//   description: '',
// }

const InjuryForm: React.FC<TEventTypeForm> = React.memo(props => {
  const {
    gameEventSettings,
    activeStep,
    players,
    gameSettings,
    handleNextStep,
  } = props

  const {
    state: { gameEventData, tempRemainingTime },
    update,
  } = React.useContext(GameEventFormContext)

  const activeStepData = React.useMemo(
    () => gameEventSettings.steps[activeStep],
    [gameEventSettings, activeStep]
  )

  React.useEffect(() => {
    if (!gameEventData)
      // setGameEventData({
      //   ...formInitialState,
      //   timestamp: dayjs().format(),
      //   remainingTime: tempRemainingTime.current,
      // })
      update(state => ({
        ...state,
        gameEventData: {
          timestamp: dayjs().format(),
          remainingTime: tempRemainingTime,
        },
      }))
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
          nextButtonDisabled: !gameEventData?.suffered,
        }))
        // setNextButtonDisabled(!gameEventData?.suffered)
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
            onClick={suffered => {
              update(state => ({
                ...state,
                nextButtonDisabled: false,
                gameEventData: {
                  ...state.gameEventData,
                  ...(suffered && suffered),
                },
              }))
              // setGameEventData(state => ({ ...state, suffered }))
              // setNextButtonDisabled(false)
              handleNextStep()
            }}
            selected={gameEventData?.suffered || null}
          />
        </Grid>
      )}

      {activeStep === 2 && (
        <>
          <Grid item xs={6}>
            <Autocomplete
              disableClearable
              id="combo-box-penalty-type"
              options={gameSettings?.injuryTypes}
              value={gameEventData?.injuryType}
              renderInput={params => (
                <TextField {...params} autoFocus label="Injury type" />
              )}
              getOptionLabel={option => option.name}
              isOptionEqualToValue={(option, value) =>
                option.name === value.name
              }
              onChange={(_, injuryType) => {
                update(state => ({
                  ...state,
                  gameEventData: {
                    ...state.gameEventData,
                    ...(injuryType && injuryType),
                  },
                }))
                // setGameEventData(state => ({
                //   ...state,
                //   injuryType,
                // }))
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              placeholder="Description"
              label="Description"
              name="Description"
              variant="standard"
              value={gameEventData?.description}
              onChange={e => {
                update(state => ({
                  ...state,
                  gameEventData: {
                    ...state.gameEventData,
                    description: e.target.value,
                  },
                }))
                // setGameEventData(state => ({
                //   ...state,
                //   description: e.target.value,
                // }))
              }}
              fullWidth
              inputProps={{
                autoComplete: 'off',
              }}
            />
          </Grid>
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
                  <TableCell align="right">Suffered</TableCell>
                  <TableCell align="right">Injury Type</TableCell>
                  <TableCell align="right">Description</TableCell>
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
                    {`${gameEventData?.suffered?.node?.name} (${gameEventData?.suffered?.jersey})`}
                  </TableCell>
                  <TableCell align="right">
                    {gameEventData?.injuryType?.name}
                  </TableCell>
                  <TableCell align="right">
                    {gameEventData?.description}
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

export { InjuryForm }
