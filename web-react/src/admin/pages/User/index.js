import React, { useCallback } from 'react'
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

import { ButtonSave } from '../commonComponents/ButtonSave'

import { RHFInput } from '../../../components/RHFInput'
import { Uploader } from '../../../components/Uploader'
import { isValidUuid, checkId } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { Relations } from './relations'

import { getAdminUserRoute } from '../../../router/routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'
import placeholderAvatar from '../../../img/placeholderPerson.jpg'

const GET_USER = gql`
  query getUser($userId: ID!) {
    user: User(userId: $userId) {
      userId
      firstName
      lastName
      phone
      email
    }
  }
`

const MERGE_USER = gql`
  mutation mergeUser(
    $userId: ID!
    $firstName: String
    $lastName: String
    $phone: String
    $email: String
  ) {
    mergeUser: MergeUser(
      userId: $userId
      firstName: $firstName
      lastName: $lastName
      phone: $phone
      email: $email
    ) {
      userId
      firstName
      lastName
      phone
      email
    }
  }
`

const User = () => {
  const history = useHistory()
  const classes = useStyles()
  const { userId } = useParams()
  const { enqueueSnackbar } = useSnackbar()
  const client = useApolloClient()
  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_USER, {
    fetchPolicy: 'network-only',
    variables: { userId },
  })

  const [mergeUser, { loading: mutationLoading, error: mutationError }] =
    useMutation(MERGE_USER, {
      onCompleted: data => {
        if (userId === 'new') {
          const newUserId = data.mergeUser.userId
          history.replace(getAdminUserRoute(newUserId))
        }
        enqueueSnackbar(`User saved!`, {
          variant: 'success',
        })
      },
    })

  const userData = (queryData && queryData.user[0]) || {}

  const { handleSubmit, control, errors, setValue, formState } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      country: '',
    },
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          userId: checkId(userId),
        }

        mergeUser({
          variables: dataToSubmit,
        })
      } catch (error) {
        console.error(error)
      }
    },
    [userId]
  )

  const updateAvatar = useCallback(
    url => {
      setValue('avatar', url, true)

      const queryResult = client.readQuery({
        query: GET_USER,
        variables: {
          userId,
        },
      })

      client.writeQuery({
        query: GET_USER,
        data: {
          user: [
            {
              ...queryResult.user[0],
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
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {mutationError && !mutationLoading && (
        <Error message={mutationError.message} />
      )}
      {(userData || userId === 'new') &&
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
                <title>{userData.name || 'User'}</title>
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
                        {formState.isDirty && (
                          <ButtonSave loading={mutationLoading} />
                        )}
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
                          defaultValue={userData.firstName}
                          control={control}
                          name="firstName"
                          label="First name"
                          required
                          fullWidth
                          variant="standard"
                          error={errors.firstName}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={userData.lastName}
                          control={control}
                          name="lastName"
                          label="Last name"
                          required
                          fullWidth
                          variant="standard"
                          error={errors.lastName}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={userData.phone}
                          control={control}
                          name="phone"
                          label="Phone"
                          fullWidth
                          variant="standard"
                          error={errors.phone}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={userData.email}
                          control={control}
                          name="email"
                          label="Email"
                          fullWidth
                          variant="standard"
                          error={errors.email}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </form>
            {userData.userId && <Relations userId={userId} />}
          </>
        )}
    </Container>
  )
}

export { User as default }
