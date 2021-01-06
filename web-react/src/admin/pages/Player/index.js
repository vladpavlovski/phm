// import React, { useState, useCallback, useEffect } from 'react'
// import { useParams, useHistory } from 'react-router-dom'
// import { gql, useQuery, useMutation } from '@apollo/client'
// import { useForm, Controller } from 'react-hook-form'
// import 'react-imported-component/macro'
// import {
//   Container,
//   Grid,
//   Paper,
//   TextField,
//   Button,
//   MenuItem,
//   Chip,
//   Avatar,
// } from '@material-ui/core'
// import { RHFAutocomplete } from '../../../components/RHFAutocomplete'
// import { RHFDatepicker } from '../../../components/RHFDatepicker'
// import { RHFSwitch } from '../../../components/RHFSwitch'
// import { ReactHookFormSelect } from '../../../components/RHFSelect'
// import { countries, countryToFlag } from '../../../utils/constants/countries'
// import { Title } from '../../../components/Title'
// import { useStyles } from '../Article/styled'
// import Load from '../../../utils/load'
// import { schema } from './schema'
// import { GET_ALL_TEAMS } from '../../../graphql/requests'
// import { getPlayerRoute } from '../../../routes'

// const GET_PLAYER = gql`
//   query getPlayer($id: ID!) {
//     player(id: $id) {
//       # user {
//       #   id
//       #   firstName
//       #   lastName
//       #   birthday
//       #   email
//       #   phone
//       # }
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
//       teams {
//         id
//         name
//         fullName
//         logoRound
//       }
//     }
//   }
// `
// const CREATE_PLAYER = gql`
//   mutation createPlayer($input: PlayerInput!) {
//     createPlayer(input: $input) {
//       id
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

// const Layout = Load(() => import('../../../components/Layout'))

// const Player = () => {
//   const history = useHistory()
//   const classes = useStyles()
//   const { playerId } = useParams()
//   const [isSubmitting, setSubmitting] = useState(false)
//   // error,
//   const { loading, data } = useQuery(GET_PLAYER, {
//     variables: { id: playerId },
//     skip: playerId === 'new',
//   })
//   const { loading: teamsLoading, data: teamsData } = useQuery(GET_ALL_TEAMS)
//   const [updatePlayer] = useMutation(UPDATE_PLAYER)
//   const [createPlayer, { data: newPlayerData }] = useMutation(CREATE_PLAYER)

//   const { handleSubmit, control, errors, reset } = useForm({
//     validationSchema: schema,
//   })

//   useEffect(() => {
//     if (newPlayerData && newPlayerData.createPlayer) {
//       const newPlayerId = newPlayerData.createPlayer.id
//       reset()
//       history.push(getPlayerRoute(newPlayerId))
//     }
//   }, [history, newPlayerData, reset])

//   const onSubmit = useCallback(
//     dataToSubmit => {
//       try {
//         // console.log('dataToSubmit', dataToSubmit)
//         setSubmitting(true)
//         const { user, teams, phone, email, ...rest } = dataToSubmit
//         if (playerId === 'new') {
//           // console.log(rest)
//           createPlayer({
//             variables: {
//               input: { ...rest, teams: teams.map(i => ({ id: i.id })) },
//             },
//           })
//         } else {
//           // console.log('will update player with data: ', dataToSubmit)
//           updatePlayer({
//             variables: {
//               input: {
//                 ...rest,
//                 id: playerId,
//                 teams: teams.map(i => ({ id: i.id })),
//               },
//             },
//           })
//         }
//       } catch (error) {
//         console.error(error)
//       } finally {
//         setSubmitting(false)
//       }
//     },
//     [playerId, updatePlayer, createPlayer]
//   )

//   return (
//     <Layout>
//       {!loading && !teamsLoading && (
//         <Container maxWidth="lg" className={classes.container}>
//           <form
//             onSubmit={handleSubmit(onSubmit)}
//             className={classes.form}
//             noValidate
//             autoComplete="off"
//           >
//             <Grid container spacing={2}>
//               <Grid item md={2} lg={2}>
//                 <Paper className={classes.paper}>
//                   <Button
//                     type="submit"
//                     variant="contained"
//                     color="primary"
//                     className={classes.submit}
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? 'Saving...' : 'Save'}
//                   </Button>
//                 </Paper>
//               </Grid>
//             </Grid>
//             <Grid container spacing={2}>
//               <Grid item xs={12} md={12} lg={12}>
//                 <Paper className={classes.paper}>
//                   {
//                     <>
//                       <Title>{'Player'}</Title>
//                       <Controller
//                         as={TextField}
//                         control={control}
//                         name="firstName"
//                         required
//                         inputProps={{
//                           autoComplete: 'off',
//                         }}
//                         id="firstName"
//                         label="First Name"
//                         defaultValue={
//                           (data && data.player && data.player.firstName) || ''
//                         }
//                         error={errors && !!errors.firstName}
//                         helperText={
//                           errors && errors.firstName && errors.firstName.message
//                         }
//                       />

//                       <Controller
//                         as={TextField}
//                         control={control}
//                         inputProps={{
//                           autoComplete: 'off',
//                         }}
//                         name="lastName"
//                         required
//                         id="lastName"
//                         label="Last Name"
//                         defaultValue={
//                           (data && data.player && data.player.lastName) || ''
//                         }
//                         error={errors && !!errors.lastName}
//                         helperText={
//                           errors && errors.lastName && errors.lastName.message
//                         }
//                       />
//                       <Controller
//                         as={TextField}
//                         control={control}
//                         inputProps={{
//                           autoComplete: 'off',
//                         }}
//                         name="playerId"
//                         id="playerId"
//                         label="Player Id"
//                         defaultValue={
//                           (data && data.player && data.player.playerId) || ''
//                         }
//                         error={errors && !!errors.playerId}
//                         helperText={
//                           errors && errors.playerId && errors.playerId.message
//                         }
//                       />
//                       <Controller
//                         as={TextField}
//                         control={control}
//                         inputProps={{
//                           autoComplete: 'off',
//                         }}
//                         name="avatar"
//                         id="avatar"
//                         label="Avatar"
//                         defaultValue={
//                           (data && data.player && data.player.avatar) || ''
//                         }
//                         error={errors && !!errors.avatar}
//                         helperText={
//                           errors && errors.avatar && errors.avatar.message
//                         }
//                       />
//                       <RHFDatepicker
//                         control={control}
//                         variant="inline"
//                         fullWidth
//                         name="birthday"
//                         label="Birthday"
//                         id="birthday"
//                         inputProps={{
//                           autoComplete: 'off',
//                         }}
//                         defaultValue={
//                           (data && data.player && data.player.birthday) || null
//                         }
//                         error={errors && !!errors.birthday}
//                         helperText={
//                           errors && errors.birthday && errors.birthday.message
//                         }
//                       />
//                       <RHFDatepicker
//                         control={control}
//                         variant="inline"
//                         fullWidth
//                         inputProps={{
//                           autoComplete: 'off',
//                         }}
//                         name="startLeagueDate"
//                         label="Start League Date"
//                         id="startLeagueDate"
//                         defaultValue={
//                           (data &&
//                             data.player &&
//                             data.player.startLeagueDate) ||
//                           null
//                         }
//                         error={errors && !!errors.startLeagueDate}
//                         helperText={
//                           errors &&
//                           errors.startLeagueDate &&
//                           errors.startLeagueDate.message
//                         }
//                       />
//                       <RHFSwitch
//                         control={control}
//                         variant="inline"
//                         name="isActive"
//                         label="Active"
//                         id="isActive"
//                         color="primary"
//                         defaultValue={
//                           (data && data.player && data.player.isActive) || false
//                         }
//                       />
//                       <RHFAutocomplete
//                         multiple
//                         fullWidth
//                         inputProps={{
//                           autoComplete: 'off',
//                         }}
//                         id="team-select"
//                         options={teamsData.teams}
//                         control={control}
//                         name="teams"
//                         label="Teams"
//                         optionPropertyToCompare="id"
//                         optionPropertyToShow="name"
//                         defaultValue={
//                           (data && data.player && data.player.teams) || ''
//                         }
//                         renderOption={option => (
//                           <>
//                             <img
//                               style={{
//                                 width: '3rem',
//                                 height: '3rem',
//                                 marginRight: '1rem',
//                               }}
//                               src={option.logoRound}
//                               alt={option['name']}
//                             />
//                             {option['name']}
//                           </>
//                         )}
//                         renderTags={(value, getTagProps) =>
//                           value.map((option, index) => (
//                             <Chip
//                               avatar={
//                                 <Avatar
//                                   alt={option.name}
//                                   src={option.logoRound}
//                                 />
//                               }
//                               variant="outlined"
//                               label={option.name}
//                               {...getTagProps({ index })}
//                             />
//                           ))
//                         }
//                       />
//                       <RHFAutocomplete
//                         id="country-select"
//                         options={countries}
//                         control={control}
//                         inputProps={{
//                           autoComplete: 'off',
//                         }}
//                         name="country"
//                         label="Country"
//                         fullWidth
//                         optionPropertyToCompare="label"
//                         optionPropertyToShow="label"
//                         defaultValue={
//                           (data && data.player && data.player.country) || ''
//                         }
//                         renderOption={option => (
//                           <>
//                             <span>{countryToFlag(option.code)}</span>
//                             {option.label} ({option.code})
//                           </>
//                         )}
//                       />

//                       <Controller
//                         as={TextField}
//                         control={control}
//                         inputProps={{
//                           autoComplete: 'off',
//                         }}
//                         name="city"
//                         label="City"
//                         type="city"
//                         id="city"
//                         defaultValue={
//                           (data && data.player && data.player.city) || ''
//                         }
//                         error={Boolean(errors.city)}
//                         helperText={errors.city && errors.city.message}
//                       />

//                       <Controller
//                         as={TextField}
//                         inputProps={{
//                           autoComplete: 'off',
//                         }}
//                         control={control}
//                         name="position"
//                         label="Position"
//                         type="position"
//                         id="position"
//                         defaultValue={
//                           (data && data.player && data.player.position) || ''
//                         }
//                         error={!!errors.position}
//                         helperText={errors.position && errors.position.message}
//                       />

//                       <ReactHookFormSelect
//                         name="stick"
//                         label="Stick"
//                         id="stick"
//                         fullWidth
//                         control={control}
//                         defaultValue={
//                           (data && data.player && data.player.stick) || ''
//                         }
//                         error={!!errors.stick}
//                       >
//                         <MenuItem value="left">Left</MenuItem>
//                         <MenuItem value="right">Right</MenuItem>
//                       </ReactHookFormSelect>
//                       <ReactHookFormSelect
//                         name="gender"
//                         label="Gender"
//                         id="gender"
//                         fullWidth
//                         control={control}
//                         defaultValue={
//                           (data && data.player && data.player.gender) || ''
//                         }
//                         error={!!errors.gender}
//                       >
//                         <MenuItem value="Male">Male</MenuItem>
//                         <MenuItem value="Female">Female</MenuItem>
//                         <MenuItem value="Other">Other</MenuItem>
//                       </ReactHookFormSelect>

//                       <Controller
//                         as={TextField}
//                         inputProps={{
//                           autoComplete: 'off',
//                         }}
//                         control={control}
//                         name="height"
//                         label="Height"
//                         type="height"
//                         id="height"
//                         defaultValue={
//                           (data && data.player && data.player.height) || ''
//                         }
//                         error={Boolean(errors.height)}
//                         helperText={errors.height && errors.height.message}
//                       />

//                       <Controller
//                         as={TextField}
//                         inputProps={{
//                           autoComplete: 'off',
//                         }}
//                         control={control}
//                         name="weight"
//                         label="Weight"
//                         type="weight"
//                         id="weight"
//                         defaultValue={
//                           (data && data.player && data.player.weight) || ''
//                         }
//                         error={Boolean(errors.weight)}
//                         helperText={errors.weight && errors.weight.message}
//                       />

//                       <Controller
//                         as={TextField}
//                         inputProps={{
//                           autoComplete: 'off',
//                         }}
//                         control={control}
//                         name="jersey"
//                         label="Jersey Number"
//                         type="jersey"
//                         id="jersey"
//                         defaultValue={
//                           (data && data.player && data.player.jersey) || ''
//                         }
//                         error={Boolean(errors.jersey)}
//                         helperText={errors.jersey && errors.jersey.message}
//                       />
//                     </>
//                   }
//                 </Paper>
//               </Grid>
//             </Grid>
//           </form>
//         </Container>
//       )}
//     </Layout>
//   )
// }

// export { Player as default }
