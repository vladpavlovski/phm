import React, { useCallback } from 'react'
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
import {
  dateExist,
  decomposeDate,
  decomposeTime,
  isValidUuid,
  checkId,
} from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { ADMIN_EVENTS, getAdminEventRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'
import placeholderEvent from '../../../img/placeholderEvent.png'
// import { Relations } from './relations'

const GET_EVENT = gql`
  query getEvent($eventId: ID!) {
    event: Event(eventId: $eventId) {
      eventId
      name
      description
      date {
        formatted
      }
      time {
        formatted
      }
      organizer {
        userId
        firstName
        lastName
        name
      }
    }
  }
`

const MERGE_EVENT = gql`
  mutation mergeEvent(
    $eventId: ID!
    $userId: ID!
    $name: String
    $description: String
    $dateDay: Int
    $dateMonth: Int
    $dateYear: Int
    $timeHour: Int
    $timeMinute: Int
  ) {
    mergeEvent: MergeEvent(
      eventId: $eventId
      name: $name
      description: $description
      date: { day: $dateDay, month: $dateMonth, year: $dateYear }
      time: { hour: $timeHour, minute: $timeMinute }
    ) {
      eventId
    }
    mergeUserEvent: MergeUserEvents(
      from: { userId: $userId }
      to: { eventId: $eventId }
    ) {
      from {
        userId
        firstName
        lastName
      }
    }
  }
`

const DELETE_EVENT = gql`
  mutation deleteEvent($eventId: ID!) {
    deleteEvent: DeleteEvent(eventId: $eventId) {
      eventId
    }
  }
`

const Event = () => {
  const history = useHistory()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { eventId } = useParams()
  const { user } = useAuth0()
  console.log('user:', user)
  const client = useApolloClient()
  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_EVENT, {
    fetchPolicy: 'network-only',
    variables: { eventId },
    skip: eventId === 'new',
  })

  const [
    mergeEvent,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(MERGE_EVENT, {
    onCompleted: data => {
      if (eventId === 'new') {
        const newId = data.mergeEvent.eventId
        history.replace(getAdminEventRoute(newId))
      }
      enqueueSnackbar('Event saved!', { variant: 'success' })
    },
  })

  const [
    deleteEvent,
    { loading: loadingDelete, error: errorDelete },
  ] = useMutation(DELETE_EVENT, {
    onCompleted: () => {
      history.push(ADMIN_EVENTS)
      enqueueSnackbar('Event was deleted!')
    },
  })

  const eventData = queryData?.event[0] || {}

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
          eventId: checkId(eventId),
          ...decomposeDate(date, 'date'),
          ...decomposeTime(time, 'time'),
        }

        mergeEvent({
          variables: dataToSubmit,
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
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationErrorMerge && !mutationLoadingMerge && (
        <Error message={mutationErrorMerge.message} />
      )}
      {(eventData || eventId === 'new') &&
        !queryLoading &&
        !queryError &&
        !mutationErrorMerge && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={classes.form}
            noValidate
            autoComplete="off"
          >
            <Helmet>
              <title>{eventData.name || 'Event'}</title>
            </Helmet>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4} lg={3}>
                <Paper className={classes.paper}>
                  <Img
                    placeholder={placeholderEvent}
                    src={eventData.logo}
                    className={classes.logo}
                    alt={eventData.name}
                  />

                  <RHFInput
                    style={{ display: 'none' }}
                    defaultValue={eventData.logo}
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
                        <ButtonSave loading={mutationLoadingMerge} />
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
                        defaultValue={eventData.name}
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
                        defaultValue={eventData.description}
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
                        views={['year', 'month', 'date']}
                        defaultValue={
                          eventData.date && dateExist(eventData.date.formatted)
                            ? eventData.date.formatted
                            : null
                        }
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
                        defaultValue={eventData?.time?.formatted}
                        error={errors?.time}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={eventData?.organizer?.name}
                        control={control}
                        name="Author"
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
