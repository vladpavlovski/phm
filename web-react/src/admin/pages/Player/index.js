import React, { useCallback, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'

import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet'
import 'react-imported-component/macro'
import { yupResolver } from '@hookform/resolvers/yup'
import { v4 as uuidv4 } from 'uuid'
import Img from 'react-cool-img'

import Toolbar from '@material-ui/core/Toolbar'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'

import { RHFAutocomplete } from '../../../components/RHFAutocomplete'
import { RHFDatepicker } from '../../../components/RHFDatepicker'
import { ReactHookFormSelect } from '../../../components/RHFSelect'
import { RHFInput } from '../../../components/RHFInput'
import { Uploader } from '../../../components/Uploader'
import { countriesNames } from '../../../utils/constants/countries'
import { dateExist, decomposeDate } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { Relations } from './relations'

import { ADMIN_PLAYERS, getAdminPlayerRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'
import placeholderAvatar from '../../../img/placeholderPerson.jpg'

const READ_PLAYER = gql`
  query getPlayer($playerId: ID!) {
    player: Player(playerId: $playerId) {
      playerId
      name
      birthday {
        formatted
      }
      externalId
      activityStatus
      country
      city
      stick
      height
      weight
      gender
      avatar
    }
  }
`

const MERGE_PLAYER = gql`
  mutation mergePlayer(
    $playerId: ID!
    $name: String
    $birthdayDay: Int
    $birthdayMonth: Int
    $birthdayYear: Int
    $userName: String
    $phone: String
    $gender: String
    $stick: String
    $height: String
    $weight: String
    $externalId: String
    $activityStatus: String
    $countryBirth: String
    $cityBirth: String
    $country: String
    $city: String
    $avatar: String
  ) {
    mergePlayer: MergePlayer(
      playerId: $playerId
      name: $name
      birthday: {
        day: $birthdayDay
        month: $birthdayMonth
        year: $birthdayYear
      }
      userName: $userName
      phone: $phone
      gender: $gender
      stick: $stick
      height: $height
      weight: $weight
      externalId: $externalId
      activityStatus: $activityStatus
      countryBirth: $countryBirth
      cityBirth: $cityBirth
      country: $country
      city: $city
      avatar: $avatar
    ) {
      playerId
    }
  }
`

const DELETE_PLAYER = gql`
  mutation deletePlayer($playerId: ID!) {
    deletePlayer: DeletePlayer(playerId: $playerId) {
      playerId
    }
  }
`

const Player = () => {
  const history = useHistory()
  const classes = useStyles()
  const { playerId } = useParams()

  const client = useApolloClient()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(READ_PLAYER, {
    fetchPolicy: 'network-only',
    variables: { playerId },
  })

  const [
    mergePlayer,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(MERGE_PLAYER, {
    onCompleted: data => {
      if (playerId === 'new') {
        const newPlayerId = data.mergePlayer.playerId
        history.replace(getAdminPlayerRoute(newPlayerId))
      }
    },
  })

  const playerData = (queryData && queryData.player[0]) || {}

  const [
    deletePlayer,
    { loading: loadingDelete, error: errorDelete },
  ] = useMutation(DELETE_PLAYER, {
    onCompleted: () => {
      history.push(ADMIN_PLAYERS)
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
          playerId: playerId === 'new' ? uuidv4() : playerId,
          ...decomposeDate(birthday, 'birthday'),
          country: country || '',
        }
        // console.log('dataToSubmit', dataToSubmit)

        mergePlayer({
          variables: dataToSubmit,
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
        query: READ_PLAYER,
        variables: {
          playerId,
        },
      })

      client.writeQuery({
        query: READ_PLAYER,
        data: {
          player: [
            {
              ...queryResult.player[0],
              avatar: url,
            },
          ],
        },
        variables: {
          playerId,
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
      {mutationError && !mutationLoading && (
        <Error message={mutationError.message} />
      )}
      {(playerData || playerId === 'new') &&
        !queryLoading &&
        !queryError &&
        !mutationError && (
          <>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={classes.form}
              noValidate
              autoComplete="off"
            >
              <Helmet>
                <title>{playerData.name || 'Player'}</title>
              </Helmet>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4} lg={3}>
                  <Paper className={classes.paper}>
                    <Img
                      placeholder={placeholderAvatar}
                      src={playerData.avatar}
                      className={classes.logo}
                      alt={playerData.name}
                    />

                    <RHFInput
                      style={{ display: 'none' }}
                      defaultValue={playerData.avatar}
                      control={control}
                      name="avatar"
                      label="Avatar URL"
                      disabled
                      fullWidth
                      variant="standard"
                      error={errors.avatar}
                    />

                    <Uploader
                      buttonText={'Change avatar'}
                      onSubmit={updateAvatar}
                      folderName="avatars"
                    />
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
                          <ButtonSave loading={mutationLoading} />
                        )}
                        {playerId !== 'new' && (
                          <ButtonDelete
                            loading={loadingDelete}
                            onClick={() => {
                              deletePlayer({ variables: { playerId } })
                            }}
                          />
                        )}
                      </div>
                    </Toolbar>
                    <Grid container spacing={2}>
                      {/* <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={playerData.avatar}
                          control={control}
                          name="avatar"
                          label="Avatar URL"
                          // disabled
                          fullWidth
                          variant="standard"
                          error={errors.avatar}
                        />
                      </Grid> */}
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={playerData.name}
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
                          defaultValue={playerData.externalId}
                          control={control}
                          name="externalId"
                          label="External Id"
                          fullWidth
                          variant="standard"
                          error={errors.externalId}
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
                          views={['year', 'month', 'date']}
                          defaultValue={
                            playerData.birthday &&
                            dateExist(playerData.birthday.formatted)
                              ? playerData.birthday.formatted
                              : null
                          }
                          error={errors.birthday}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={playerData.activityStatus}
                          control={control}
                          name="activityStatus"
                          label="Activity Status"
                          fullWidth
                          variant="standard"
                          error={errors.activityStatus}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFAutocomplete
                          fullWidth
                          options={countriesNames}
                          defaultValue={playerData.country}
                          // getOptionLabel={option => {
                          //   console.log(option)
                          //   return option
                          // }}
                          // getOptionSelected={(option, value) => {
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
                          defaultValue={playerData.city}
                          control={control}
                          name="city"
                          label="City"
                          fullWidth
                          variant="standard"
                          error={errors.city}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={playerData.stick}
                          control={control}
                          name="stick"
                          label="Stick"
                          fullWidth
                          variant="standard"
                          error={errors.stick}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <ReactHookFormSelect
                          fullWidth
                          name="gender"
                          label="Gender"
                          id="gender"
                          control={control}
                          defaultValue={
                            (playerData.gender &&
                              playerData.gender.toLowerCase()) ||
                            ''
                          }
                          error={errors.gender}
                        >
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </ReactHookFormSelect>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={playerData.height}
                          control={control}
                          name="height"
                          label="Height"
                          fullWidth
                          variant="standard"
                          error={errors.height}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={playerData.weight}
                          control={control}
                          name="weight"
                          label="Weight"
                          fullWidth
                          variant="standard"
                          error={errors.weight}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </form>
            <Relations playerId={playerId} />
          </>
        )}
    </Container>
  )
}

export { Player as default }
