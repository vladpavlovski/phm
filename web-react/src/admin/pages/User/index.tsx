// import { Relations } from './relations'
// import { getAdminUserRoute } from 'router/routes'
import { Error, Loader, RHFInput, Title, Uploader } from 'components'
import placeholderAvatar from 'img/placeholderPerson.jpg'
import React, { useCallback } from 'react'
import Img from 'react-cool-img'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { isValidUuid } from 'utils'
import { gql, useApolloClient, useQuery } from '@apollo/client'
// import { useSnackbar } from 'notistack'
import { yupResolver } from '@hookform/resolvers/yup'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import { ButtonSave } from '../commonComponents/ButtonSave'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

const GET_USER = gql`
  query getUser($where: UserWhere) {
    users(where: $where) {
      userId
      firstName
      lastName
      phone
      email
    }
  }
`

// const MERGE_USER = gql`
//   mutation mergeUser(
//     $userId: ID!
//     $firstName: String
//     $lastName: String
//     $phone: String
//     $email: String
//   ) {
//     mergeUser: MergeUser(
//       userId: $userId
//       firstName: $firstName
//       lastName: $lastName
//       phone: $phone
//       email: $email
//     ) {
//       userId
//       firstName
//       lastName
//       phone
//       email
//     }
//   }
// `

type TParams = {
  userId: string
}

const User: React.FC = () => {
  // const history = useHistory()
  const classes = useStyles()
  const { userId } = useParams<TParams>()
  // const { enqueueSnackbar } = useSnackbar()
  const client = useApolloClient()
  const {
    loading: queryLoading,
    data: { users: [userData] } = { users: [] },
    error: queryError,
  } = useQuery(GET_USER, {
    variables: { where: { userId } },
  })

  // const [mergeUser, { loading: mutationLoading, error: mutationError }] =
  //   useMutation(MERGE_USER, {
  //     onCompleted: data => {
  //       if (userId === 'new') {
  //         const newUserId = data.mergeUser.userId
  //         history.replace(getAdminUserRoute(newUserId))
  //       }
  //       enqueueSnackbar(`User saved!`, {
  //         variant: 'success',
  //       })
  //     },
  //   })

  const { handleSubmit, control, errors, setValue, formState } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(() => {
    try {
      // const { ...rest } = dataToCheck
      // const dataToSubmit = {
      //   ...rest,
      //   userId: userId,
      // }
      // mergeUser({
      //   variables: dataToSubmit,
      // })
    } catch (error) {
      console.error(error)
    }
  }, [userId])

  const updateAvatar = useCallback(
    url => {
      setValue('avatar', url, { shouldValidate: true, shouldDirty: true })

      const queryResult = client.readQuery({
        query: GET_USER,
        variables: {
          userId,
        },
      })

      client.writeQuery({
        query: GET_USER,
        data: {
          users: [
            {
              ...queryResult.users[0],
              avatar: url,
            },
          ],
        },
        variables: {
          userId,
        },
      })
      handleSubmit(onSubmit)()
    },
    [client]
  )

  return (
    <Container maxWidth="lg">
      {queryLoading && <Loader />}

      <Error message={queryError?.message} />
      {(userData || userId === 'new') && (
        <>
          <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
            <Helmet>
              <title>{userData?.name || 'User'}</title>
            </Helmet>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4} lg={3}>
                <Paper className={classes.paper}>
                  <Img
                    placeholder={placeholderAvatar}
                    src={userData.avatar}
                    className={classes.logo}
                    alt={userData.name}
                  />

                  <RHFInput
                    style={{ display: 'none' }}
                    defaultValue={userData.avatar}
                    control={control}
                    name="avatar"
                    label="Avatar URL"
                    disabled
                    fullWidth
                    variant="standard"
                    error={errors.avatar}
                  />

                  {isValidUuid(userId) && (
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
                      <Title>{'User'}</Title>
                    </div>
                    <div>
                      {formState.isDirty && <ButtonSave loading={false} />}
                      {/* {userId !== 'new' && (
                          <ButtonDelete
                            loading={loadingDelete}
                            onClick={() => {
                              deleteUser({ variables: { userId } })
                            }}
                          />
                        )} */}
                    </div>
                  </Toolbar>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={userData?.firstName}
                        control={control}
                        name="firstName"
                        label="First name"
                        required
                        fullWidth
                        variant="standard"
                        error={errors?.firstName}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={userData?.lastName}
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
                        defaultValue={userData?.phone}
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
                        defaultValue={userData?.email}
                        control={control}
                        name="email"
                        label="Email"
                        fullWidth
                        variant="standard"
                        error={errors?.email}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </form>
          {/* {userData?.userId && <Relations userId={userId} />} */}
        </>
      )}
    </Container>
  )
}

export { User as default }
