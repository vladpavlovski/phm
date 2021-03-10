import React, { useCallback, useMemo } from 'react'

import { useParams, useHistory } from 'react-router-dom'
import dayjs from 'dayjs'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { Helmet } from 'react-helmet'

import { yupResolver } from '@hookform/resolvers/yup'

import { Container, Grid, Paper } from '@material-ui/core'

import Toolbar from '@material-ui/core/Toolbar'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'

import { RHFDatepicker } from '../../../components/RHFDatepicker'
import { RHFInput } from '../../../components/RHFInput'
import { dateExist, checkId } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { ADMIN_VENUES, getAdminVenueRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'

import { Relations } from './relations/Relations'

const READ_VENUE = gql`
  query getVenue($venueId: ID!) {
    venue: Venue(venueId: $venueId) {
      venueId
      name
      nick
      short
      web
      description
      location
      capacity
      foundDate {
        formatted
      }
      address {
        addressId
        addressLine1
        addressLine2
        addressLine3
        city
        countyProvince
        zip
        country
        other
      }
    }
  }
`

const MERGE_VENUE = gql`
  mutation mergeVenue(
    $venueId: ID!
    $name: String
    $nick: String
    $short: String
    $web: String
    $description: String
    $location: String
    $capacity: Int
    $foundDateDay: Int
    $foundDateMonth: Int
    $foundDateYear: Int
  ) {
    mergeVenue: MergeVenue(
      venueId: $venueId
      name: $name
      nick: $nick
      short: $short
      web: $web
      description: $description
      location: $location
      capacity: $capacity
      foundDate: {
        day: $foundDateDay
        month: $foundDateMonth
        year: $foundDateYear
      }
    ) {
      venueId
    }
  }
`

const DELETE_VENUE = gql`
  mutation deleteVenue($venueId: ID!) {
    deleteVenue: DeleteVenue(venueId: $venueId) {
      venueId
    }
  }
`

const Venue = () => {
  const history = useHistory()
  const classes = useStyles()
  const { venueId } = useParams()
  const { enqueueSnackbar } = useSnackbar()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(READ_VENUE, {
    fetchPolicy: 'network-only',
    variables: { venueId },
    skip: venueId === 'new',
  })

  const [
    mergeVenue,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(MERGE_VENUE, {
    onCompleted: data => {
      if (venueId === 'new') {
        const newId = data.mergeVenue.venueId
        history.replace(getAdminVenueRoute(newId))
      }
      enqueueSnackbar('Venue saved!', { variant: 'success' })
    },
  })

  const [
    deleteVenue,
    { loading: loadingDelete, error: errorDelete },
  ] = useMutation(DELETE_VENUE, {
    onCompleted: () => {
      history.push(ADMIN_VENUES)
      enqueueSnackbar('Venue was deleted!')
    },
  })

  const venueData = useMemo(() => (queryData && queryData.venue[0]) || {}, [
    queryData,
  ])

  const { handleSubmit, control, errors, formState } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { foundDate, capacity, ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          venueId: checkId(venueId),
          capacity: capacity ? parseInt(capacity) : 0,
          foundDateDay: dayjs(foundDate).date(),
          foundDateMonth: dayjs(foundDate).month() + 1,
          foundDateYear: dayjs(foundDate).year(),
        }

        mergeVenue({
          variables: dataToSubmit,
        })
      } catch (error) {
        console.error(error)
      }
    },
    [venueId]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationErrorMerge && !mutationLoadingMerge && (
        <Error message={mutationErrorMerge.message} />
      )}
      {(venueData || venueId === 'new') &&
        !queryLoading &&
        !queryError &&
        !mutationErrorMerge && (
          <>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={classes.form}
              noValidate
              autoComplete="off"
            >
              <Helmet>
                <title>{venueData.name || 'Venue'}</title>
              </Helmet>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12} lg={12}>
                  <Paper className={classes.paper}>
                    <Toolbar disableGutters className={classes.toolbarForm}>
                      <div>
                        <Title>{'Venue'}</Title>
                      </div>
                      <div>
                        {formState.isDirty && (
                          <ButtonSave loading={mutationLoadingMerge} />
                        )}
                        {venueId !== 'new' && (
                          <ButtonDelete
                            loading={loadingDelete}
                            onClick={() => {
                              deleteVenue({ variables: { venueId } })
                            }}
                          />
                        )}
                      </div>
                    </Toolbar>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={venueData.name}
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
                          defaultValue={venueData.nick}
                          control={control}
                          name="nick"
                          label="Nick"
                          fullWidth
                          variant="standard"
                          error={errors.nick}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={venueData.short}
                          control={control}
                          name="short"
                          label="Short"
                          fullWidth
                          variant="standard"
                          error={errors.short}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={venueData.web}
                          control={control}
                          name="web"
                          label="Web"
                          fullWidth
                          variant="standard"
                          error={errors.web}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={venueData.description}
                          control={control}
                          name="description"
                          label="Description"
                          fullWidth
                          variant="standard"
                          error={errors.description}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={venueData.location}
                          control={control}
                          name="location"
                          label="Location"
                          fullWidth
                          variant="standard"
                          error={errors.location}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={venueData.capacity}
                          control={control}
                          name="capacity"
                          label="Capacity"
                          fullWidth
                          variant="standard"
                          error={errors.capacity}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFDatepicker
                          fullWidth
                          control={control}
                          variant="standard"
                          name="foundDate"
                          label="Found Date"
                          id="foundDate"
                          openTo="year"
                          disableFuture
                          inputFormat={'DD/MM/YYYY'}
                          views={['year', 'month', 'date']}
                          defaultValue={
                            venueData.foundDate &&
                            dateExist(venueData.foundDate.formatted)
                              ? venueData.foundDate.formatted
                              : null
                          }
                          error={errors.foundDate}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </form>
            <Relations venueId={venueId} />
          </>
        )}
    </Container>
  )
}

export { Venue as default }
