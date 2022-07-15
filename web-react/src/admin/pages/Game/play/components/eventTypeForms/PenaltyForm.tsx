import React from 'react'
import { sortByPriority } from 'utils'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import { GameEventFormContext } from '../../components/GameEventWizard'
import {
  getPlayerObject,
  GridButtonSelect,
  PlayerSelect,
  TimeInfo,
  TitleDivider,
} from './components'
import { TEventTypeForm } from './index'

const PenaltyForm: React.FC<TEventTypeForm> = ({ players, gameSettings }) => {
  const {
    state: { gameEventData },
    update,
  } = React.useContext(GameEventFormContext)

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TimeInfo />
      </Grid>
      <Grid item xs={12}>
        <PlayerSelect
          title="Penalized"
          players={players}
          onClick={penalized => {
            update(state => ({
              ...state,

              gameEventData: {
                ...state.gameEventData,
                ...getPlayerObject({
                  player: penalized,
                  playerTitle: 'penalized',
                  playerToCheck: gameEventData?.penalized,
                }),
              },
            }))
          }}
          selected={gameEventData?.penalized}
        />
      </Grid>

      <Grid item xs={12}>
        <GridButtonSelect
          title="Penalty type"
          data={[...gameSettings?.penaltyTypes].sort(sortByPriority)}
          selected={gameEventData?.penaltyType}
          onClick={penaltyType => {
            update(state => ({
              ...state,
              gameEventData: {
                ...state.gameEventData,
                penaltyType:
                  penaltyType.penaltyTypeId ===
                  gameEventData?.penaltyType?.penaltyTypeId
                    ? undefined
                    : penaltyType,
                duration: penaltyType.duration,
              },
            }))
          }}
        />
      </Grid>
      <Grid item xs={12}>
        {gameEventData?.penaltyType?.subTypes &&
          gameEventData?.penaltyType?.subTypes?.length > 0 && (
            <GridButtonSelect
              title="Penalty Sub type"
              data={[...gameEventData?.penaltyType?.subTypes].sort(
                sortByPriority
              )}
              selected={gameEventData?.penaltySubType}
              onClick={penaltySubType => {
                update(state => ({
                  ...state,
                  gameEventData: {
                    ...state.gameEventData,
                    penaltySubType:
                      penaltySubType?.penaltySubTypeId ===
                      gameEventData?.penaltySubType?.penaltySubTypeId
                        ? undefined
                        : penaltySubType,
                  },
                }))
              }}
            />
          )}
      </Grid>
      <Grid item xs={12}>
        <TitleDivider title="Duration" />
        <TextField
          placeholder="Duration"
          label="Duration"
          name="Duration"
          variant="standard"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
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
          inputProps={{
            autoComplete: 'off',
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <TitleDivider title="recapitulation" />
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="event recapitulation table">
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
                  {gameEventData?.penalized
                    ? `${gameEventData?.penalized?.node?.name} (${gameEventData?.penalized?.jersey})`
                    : ''}
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
    </Grid>
  )
}

export { PenaltyForm }
