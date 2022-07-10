import dayjs from 'dayjs'
import React from 'react'
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
  RemainingTime,
  TitleDivider,
} from './components'
import { TEventTypeForm } from './index'

const InjuryForm: React.FC<TEventTypeForm> = ({ players, gameSettings }) => {
  const {
    state: { gameEventData, tempRemainingTime },
    update,
  } = React.useContext(GameEventFormContext)

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

  return gameEventData ? (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <RemainingTime />
      </Grid>

      <Grid item xs={12}>
        <PlayerSelect
          players={players}
          onClick={suffered => {
            update(state => ({
              ...state,

              gameEventData: {
                ...state.gameEventData,
                ...getPlayerObject({
                  player: suffered,
                  playerTitle: 'suffered',
                  playerToCheck: gameEventData?.suffered,
                }),
              },
            }))
          }}
          selected={gameEventData?.suffered}
        />
      </Grid>

      <>
        <Grid item xs={12}>
          <GridButtonSelect
            title="Goal type"
            data={[...gameSettings?.injuryTypes]}
            selected={gameEventData?.injuryType}
            onClick={injuryType => {
              update(state => ({
                ...state,
                gameEventData: {
                  ...state.gameEventData,
                  injuryType:
                    injuryType.injuryTypeId ===
                    gameEventData?.injuryType?.injuryTypeId
                      ? undefined
                      : injuryType,
                },
              }))
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TitleDivider title="Description" />
          <TextField
            multiline
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
            }}
            fullWidth
            inputProps={{
              autoComplete: 'off',
            }}
          />
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
                  {gameEventData?.suffered
                    ? `${gameEventData?.suffered?.node?.name} (${gameEventData?.suffered?.jersey})`
                    : ''}
                </TableCell>
                <TableCell align="right">
                  {gameEventData?.injuryType?.name || ''}
                </TableCell>
                <TableCell align="right">
                  {gameEventData?.description}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  ) : null
}

export { InjuryForm }
