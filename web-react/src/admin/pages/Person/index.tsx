import React, { useCallback, useEffect, useContext } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet-async'
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

import {
  RHFAutocomplete,
  RHFDatepicker,
  RHFSelect,
  RHFInput,
  Uploader,
  Title,
  Loader,
  Error,
} from 'components'

import { countriesNames } from 'utils/constants/countries'
import { decomposeDate, isValidUuid } from 'utils'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'
import { activityStatusList } from 'components/lists'
import { Relations } from './relations'

import { getAdminOrgPersonsRoute, getAdminOrgPersonRoute } from 'router/routes'
import placeholderAvatar from 'img/placeholderPerson.jpg'
import OrganizationContext from 'context/organization'

const GET_PERSON = gql`
  query getPerson($where: PersonWhere) {
    people(where: $where) {
      personId
      firstName
      lastName
      birthday
      externalId
      activityStatus
      country
      city
      gender
      avatar
      phone
      email
    }
  }
`

const CREATE_PERSON = gql`
  mutation createPerson($input: [PersonCreateInput!]!) {
    createPeople(input: $input) {
      people {
        personId
      }
    }
  }
`

const UPDATE_PERSON = gql`
  mutation updatePerson(
    $where: PersonWhere
    $update: PersonUpdateInput
    $create: PersonRelationInput
  ) {
    updatePeople(where: $where, update: $update, create: $create) {
      people {
        personId
        firstName
        lastName
        birthday
        externalId
        activityStatus
        country
        city
        gender
        avatar
        phone
        email
      }
    }
  }
`

const DELETE_PERSON = gql`
  mutation deletePerson($where: PersonWhere) {
    deletePeople(where: $where) {
      nodesDeleted
    }
  }
`

type TParams = {
  organizationSlug: string
  personId: string
}

const Person: React.FC = () => {
  const history = useHistory()
  const classes = useStyles()
  const { personId, organizationSlug } = useParams<TParams>()
  const { organizationData } = useContext(OrganizationContext)
  const { enqueueSnackbar } = useSnackbar()
  const client = useApolloClient()
  const {
    loading: queryLoading,
    data: { people: [personData] } = { people: [] },
    error: queryError,
  } = useQuery(GET_PERSON, {
    fetchPolicy: 'network-only',
    variables: { where: { personId } },
  })

  const [
    createPerson,
    { loading: mutationLoadingCreate, error: mutationErrorCreate },
  ] = useMutation(CREATE_PERSON, {
    onCompleted: data => {
      if (personId === 'new') {
        const newId = data?.createPersons?.persons?.[0]?.personId
        newId &&
          history.replace(getAdminOrgPersonRoute(organizationSlug, newId))
      }
      enqueueSnackbar('Person saved!', { variant: 'success' })
    },
  })

  const [
    updatePerson,
    { loading: mutationLoadingUpdate, error: mutationErrorUpdate },
  ] = useMutation(UPDATE_PERSON, {
    update(cache, { data }) {
      try {
        cache.writeQuery({
          query: GET_PERSON,
          data: {
            persons: data?.updatePersons?.people,
          },
          variables: { where: { personId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      enqueueSnackbar('Person updated!', { variant: 'success' })
    },
  })

  const [deletePerson, { loading: loadingDelete, error: errorDelete }] =
    useMutation(DELETE_PERSON, {
      variables: { where: { personId } },
      onCompleted: () => {
        history.push(getAdminOrgPersonsRoute(organizationSlug))
        enqueueSnackbar('Person was deleted!')
      },
    })

  const { handleSubmit, control, errors, setValue, formState } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (personData) {
      setValue('country', personData.country)
    }
  }, [personData])

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { country, birthday, ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          ...decomposeDate(birthday, 'birthday'),
          country: country || '',
        }

        personId === 'new'
          ? createPerson({
              variables: {
                input: dataToSubmit,
              },
            })
          : updatePerson({
              variables: {
                where: {
                  personId,
                },
                update: dataToSubmit,
              },
            })
      } catch (error) {
        console.error(error)
      }
    },
    [personId, organizationData]
  )

  const updateAvatar = useCallback(
    url => {
      setValue('avatar', url, { shouldValidate: true, shouldDirty: true })

      const queryResult = client.readQuery({
        query: GET_PERSON,
        variables: {
          personId,
        },
      })

      client.writeQuery({
        query: GET_PERSON,
        data: {
          person: [
            {
              ...queryResult.person[0],
              avatar: url,
            },
          ],
        },
        variables: {
          personId,
        },
      })
      handleSubmit(onSubmit)()
    },
    [client]
  )

  return (
    <Container maxWidth={false} className={classes.container}>
      {queryLoading && <Loader />}

      <Error
        message={
          mutationErrorCreate?.message ||
          mutationErrorUpdate?.message ||
          queryError?.message ||
          errorDelete?.message
        }
      />

      {(personData || personId === 'new') && (
        <>
          <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
            <Helmet>
              <title>{personData.name || 'Person'}</title>
            </Helmet>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4} lg={3}>
                <Paper className={classes.paper}>
                  <Img
                    placeholder={placeholderAvatar}
                    src={personData.avatar}
                    className={classes.logo}
                    alt={personData.name}
                  />

                  <RHFInput
                    style={{ display: 'none' }}
                    defaultValue={personData.avatar}
                    control={control}
                    name="avatar"
                    label="Avatar URL"
                    disabled
                    fullWidth
                    variant="standard"
                    error={errors?.avatar}
                  />

                  {isValidUuid(personId) && (
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
                      <Title>{'Person'}</Title>
                    </div>
                    <div>
                      {formState.isDirty && (
                        <ButtonSave
                          loading={
                            mutationLoadingUpdate || mutationLoadingCreate
                          }
                        />
                      )}
                      {personId !== 'new' && (
                        <ButtonDelete
                          loading={loadingDelete}
                          onClick={() => {
                            deletePerson()
                          }}
                        />
                      )}
                    </div>
                  </Toolbar>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={personData?.firstName}
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
                        defaultValue={personData.lastName}
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
                        defaultValue={personData?.externalId}
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
                        defaultValue={personData?.phone}
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
                        defaultValue={personData?.email}
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
                        defaultValue={personData?.birthday}
                        error={errors?.birthday}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFSelect
                        fullWidth
                        control={control}
                        name="activityStatus"
                        label="Activity Status"
                        defaultValue={personData?.activityStatus || ''}
                        error={errors?.activityStatus}
                      >
                        {activityStatusList.map(s => {
                          return (
                            <MenuItem key={s.value} value={s.value}>
                              {s.name}
                            </MenuItem>
                          )
                        })}
                      </RHFSelect>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFAutocomplete
                        fullWidth
                        options={countriesNames}
                        defaultValue={personData.country}
                        // getOptionLabel={option => {
                        //   console.log(option)
                        //   return option
                        // }}
                        // isOptionEqualToValue={(option, value) => {
                        //   console.log(option, value)
                        //   return equals(option, value)
                        // }}
                        control={control}
                        name="country"
                        label="Country"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={personData?.city}
                        control={control}
                        name="city"
                        label="City"
                        fullWidth
                        variant="standard"
                        error={errors?.city}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFSelect
                        fullWidth
                        name="gender"
                        label="Gender"
                        id="gender"
                        control={control}
                        defaultValue={personData?.gender?.toLowerCase() || ''}
                        error={errors?.gender}
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </RHFSelect>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </form>
          {isValidUuid(personId) && <Relations personId={personId} />}
        </>
      )}
    </Container>
  )
}

export { Person as default }