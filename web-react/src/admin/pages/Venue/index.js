import React from 'react'

import { useParams, useHistory } from 'react-router-dom'
import Img from 'react-cool-img'
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { Helmet } from 'react-helmet'

import { yupResolver } from '@hookform/resolvers/yup'

import { Container, Grid, Paper } from '@material-ui/core'

import Toolbar from '@material-ui/core/Toolbar'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'
import { Uploader } from '../../../components/Uploader'
import { RHFDatepicker } from '../../../components/RHFDatepicker'
import { RHFInput } from '../../../components/RHFInput'
import { decomposeDate, isValidUuid } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { getAdminOrgVenuesRoute, getAdminOrgVenueRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'
import placeholderOrganization from '../../../img/placeholderOrganization.png'
import { Relations } from './relations'

const GET_VENUE = gql`
  query getVenue($where: VenueWhere) {
    venues(where: $where) {
      venueId
      name
      nick
      short
      web
      description
      location
      capacity
      logo
      foundDate
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
      competitions {
        competitionId
        name
      }
      seasons {
        seasonId
        name
      }
      phases {
        phaseId
        name
        status
        startDate
        endDate
        competition {
          name
        }
      }
      groups {
        groupId
        name
        competition {
          name
        }
      }
    }
  }
`

const CREATE_VENUE = gql`
  mutation createVenue($input: [VenueCreateInput!]!) {
    createVenues(input: $input) {
      venues {
        venueId
      }
    }
  }
`

const UPDATE_VENUE = gql`
  mutation updateVenue($where: VenueWhere, $update: VenueUpdateInput) {
    updateVenues(where: $where, update: $update) {
      venues {
        venueId
        name
        nick
        short
        web
        description
        location
        capacity
        logo
        foundDate
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
  }
`

const DELETE_VENUE = gql`
  mutation deleteVenue($where: VenueWhere) {
    deleteVenues(where: $where) {
      nodesDeleted
    }
  }
`

const Venue = () => {
  const history = useHistory()
  const classes = useStyles()
  const { venueId, organizationSlug } = useParams()
  const { enqueueSnackbar } = useSnackbar()
  const client = useApolloClient()
  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_VENUE, {
    variables: { where: { venueId } },
    skip: venueId === 'new',
  })

  const venueData = queryData?.venues?.[0]

  const [
    createVenue,
    { loading: mutationLoadingCreate, error: mutationErrorCreate },
  ] = useMutation(CREATE_VENUE, {
    onCompleted: data => {
      if (venueId === 'new') {
        const newId = data?.createVenues?.venues?.[0]?.venueId
        newId && history.replace(getAdminOrgVenueRoute(organizationSlug, newId))
      }
      enqueueSnackbar('Venue saved!', { variant: 'success' })
    },
  })

  const [
    updateVenue,
    { loading: mutationLoadingUpdate, error: mutationErrorUpdate },
  ] = useMutation(UPDATE_VENUE, {
    update(cache, { data }) {
      try {
        cache.writeQuery({
          query: GET_VENUE,
          data: {
            venues: data?.updateVenues?.venues,
          },
          variables: { where: { venueId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      enqueueSnackbar('Venue updated!', { variant: 'success' })
    },
  })

  const [deleteVenue, { loading: loadingDelete, error: errorDelete }] =
    useMutation(DELETE_VENUE, {
      variables: { where: { venueId } },
      onCompleted: () => {
        history.push(getAdminOrgVenuesRoute(organizationSlug))
        enqueueSnackbar('Venue was deleted!')
      },
    })

  const { handleSubmit, control, errors, formState, setValue } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = React.useCallback(
    dataToCheck => {
      try {
        const { foundDate, capacity, ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          capacity: capacity ? `${capacity}` : null,
          ...decomposeDate(foundDate, 'foundDate'),
        }

        venueId === 'new'
          ? createVenue({
              variables: {
                input: {
                  ...dataToSubmit,
                },
              },
            })
          : updateVenue({
              variables: {
                where: {
                  venueId,
                },
                update: dataToSubmit,
              },
            })
      } catch (error) {
        console.error(error)
      }
    },
    [venueId]
  )

  const updateLogo = React.useCallback(
    url => {
      setValue('logo', url, true)

      const queryResult = client.readQuery({
        query: GET_VENUE,
        variables: {
          venueId,
        },
      })

      client.writeQuery({
        query: GET_VENUE,
        data: {
          venue: [
            {
              ...queryResult?.venue?.[0],
              logo: url,
            },
          ],
        },
        variables: {
          venueId,
        },
      })
      handleSubmit(onSubmit)()
    },
    [client, venueId]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && <Loader />}
      {(mutationErrorCreate ||
        mutationErrorUpdate ||
        queryError ||
        errorDelete) && (
        <Error
          message={
            mutationErrorCreate?.message ||
            mutationErrorUpdate?.message ||
            queryError?.message ||
            errorDelete?.message
          }
        />
      )}
      {(venueData || venueId === 'new') && (
        <>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={classes.form}
            noValidate
            autoComplete="off"
          >
            <Helmet>
              <title>{venueData?.name || 'Venue'}</title>
            </Helmet>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4} lg={3}>
                <Paper className={classes.paper}>
                  <Img
                    placeholder={placeholderOrganization}
                    src={venueData?.logo}
                    className={classes.logo}
                    alt={venueData?.name}
                  />

                  <RHFInput
                    style={{ display: 'none' }}
                    defaultValue={venueData?.logo}
                    control={control}
                    name="logo"
                    label="Logo URL"
                    disabled
                    fullWidth
                    variant="standard"
                    error={errors.logo}
                  />

                  {isValidUuid(venueId) && (
                    <Uploader
                      buttonText={'Change logo'}
                      onSubmit={updateLogo}
                      folderName="images/venues"
                    />
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={12} lg={9}>
                <Paper className={classes.paper}>
                  <Toolbar disableGutters className={classes.toolbarForm}>
                    <div>
                      <Title>{'Venue'}</Title>
                    </div>
                    <div>
                      {formState.isDirty && (
                        <ButtonSave
                          loading={
                            mutationLoadingCreate || mutationLoadingUpdate
                          }
                        />
                      )}
                      {venueId !== 'new' && (
                        <ButtonDelete
                          loading={loadingDelete}
                          onClick={() => {
                            deleteVenue({ variables: { where: { venueId } } })
                          }}
                        />
                      )}
                    </div>
                  </Toolbar>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={venueData?.name}
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
                        defaultValue={venueData?.nick}
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
                        defaultValue={venueData?.short}
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
                        defaultValue={venueData?.web}
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
                        defaultValue={venueData?.description}
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
                        defaultValue={venueData?.location}
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
                        defaultValue={venueData?.capacity}
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
                        views={['year', 'month', 'day']}
                        defaultValue={venueData?.foundDate}
                        error={errors.foundDate}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </form>
          {isValidUuid(venueId) && (
            <Relations
              venueId={venueId}
              venue={venueData}
              updateVenue={updateVenue}
            />
          )}
        </>
      )}
    </Container>
  )
}

export { Venue as default }
