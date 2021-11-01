import React, { useCallback, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'

import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet'
import { useSnackbar } from 'notistack'
import { yupResolver } from '@hookform/resolvers/yup'
import Img from 'react-cool-img'

import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import MenuItem from '@mui/material/MenuItem'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'

import { RHFAutocomplete } from '../../../components/RHFAutocomplete'
import { RHFDatepicker } from '../../../components/RHFDatepicker'
import { RHFSelect } from '../../../components/RHFSelect'
import { RHFInput } from '../../../components/RHFInput'
import { Uploader } from '../../../components/Uploader'
import { countriesNames } from '../../../utils/constants/countries'
import { decomposeDate, isValidUuid } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { Relations } from './relations'

import {
  getAdminOrgPlayersRoute,
  getAdminOrgPlayerRoute,
} from '../../../router/routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'
import placeholderAvatar from '../../../img/placeholderPerson.jpg'

const GET_PLAYER = gql`
  query getPlayer($where: PlayerWhere) {
    players(where: $where) {
      playerId
      firstName
      lastName
      birthday
      externalId
      activityStatus
      country
      city
      stick
      height
      weight
      gender
      avatar
      phone
      email
      teams {
        teamId
        name
        positions {
          positionId
          name
        }
        jerseys {
          jerseyId
          name
          number
        }
      }
      positions {
        positionId
        name
        team {
          name
        }
      }
      jerseys {
        jerseyId
        name
        number
        team {
          name
        }
      }
      sponsors {
        sponsorId
        name
      }
    }
  }
`

const CREATE_PLAYER = gql`
  mutation createPlayer($input: [PlayerCreateInput!]!) {
    createPlayers(input: $input) {
      players {
        playerId
        firstName
        lastName
        birthday
        externalId
        activityStatus
        country
        city
        stick
        height
        weight
        gender
        avatar
        phone
        email
      }
    }
  }
`

const UPDATE_PLAYER = gql`
  mutation updatePlayer($where: PlayerWhere, $update: PlayerUpdateInput) {
    updatePlayers(where: $where, update: $update) {
      players {
        playerId
        firstName
        lastName
        birthday
        externalId
        activityStatus
        country
        city
        stick
        height
        weight
        gender
        avatar
        phone
        email
        teams {
          teamId
          name
          positions {
            positionId
            name
          }
          jerseys {
            jerseyId
            name
            number
          }
        }
        positions {
          positionId
          name
          team {
            name
          }
        }
        jerseys {
          jerseyId
          name
          number
          team {
            name
          }
        }
        sponsors {
          sponsorId
          name
        }
      }
    }
  }
`

const DELETE_PLAYER = gql`
  mutation deletePlayer($where: PlayerWhere) {
    deletePlayers(where: $where) {
      nodesDeleted
    }
  }
`

const Player = () => {
  const history = useHistory()
  const classes = useStyles()
  const { playerId, organizationSlug } = useParams()
  const { enqueueSnackbar } = useSnackbar()
  const client = useApolloClient()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_PLAYER, {
    variables: { where: { playerId } },
    fetchPolicy: 'network-only',
  })

  const [
    createPlayer,
    { loading: mutationLoadingCreate, error: mutationErrorCreate },
  ] = useMutation(CREATE_PLAYER, {
    onCompleted: data => {
      if (playerId === 'new') {
        const newId = data?.createPlayers?.players?.[0]?.playerId
        newId &&
          history.replace(getAdminOrgPlayerRoute(organizationSlug, newId))
      }
      enqueueSnackbar('Player saved!', { variant: 'success' })
    },
    onError: error => {
      enqueueSnackbar(`Error: ${error}`, {
        variant: 'error',
      })
    },
  })

  const [
    updatePlayer,
    { loading: mutationLoadingUpdate, error: mutationErrorUpdate },
  ] = useMutation(UPDATE_PLAYER, {
    update(cache, { data }) {
      try {
        cache.writeQuery({
          query: GET_PLAYER,
          data: {
            players: data?.updatePlayers?.players,
          },
          variables: { where: { playerId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      enqueueSnackbar('Player updated!', { variant: 'success' })
    },
    onError: error => {
      enqueueSnackbar(`Error: ${error}`, {
        variant: 'error',
      })
    },
  })

  const playerData = queryData?.players?.[0]

  const [deletePlayer, { loading: loadingDelete, error: errorDelete }] =
    useMutation(DELETE_PLAYER, {
      variables: { where: { playerId } },
      onCompleted: () => {
        history.push(getAdminOrgPlayersRoute(organizationSlug))
        enqueueSnackbar(`Player was deleted!`, {
          variant: 'info',
        })
      },
    })

  const { handleSubmit, control, errors, setValue, formState } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      country: '',
    },
  })

  useEffect(() => {
    if (playerData) {
      setValue('country', playerData.country)
    }
  }, [playerData])

  const onSubmit = useCallback(
    async dataToCheck => {
      try {
        const { country, birthday, ...rest } = dataToCheck
        const dataToSubmit = {
          ...rest,
          ...decomposeDate(birthday, 'birthday'),
          country: country || '',
        }

        playerId !== 'new'
          ? updatePlayer({
              variables: {
                where: {
                  playerId,
                },
                update: dataToSubmit,
              },
            })
          : createPlayer({
              variables: {
                input: {
                  ...dataToSubmit,
                  meta: {
                    create: {
                      node: {},
                    },
                  },
                },
              },
            })
      } catch (error) {
        console.error(error)
      }
    },
    [playerId]
  )

  const updateAvatar = useCallback(
    url => {
      setValue('avatar', url, true)

      const queryResult = client.readQuery({
        query: GET_PLAYER,
        variables: {
          where: { playerId },
        },
      })

      client.writeQuery({
        query: GET_PLAYER,
        data: {
          player: [
            {
              ...queryResult?.players?.[0],
              avatar: url,
            },
          ],
        },
        variables: {
          where: { playerId },
        },
      })
      handleSubmit(onSubmit)()
    },
    [client]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {(mutationErrorCreate || mutationErrorUpdate) && (
        <Error
          message={mutationErrorCreate.message || mutationErrorUpdate.message}
        />
      )}
      {(playerData || playerId === 'new') &&
        !queryError &&
        !mutationErrorCreate && (
          <>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={classes.form}
              noValidate
              autoComplete="off"
            >
              <Helmet>
                <title>{playerData?.name || 'Player'}</title>
              </Helmet>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4} lg={3}>
                  <Paper className={classes.paper}>
                    <Img
                      placeholder={placeholderAvatar}
                      src={playerData?.avatar}
                      className={classes.logo}
                      alt={playerData?.name}
                    />

                    <RHFInput
                      style={{ display: 'none' }}
                      defaultValue={playerData?.avatar}
                      control={control}
                      name="avatar"
                      label="Avatar URL"
                      disabled
                      fullWidth
                      variant="standard"
                      error={errors.avatar}
                    />

                    {isValidUuid(playerId) && (
                      <Uploader
                        buttonText={'Change avatar'}
                        onSubmit={updateAvatar}
                        folderName="images/avatars"
                      />
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={8} lg={9}>
                  <Paper className={classes.paper}>
                    <Toolbar disableGutters className={classes.toolbarForm}>
                      <div>
                        <Title>{'Player'}</Title>
                      </div>
                      <div>
                        {formState.isDirty && (
                          <ButtonSave
                            loading={
                              mutationLoadingCreate || mutationLoadingUpdate
                            }
                          />
                        )}
                        {playerId !== 'new' && (
                          <ButtonDelete
                            loading={loadingDelete}
                            onClick={deletePlayer}
                          />
                        )}
                      </div>
                    </Toolbar>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={playerData?.firstName}
                          control={control}
                          name="firstName"
                          label="First Name"
                          required
                          fullWidth
                          variant="standard"
                          error={errors?.firstName}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={playerData?.lastName}
                          control={control}
                          name="lastName"
                          label="Last name"
                          required
                          fullWidth
                          variant="standard"
                          error={errors?.lastName}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={playerData?.externalId}
                          control={control}
                          name="externalId"
                          label="External Id"
                          fullWidth
                          variant="standard"
                          error={errors?.externalId}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={playerData?.phone}
                          control={control}
                          name="phone"
                          label="Phone"
                          fullWidth
                          variant="standard"
                          error={errors?.phone}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={playerData?.email}
                          control={control}
                          name="email"
                          label="Email"
                          fullWidth
                          variant="standard"
                          error={errors?.email}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFDatepicker
                          fullWidth
                          control={control}
                          variant="standard"
                          name="birthday"
                          label="Birthday"
                          id="birthday"
                          openTo="year"
                          disableFuture
                          inputFormat={'DD/MM/YYYY'}
                          views={['year', 'month', 'day']}
                          defaultValue={playerData?.birthday}
                          error={errors?.birthday}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFSelect
                          fullWidth
                          control={control}
                          name="activityStatus"
                          label="Activity Status"
                          defaultValue={
                            playerData?.activityStatus?.toLowerCase() || ''
                          }
                          error={errors.activityStatus}
                        >
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                          <MenuItem value="retired">Retired</MenuItem>
                          <MenuItem value="unknown">Unknown</MenuItem>
                        </RHFSelect>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFAutocomplete
                          fullWidth
                          options={countriesNames}
                          defaultValue={playerData?.country}
                          // getOptionLabel={option => {
                          //   console.log(option)
                          //   return option
                          // }}
                          // isOptionEqualToValue={(option, value) => {
                          //   console.log(option, value)
                          //   return equals(option, value)
                          // }}
                          control={control}
                          id="country"
                          name="country"
                          label="Country"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={playerData?.city}
                          control={control}
                          name="city"
                          label="City"
                          fullWidth
                          variant="standard"
                          error={errors?.city}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={playerData?.stick}
                          control={control}
                          name="stick"
                          label="Stick"
                          fullWidth
                          variant="standard"
                          error={errors?.stick}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFSelect
                          fullWidth
                          name="gender"
                          label="Gender"
                          id="gender"
                          control={control}
                          defaultValue={
                            (playerData?.gender &&
                              playerData.gender.toLowerCase()) ||
                            ''
                          }
                          error={errors?.gender}
                        >
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </RHFSelect>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={playerData?.height}
                          control={control}
                          name="height"
                          label="Height"
                          fullWidth
                          variant="standard"
                          error={errors?.height}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={playerData?.weight}
                          control={control}
                          name="weight"
                          label="Weight"
                          fullWidth
                          variant="standard"
                          error={errors?.weight}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </form>
            {isValidUuid(playerId) && (
              <Relations
                playerId={playerId}
                player={playerData}
                updatePlayer={updatePlayer}
              />
            )}
          </>
        )}
    </Container>
  )
}

export { Player as default }
