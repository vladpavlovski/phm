import React, { useCallback, useMemo } from 'react'

import { useParams, useHistory } from 'react-router-dom'
import dayjs from 'dayjs'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
// useWatch
import { Helmet } from 'react-helmet'
import 'react-imported-component/macro'
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

import { ADMIN_ASSOCIATIONS, getAdminAssociationRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'

import { Relations } from './relations/Relations'

const READ_ASSOCIATION = gql`
  query getAssociation($associationId: ID!) {
    association: Association(associationId: $associationId) {
      associationId
      name
      nick
      short
      status
      legalName
      foundDate {
        formatted
      }
    }
  }
`

const MERGE_ASSOCIATION = gql`
  mutation mergeAssociation(
    $associationId: ID!
    $name: String
    $legalName: String
    $nick: String
    $short: String
    $status: String
    $foundDateDay: Int
    $foundDateMonth: Int
    $foundDateYear: Int
  ) {
    mergeAssociation: MergeAssociation(
      associationId: $associationId
      name: $name
      legalName: $legalName
      nick: $nick
      short: $short
      status: $status
      foundDate: {
        day: $foundDateDay
        month: $foundDateMonth
        year: $foundDateYear
      }
    ) {
      associationId
    }
  }
`

const DELETE_ASSOCIATION = gql`
  mutation deleteAssociation($associationId: ID!) {
    deleteAssociation: DeleteAssociation(associationId: $associationId) {
      associationId
    }
  }
`

const Association = () => {
  const history = useHistory()
  const classes = useStyles()
  const { associationId } = useParams()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(READ_ASSOCIATION, {
    fetchPolicy: 'network-only',
    variables: { associationId },
    skip: associationId === 'new',
  })

  const [
    mergeAssociation,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(MERGE_ASSOCIATION, {
    onCompleted: data => {
      if (associationId === 'new') {
        const newId = data.mergeAssociation.associationId
        history.replace(getAdminAssociationRoute(newId))
      }
    },
  })

  const [
    deleteAssociation,
    { loading: loadingDelete, error: errorDelete },
  ] = useMutation(DELETE_ASSOCIATION, {
    onCompleted: () => {
      history.push(ADMIN_ASSOCIATIONS)
    },
  })

  const associationData = useMemo(
    () => (queryData && queryData.association[0]) || {},
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
          associationId: associationId === 'new' ? uuidv4() : associationId,
          foundDateDay: dayjs(foundDate).date(),
          foundDateMonth: dayjs(foundDate).month() + 1,
          foundDateYear: dayjs(foundDate).year(),
        }

        mergeAssociation({
          variables: dataToSubmit,
        })
      } catch (error) {
        console.error(error)
      }
    },
    [associationId]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationErrorMerge && !mutationLoadingMerge && (
        <Error message={mutationErrorMerge.message} />
      )}
      {(associationData || associationId === 'new') &&
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
              <title>{associationData.name || 'Association'}</title>
            </Helmet>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <Paper className={classes.paper}>
                  <Toolbar disableGutters className={classes.toolbarForm}>
                    <div>
                      <Title>{'Association'}</Title>
                    </div>
                    <div>
                      {formState.isDirty && (
                        <ButtonSave loading={mutationLoadingMerge} />
                      )}
                      {associationId !== 'new' && (
                        <ButtonDelete
                          loading={loadingDelete}
                          onClick={() => {
                            deleteAssociation({ variables: { associationId } })
                          }}
                        />
                      )}
                    </div>
                  </Toolbar>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={associationData.name}
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
                        defaultValue={associationData.legalName}
                        control={control}
                        name="legalName"
                        label="Legal name"
                        fullWidth
                        variant="standard"
                        error={errors.legalName}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={associationData.nick}
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
                        defaultValue={associationData.short}
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
                        defaultValue={associationData.status}
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
                          associationData.foundDate &&
                          dateExist(associationData.foundDate.formatted)
                            ? associationData.foundDate.formatted
                            : null
                        }
                        error={errors.foundDate}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
            <Relations />
          </form>
        )}
    </Container>
  )
}

export { Association as default }
