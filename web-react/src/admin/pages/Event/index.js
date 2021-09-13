import React, { useCallback, useContext } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useParams, useHistory } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet'
import Img from 'react-cool-img'
import { yupResolver } from '@hookform/resolvers/yup'
import { Container, Grid, Paper } from '@material-ui/core'

import Toolbar from '@material-ui/core/Toolbar'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'
import { Uploader } from '../../../components/Uploader'
import { RHFDatepicker } from '../../../components/RHFDatepicker'
import { RHFTimepicker } from '../../../components/RHFTimepicker'

import { RHFInput } from '../../../components/RHFInput'
import { decomposeDate, decomposeTime, isValidUuid } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { getAdminOrgEventsRoute, getAdminOrgEventRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'
import placeholderEvent from '../../../img/placeholderEvent.png'
// import { Relations } from './relations'
import OrganizationContext from '../../../context/organization'

const GET_EVENT = gql`
  query getEvent($where: EventWhere) {
    events(where: $where) {
      eventId
      name
      description
      date
      time
      organizer {
        userId
        firstName
        lastName
        name
      }
    }
  }
`

const CREATE_EVENT = gql`
  mutation createEvent($input: [EventCreateInput!]!) {
    createEvents(input: $input) {
      events {
        eventId
      }
    }
  }
`

const UPDATE_EVENT = gql`
  mutation updateEvent(
    $where: EventWhere
    $update: EventUpdateInput
    $create: EventRelationInput
  ) {
    updateEvents(where: $where, update: $update, create: $create) {
      events {
        eventId
        name
        description
        date
        time
      }
    }
  }
`

const DELETE_EVENT = gql`
  mutation deleteEvent($where: EventWhere) {
    deleteEvents(where: $where) {
      nodesDeleted
    }
  }
`

const Event = () => {
  const history = useHistory()
  const classes = useStyles()
  const { organizationData } = useContext(OrganizationContext)
  const { enqueueSnackbar } = useSnackbar()
  const { eventId, organizationSlug } = useParams()
  const { user } = useAuth0()

  const client = useApolloClient()
  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_EVENT, {
    fetchPolicy: 'network-only',
    variables: { where: { eventId } },
    skip: eventId === 'new',
  })

  const eventData = queryData?.events?.[0]

  const [
    createEvent,
    { loading: mutationLoadingCreate, error: mutationErrorCreate },
  ] = useMutation(CREATE_EVENT, {
    onCompleted: data => {
      if (eventId === 'new') {
        const newId = data?.createEvents?.events?.[0]?.eventId
        newId && history.replace(getAdminOrgEventRoute(organizationSlug, newId))
      }
      enqueueSnackbar('Event saved!', { variant: 'success' })
    },
  })

  const [
    updateEvent,
    { loading: mutationLoadingUpdate, error: mutationErrorUpdate },
  ] = useMutation(UPDATE_EVENT, {
    update(cache, { data }) {
      try {
        cache.writeQuery({
          query: GET_EVENT,
          data: {
            events: data?.updateEvents?.events,
          },
          variables: { where: { eventId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      enqueueSnackbar('Event updated!', { variant: 'success' })
    },
  })

  const [deleteEvent, { loading: loadingDelete, error: errorDelete }] =
    useMutation(DELETE_EVENT, {
      variables: { where: { eventId } },
      onCompleted: () => {
        history.push(getAdminOrgEventsRoute(organizationSlug))
        enqueueSnackbar('Event was deleted!')
      },
    })

  const { handleSubmit, control, errors, formState, setValue } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { date, time, ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          userId: eventData?.organizer?.userId || user?.sub,
          ...decomposeDate(date, 'date'),
          ...decomposeTime(time, 'time'),
          org: {
            connect: {
              where: {
                node: {
                  organizationId: organizationData?.organizationId,
                },
              },
            },
          },
          organizationId: organizationData?.organizationId,
        }

        eventId === 'new'
          ? createEvent({
              variables: {
                input: dataToSubmit,
              },
            })
          : updateEvent({
              variables: {
                where: {
                  eventId,
                },
                update: dataToSubmit,
              },
            })
      } catch (error) {
        console.error(error)
      }
    },
    [eventId]
  )

  const updateLogo = useCallback(
    url => {
      setValue('logo', url, true)

      const queryResult = client.readQuery({
        query: GET_EVENT,
        variables: {
          eventId,
        },
      })

      client.writeQuery({
        query: GET_EVENT,
        data: {
          event: [
            {
              ...queryResult.event[0],
              logo: url,
            },
          ],
        },
        variables: {
          eventId,
        },
      })
      handleSubmit(onSubmit)()
    },
    [client, eventId]
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
      {(eventData || eventId === 'new') && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={classes.form}
          noValidate
          autoComplete="off"
        >
          <Helmet>
            <title>{eventData?.name || 'Event'}</title>
          </Helmet>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4} lg={3}>
              <Paper className={classes.paper}>
                <Img
                  placeholder={placeholderEvent}
                  src={eventData?.logo}
                  className={classes.logo}
                  alt={eventData?.name}
                />

                <RHFInput
                  style={{ display: 'none' }}
                  defaultValue={eventData?.logo}
                  control={control}
                  name="logo"
                  label="Logo URL"
                  disabled
                  fullWidth
                  variant="standard"
                  error={errors.logo}
                />

                {isValidUuid(eventId) && (
                  <Uploader
                    buttonText={'Change logo'}
                    onSubmit={updateLogo}
                    folderName="images/events"
                  />
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={12} lg={9}>
              <Paper className={classes.paper}>
                <Toolbar disableGutters className={classes.toolbarForm}>
                  <div>
                    <Title>{'Event'}</Title>
                  </div>
                  <div>
                    {formState.isDirty && (
                      <ButtonSave
                        loading={mutationLoadingCreate || mutationLoadingUpdate}
                      />
                    )}
                    {eventId !== 'new' && (
                      <ButtonDelete
                        loading={loadingDelete}
                        onClick={() => {
                          deleteEvent({ variables: { eventId } })
                        }}
                      />
                    )}
                  </div>
                </Toolbar>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <RHFInput
                      defaultValue={eventData?.name}
                      control={control}
                      name="name"
                      label="Name"
                      required
                      fullWidth
                      variant="standard"
                      error={errors.name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <RHFInput
                      defaultValue={eventData?.description}
                      control={control}
                      name="description"
                      label="Description"
                      fullWidth
                      variant="standard"
                      error={errors.description}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFDatepicker
                      fullWidth
                      control={control}
                      variant="standard"
                      name="date"
                      label="Date"
                      id="date"
                      openTo="year"
                      inputFormat={'DD/MM/YYYY'}
                      views={['year', 'month', 'day']}
                      defaultValue={eventData?.date}
                      error={errors.date}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFTimepicker
                      fullWidth
                      control={control}
                      variant="standard"
                      name="time"
                      label="Time"
                      id="time"
                      mask="__:__"
                      openTo="hours"
                      inputFormat={'HH:mm'}
                      views={['hours', 'minutes']}
                      defaultValue={eventData?.time}
                      error={errors?.time}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={eventData?.organizer?.name}
                      control={control}
                      name="author"
                      label="Author"
                      fullWidth
                      disabled
                      variant="standard"
                      error={errors.author}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
          {/* {isValidUuid(eventId) && <Relations eventId={eventId} />} */}
        </form>
      )}
    </Container>
  )
}

export { Event as default }
