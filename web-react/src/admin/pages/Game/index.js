import React, { useCallback } from 'react'

import { useParams, useHistory } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet'

import { yupResolver } from '@hookform/resolvers/yup'
import { Container, Grid, Paper } from '@material-ui/core'

import Toolbar from '@material-ui/core/Toolbar'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'

import { RHFDatepicker } from '../../../components/RHFDatepicker'
import { RHFTimepicker } from '../../../components/RHFTimepicker'

import { RHFInput } from '../../../components/RHFInput'
import {
  decomposeDate,
  decomposeTime,
  checkId,
  isValidUuid,
} from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { ADMIN_GAMES, getAdminGameRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'

import { Relations } from './relations'

export const GET_GAME = gql`
  query getGame($gameId: ID!) {
    game: Game(gameId: $gameId) {
      gameId
      name
      type
      info
      foreignId
      description
      teams {
        team {
          teamId
          name
          logo
        }
        host
      }
      players {
        player {
          avatar
          playerId
          name
          firstName
          lastName
        }
        host
        jersey
        position
      }
      startDate {
        formatted
      }
      endDate {
        formatted
      }
      startTime {
        formatted
      }
      endTime {
        formatted
      }
      event {
        eventId
        name
      }
    }
  }
`

const MERGE_GAME = gql`
  mutation mergeGame(
    $gameId: ID!
    $name: String!
    $type: String
    $description: String
    $info: String
    $foreignId: String
    $startDateDay: Int
    $startDateMonth: Int
    $startDateYear: Int
    $endDateDay: Int
    $endDateMonth: Int
    $endDateYear: Int
    $startTimeHour: Int
    $startTimeMinute: Int
    $endTimeHour: Int
    $endTimeMinute: Int
  ) {
    mergeGame: MergeGame(
      gameId: $gameId
      name: $name
      description: $description
      info: $info
      type: $type
      foreignId: $foreignId
      startDate: {
        day: $startDateDay
        month: $startDateMonth
        year: $startDateYear
      }
      endDate: { day: $endDateDay, month: $endDateMonth, year: $endDateYear }
      startTime: { hour: $startTimeHour, minute: $startTimeMinute }
      endTime: { hour: $endTimeHour, minute: $endTimeMinute }
    ) {
      gameId
    }
  }
`

const DELETE_GAME = gql`
  mutation deleteGame($gameId: ID!) {
    deleteGame: DeleteGame(gameId: $gameId) {
      gameId
    }
  }
`

const Game = () => {
  const history = useHistory()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { gameId } = useParams()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_GAME, {
    fetchPolicy: 'network-only',
    variables: { gameId },
    skip: gameId === 'new',
  })

  const [
    mergeGame,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(MERGE_GAME, {
    onCompleted: data => {
      if (gameId === 'new') {
        const newId = data.mergeGame.gameId
        history.replace(getAdminGameRoute(newId))
      }
      enqueueSnackbar('Game saved!', { variant: 'success' })
    },
  })

  const [
    deleteGame,
    { loading: loadingDelete, error: errorDelete },
  ] = useMutation(DELETE_GAME, {
    onCompleted: () => {
      history.push(ADMIN_GAMES)
      enqueueSnackbar('Game was deleted!')
    },
  })

  const gameData = queryData?.game[0] || {}

  const { handleSubmit, control, errors, formState } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { startDate, endDate, startTime, endTime, ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          gameId: checkId(gameId),
          ...decomposeDate(startDate, 'startDate'),
          ...decomposeDate(endDate, 'endDate'),
          ...decomposeTime(startTime, 'startTime'),
          ...decomposeTime(endTime, 'endTime'),
        }

        mergeGame({
          variables: dataToSubmit,
        })
      } catch (error) {
        console.error(error)
      }
    },
    [gameId]
  )

  return (
    <Container maxWidth={false} className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationErrorMerge && !mutationLoadingMerge && (
        <Error message={mutationErrorMerge.message} />
      )}
      {(gameData || gameId === 'new') &&
        !queryLoading &&
        !queryError &&
        !mutationErrorMerge && (
          <>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={classes.form}
              noValidate
              autoComplete="off"
            >
              <Helmet>
                <title>{gameData?.name || 'Game'}</title>
              </Helmet>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12} lg={12}>
                  <Paper className={classes.paper}>
                    <Toolbar disableGutters className={classes.toolbarForm}>
                      <div>
                        <Title>{'Game'}</Title>
                      </div>
                      <div>
                        {formState.isDirty && (
                          <ButtonSave loading={mutationLoadingMerge} />
                        )}
                        {gameId !== 'new' && (
                          <ButtonDelete
                            loading={loadingDelete}
                            onClick={() => {
                              deleteGame({ variables: { gameId } })
                            }}
                          />
                        )}
                      </div>
                    </Toolbar>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={6} lg={6}>
                        <RHFInput
                          defaultValue={gameData.name}
                          control={control}
                          name="name"
                          label="Name"
                          required
                          fullWidth
                          variant="standard"
                          error={errors.name}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={gameData?.foreignId}
                          control={control}
                          name="foreignId"
                          label="Foreign Id"
                          fullWidth
                          variant="standard"
                          error={errors?.foreignId}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={gameData?.type}
                          control={control}
                          name="type"
                          label="Type"
                          fullWidth
                          variant="standard"
                          error={errors?.type}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFDatepicker
                          fullWidth
                          control={control}
                          variant="standard"
                          name="startDate"
                          label="Start Date"
                          id="startDate"
                          openTo="year"
                          inputFormat={'DD/MM/YYYY'}
                          views={['year', 'month', 'date']}
                          defaultValue={gameData?.startDate?.formatted}
                          error={errors?.startDate}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFTimepicker
                          fullWidth
                          control={control}
                          variant="standard"
                          name="startTime"
                          label="Start Time"
                          id="startTime"
                          mask="__:__"
                          openTo="hours"
                          inputFormat={'HH:mm'}
                          views={['hours', 'minutes']}
                          defaultValue={gameData?.startTime?.formatted}
                          error={errors?.startTime}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFDatepicker
                          fullWidth
                          control={control}
                          variant="standard"
                          name="endDate"
                          label="End Date"
                          id="endDate"
                          openTo="year"
                          inputFormat={'DD/MM/YYYY'}
                          views={['year', 'month', 'date']}
                          defaultValue={gameData?.endDate?.formatted}
                          error={errors?.endDate}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFTimepicker
                          fullWidth
                          control={control}
                          variant="standard"
                          name="endTime"
                          label="End Time"
                          id="endTime"
                          mask="__:__"
                          openTo="hours"
                          inputFormat={'HH:mm'}
                          views={['hours', 'minutes']}
                          defaultValue={gameData?.endTime?.formatted}
                          error={errors?.endTime}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} lg={6}>
                        <RHFInput
                          defaultValue={gameData.description}
                          control={control}
                          name="description"
                          label="Description"
                          fullWidth
                          variant="standard"
                          error={errors.description}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} lg={6}>
                        <RHFInput
                          defaultValue={gameData?.info}
                          control={control}
                          name="info"
                          label="Info"
                          fullWidth
                          variant="standard"
                          error={errors?.info}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </form>
            {isValidUuid(gameId) && (
              <Relations
                gameId={gameId}
                teams={gameData?.teams}
                players={gameData?.players}
              />
            )}
          </>
        )}
    </Container>
  )
}

export { Game as default }
