import React, { useCallback, useContext } from 'react'

import { useParams, useHistory } from 'react-router-dom'

import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet'

import { yupResolver } from '@hookform/resolvers/yup'
import { v4 as uuidv4 } from 'uuid'
import Img from 'react-cool-img'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

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

import { ADMIN_ORGANIZATIONS, getAdminOrganizationRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'
import placeholderOrganization from '../../../img/placeholderOrganization.png'
import { Relations } from './relations'
import * as ROUTES from '../../../routes'
import OrganizationContext from '../../../context/organization'

const GET_ORGANIZATION_BY_SLUG = gql`
  query getOrganizationBySlug($organizationSlug: String!) {
    organization: organizationBySlug(organizationSlug: $organizationSlug) {
      organizationId
      name
      nick
      short
      status
      legalName
      logo
      urlSlug
      foundDate {
        formatted
      }
      persons {
        personId
        firstName
        lastName
        name
        avatar
        occupations {
          occupationId
          name
        }
      }
      occupations {
        occupationId
        name
      }
    }
  }
`

export const GET_ORGANIZATION = gql`
  query getOrganization($organizationId: ID!) {
    organization: Organization(organizationId: $organizationId) {
      organizationId
      name
      nick
      short
      status
      legalName
      logo
      urlSlug
      foundDate {
        formatted
      }
      persons {
        personId
        firstName
        lastName
        name
        avatar
        occupations {
          occupationId
          name
        }
      }
      occupations {
        occupationId
        name
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
    $logo: String
    $urlSlug: String!
  ) {
    mergeOrganization: MergeOrganization(
      organizationId: $organizationId
      name: $name
      legalName: $legalName
      nick: $nick
      short: $short
      status: $status
      logo: $logo
      urlSlug: $urlSlug
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
  const { organizationId, organizationSlug } = useParams()
  const client = useApolloClient()

  const { setOrganizationData } = useContext(OrganizationContext)

  // const {
  //   loading: queryLoading,
  //   data: queryData,
  //   error: queryError,
  // } = useQuery(GET_ORGANIZATION, {
  //   fetchPolicy: 'network-only',
  //   variables: { organizationId },
  //   skip: organizationId === 'new',
  // })

  const {
    data: queryData,
    loading: queryLoading,
    error: queryError,
  } = useQuery(GET_ORGANIZATION_BY_SLUG, {
    variables: { organizationSlug },
    skip: organizationId === 'new',
    onCompleted: ({ organization }) => {
      if (organization) {
        const { organizationId, urlSlug, name, nick } = organization
        setOrganizationData({
          organizationId,
          urlSlug,
          name,
          nick,
        })
      } else {
        history.replace(ROUTES.NOT_FOUND)
      }
    },
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

  const orgData = queryData?.organization || {}

  const { handleSubmit, control, errors, formState, setValue } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { foundDate, ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          organizationId: organizationId === 'new' ? uuidv4() : organizationId,
          ...decomposeDate(foundDate, 'foundDate'),
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

  const updateLogo = useCallback(
    url => {
      setValue('logo', url, true)

      const queryResult = client.readQuery({
        query: GET_ORGANIZATION,
        variables: {
          organizationId,
        },
      })

      client.writeQuery({
        query: GET_ORGANIZATION,
        data: {
          organization: [
            {
              ...queryResult.organization[0],
              logo: url,
            },
          ],
        },
        variables: {
          organizationId,
        },
      })
      handleSubmit(onSubmit)()
    },
    [client, organizationId]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationErrorMerge && !mutationLoadingMerge && (
        <Error message={mutationErrorMerge.message} />
      )}
      {(orgData || organizationId === 'new') &&
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
              <title>{orgData.name || 'Organization'}</title>
            </Helmet>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4} lg={3}>
                <Paper className={classes.paper}>
                  <Img
                    placeholder={placeholderOrganization}
                    src={orgData.logo}
                    className={classes.logo}
                    alt={orgData.name}
                  />

                  <RHFInput
                    style={{ display: 'none' }}
                    defaultValue={orgData.logo}
                    control={control}
                    name="logo"
                    label="Logo URL"
                    disabled
                    fullWidth
                    variant="standard"
                    error={errors.logo}
                  />

                  {isValidUuid(organizationId) && (
                    <Uploader
                      buttonText={'Change logo'}
                      onSubmit={updateLogo}
                      folderName="images/organizations"
                    />
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={12} lg={9}>
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
                        defaultValue={orgData.name}
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
                        defaultValue={orgData.legalName}
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
                        defaultValue={orgData.nick}
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
                        defaultValue={orgData.short}
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
                        defaultValue={orgData.urlSlug}
                        control={control}
                        name="urlSlug"
                        label="Url Slug"
                        required
                        fullWidth
                        variant="standard"
                        error={errors.urlSlug}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={orgData.status}
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
                        views={['year', 'month', 'day']}
                        defaultValue={orgData?.foundDate?.formatted}
                        error={errors?.foundDate}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
            {isValidUuid(organizationId) && (
              <Relations organizationId={organizationId} data={orgData} />
            )}
          </form>
        )}
    </Container>
  )
}

export { Organization as default }
