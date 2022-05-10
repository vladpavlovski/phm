import {
  Error,
  LinkButton,
  Loader,
  RHFDatepicker,
  RHFInput,
  RHFSelect,
  RHFTimepicker,
  Title,
} from 'components'
import OrganizationContext from 'context/organization'
import { useSnackbar } from 'notistack'
import React, { useCallback, useContext } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'
import {
  getAdminOrgGamePlayRoute,
  getAdminOrgGameRoute,
  getAdminOrgGamesRoute,
} from 'router/routes'
import { decomposeDate, decomposeTime, isValidUuid } from 'utils'
import { Game as GameType, Venue } from 'utils/types'
import { gql, useMutation, useQuery } from '@apollo/client'
import { yupResolver } from '@hookform/resolvers/yup'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import Autocomplete from '@mui/material/Autocomplete'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Toolbar from '@mui/material/Toolbar'
import { ButtonDelete } from '../commonComponents/ButtonDelete'
import { ButtonSave } from '../commonComponents/ButtonSave'
import { useStyles } from '../commonComponents/styled'
import { GameInvitation, GameReport, GameStatus } from './components'
import { Relations } from './relations'
import { schema } from './schema'

export const GET_GAME = gql`
  query getGame($where: GameWhere) {
    games(where: $where) {
      gameId
      name
      type
      info
      foreignId
      description
      timekeeper
      referee
      status
      flickrAlbum
      report
      paymentHost
      paymentGuest
      paymentTimekeeper
      paymentReferee
      price
      headline
      perex
      body
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
          captain
          goalkeeper
          star
          teamId
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
      gameEventsSimple {
        gameEventSimpleId
        timestamp
        period
        remainingTime
        eventType
        eventTypeCode
        goalType
        goalSubType
        shotType
        shotSubType
        penaltyType
        penaltySubType
        duration
        injuryType
        team {
          teamId
          nick
          logo
        }
        scoredBy {
          player {
            playerId
          }
        }
        allowedBy {
          player {
            playerId
          }
        }
        firstAssist {
          player {
            playerId
          }
        }
        secondAssist {
          player {
            playerId
          }
        }
        penalized {
          player {
            playerId
          }
        }
      }
      gameResult {
        gameResultId
        hostWin
        guestWin
        draw
        periodActive
        gameStartedAt
        gameStatus
        hostGoals
        guestGoals
        hostPenalties
        guestPenalties
        hostPenaltyShots
        guestPenaltyShots
        hostInjuries
        guestInjuries
        hostSaves
        guestSaves
        hostFaceOffs
        guestFaceOffs
        periodStatistics {
          periodStatisticId
          period
          hostGoals
          guestGoals
          hostPenalties
          guestPenalties
          hostPenaltyShots
          guestPenaltyShots
          hostInjuries
          guestInjuries
          hostSaves
          guestSaves
          hostFaceOffs
          guestFaceOffs
        }
      }
      media {
        mediaId
      }
    }
    venues {
      venueId
      name
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
        name
        type
        info
        foreignId
        description
        timekeeper
        referee
        status
        flickrAlbum
        report
        paymentHost
        paymentGuest
        paymentTimekeeper
        paymentReferee
        price
        headline
        perex
        body
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
            captain
            goalkeeper
            star
            teamId
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
        gameEventsSimple {
          gameEventSimpleId
          timestamp
          period
          remainingTime
          eventType
          eventTypeCode
          goalType
          goalSubType
          shotType
          shotSubType
          penaltyType
          penaltySubType
          duration
          injuryType
          team {
            teamId
            nick
            logo
          }
          scoredBy {
            player {
              playerId
            }
          }
          firstAssist {
            player {
              playerId
            }
          }
          secondAssist {
            player {
              playerId
            }
          }
          penalized {
            player {
              playerId
            }
          }
        }
        gameResult {
          gameResultId
          hostWin
          guestWin
          draw
          periodActive
          gameStartedAt
          gameStatus
          hostGoals
          guestGoals
          hostPenalties
          guestPenalties
          hostPenaltyShots
          guestPenaltyShots
          hostInjuries
          guestInjuries
          hostSaves
          guestSaves
          hostFaceOffs
          guestFaceOffs
          periodStatistics {
            periodStatisticId
            period
            hostGoals
            guestGoals
            hostPenalties
            guestPenalties
            hostPenaltyShots
            guestPenaltyShots
            hostInjuries
            guestInjuries
            hostSaves
            guestSaves
            hostFaceOffs
            guestFaceOffs
          }
        }
        media {
          mediaId
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

type TParams = {
  gameId: string
  organizationSlug: string
}

export type TQueryTypeData = {
  games: GameType[]
  venues: Venue[]
}

export type TQueryTypeVars = {
  where: {
    gameId: string
  }
}

const Game: React.FC = () => {
  const history = useHistory()
  const classes = useStyles()
  const { organizationData } = useContext(OrganizationContext)
  const { enqueueSnackbar } = useSnackbar()
  const { gameId, organizationSlug } = useParams<TParams>()

  const {
    loading: queryLoading,
    data: { games: [gameData], venues: gameVenues } = {
      games: [],
      venues: null,
    },
    error: queryError,
  } = useQuery(GET_GAME, {
    variables: { where: { gameId } },
    skip: gameId === 'new',
    onCompleted: data => {
      // create GameResult entity for already exists Game
      if (!data?.games?.[0]?.gameResult) {
        updateGame({
          variables: {
            where: {
              gameId,
            },
            update: {
              gameResult: {
                create: {
                  node: {},
                },
              },
            },
          },
        })
      }
    },
  })

  const { data: venuesData } = useQuery(GET_ALL_VENUES, {
    skip: gameId !== 'new',
  })

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
    update(cache, { data }) {
      try {
        const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
          query: GET_GAME,
          variables: {
            where: { gameId },
          },
        })

        cache.writeQuery({
          query: GET_GAME,
          data: {
            games: data?.updateGame?.games,
            venues: queryResult?.venues,
          },
          variables: { where: { gameId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
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

  const { handleSubmit, control, errors, register, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      gameVenue: gameData?.venue || null,
      name: gameData?.name,
      foreignId: gameData?.foreignId,
      type: gameData?.type,
      startDate: gameData?.startDate,
      startTime: gameData?.startTime,
      endDate: gameData?.endDate,
      endTime: gameData?.endTime,
      timekeeper: gameData?.timekeeper,
      referee: gameData?.referee,
      description: gameData?.description,
      info: gameData?.info,
      flickrAlbum: gameData?.flickrAlbum,
      headline: gameData?.headline,
      perex: gameData?.perex,
      body: gameData?.body,
      paymentHost: gameData?.paymentHost,
      paymentGuest: gameData?.paymentGuest,
      paymentTimekeeper: gameData?.paymentTimekeeper,
      paymentReferee: gameData?.paymentReferee,
      price: gameData?.price,
    },
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
        const {
          startDate,
          endDate,
          startTime,
          endTime,
          gameVenue,
          price,
          ...rest
        } = dataToCheck
        const dataToSubmit = {
          ...rest,
          ...decomposeDate(startDate, 'startDate'),
          ...decomposeDate(endDate, 'endDate'),
          ...decomposeTime(startTime, 'startTime'),
          ...decomposeTime(endTime, 'endTime'),
          price: price ? parseInt(price) : null,
          org: {
            connect: {
              where: {
                node: { organizationId: organizationData?.organizationId },
              },
            },
          },
          ...(gameId === 'new' && {
            gameResult: {
              create: {
                node: {},
              },
            },
          }),
          ...(gameVenue?.venueId && {
            venue: {
              ...(gameId !== 'new' && {
                disconnect: {
                  where: {
                    node: {},
                  },
                },
              }),
              ...(gameVenue?.venueId && {
                connect: {
                  where: {
                    node: { venueId: gameVenue?.venueId },
                  },
                },
              }),
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
    <Container maxWidth={false}>
      {queryLoading && <Loader />}

      <Error
        message={
          queryError?.message ||
          mutationErrorMerge?.message ||
          mutationErrorCreate?.message ||
          errorDelete?.message
        }
      />
      {(gameData || gameId === 'new') && (
        <>
          <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
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
                      {/* {formState.isDirty && ( */}
                      {/* { // TODO: country change not triggered!!} */}
                      <ButtonSave
                        loading={mutationLoadingMerge || mutationLoadingCreate}
                      />
                      {/* )} */}
                      {gameId !== 'new' && (
                        <ButtonDelete
                          loading={loadingDelete}
                          onClick={() => {
                            deleteGame()
                          }}
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
                        defaultValue={gameData?.timekeeper}
                        control={control}
                        name="timekeeper"
                        label="Timekeeper"
                        fullWidth
                        multiline
                        maxRows={4}
                        variant="standard"
                        error={errors?.timekeeper}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                      <RHFInput
                        defaultValue={gameData?.referee}
                        control={control}
                        name="referee"
                        label="Referee"
                        fullWidth
                        multiline
                        maxRows={4}
                        variant="standard"
                        error={errors?.referee}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                      <RHFInput
                        defaultValue={gameData?.description}
                        control={control}
                        name="description"
                        label="Description"
                        multiline
                        maxRows={4}
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
                        multiline
                        maxRows={4}
                        variant="standard"
                        error={errors?.info}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={6} lg={6}>
                      <Autocomplete
                        id="combo-box-game-venue"
                        options={gameVenues || venuesData?.venues || []}
                        defaultValue={gameData?.venue || null}
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
                        isOptionEqualToValue={(option, value) =>
                          option.venueId === value.venueId
                        }
                        // getOptionSelected={(option, value) =>
                        //   option.venueId === value.venueId
                        // }
                        onChange={(_, options) =>
                          setValue('gameVenue', options)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                      <RHFInput
                        defaultValue={gameData?.flickrAlbum}
                        control={control}
                        name="flickrAlbum"
                        label="Flickr Album"
                        fullWidth
                        multiline
                        variant="standard"
                        error={errors?.flickrAlbum}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <RHFInput
                        defaultValue={gameData?.headline}
                        control={control}
                        name="headline"
                        label="Headline"
                        multiline
                        maxRows={4}
                        fullWidth
                        variant="standard"
                        error={errors.headline}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <RHFInput
                        defaultValue={gameData?.perex}
                        control={control}
                        name="perex"
                        label="Perex"
                        multiline
                        maxRows={10}
                        fullWidth
                        variant="standard"
                        error={errors.perex}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <RHFInput
                        defaultValue={gameData?.body}
                        control={control}
                        name="body"
                        label="Body"
                        multiline
                        maxRows={10}
                        fullWidth
                        variant="standard"
                        error={errors.body}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFSelect
                        fullWidth
                        name="paymentHost"
                        label="Payment Host"
                        id="paymentHost"
                        control={control}
                        defaultValue={gameData?.paymentHost || ''}
                        error={errors.paymentHost}
                      >
                        <MenuItem value="paid">Paid</MenuItem>
                        <MenuItem value="notPaid">Not paid</MenuItem>
                      </RHFSelect>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFSelect
                        fullWidth
                        name="paymentGuest"
                        label="Payment Guest"
                        id="paymentGuest"
                        control={control}
                        defaultValue={gameData?.paymentGuest || ''}
                        error={errors.paymentGuest}
                      >
                        <MenuItem value="paid">Paid</MenuItem>
                        <MenuItem value="notPaid">Not paid</MenuItem>
                      </RHFSelect>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFSelect
                        fullWidth
                        name="paymentTimekeeper"
                        label="Payment Timekeeper"
                        id="paymentTimekeeper"
                        control={control}
                        defaultValue={gameData?.paymentTimekeeper || ''}
                        error={errors.paymentTimekeeper}
                      >
                        <MenuItem value="paid">Paid</MenuItem>
                        <MenuItem value="notPaid">Not paid</MenuItem>
                      </RHFSelect>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFSelect
                        fullWidth
                        name="paymentReferee"
                        label="Payment Referee"
                        id="paymentReferee"
                        control={control}
                        defaultValue={gameData?.paymentReferee || ''}
                        error={errors.paymentReferee}
                      >
                        <MenuItem value="paid">Paid</MenuItem>
                        <MenuItem value="notPaid">Not paid</MenuItem>
                      </RHFSelect>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={gameData?.price}
                        control={control}
                        name="price"
                        label="Price"
                        type="number"
                        fullWidth
                        variant="standard"
                        error={errors?.price}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              {gameData?.gameId && (
                <Grid item xs={12} sm={4}>
                  <Paper className={classes.paper}>
                    <Toolbar disableGutters className={classes.toolbarForm}>
                      <div>
                        <Title>{'Play'}</Title>
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
                          target="_blank"
                          variant={'outlined'}
                          className={classes.submit}
                          startIcon={<PlayCircleIcon />}
                        >
                          Play
                        </LinkButton>
                      </Grid>
                      <Grid item xs={12}>
                        <GameStatus
                          gameData={gameData}
                          updateGame={updateGame}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <GameReport gameId={gameData?.gameId} />
                      </Grid>
                      <Grid item xs={12}>
                        <GameInvitation gameData={gameData} />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </form>
          {isValidUuid(gameId) && (
            <Relations
              gameId={gameId}
              teams={gameData?.teamsConnection?.edges}
              players={gameData?.playersConnection?.edges}
              gameData={gameData}
              updateGame={updateGame}
            />
          )}
        </>
      )}
    </Container>
  )
}

export { Game as default }
