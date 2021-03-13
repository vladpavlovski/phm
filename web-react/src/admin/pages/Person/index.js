import React, { useCallback, useMemo, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import dayjs from 'dayjs'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet'

import { yupResolver } from '@hookform/resolvers/yup'
import { v4 as uuidv4 } from 'uuid'
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
import { countriesNames } from '../../../utils/constants/countries'
import { dateExist } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { Relations } from './relations'

import { ADMIN_PERSONS, getAdminPersonRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'

const READ_PERSON = gql`
  query getPerson($personId: ID!) {
    Person(personId: $personId) {
      personId
      name
      birthday {
        formatted
      }
      externalId
      activityStatus
      country
      city
      height
      weight
      gender
    }
  }
`

const MERGE_PERSON = gql`
  mutation mergePerson(
    $personId: ID!
    $name: String
    $birthdayDay: Int
    $birthdayMonth: Int
    $birthdayYear: Int
    $userName: String
    $phone: String
    $gender: String
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
    mergePerson: MergePerson(
      personId: $personId
      name: $name
      birthday: {
        day: $birthdayDay
        month: $birthdayMonth
        year: $birthdayYear
      }
      userName: $userName
      phone: $phone
      gender: $gender
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
      personId
    }
  }
`

const DELETE_PERSON = gql`
  mutation deletePerson($personId: ID!) {
    deletePerson: DeletePerson(personId: $personId) {
      personId
    }
  }
`

const Person = () => {
  const history = useHistory()
  const classes = useStyles()
  const { personId } = useParams()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(READ_PERSON, {
    fetchPolicy: 'network-only',
    variables: { personId },
  })

  const [
    mergePerson,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(MERGE_PERSON, {
    onCompleted: data => {
      if (personId === 'new') {
        const newPersonId = data.mergePerson.personId
        history.replace(getAdminPersonRoute(newPersonId))
      }
    },
  })

  const personData = useMemo(() => (queryData && queryData.Person[0]) || {}, [
    queryData,
  ])

  const [
    deletePerson,
    { loading: loadingDelete, error: errorDelete },
  ] = useMutation(DELETE_PERSON, {
    onCompleted: () => {
      history.push(ADMIN_PERSONS)
    },
  })

  const { handleSubmit, control, errors, setValue, formState } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      country: '',
    },
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
          personId: personId === 'new' ? uuidv4() : personId,
          birthdayDay: dayjs(birthday).date(),
          birthdayMonth: dayjs(birthday).month() + 1,
          birthdayYear: dayjs(birthday).year(),
          country: country || '',
        }

        mergePerson({
          variables: dataToSubmit,
        })
      } catch (error) {
        console.error(error)
      }
    },
    [personId]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationError && !mutationLoading && (
        <Error message={mutationError.message} />
      )}
      {(personData || personId === 'new') &&
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
                <title>{personData.name || 'Person'}</title>
              </Helmet>
              <Paper className={classes.paper}>
                <Toolbar disableGutters className={classes.toolbarForm}>
                  <div>
                    <Title>{'Person'}</Title>
                  </div>
                  <div>
                    {formState.isDirty && (
                      <ButtonSave loading={mutationLoading} />
                    )}
                    {personId !== 'new' && (
                      <ButtonDelete
                        loading={loadingDelete}
                        onClick={() => {
                          deletePerson({ variables: { personId } })
                        }}
                      />
                    )}
                  </div>
                </Toolbar>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={personData.name}
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
                      defaultValue={personData.externalId}
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
                        personData.birthday &&
                        dateExist(personData.birthday.formatted)
                          ? personData.birthday.formatted
                          : null
                      }
                      error={errors.birthday}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={personData.activityStatus}
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
                      defaultValue={personData.country}
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
                      defaultValue={personData.city}
                      control={control}
                      name="city"
                      label="City"
                      fullWidth
                      variant="standard"
                      error={errors.city}
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
                        (personData.gender &&
                          personData.gender.toLowerCase()) ||
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
                      defaultValue={personData.height}
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
                      defaultValue={personData.weight}
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
            </form>
            <Relations personId={personId} />
          </>
        )}
    </Container>
  )
}

export { Person as default }
