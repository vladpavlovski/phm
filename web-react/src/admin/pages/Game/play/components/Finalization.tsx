/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getFieldName, getKeyValue, setKeyValue } from 'admin/pages/Game/play/handlers'
import dayjs from 'dayjs'
import React from 'react'
import { Game, GameResult, PeriodStatistic, Team } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import Button from '@mui/material/Button'

type TFinalization = {
  gameData: Game
  updateGameResult: MutationFunction
  teamHost: Team
  teamGuest: Team
}

const Finalization: React.FC<TFinalization> = React.memo(props => {
  const { gameData, updateGameResult, teamHost } = props

  const prepareGameFinalization = React.useCallback(() => {
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
      const isHostEvent = ges?.team?.teamId === teamHost?.teamId
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
      const isHostEvent = ges?.team?.teamId === teamHost?.teamId
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

    updateGameResult({
      variables: {
        where: {
          gameResultId,
        },
        update: {
          ...rest,
          hostWin,
          guestWin,
          draw,
          gameStatus: 'Finished',
          periodActive: null,
          periodStatistics: {
            delete: periodStatisticsToDelete,
            create: periodStatistics.map(ps => ({ node: ps })),
          },
        },
      },
    })
  }, [gameData, teamHost])

  return gameData?.gameResult?.periodActive ? (
    <Button
      fullWidth
      onClick={prepareGameFinalization}
      variant="contained"
      disabled={!gameData?.gameResult?.periodActive}
    >
      End Game
    </Button>
  ) : null
})

export { Finalization }
