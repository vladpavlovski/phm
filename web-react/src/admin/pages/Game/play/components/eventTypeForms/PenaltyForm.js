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

import { PlayerSelect } from './components'
import GameEventFormContext from '../../context'

const formInitialState = {
  remainingTime: '00:00',
  penalized: null,
  penaltyType: null,
  penaltySubType: null,
  duration: '',
}

const PenaltyForm = props => {
  const { gameEventSettings, activeStep, players, gameSettings } = props

  const { setNextButtonDisabled, gameEventData, setGameEventData } =
    React.useContext(GameEventFormContext)

  const activeStepData = React.useMemo(
    () => gameEventSettings.steps[activeStep],
    [gameEventSettings, activeStep]
  )

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
        setNextButtonDisabled(!gameEventData?.penalized)
        break
    }
  }, [gameEventData, activeStep])

  return gameEventData ? (
    <Grid container spacing={2}>
      {activeStep === 0 && (
        <Grid item xs={12}>
          <TextField
            placeholder="Remaining time"
            label="Remaining time"
            name="Remaining time"
            fullWidth
            autoFocus
            variant="standard"
            value={gameEventData?.remainingTime}
            onChange={e => {
              setGameEventData(state => ({
                ...state,
                remainingTime: e.target.value,
              }))
            }}
            required={!activeStepData.optional}
            error={!gameEventData?.remainingTime}
            helperText={
              !gameEventData?.remainingTime &&
              'Remaining time should be defined'
            }
            inputProps={{
              autoComplete: 'off',
            }}
          />
        </Grid>
      )}
      {activeStep === 1 && (
        <Grid item xs={12}>
          <PlayerSelect
            players={players}
            onClick={penalized => {
              setGameEventData(state => ({ ...state, penalized }))
            }}
            selected={gameEventData?.penalized}
          />
        </Grid>
      )}

      {activeStep === 2 && (
        <>
          <Grid item xs={4}>
            <Autocomplete
              disableClearable
              id="combo-box-penalty-type"
              options={gameSettings?.penaltyTypes}
              value={gameEventData?.penaltyType}
              renderInput={params => (
                <TextField {...params} autoFocus label="Penalty type" />
              )}
              getOptionLabel={option => option.name}
              isOptionEqualToValue={(option, value) =>
                option.type === value.type
              }
              onChange={(_, penaltyType) => {
                setGameEventData(state => ({
                  ...state,
                  penaltyType,
                  duration: penaltyType.duration,
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
              value={gameEventData?.duration}
              onChange={e => {
                setGameEventData(state => ({
                  ...state,
                  duration: e.target.value,
                }))
              }}
              fullWidth
              // error={!gameEventData?.remainingTime}
              // helperText={
              //   !gameEventData?.remainingTime &&
              //   'Remaining time should be defined'
              // }
              inputProps={{
                autoComplete: 'off',
              }}
            />
          </Grid>

          {gameEventData?.penaltyType?.subTypes?.length > 0 && (
            <Grid item xs={4}>
              <Autocomplete
                // disablePortal
                disableClearable
                id="combo-box-penalty-sub-type"
                options={gameEventData?.penaltyType?.subTypes}
                value={gameEventData?.penaltySubType}
                renderInput={params => (
                  <TextField {...params} label="Goal Sub type" />
                )}
                getOptionLabel={option => option.name}
                isOptionEqualToValue={(option, value) =>
                  option.type === value.type
                }
                onChange={(_, penaltySubType) => {
                  setGameEventData(state => ({ ...state, penaltySubType }))
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
                    {'Goal'}
                  </TableCell>
                  <TableCell align="right">
                    {gameEventData?.remainingTime}
                  </TableCell>
                  <TableCell align="right">
                    {`${gameEventData?.penalized?.player?.name} (${gameEventData?.penalized?.jersey})`}
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

PenaltyForm.propTypes = {
  gameEventSettings: PropTypes.object,
  activeStep: PropTypes.number,
}

export { PenaltyForm }
