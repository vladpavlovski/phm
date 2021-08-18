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
import { checkId, isValidUuid } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import {
  getAdminOrgSeasonsRoute,
  getAdminOrgSeasonRoute,
} from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'

import { Relations } from './relations'

const GET_SEASON = gql`
  query getSeason($seasonId: ID!) {
    season: Season(seasonId: $seasonId) {
      seasonId
      name
      nick
      short
      startDate {
        formatted
      }
      endDate {
        formatted
      }
    }
  }
`

const MERGE_SEASON = gql`
  mutation mergeSeason(
    $seasonId: ID!
    $name: String
    $nick: String
    $short: String
    $startDateDay: Int
    $startDateMonth: Int
    $startDateYear: Int
    $endDateDay: Int
    $endDateMonth: Int
    $endDateYear: Int
  ) {
    mergeSeason: MergeSeason(
      seasonId: $seasonId
      name: $name
      nick: $nick
      short: $short
      startDate: {
        day: $startDateDay
        month: $startDateMonth
        year: $startDateYear
      }
      endDate: { day: $endDateDay, month: $endDateMonth, year: $endDateYear }
    ) {
      seasonId
    }
  }
`

const DELETE_SEASON = gql`
  mutation deleteSeason($seasonId: ID!) {
    deleteSeason: DeleteSeason(seasonId: $seasonId) {
      seasonId
    }
  }
`

const Season = () => {
  const history = useHistory()
  const classes = useStyles()
  const { seasonId, organizationSlug } = useParams()
  const { enqueueSnackbar } = useSnackbar()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_SEASON, {
    fetchPolicy: 'network-only',
    variables: { seasonId },
    skip: seasonId === 'new',
  })

  const [
    mergeSeason,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(MERGE_SEASON, {
    onCompleted: data => {
      if (seasonId === 'new') {
        const newId = data.mergeSeason.seasonId
        history.replace(getAdminOrgSeasonRoute(organizationSlug, newId))
      }
      enqueueSnackbar('Season saved!', { variant: 'success' })
    },
  })

  const [deleteSeason, { loading: loadingDelete, error: errorDelete }] =
    useMutation(DELETE_SEASON, {
      onCompleted: () => {
        history.push(getAdminOrgSeasonsRoute(organizationSlug))
        enqueueSnackbar('Season was deleted!')
      },
    })

  const seasonData = useMemo(
    () => (queryData && queryData.season[0]) || {},
    [queryData]
  )

  const { handleSubmit, control, errors, formState } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { startDate, endDate, ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          seasonId: checkId(seasonId),
          startDateDay: dayjs(startDate).date(),
          startDateMonth: dayjs(startDate).month() + 1,
          startDateYear: dayjs(startDate).year(),
          endDateDay: dayjs(endDate).date(),
          endDateMonth: dayjs(endDate).month() + 1,
          endDateYear: dayjs(endDate).year(),
        }

        mergeSeason({
          variables: dataToSubmit,
        })
      } catch (error) {
        console.error(error)
      }
    },
    [seasonId]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationErrorMerge && !mutationLoadingMerge && (
        <Error message={mutationErrorMerge.message} />
      )}
      {(seasonData || seasonId === 'new') &&
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
                <title>{seasonData.name || 'Season'}</title>
              </Helmet>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12} lg={12}>
                  <Paper className={classes.paper}>
                    <Toolbar disableGutters className={classes.toolbarForm}>
                      <div>
                        <Title>{'Season'}</Title>
                      </div>
                      <div>
                        {formState.isDirty && (
                          <ButtonSave loading={mutationLoadingMerge} />
                        )}
                        {seasonId !== 'new' && (
                          <ButtonDelete
                            loading={loadingDelete}
                            onClick={() => {
                              deleteSeason({ variables: { seasonId } })
                            }}
                          />
                        )}
                      </div>
                    </Toolbar>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={seasonData.name}
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
                          defaultValue={seasonData.nick}
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
                          defaultValue={seasonData.short}
                          control={control}
                          name="short"
                          label="Short"
                          fullWidth
                          variant="standard"
                          error={errors.short}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFDatepicker
                          fullWidth
                          control={control}
                          variant="standard"
                          name="startDate"
                          label="Start Date"
                          id="startDate"
                          openTo="year"
                          inputFormat={'DD/MM/YYYY'}
                          views={['year', 'month', 'day']}
                          defaultValue={seasonData?.startDate?.formatted}
                          error={errors.startDate}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFDatepicker
                          fullWidth
                          control={control}
                          variant="standard"
                          name="endDate"
                          label="End Date"
                          id="endDate"
                          openTo="year"
                          inputFormat={'DD/MM/YYYY'}
                          views={['year', 'month', 'day']}
                          defaultValue={seasonData?.endDate?.formatted}
                          error={errors.endDate}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </form>
            {isValidUuid(seasonId) && <Relations seasonId={seasonId} />}
          </>
        )}
    </Container>
  )
}

export { Season as default }
