/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Title } from 'components/Title'
import dayjs from 'dayjs'
import React from 'react'
import { Game, GameResult, PeriodStatistic, Team } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import CompareIcon from '@mui/icons-material/Compare'
import SafetyDividerIcon from '@mui/icons-material/SafetyDivider'
import LoadingButton from '@mui/lab/LoadingButton'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Toolbar from '@mui/material/Toolbar'
import { getFieldName, getKeyValue, setKeyValue } from '../play/handlers'

type TGameStatus = {
  gameData: Game
  updateGame: MutationFunction
}

const GameStatus: React.FC<TGameStatus> = props => {
  const { gameData, updateGame } = props
  const loading = false

  const hostTeam = React.useMemo<Team | undefined>(
    () => gameData?.teamsConnection?.edges.find(e => e.host)?.node,
    [gameData]
  )
  const guestTeam = React.useMemo<Team | undefined>(
    () => gameData?.teamsConnection?.edges.find(e => !e.host)?.node,
    [gameData]
  )

  const winner = React.useMemo(() => {
    if (gameData?.gameResult?.hostWin) return hostTeam
    if (gameData?.gameResult?.guestWin) return guestTeam
    return null
  }, [gameData, hostTeam, guestTeam])

  const looser = React.useMemo<Team | undefined | null>(() => {
    if (!gameData?.gameResult?.hostWin) return hostTeam
    if (!gameData?.gameResult?.guestWin) return guestTeam
    return null
  }, [gameData, hostTeam, guestTeam])

  const recomputeGameResult = React.useCallback(() => {
    const { __typename, ...restGameData } = gameData?.gameResult
    const gameResultNew: GameResult = {
      ...restGameData,
      periodStatistics: [],
    }

    // clear previous values
    const periodStatisticsToDelete =
      gameData?.gameResult?.periodStatistics?.map(ps => ({
        where: { node: { periodStatisticId: ps?.periodStatisticId } },
      }))
    let key: keyof GameResult
    for (key in gameResultNew) {
      // skip loop if the property is from prototype
      if (!Object.prototype.hasOwnProperty.call(gameResultNew, key)) continue
      if (typeof gameResultNew[key] === 'number') {
        setKeyValue<keyof GameResult, GameResult>(key, 0)(gameResultNew)
      }
    }

    gameData?.gameEventsSimple?.forEach(ges => {
      const isHostEvent = ges?.team?.teamId === hostTeam?.teamId
      const eventFieldName = getFieldName({
        host: isHostEvent,
        type: ges?.eventTypeCode,
      })

      setKeyValue<keyof GameResult, GameResult>(
        eventFieldName as keyof GameResult,
        0
      )(gameResultNew)
    })

    // count new values
    gameData?.gameEventsSimple?.forEach(ges => {
      const isHostEvent = ges?.team?.teamId === hostTeam?.teamId
      const eventFieldName = getFieldName({
        host: isHostEvent,
        type: ges?.eventTypeCode,
      })

      const fieldValue = getKeyValue<keyof GameResult, GameResult>(
        eventFieldName as keyof GameResult,
        gameResultNew
      ) as number

      setKeyValue<keyof GameResult, GameResult>(
        eventFieldName as keyof GameResult,
        fieldValue + 1
      )(gameResultNew)

      if (ges?.period) {
        const periodStatistics = gameResultNew.periodStatistics?.find(
          ps => ps?.period === ges.period
        )

        if (periodStatistics) {
          const field = getKeyValue<keyof PeriodStatistic, PeriodStatistic>(
            eventFieldName as keyof PeriodStatistic,
            periodStatistics
          ) as number

          setKeyValue<keyof PeriodStatistic, PeriodStatistic>(
            eventFieldName as keyof PeriodStatistic,
            field ? field + 1 : 1
          )(periodStatistics)
        } else {
          if (gameResultNew.periodStatistics) {
            gameResultNew.periodStatistics = [
              ...gameResultNew.periodStatistics,
              {
                period: ges?.period,
                [eventFieldName]: 1,
              },
            ]
          } else {
            gameResultNew.periodStatistics = [
              {
                period: ges?.period,
                [eventFieldName]: 1,
              },
            ]
          }
        }
      }
    })

    let hostWin = false
    let guestWin = false
    let draw = false
    if (gameResultNew?.hostGoals > gameResultNew?.guestGoals) {
      hostWin = true
    }
    if (gameResultNew?.hostGoals < gameResultNew?.guestGoals) {
      guestWin = true
    }
    if (gameResultNew?.hostGoals === gameResultNew?.guestGoals) {
      draw = true
    }

    gameResultNew.hostWin = hostWin
    gameResultNew.guestWin = guestWin
    gameResultNew.draw = draw
    gameResultNew.gameStatus = dayjs().isAfter(dayjs(gameData?.startDate))
      ? 'Finished'
      : 'Not played'

    const { gameResultId, periodStatistics, ...rest } = gameResultNew

    const result = {
      where: {
        node: { gameResultId },
      },
      update: {
        node: {
          ...rest,
          periodStatistics: {
            delete: periodStatisticsToDelete,
            create: periodStatistics.map(ps => ({ node: ps })),
          },
        },
      },
    }

    updateGame({
      variables: {
        where: {
          gameId: gameData?.gameId,
        },
        update: {
          gameResult: {
            ...result,
          },
        },
      },
    })
  }, [gameData, hostTeam, guestTeam])

  return (
    <>
      <Toolbar
        disableGutters
        sx={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <div>
          <Title>{`Status: ${gameData?.gameResult?.gameStatus}`}</Title>
        </div>
        <div>
          <LoadingButton
            size="small"
            type="button"
            variant="contained"
            color="primary"
            loading={loading}
            loadingPosition="start"
            startIcon={<CompareIcon />}
            onClick={() => {
              recomputeGameResult()
            }}
          >
            {loading ? 'Computing...' : 'Recompute'}
          </LoadingButton>
        </div>
      </Toolbar>
      <Grid container>
        <Grid item xs={12}>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              display: 'flex',
              justifyContent: gameData?.gameResult?.draw
                ? 'center'
                : 'space-between',
            }}
          >
            {winner && looser && (
              <>
                {/* Winner chip */}
                <Chip
                  avatar={<Avatar alt={winner?.nick} src={winner?.logo} />}
                  label={winner?.name}
                  color="success"
                />
                {/* Looser chip */}
                <Chip
                  avatar={<Avatar alt={looser?.nick} src={looser?.logo} />}
                  label={looser?.name}
                  color="error"
                />
              </>
            )}
            {gameData?.gameResult?.draw && (
              <Chip
                icon={<SafetyDividerIcon />}
                label={'Draw'}
                color="default"
              />
            )}
          </Stack>
        </Grid>
      </Grid>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="right">{hostTeam?.nick}</TableCell>
            <TableCell align="right">{guestTeam?.nick}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row">
              Goals
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.hostGoals}
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.guestGoals}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">
              Penalties
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.hostPenalties}
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.guestPenalties}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">
              PenaltyShots
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.hostPenaltyShots}
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.guestPenaltyShots}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">
              Saves
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.hostSaves}
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.guestSaves}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">
              FaceOffs
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.hostFaceOffs}
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.guestFaceOffs}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">
              Injuries
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.hostInjuries}
            </TableCell>
            <TableCell align="right">
              {gameData?.gameResult?.guestInjuries}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  )
}

export { GameStatus }
