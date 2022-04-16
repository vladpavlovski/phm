import { Game, GameResult, PeriodStatistic } from 'utils/types'

import { TEventType } from '../components/gameEvents'
type TFieldNameParams = {
  type: string
  host: boolean
}
export const getFieldName = <T extends TFieldNameParams>(params: T): string => {
  const { type, host } = params
  const prefix = host ? 'host' : 'guest'

  switch (type) {
    case 'goal':
      return `${prefix}Goals`
    case 'penalty':
      return `${prefix}Penalties`
    case 'penaltyShot':
      return `${prefix}PenaltyShots`
    case 'injury':
      return `${prefix}Injuries`
    case 'save':
      return `${prefix}Saves`
    case 'faceOff':
      return `${prefix}FaceOffs`
    // case 'hit':
    //   break
    // case 'takeOver':
    //   break
    // case 'icing':
    //   break
    // case 'fight':
    //   break
    // case 'intervalOnIce':
    //   break
    // case 'timeout':
    //   break
    // case 'shot':
    //   break
    // case 'revision':
    //   break
    // case 'offside':
    //   break
    // case 'pass':
    //   break
    // case 'star':
    //   break
  }
  return 'game'
}

type TPrepareGameResultUpdate = {
  gameData: Game
  gameEventSettings: TEventType
  host: boolean
  changeUp?: boolean | null
}

export const getKeyValue = <T extends keyof U, U>(key: T, obj: U): U[T] =>
  obj[key]

export const setKeyValue =
  <U extends keyof T, T extends Record<string, unknown>>(key: U, val: T[U]) =>
  (obj: T): void => {
    obj[key] = val
  }

export const ensure = <T>(
  argument: T | undefined | null,
  message = 'This value was promised to be there.'
): T => {
  if (argument === undefined || argument === null) {
    throw new TypeError(message)
  }

  return argument
}

export const prepareGameResultUpdate = (
  props: TPrepareGameResultUpdate
): Record<string, unknown> => {
  const { gameData, gameEventSettings, host, changeUp = true } = props
  const period = gameData?.gameResult?.periodActive
  const possiblePeriod: PeriodStatistic | undefined =
    gameData?.gameResult?.periodStatistics?.find(ps => ps.period === period)

  const fieldName = getFieldName({
    host,
    type: gameEventSettings.type,
  })

  const fieldValueGameResult = getKeyValue<keyof GameResult, GameResult>(
    fieldName as keyof GameResult,
    gameData?.gameResult
  )

  const fieldValuePeriod = possiblePeriod
    ? getKeyValue<keyof PeriodStatistic, PeriodStatistic>(
        fieldName as keyof PeriodStatistic,
        possiblePeriod
      )
    : null

  const preparedOutput = {
    where: {
      gameResultId: gameData?.gameResult?.gameResultId,
    },
    update: {
      ...(fieldName && {
        [fieldName]:
          typeof fieldValueGameResult === 'number' &&
          typeof changeUp === 'boolean'
            ? changeUp
              ? fieldValueGameResult + 1
              : fieldValueGameResult - 1
            : fieldValueGameResult,
        periodStatistics: {
          ...(possiblePeriod?.periodStatisticId
            ? {
                where: {
                  node: {
                    periodStatisticId: possiblePeriod?.periodStatisticId,
                  },
                },
                update: {
                  node: {
                    period,
                    [fieldName]:
                      typeof fieldValuePeriod === 'number' &&
                      typeof changeUp === 'boolean'
                        ? changeUp
                          ? fieldValuePeriod + 1
                          : fieldValuePeriod - 1
                        : fieldValuePeriod,
                  },
                },
              }
            : {
                create: {
                  node: {
                    period,
                    [fieldName]: 1,
                  },
                },
              }),
        },
      }),
    },
  }

  return preparedOutput
}
