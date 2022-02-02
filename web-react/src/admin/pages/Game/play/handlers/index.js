export const getFieldName = ({ type, host }) => {
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
    case 'hit':
      break
    case 'takeOver':
      break
    case 'icing':
      break
    case 'fight':
      break
    case 'intervalOnIce':
      break
    case 'timeout':
      break
    case 'shot':
      break
    case 'revision':
      break
    case 'offside':
      break
    case 'pass':
      break
    case 'star':
      break
    default:
      return null
  }

  return
}

export const prepareGameResultUpdate = props => {
  const { gameData, gameEventSettings, host, changeUp = true } = props
  const period = gameData?.gameResult?.periodActive
  const possiblePeriod = gameData?.gameResult?.periodStatistics?.find(
    ps => ps.period === period
  )
  const fieldName = getFieldName({ host, type: gameEventSettings?.type })

  let preparedOutput = {
    where: {
      gameResultId: gameData?.gameResult?.gameResultId,
    },
    update: {
      ...(fieldName && {
        [fieldName]: changeUp
          ? gameData?.gameResult?.[fieldName] + 1
          : gameData?.gameResult?.[fieldName] - 1,
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
                    [fieldName]: changeUp
                      ? gameData?.gameResult?.periodStatistics?.[fieldName] + 1
                      : gameData?.gameResult?.periodStatistics?.[fieldName] - 1,
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