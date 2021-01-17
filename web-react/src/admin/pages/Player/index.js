import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { gql, useQuery } from '@apollo/client'
import { useForm, Controller } from 'react-hook-form'
import 'react-imported-component/macro'
import { equals } from 'rambda'
import {
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  MenuItem,
  // Chip,
  // Avatar,
} from '@material-ui/core'
import { RHFAutocomplete } from '../../../components/RHFAutocomplete'
import { RHFDatepicker } from '../../../components/RHFDatepicker'
import { RHFSwitch } from '../../../components/RHFSwitch'
import { ReactHookFormSelect } from '../../../components/RHFSelect'
import { countriesNames } from '../../../utils/constants/countries'
import { Title } from '../../../components/Title'
import { useStyles } from './styled'
// import Load from '../../../utils/load'
import { schema } from './schema'
// import { GET_ALL_TEAMS } from '../../../graphql/requests'
// import { getPlayerRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'

const GET_PLAYER = gql`
  query getPlayer($playerId: ID!) {
    Player(playerId: $playerId) {
      playerId
      name
      birthday {
        formatted
      }
      internalId
      isActive
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
      }
    }
    Team {
      teamId
      name
    }
  }
`

// const CREATE_PLAYER = gql`
//   mutation createPlayer($input: PlayerInput!) {
//     createPlayer(input: $input) {
//       playerId
//       # firstName
//       # lastName
//       # birthday
//       # avatar
//       # isActive
//       # country
//       # city
//       # position
//       # stick
//       # height
//       # weight
//       # startLeagueDate
//       # jersey
//       # gender
//       # disabled
//     }
//   }
// `
// const UPDATE_PLAYER = gql`
//   mutation updatePlayer($input: PlayerInput!) {
//     updatePlayer(input: $input) {
//       playerId
//       firstName
//       lastName
//       birthday
//       avatar
//       isActive
//       country
//       city
//       position
//       stick
//       height
//       weight
//       startLeagueDate
//       jersey
//       gender
//       disabled
//     }
//   }
// `

const Player = () => {
  // const history = useHistory()
  const classes = useStyles()
  const { playerId } = useParams()
  const [isSubmitting, setSubmitting] = useState(false)

  const { loading, data: playerDataArray, error: playerError } = useQuery(
    GET_PLAYER,
    {
      variables: { playerId },
      skip: playerId === 'new',
    }
  )

  // const [updatePlayer] = useMutation(UPDATE_PLAYER)
  // const [createPlayer, { data: newPlayerData }] = useMutation(CREATE_PLAYER)
  console.log('playerDataArray: ', playerDataArray)
  const playerData = useMemo(
    () => playerDataArray && playerDataArray.Player[0],
    [playerDataArray]
  )
  console.log('playerData:', playerData)
  const { handleSubmit, control, errors, setValue } = useForm({
    validationSchema: schema,
    defaultValues: {
      country: '',
      teams: [],
    },
  })

  useEffect(() => {
    setValue('country', playerData ? playerData.country : '')
    setValue('teams', playerData ? playerData.teams : [])
  }, [playerData])

  // useEffect(() => {
  //   if (newPlayerData && newPlayerData.createPlayer) {
  //     const newPlayerId = newPlayerData.createPlayer.id
  //     reset()
  //     history.push(getPlayerRoute(newPlayerId))
  //   }
  // }, [history, newPlayerData, reset])

  const onSubmit = useCallback(
    dataToSubmit => {
      try {
        console.log('dataToSubmit', dataToSubmit)
        setSubmitting(true)
        // const { user, teams, phone, email, ...rest } = dataToSubmit
        // if (playerId === 'new') {
        //   // console.log(rest)
        //   createPlayer({
        //     variables: {
        //       input: { ...rest, teams: teams.map(i => ({ id: i.id })) },
        //     },
        //   })
        // } else {
        //   // console.log('will update player with data: ', dataToSubmit)
        //   updatePlayer({
        //     variables: {
        //       input: {
        //         ...rest,
        //         id: playerId,
        //         teams: teams.map(i => ({ id: i.id })),
        //       },
        //     },
        //   })
        // }
      } catch (error) {
        console.error(error)
      } finally {
        setSubmitting(false)
      }
    },
    [playerId]
  )

  if (loading) return <Loader />
  if (playerError) return <Error message={playerError.message} />
  return (
    <Container maxWidth="lg" className={classes.container}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={classes.form}
        noValidate
        autoComplete="off"
      >
        <Grid container spacing={2}>
          <Grid item md={2} lg={2}>
            <Paper className={classes.paper}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12} lg={12}>
            <Paper className={classes.paper}>
              {
                <>
                  <Title>{'Player'}</Title>
                  <Controller
                    as={TextField}
                    control={control}
                    name="name"
                    required
                    variant="standard"
                    inputProps={{
                      autoComplete: 'off',
                    }}
                    id="name"
                    label="Name"
                    defaultValue={playerData.name || ''}
                    error={errors && !!errors.firstName}
                    helperText={
                      errors && errors.firstName && errors.firstName.message
                    }
                  />

                  <Controller
                    as={TextField}
                    control={control}
                    variant="standard"
                    inputProps={{
                      autoComplete: 'off',
                    }}
                    name="internalId"
                    id="internalId"
                    label="Internal Id"
                    defaultValue={playerData.internalId || ''}
                    error={errors && !!errors.internalId}
                    helperText={
                      errors && errors.internalId && errors.internalId.message
                    }
                  />

                  <RHFDatepicker
                    control={control}
                    variant="standard"
                    name="birthday"
                    label="Birthday"
                    id="birthday"
                    defaultValue={playerData.birthday.formatted || null}
                    error={errors && !!errors.birthday}
                    helperText={
                      errors && errors.birthday && errors.birthday.message
                    }
                  />
                  {/*  <RHFDatepicker
                        control={control}
                        variant="standard"
                        fullWidth
                        inputProps={{
                          autoComplete: 'off',
                        }}
                        name="startLeagueDate"
                        label="Start League Date"
                        id="startLeagueDate"
                        defaultValue={
                          (data &&
                            playerData.Player &&
                            playerData.Player.startLeagueDate) ||
                          null
                        }
                        error={errors && !!errors.startLeagueDate}
                        helperText={
                          errors &&
                          errors.startLeagueDate &&
                          errors.startLeagueDate.message
                        }
                      /> */}
                  <RHFSwitch
                    control={control}
                    variant="standard"
                    name="isActive"
                    label="Active"
                    id="isActive"
                    color="primary"
                    defaultValue={playerData.isActive || false}
                  />
                  <RHFAutocomplete
                    multiple
                    id="teams"
                    options={playerDataArray.Team}
                    getOptionLabel={option => option.name}
                    getOptionSelected={(option, value) => equals(option, value)}
                    control={control}
                    name="teams"
                    label="Teams"
                    // renderTags={(value, getTagProps) =>
                    //   value.map((option, index) => (
                    //     <Chip
                    //       key={option.name}
                    //       avatar={
                    //         <Avatar
                    //           alt={option.name}
                    //           src={option.logoRound}
                    //         />
                    //       }
                    //       variant="outlined"
                    //       label={option.name}
                    //       {...getTagProps({ index })}
                    //     />
                    //   ))
                    // }
                  />
                  <RHFAutocomplete
                    id="country"
                    options={countriesNames}
                    control={control}
                    name="country"
                    label="Country"
                  />

                  <Controller
                    as={TextField}
                    control={control}
                    variant="standard"
                    inputProps={{
                      autoComplete: 'off',
                    }}
                    name="city"
                    label="City"
                    type="city"
                    id="city"
                    defaultValue={playerData.city || ''}
                    error={Boolean(errors.city)}
                    helperText={errors.city && errors.city.message}
                  />

                  <Controller
                    as={TextField}
                    variant="standard"
                    inputProps={{
                      autoComplete: 'off',
                    }}
                    control={control}
                    name="position"
                    label="Position"
                    type="position"
                    id="position"
                    defaultValue={playerData.position || ''}
                    error={!!errors.position}
                    helperText={errors.position && errors.position.message}
                  />

                  <ReactHookFormSelect
                    name="stick"
                    label="Stick"
                    id="stick"
                    control={control}
                    defaultValue={playerData.stick || ''}
                    error={!!errors.stick}
                  >
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                  </ReactHookFormSelect>
                  <ReactHookFormSelect
                    name="gender"
                    label="Gender"
                    id="gender"
                    fullWidth
                    control={control}
                    defaultValue={playerData.gender.toLowerCase() || ''}
                    error={!!errors.gender}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </ReactHookFormSelect>

                  <Controller
                    as={TextField}
                    variant="standard"
                    inputProps={{
                      autoComplete: 'off',
                    }}
                    control={control}
                    name="height"
                    label="Height"
                    type="height"
                    id="height"
                    defaultValue={playerData.height || ''}
                    error={Boolean(errors.height)}
                    helperText={errors.height && errors.height.message}
                  />

                  <Controller
                    as={TextField}
                    variant="standard"
                    inputProps={{
                      autoComplete: 'off',
                    }}
                    control={control}
                    name="weight"
                    label="Weight"
                    type="weight"
                    id="weight"
                    defaultValue={playerData.weight || ''}
                    error={Boolean(errors.weight)}
                    helperText={errors.weight && errors.weight.message}
                  />

                  <Controller
                    as={TextField}
                    variant="standard"
                    inputProps={{
                      autoComplete: 'off',
                    }}
                    control={control}
                    name="jersey"
                    label="Jersey Number"
                    type="jersey"
                    id="jersey"
                    defaultValue={playerData.jerseys[0].number || ''}
                    error={Boolean(errors.jersey)}
                    helperText={errors.jersey && errors.jersey.message}
                  />
                </>
              }
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Container>
  )
}

export { Player as default }
