import {
  Error,
  Loader,
  RHFAutocomplete,
  RHFDatepicker,
  RHFInput,
  RHFSelect,
  Title,
  Uploader,
} from 'components'
import { activityStatusList } from 'components/lists'
import OrganizationContext from 'context/organization'
import placeholderAvatar from 'img/placeholderPerson.jpg'
import { useSnackbar } from 'notistack'
import React, { useCallback, useContext } from 'react'
import Img from 'react-cool-img'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'
import { getAdminOrgPersonRoute, getAdminOrgPersonsRoute } from 'router/routes'
import { decomposeDate, isValidUuid } from 'utils'
import { countriesNames } from 'utils/constants/countries'
import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client'
import { yupResolver } from '@hookform/resolvers/yup'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import { ButtonDelete } from '../commonComponents/ButtonDelete'
import { ButtonSave } from '../commonComponents/ButtonSave'
import { Relations } from './relations'
import { schema } from './schema'

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
  const { personId, organizationSlug } = useParams<TParams>()
  const { organizationData } = useContext(OrganizationContext)
  const { enqueueSnackbar } = useSnackbar()
  const client = useApolloClient()
  const {
    loading: queryLoading,
    data: { people: [personData] } = { people: [] },
    error: queryError,
  } = useQuery(GET_PERSON, {
    variables: { where: { personId } },
  })

  const [
    createPerson,
    { loading: mutationLoadingCreate, error: mutationErrorCreate },
  ] = useMutation(CREATE_PERSON, {
    onCompleted: data => {
      if (personId === 'new') {
        const newId = data?.createPeople?.people?.[0]?.personId
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
            persons: data?.updatePeople?.people,
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
    defaultValues: {
      country: personData?.country || '',
      avatar: personData?.avatar,
      firstName: personData?.firstName,
      lastName: personData?.lastName,
      externalId: personData?.externalId,
      phone: personData?.phone,
      email: personData?.email,
      birthday: personData?.birthday,
      activityStatus: personData?.activityStatus,
      city: personData?.city,
      gender: personData?.gender?.toLowerCase() || '',
    },
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { birthday, ...rest } = dataToCheck
        const dataToSubmit = {
          ...rest,
          ...decomposeDate(birthday, 'birthday'),
          orgs: {
            connect: {
              where: {
                node: { organizationId: organizationData?.organizationId },
              },
            },
          },
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
          where: { personId },
        },
      })

      client.writeQuery({
        query: GET_PERSON,
        data: {
          people: [
            {
              ...queryResult?.people?.[0],
              avatar: url,
            },
          ],
        },
        variables: {
          where: { personId },
        },
      })
      handleSubmit(onSubmit)()
    },
    [client]
  )

  return (
    <Container maxWidth={false}>
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
              <title>{personData?.name || 'Person'}</title>
            </Helmet>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4} lg={3}>
                <Paper sx={{ p: '16px' }}>
                  <Img
                    placeholder={placeholderAvatar}
                    src={personData?.avatar}
                    style={{ width: '100%' }}
                    alt={personData?.name}
                  />

                  <RHFInput
                    style={{ display: 'none' }}
                    defaultValue={personData?.avatar}
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
                <Paper sx={{ p: '16px' }}>
                  <Toolbar
                    disableGutters
                    sx={{
                      p: 0,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
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
                        defaultValue={personData?.lastName}
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
                        defaultValue={personData?.activityStatus || 'UNKNOWN'}
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
                        defaultValue={personData?.country}
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
