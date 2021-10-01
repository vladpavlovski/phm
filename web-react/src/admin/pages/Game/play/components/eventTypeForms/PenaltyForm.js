import React from 'react'
import PropTypes from 'prop-types'
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
import GameEventFormContext from '../../context'

import { sortByPriority } from '../../../../../../utils'

const formInitialState = {
  remainingTime: '00:00',
  penalized: null,
  penaltyType: null,
  penaltySubType: null,
  duration: '',
}

const PenaltyForm = props => {
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
            onClick={penalized => {
              setGameEventData(state => ({ ...state, penalized }))
              setNextButtonDisabled(false)
              handleNextStep()
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
              options={[...gameSettings?.penaltyTypes].sort(sortByPriority)}
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
                options={[...gameEventData?.penaltyType?.subTypes].sort(
                  sortByPriority
                )}
                value={gameEventData?.penaltySubType}
                renderInput={params => (
                  <TextField {...params} label="Penalty Sub type" />
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
                    {'Penalty'}
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
