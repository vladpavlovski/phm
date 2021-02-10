import React, { useCallback, useMemo, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import dayjs from 'dayjs'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useForm, useWatch } from 'react-hook-form'
import 'react-imported-component/macro'
import { yupResolver } from '@hookform/resolvers/yup'
import { v4 as uuidv4 } from 'uuid'
import {
  Container,
  Grid,
  Paper,
  MenuItem,
  Chip,
  Avatar,
} from '@material-ui/core'
import Toolbar from '@material-ui/core/Toolbar'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'

import { RHFAutocomplete } from '../../../components/RHFAutocomplete'
import { RHFDatepicker } from '../../../components/RHFDatepicker'
import { ReactHookFormSelect } from '../../../components/RHFSelect'
import { RHFInput } from '../../../components/RHFInput'
import { countriesNames } from '../../../utils/constants/countries'
import { dateExist } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { ADMIN_PLAYERS, getAdminPlayerRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'

const READ_PLAYER = gql`
  query getPlayer($playerId: ID!) {
    Player(playerId: $playerId) {
      playerId
      name
      birthday {
        formatted
      }
      externalId
      activityStatus
      country
      city
      positions {
        positionId
        name
      }
      stick
      height
      weight
      # startLeagueDate
      jerseys {
        jerseyNoId
        number
      }
      gender
      teams {
        teamId
        name
        logoUrl
        jerseys(orderBy: number_asc) {
          jerseyNoId
          name
          number
        }
        positions {
          positionId
          name
        }
      }
    }
    Team {
      teamId
      name
      logoUrl
      positions {
        positionId
        name
      }
      jerseys(orderBy: number_asc) {
        jerseyNoId
        name
        number
      }
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
    $avatarUrl: String
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
      avatarUrl: $avatarUrl
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

const MERGE_PLAYER_TEAM = gql`
  mutation mergePlayerTeam($playerId: ID!, $teamId: ID!) {
    playerTeam: MergePlayerTeams(
      from: { playerId: $playerId }
      to: { teamId: $teamId }
    ) {
      from {
        playerId
      }
    }
  }
`

// const MERGE_PLAYER_POSITION = gql`
//   mutation mergePlayerPosition($playerId: ID!, $positionId: ID!) {
//     playerTeam: MergePlayerPositions(
//       from: { playerId: $playerId }
//       to: { positionId: $positionId }
//     ) {
//       from {
//         playerId
//       }
//     }
//   }
// `

const Teams = ({ control, playerData, errors }) => {
  const teams = useWatch({
    control,
    name: 'teams',
    defaultValue: [],
  })
  return teams.map(team => {
    // TODO: position autocomplete
    // console.log('team: ', team)
    return (
      <React.Fragment key={team.teamId}>
        <Title>{team.name}</Title>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6} lg={6}>
            <RHFInput
              defaultValue={playerData.position}
              control={control}
              name="position"
              label="Position"
              fullWidth
              variant="standard"
              error={errors.position}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={6}>
            <RHFAutocomplete
              multiple
              fullWidth
              defaultValue={playerData.jerseys || []}
              options={team.jerseys || []}
              getOptionLabel={option => option.name}
              getOptionSelected={(option, value) =>
                option.jerseyNoId === value.jerseyNoId
              }
              control={control}
              name="jerseys"
              label="Jerseys"
              renderTags={(value, getTagProps) => {
                return value.map((option, index) => {
                  return (
                    <Chip
                      key={option.name}
                      avatar={
                        <Avatar alt={option.name}>{option.number}</Avatar>
                      }
                      variant="filled"
                      label={option.name}
                      {...getTagProps({ index })}
                    />
                  )
                })
              }}
            />
          </Grid>
        </Grid>
      </React.Fragment>
    )
  })
}

const Player = () => {
  const history = useHistory()
  const classes = useStyles()
  const { playerId } = useParams()

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

  const [mergePlayerTeam] = useMutation(MERGE_PLAYER_TEAM)
  const playerData = useMemo(() => (queryData && queryData.Player[0]) || {}, [
    queryData,
  ])

  const [
    deletePlayer,
    { loading: loadingDelete, error: errorDelete },
  ] = useMutation(DELETE_PLAYER, {
    onCompleted: () => {
      history.push(ADMIN_PLAYERS)
    },
  })

  // console.log('playerData:', playerData)

  const { handleSubmit, control, errors, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      country: '',
      teams: [],
    },
  })

  useEffect(() => {
    if (playerData) {
      setValue('country', playerData.country)
      setValue('teams', playerData.teams)
    }
  }, [playerData])

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { country, birthday, teams, ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          playerId: playerId === 'new' ? uuidv4() : playerId,
          birthdayDay: dayjs(birthday).date(),
          birthdayMonth: dayjs(birthday).month() + 1,
          birthdayYear: dayjs(birthday).year(),
          country: country || '',
        }
        // console.log('dataToSubmit', dataToSubmit)

        mergePlayer({
          variables: dataToSubmit,
        }).then(({ data }) => {
          // console.log('after merge: ', data)
          teams.forEach(team => {
            mergePlayerTeam({
              variables: {
                playerId: data.mergePlayer.playerId,
                teamId: team.teamId,
              },
            }).then(res => {
              console.log('after team merge:', res)
            })
          })
        })
      } catch (error) {
        console.error(error)
      }
    },
    [playerId]
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
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={classes.form}
            noValidate
            autoComplete="off"
          >
            <Paper className={classes.paper}>
              <Toolbar disableGutters className={classes.toolbarForm}>
                <div>
                  <Title>{'Player'}</Title>
                </div>
                <div>
                  <ButtonSave
                    loading={mutationLoading}
                    className={classes.submit}
                  />
                  {playerId !== 'new' && (
                    <ButtonDelete
                      loading={loadingDelete}
                      className={classes.submit}
                      onClick={() => {
                        deletePlayer({ variables: { playerId } })
                      }}
                    />
                  )}
                </div>
              </Toolbar>

              <Grid container spacing={2}>
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
                      (playerData.gender && playerData.gender.toLowerCase()) ||
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

                <Grid item xs={12} md={12} lg={12}>
                  <RHFAutocomplete
                    multiple
                    fullWidth
                    id="teams"
                    defaultValue={playerData.teams || []}
                    options={queryData.Team || []}
                    getOptionLabel={option => option.name}
                    getOptionSelected={(option, value) =>
                      option.teamId === value.teamId
                    }
                    control={control}
                    name="teams"
                    label="Teams"
                    renderTags={(value, getTagProps) => {
                      return value.map((option, index) => {
                        return (
                          <Chip
                            key={option.name}
                            avatar={
                              <Avatar alt={option.name} src={option.logoUrl} />
                            }
                            variant="filled"
                            label={option.name}
                            {...getTagProps({ index })}
                          />
                        )
                      })
                    }}
                  />
                </Grid>
              </Grid>
              <Teams
                control={control}
                playerData={playerData}
                errors={errors}
              />
            </Paper>
          </form>
        )}
    </Container>
  )
}

export { Player as default }
