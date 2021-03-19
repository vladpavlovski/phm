import React, { useCallback, useMemo } from 'react'

import { useParams, useHistory } from 'react-router-dom'
import dayjs from 'dayjs'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet'

import { yupResolver } from '@hookform/resolvers/yup'
import { v4 as uuidv4 } from 'uuid'
import { Container, Grid, Paper } from '@material-ui/core'

import Toolbar from '@material-ui/core/Toolbar'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'

import { RHFDatepicker } from '../../../components/RHFDatepicker'
import { RHFInput } from '../../../components/RHFInput'
import { dateExist } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { ADMIN_COMPETITIONS, getAdminCompetitionRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'

import { Relations } from './relations'

const GET_COMPETITION = gql`
  query getCompetition($competitionId: ID!) {
    competition: Competition(competitionId: $competitionId) {
      competitionId
      name
      nick
      short
      status
      foundDate {
        formatted
      }
    }
  }
`

const MERGE_COMPETITION = gql`
  mutation mergeCompetition(
    $competitionId: ID!
    $name: String
    $nick: String
    $short: String
    $status: String
    $foundDateDay: Int
    $foundDateMonth: Int
    $foundDateYear: Int
  ) {
    mergeCompetition: MergeCompetition(
      competitionId: $competitionId
      name: $name
      nick: $nick
      short: $short
      status: $status
      foundDate: {
        day: $foundDateDay
        month: $foundDateMonth
        year: $foundDateYear
      }
    ) {
      competitionId
    }
  }
`

const DELETE_COMPETITION = gql`
  mutation deleteCompetition($competitionId: ID!) {
    deleteCompetition: DeleteCompetition(competitionId: $competitionId) {
      competitionId
    }
  }
`

const Competition = () => {
  const history = useHistory()
  const classes = useStyles()
  const { competitionId } = useParams()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_COMPETITION, {
    fetchPolicy: 'network-only',
    variables: { competitionId },
    skip: competitionId === 'new',
  })

  const [
    mergeCompetition,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(MERGE_COMPETITION, {
    onCompleted: data => {
      if (competitionId === 'new') {
        const newId = data.mergeCompetition.competitionId
        history.replace(getAdminCompetitionRoute(newId))
      }
    },
  })

  const [
    deleteCompetition,
    { loading: loadingDelete, error: errorDelete },
  ] = useMutation(DELETE_COMPETITION, {
    onCompleted: () => {
      history.push(ADMIN_COMPETITIONS)
    },
  })

  const competitionData = useMemo(
    () => (queryData && queryData.competition[0]) || {},
    [queryData]
  )

  const { handleSubmit, control, errors, formState } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { foundDate, ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          competitionId: competitionId === 'new' ? uuidv4() : competitionId,
          foundDateDay: dayjs(foundDate).date(),
          foundDateMonth: dayjs(foundDate).month() + 1,
          foundDateYear: dayjs(foundDate).year(),
        }

        mergeCompetition({
          variables: dataToSubmit,
        })
      } catch (error) {
        console.error(error)
      }
    },
    [competitionId]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationErrorMerge && !mutationLoadingMerge && (
        <Error message={mutationErrorMerge.message} />
      )}
      {(competitionData || competitionId === 'new') &&
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
              <title>{competitionData.name || 'Competition'}</title>
            </Helmet>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <Paper className={classes.paper}>
                  <Toolbar disableGutters className={classes.toolbarForm}>
                    <div>
                      <Title>{'Competition'}</Title>
                    </div>
                    <div>
                      {formState.isDirty && (
                        <ButtonSave loading={mutationLoadingMerge} />
                      )}
                      {competitionId !== 'new' && (
                        <ButtonDelete
                          loading={loadingDelete}
                          onClick={() => {
                            deleteCompetition({ variables: { competitionId } })
                          }}
                        />
                      )}
                    </div>
                  </Toolbar>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={competitionData.name}
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
                        defaultValue={competitionData.nick}
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
                        defaultValue={competitionData.short}
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
                        defaultValue={competitionData.status}
                        control={control}
                        name="status"
                        label="Status"
                        fullWidth
                        variant="standard"
                        error={errors.status}
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
                          competitionData.foundDate &&
                          dateExist(competitionData.foundDate.formatted)
                            ? competitionData.foundDate.formatted
                            : null
                        }
                        error={errors.foundDate}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
            <Relations competitionId={competitionId} />
          </form>
        )}
    </Container>
  )
}

export { Competition as default }
