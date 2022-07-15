import React from 'react'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { GameEventFormContext } from '../../components/GameEventWizard'
import { getPlayerObject, PlayerSelect, TimeInfo, TitleDivider } from './components'
import { TEventTypeForm } from './index'

const PenaltyShotForm: React.FC<TEventTypeForm> = props => {
  const { players, playersRival } = props

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
          title="Executed By"
          players={players}
          onClick={executedBy => {
            update(state => ({
              ...state,

              gameEventData: {
                ...state.gameEventData,
                ...getPlayerObject({
                  player: executedBy,
                  playerTitle: 'executedBy',
                  playerToCheck: gameEventData?.executedBy,
                }),
              },
            }))
          }}
          selected={gameEventData?.executedBy}
        />
      </Grid>

      <Grid item xs={12}>
        <PlayerSelect
          title="Faced Against"
          players={playersRival}
          onClick={facedAgainst => {
            update(state => ({
              ...state,

              gameEventData: {
                ...state.gameEventData,
                ...getPlayerObject({
                  player: facedAgainst,
                  playerTitle: 'facedAgainst',
                  playerToCheck: gameEventData?.facedAgainst,
                }),
              },
            }))
          }}
          selected={gameEventData?.facedAgainst}
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
                <TableCell align="right">Executed By</TableCell>
                <TableCell align="right">Faced Against</TableCell>
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
                  {gameEventData?.executedBy
                    ? `${gameEventData?.executedBy?.node?.name} (${gameEventData?.executedBy?.jersey})`
                    : ''}
                </TableCell>
                <TableCell align="right">
                  {gameEventData?.facedAgainst
                    ? `${gameEventData?.facedAgainst?.node?.name} (${gameEventData?.facedAgainst?.jersey})`
                    : ''}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  )
}

export { PenaltyShotForm }
