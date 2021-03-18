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

import { ADMIN_ORGANIZATIONS, getAdminOrganizationRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'

import { Relations } from './relations'

const READ_ORGANIZATION = gql`
  query getOrganization($organizationId: ID!) {
    organization: Organization(organizationId: $organizationId) {
      organizationId
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

const MERGE_ORGANIZATION = gql`
  mutation mergeOrganization(
    $organizationId: ID!
    $name: String
    $legalName: String
    $nick: String
    $short: String
    $status: String
    $foundDateDay: Int
    $foundDateMonth: Int
    $foundDateYear: Int
  ) {
    mergeOrganization: MergeOrganization(
      organizationId: $organizationId
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
      organizationId
    }
  }
`

const DELETE_ORGANIZATION = gql`
  mutation deleteOrganization($organizationId: ID!) {
    deleteOrganization: DeleteOrganization(organizationId: $organizationId) {
      organizationId
    }
  }
`

const Organization = () => {
  const history = useHistory()
  const classes = useStyles()
  const { organizationId } = useParams()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(READ_ORGANIZATION, {
    fetchPolicy: 'network-only',
    variables: { organizationId },
    skip: organizationId === 'new',
  })

  const [
    mergeOrganization,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(MERGE_ORGANIZATION, {
    onCompleted: data => {
      if (organizationId === 'new') {
        const newId = data.mergeOrganization.organizationId
        history.replace(getAdminOrganizationRoute(newId))
      }
    },
  })

  const [
    deleteOrganization,
    { loading: loadingDelete, error: errorDelete },
  ] = useMutation(DELETE_ORGANIZATION, {
    onCompleted: () => {
      history.push(ADMIN_ORGANIZATIONS)
    },
  })

  const organizationData = useMemo(
    () => (queryData && queryData.organization[0]) || {},
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
          organizationId: organizationId === 'new' ? uuidv4() : organizationId,
          foundDateDay: dayjs(foundDate).date(),
          foundDateMonth: dayjs(foundDate).month() + 1,
          foundDateYear: dayjs(foundDate).year(),
        }

        mergeOrganization({
          variables: dataToSubmit,
        })
      } catch (error) {
        console.error(error)
      }
    },
    [organizationId]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationErrorMerge && !mutationLoadingMerge && (
        <Error message={mutationErrorMerge.message} />
      )}
      {(organizationData || organizationId === 'new') &&
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
              <title>{organizationData.name || 'Organization'}</title>
            </Helmet>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <Paper className={classes.paper}>
                  <Toolbar disableGutters className={classes.toolbarForm}>
                    <div>
                      <Title>{'Organization'}</Title>
                    </div>
                    <div>
                      {formState.isDirty && (
                        <ButtonSave loading={mutationLoadingMerge} />
                      )}
                      {organizationId !== 'new' && (
                        <ButtonDelete
                          loading={loadingDelete}
                          onClick={() => {
                            deleteOrganization({
                              variables: { organizationId },
                            })
                          }}
                        />
                      )}
                    </div>
                  </Toolbar>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={organizationData.name}
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
                        defaultValue={organizationData.legalName}
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
                        defaultValue={organizationData.nick}
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
                        defaultValue={organizationData.short}
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
                        defaultValue={organizationData.status}
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
                          organizationData.foundDate &&
                          dateExist(organizationData.foundDate.formatted)
                            ? organizationData.foundDate.formatted
                            : null
                        }
                        error={errors.foundDate}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
            <Relations organizationId={organizationId} />
          </form>
        )}
    </Container>
  )
}

export { Organization as default }
