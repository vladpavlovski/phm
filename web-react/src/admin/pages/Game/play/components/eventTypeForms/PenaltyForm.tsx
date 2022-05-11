import dayjs from 'dayjs'
import React from 'react'
import { sortByPriority } from 'utils'
import Autocomplete from '@mui/material/Autocomplete'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { GameEventFormContext } from '../../components/GameEventWizard'
import { PlayerSelect, RemainingTime } from './components'
import { TEventTypeForm } from './index'

const PenaltyForm: React.FC<TEventTypeForm> = props => {
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

        break
      case 1:
        update(state => ({
          ...state,
          nextButtonDisabled: !gameEventData?.penalized,
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
            onClick={penalized => {
              update(state => ({
                ...state,
                nextButtonDisabled: false,
                gameEventData: {
                  ...state.gameEventData,
                  ...(penalized && { penalized }),
                },
              }))
              handleNextStep()
            }}
            selected={gameEventData?.penalized || null}
          />
        </Grid>
      )}

      {activeStep === 2 && (
        <>
          <Grid item xs={4}>
            <Autocomplete
              disableClearable
              id="combo-box-penalty-type"
              options={[...gameSettings?.penaltyTypes].sort(sortByPriority)}
              value={gameEventData?.penaltyType}
              renderInput={params => (
                <TextField {...params} autoFocus label="Penalty type" />
              )}
              getOptionLabel={option => option?.name || ''}
              isOptionEqualToValue={(option, value) => {
                return option && value && option.name === value.name
              }}
              onChange={(_, penaltyType) => {
                update(state => ({
                  ...state,
                  gameEventData: {
                    ...state.gameEventData,
                    penaltyType,
                    duration: penaltyType.duration,
                  },
                }))
              }}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              placeholder="Duration"
              label="Duration"
              name="Duration"
              variant="standard"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              value={gameEventData?.duration || ''}
              onChange={e => {
                update(state => ({
                  ...state,
                  gameEventData: {
                    ...state.gameEventData,
                    duration: Number(e.target.value),
                  },
                }))
              }}
              fullWidth
              inputProps={{
                autoComplete: 'off',
              }}
            />
          </Grid>

          {gameEventData?.penaltyType?.subTypes &&
            gameEventData?.penaltyType?.subTypes?.length > 0 && (
              <Grid item xs={4}>
                <Autocomplete
                  disableClearable
                  id="combo-box-penalty-sub-type"
                  options={[...gameEventData?.penaltyType?.subTypes].sort(
                    sortByPriority
                  )}
                  value={gameEventData?.penaltySubType}
                  renderInput={params => (
                    <TextField {...params} label="Penalty Sub type" />
                  )}
                  getOptionLabel={option => option.name}
                  isOptionEqualToValue={(option, value) =>
                    option.name === value.name
                  }
                  onChange={(_, penaltySubType) => {
                    update(state => ({
                      ...state,
                      gameEventData: {
                        ...state.gameEventData,
                        penaltySubType,
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
                  <TableCell align="right">Penalized</TableCell>
                  <TableCell align="right">Penalty Type</TableCell>
                  <TableCell align="right">Penalty SubType</TableCell>
                  <TableCell align="right">Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {'Penalty'}
                  </TableCell>
                  <TableCell align="right">
                    {gameEventData?.remainingTime}
                  </TableCell>
                  <TableCell align="right">
                    {`${gameEventData?.penalized?.node?.name} (${gameEventData?.penalized?.jersey})`}
                  </TableCell>
                  <TableCell align="right">
                    {gameEventData?.penaltyType?.name}
                  </TableCell>
                  <TableCell align="right">
                    {gameEventData?.penaltySubType?.name}
                  </TableCell>
                  <TableCell align="right">{gameEventData?.duration}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
    </Grid>
  ) : null
}

export { PenaltyForm }
