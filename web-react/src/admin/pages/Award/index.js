import React, { useCallback, useMemo } from 'react'

import { useParams, useHistory } from 'react-router-dom'

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
import { checkId, isValidUuid, decomposeDate } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { getAdminOrgAwardsRoute, getAdminOrgAwardRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'

import { Relations } from './relations'

const GET_AWARD = gql`
  query getAward($awardId: ID!) {
    award: Award(awardId: $awardId) {
      awardId
      name
      nick
      short
      description
      type
      foundDate {
        formatted
      }
    }
  }
`

const MERGE_AWARD = gql`
  mutation mergeAward(
    $awardId: ID!
    $name: String
    $nick: String
    $short: String
    $description: String
    $type: String
    $foundDateDay: Int
    $foundDateMonth: Int
    $foundDateYear: Int
  ) {
    mergeAward: MergeAward(
      awardId: $awardId
      name: $name
      nick: $nick
      short: $short
      description: $description
      type: $type
      foundDate: {
        day: $foundDateDay
        month: $foundDateMonth
        year: $foundDateYear
      }
    ) {
      awardId
    }
  }
`

const DELETE_AWARD = gql`
  mutation deleteAward($awardId: ID!) {
    deleteAward: DeleteAward(awardId: $awardId) {
      awardId
    }
  }
`

const Award = () => {
  const history = useHistory()
  const classes = useStyles()
  const { awardId, organizationSlug } = useParams()
  const { enqueueSnackbar } = useSnackbar()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_AWARD, {
    fetchPolicy: 'network-only',
    variables: { awardId },
    skip: awardId === 'new',
  })

  const [
    mergeAward,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(MERGE_AWARD, {
    onCompleted: data => {
      if (awardId === 'new') {
        const newId = data.mergeAward.awardId
        history.replace(getAdminOrgAwardRoute(organizationSlug, newId))
      }
      enqueueSnackbar('Award saved!', { variant: 'success' })
    },
  })

  const [
    deleteAward,
    { loading: loadingDelete, error: errorDelete },
  ] = useMutation(DELETE_AWARD, {
    onCompleted: () => {
      history.push(getAdminOrgAwardsRoute(organizationSlug))
      enqueueSnackbar('Award was deleted!')
    },
  })

  const awardData = useMemo(() => (queryData && queryData.award[0]) || {}, [
    queryData,
  ])

  const { handleSubmit, control, errors, formState } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { foundDate, ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          awardId: checkId(awardId),
          ...decomposeDate(foundDate, 'foundDate'),
        }

        mergeAward({
          variables: dataToSubmit,
        })
      } catch (error) {
        console.error(error)
      }
    },
    [awardId]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationErrorMerge && !mutationLoadingMerge && (
        <Error message={mutationErrorMerge.message} />
      )}
      {(awardData || awardId === 'new') &&
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
                <title>{awardData.name || 'Award'}</title>
              </Helmet>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12} lg={12}>
                  <Paper className={classes.paper}>
                    <Toolbar disableGutters className={classes.toolbarForm}>
                      <div>
                        <Title>{'Award'}</Title>
                      </div>
                      <div>
                        {formState.isDirty && (
                          <ButtonSave loading={mutationLoadingMerge} />
                        )}
                        {awardId !== 'new' && (
                          <ButtonDelete
                            loading={loadingDelete}
                            onClick={() => {
                              deleteAward({ variables: { awardId } })
                            }}
                          />
                        )}
                      </div>
                    </Toolbar>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={awardData.name}
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
                          defaultValue={awardData.nick}
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
                          defaultValue={awardData.short}
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
                          defaultValue={awardData.description}
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
                          defaultValue={awardData.type}
                          control={control}
                          name="type"
                          label="Type"
                          fullWidth
                          variant="standard"
                          error={errors.type}
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
                          inputFormat={'DD/MM/YYYY'}
                          views={['year', 'month', 'date']}
                          defaultValue={awardData?.foundDate?.formatted}
                          error={errors.foundDate}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </form>
            {isValidUuid(awardId) && <Relations awardId={awardId} />}
          </>
        )}
    </Container>
  )
}

export { Award as default }
