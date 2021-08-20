import React, { useCallback, useContext } from 'react'

import { useParams, useHistory } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet'

import { yupResolver } from '@hookform/resolvers/yup'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import { LinkButton } from '../../../components/LinkButton'
import Toolbar from '@material-ui/core/Toolbar'
import PlayCircleIcon from '@material-ui/icons/PlayCircle'
import Autocomplete from '@material-ui/core/Autocomplete'
import TextField from '@material-ui/core/TextField'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'

import { RHFDatepicker } from '../../../components/RHFDatepicker'
import { RHFTimepicker } from '../../../components/RHFTimepicker'

import { RHFInput } from '../../../components/RHFInput'
import { decomposeDate, decomposeTime, isValidUuid } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import {
  getAdminOrgGamesRoute,
  getAdminOrgGameRoute,
  getAdminOrgGamePlayRoute,
} from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'

import { Relations } from './relations'
import OrganizationContext from '../../../context/organization'

export const GET_GAME = gql`
  query getGame($where: GameWhere) {
    games(where: $where) {
      gameId
      name
      type
      info
      foreignId
      description
      teamsConnection {
        edges {
          host
          node {
            teamId
            name
            nick
            logo
          }
        }
      }
      playersConnection {
        edges {
          host
          jersey
          position
          node {
            avatar
            playerId
            name
            firstName
            lastName
          }
        }
      }
      startDate
      endDate
      startTime
      endTime
      event {
        eventId
        name
      }
      venue {
        venueId
        name
      }
    }
  }
`

const GET_ALL_VENUES = gql`
  query getVenues($where: VenueWhere) {
    venues(where: $where) {
      venueId
      name
    }
  }
`

const CREATE_GAME = gql`
  mutation createGame($input: [GameCreateInput!]!) {
    createGames(input: $input) {
      games {
        gameId
      }
    }
  }
`

export const UPDATE_GAME = gql`
  mutation updateGame($where: GameWhere, $update: GameUpdateInput) {
    updateGame: updateGames(where: $where, update: $update) {
      games {
        gameId
        teamsConnection {
          edges {
            host
            node {
              teamId
              name
              nick
              logo
            }
          }
        }
        playersConnection {
          edges {
            host
            jersey
            position
            node {
              avatar
              playerId
              name
              firstName
              lastName
            }
          }
        }
      }
    }
  }
`

const DELETE_GAME = gql`
  mutation deleteGame($where: GameWhere) {
    deleteGames(where: $where) {
      nodesDeleted
    }
  }
`

const Game = () => {
  const history = useHistory()
  const classes = useStyles()
  const { organizationData } = useContext(OrganizationContext)
  const { enqueueSnackbar } = useSnackbar()
  const { gameId, organizationSlug } = useParams()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_GAME, {
    variables: { where: { gameId } },
    skip: gameId === 'new',
  })

  const { data: venuesData } = useQuery(GET_ALL_VENUES)

  const [
    createGame,
    { loading: mutationLoadingCreate, error: mutationErrorCreate },
  ] = useMutation(CREATE_GAME, {
    onCompleted: data => {
      if (gameId === 'new') {
        const newId = data?.createGames?.games?.[0]?.gameId
        newId && history.replace(getAdminOrgGameRoute(organizationSlug, newId))
      }
      enqueueSnackbar('Game saved!', { variant: 'success' })
    },
    onError: error => {
      enqueueSnackbar(`Error: ${error}`, {
        variant: 'error',
      })
    },
  })

  const [
    updateGame,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(UPDATE_GAME, {
    onCompleted: () => {
      enqueueSnackbar('Game updated!', { variant: 'success' })
    },
    onError: error => {
      enqueueSnackbar(`Error: ${error}`, {
        variant: 'error',
      })
    },
  })

  const [deleteGame, { loading: loadingDelete, error: errorDelete }] =
    useMutation(DELETE_GAME, {
      variables: { where: { gameId } },
      onCompleted: () => {
        history.push(getAdminOrgGamesRoute(organizationSlug))
        enqueueSnackbar('Game was deleted!')
      },
      onError: error => {
        enqueueSnackbar(`Error: ${error}`, {
          variant: 'error',
        })
      },
    })

  const gameData = queryData?.games?.[0]

  const { handleSubmit, control, errors, formState, register, setValue } =
    useForm({
      resolver: yupResolver(schema),
      defaultValues: { gameVenue: [] },
    })

  React.useEffect(() => {
    register('gameVenue', {
      validate: value => {
        return !!value?.venueId
      },
    })
  }, [register])

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { startDate, endDate, startTime, endTime, gameVenue, ...rest } =
          dataToCheck
        const dataToSubmit = {
          ...rest,
          ...decomposeDate(startDate, 'startDate'),
          ...decomposeDate(endDate, 'endDate'),
          ...decomposeTime(startTime, 'startTime'),
          ...decomposeTime(endTime, 'endTime'),
          org: {
            connect: {
              where: {
                node: { organizationId: organizationData?.organizationId },
              },
            },
          },
          ...(gameVenue && {
            venue: {
              disconnect: {
                where: {
                  node: {},
                },
              },
              connect: {
                where: {
                  node: { venueId: gameVenue?.venueId },
                },
              },
            },
          }),
        }
        gameId === 'new'
          ? createGame({
              variables: {
                input: dataToSubmit,
              },
            })
          : updateGame({
              variables: {
                where: {
                  gameId,
                },
                update: dataToSubmit,
              },
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
      {(mutationErrorMerge || mutationErrorCreate) && (
        <Error
          message={mutationErrorMerge?.message || mutationErrorCreate?.message}
        />
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
                <Grid item xs={12} md={8} lg={8}>
                  <Paper className={classes.paper}>
                    <Toolbar disableGutters className={classes.toolbarForm}>
                      <div>
                        <Title sx={{ display: 'inline' }}>{'Game'}</Title>
                      </div>
                      <div>
                        {formState.isDirty && (
                          <ButtonSave
                            loading={
                              mutationLoadingMerge || mutationLoadingCreate
                            }
                          />
                        )}
                        {gameId !== 'new' && (
                          <ButtonDelete
                            loading={loadingDelete}
                            onClick={deleteGame}
                          />
                        )}
                      </div>
                    </Toolbar>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={6} lg={6}>
                        <RHFInput
                          defaultValue={gameData?.name}
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
                          views={['year', 'month', 'day']}
                          error={errors?.startDate}
                          defaultValue={gameData?.startDate}
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
                          defaultValue={gameData?.startTime}
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
                          views={['year', 'month', 'day']}
                          defaultValue={gameData?.endDate}
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
                          defaultValue={gameData?.endTime}
                          error={errors?.endTime}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} lg={6}>
                        <RHFInput
                          defaultValue={gameData?.description}
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

                      <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Autocomplete
                          id="combo-box-game-venue"
                          options={venuesData?.venues || []}
                          // value={gameData?.venue}
                          defaultValue={gameData?.venue}
                          renderInput={params => (
                            <TextField
                              variant="standard"
                              {...params}
                              label="Venue"
                              error={errors?.gameVenue}
                              helperText={errors?.gameVenue?.message}
                            />
                          )}
                          getOptionLabel={option => option.name}
                          // isOptionEqualToValue={(option, value) =>
                          //   option.venueId === value.venueId
                          // }
                          getOptionSelected={(option, value) =>
                            option.venueId === value.venueId
                          }
                          onChange={(_, options) =>
                            setValue('gameVenue', options)
                          }
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper className={classes.paper}>
                    <Toolbar disableGutters className={classes.toolbarForm}>
                      <div>
                        <Title>{'Result'}</Title>
                      </div>
                    </Toolbar>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <LinkButton
                          to={getAdminOrgGamePlayRoute(
                            organizationSlug,
                            gameId
                          )}
                          fullWidth
                          size="medium"
                          // target="_blank"
                          variant={'outlined'}
                          className={classes.submit}
                          startIcon={<PlayCircleIcon />}
                        >
                          Play
                        </LinkButton>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </form>
            {isValidUuid(gameId) && (
              <Relations
                gameId={gameId}
                teams={gameData?.teamsConnection?.edges}
                players={gameData?.playersConnection?.edges}
              />
            )}
          </>
        )}
    </Container>
  )
}

export { Game as default }
