import React, { useCallback, useContext } from 'react'

import { useParams, useHistory } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet'
import { useSnackbar } from 'notistack'

import { yupResolver } from '@hookform/resolvers/yup'
import Img from 'react-cool-img'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'

import Toolbar from '@mui/material/Toolbar'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'
import { Uploader } from '../../../components/Uploader'
import { RHFDatepicker } from '../../../components/RHFDatepicker'
import { RHFInput } from '../../../components/RHFInput'
import { decomposeDate, isValidUuid } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import {
  ADMIN_ORGANIZATIONS,
  getAdminOrganizationRoute,
} from '../../../router/routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'
import placeholderOrganization from '../../../img/placeholderOrganization.png'
import { Relations } from './relations'
import * as ROUTES from '../../../router/routes'
import OrganizationContext from '../../../context/organization'

export const GET_ORGANIZATION = gql`
  query getOrganization($where: OrganizationWhere) {
    organizations(where: $where) {
      organizationId
      name
      nick
      short
      status
      legalName
      logo
      urlSlug
      ownerId
      foundDate
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

const CREATE_ORGANIZATION = gql`
  mutation createOrganization($input: [OrganizationCreateInput!]!) {
    createOrganizations(input: $input) {
      organizations {
        organizationId
        name
        nick
        short
        status
        legalName
        logo
        urlSlug
        ownerId
        foundDate
      }
    }
  }
`

const UPDATE_ORGANIZATION = gql`
  mutation updateOrganization(
    $where: OrganizationWhere
    $update: OrganizationUpdateInput
  ) {
    updateOrganizations(where: $where, update: $update) {
      organizations {
        organizationId
        name
        nick
        short
        status
        legalName
        logo
        urlSlug
        ownerId
        foundDate
      }
    }
  }
`

const DELETE_ORGANIZATION = gql`
  mutation deleteOrganization($where: OrganizationWhere) {
    deleteOrganizations(where: $where) {
      nodesDeleted
    }
  }
`

const Organization = () => {
  const history = useHistory()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { organizationSlug } = useParams()
  const client = useApolloClient()
  const { user } = useAuth0()
  const { setOrganizationData } = useContext(OrganizationContext)

  const {
    data: queryData,
    loading: queryLoading,
    error: queryError,
  } = useQuery(GET_ORGANIZATION, {
    variables: { where: { urlSlug: organizationSlug } },
    skip: organizationSlug === 'new',
    onCompleted: data => {
      if (data) {
        const { organizationId, urlSlug, name, nick } = data?.organizations?.[0]
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
    createOrganization,
    { loading: mutationLoadingCreate, error: mutationErrorCreate },
  ] = useMutation(CREATE_ORGANIZATION, {
    onCompleted: data => {
      if (organizationSlug === 'new') {
        const newId = data.mergeOrganization.organizationId
        history.replace(getAdminOrganizationRoute(newId))
      }
      enqueueSnackbar('Organization created!', { variant: 'success' })
    },
  })

  const [updateOrganization, { loading: mutationLoadingUpdate }] = useMutation(
    UPDATE_ORGANIZATION,
    {
      onCompleted: () => {
        enqueueSnackbar('Organization updated!', { variant: 'success' })
      },
    }
  )

  const [deleteOrganization, { loading: loadingDelete, error: errorDelete }] =
    useMutation(DELETE_ORGANIZATION, {
      onCompleted: () => {
        history.push(ADMIN_ORGANIZATIONS)
      },
    })

  const orgData = queryData?.organizations?.[0]

  const { handleSubmit, control, errors, formState, setValue } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { foundDate, ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          ownerId: orgData?.ownerId || user?.sub,
          ...decomposeDate(foundDate, 'foundDate'),
        }

        orgData.organizationId
          ? updateOrganization({
              variables: {
                where: {
                  organizationId: orgData.organizationId,
                },
                update: dataToSubmit,
              },
            })
          : createOrganization({
              variables: {
                input: dataToSubmit,
              },
            })
      } catch (error) {
        console.error(error)
      }
    },
    [orgData]
  )

  const updateLogo = useCallback(
    url => {
      setValue('logo', url, true)

      const queryResult = client.readQuery({
        query: GET_ORGANIZATION,
        variables: {
          where: { organizationId: orgData.organizationId },
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
          where: { organizationId: orgData.organizationId },
        },
      })
      handleSubmit(onSubmit)()
    },
    [client, orgData]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationErrorCreate && !mutationLoadingCreate && (
        <Error message={mutationErrorCreate.message} />
      )}
      {(orgData || organizationSlug === 'new') &&
        !queryError &&
        !mutationErrorCreate && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={classes.form}
            noValidate
            autoComplete="off"
          >
            <Helmet>
              <title>{orgData?.name || 'Organization'}</title>
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

                  {isValidUuid(orgData.organizationId) && (
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
                      <Title>{orgData?.name || 'Organization'}</Title>
                    </div>
                    <div>
                      {formState.isDirty && (
                        <ButtonSave
                          loading={
                            mutationLoadingCreate || mutationLoadingUpdate
                          }
                        />
                      )}
                      {organizationSlug !== 'new' && (
                        <ButtonDelete
                          loading={loadingDelete}
                          onClick={() => {
                            deleteOrganization({
                              variables: {
                                where: {
                                  organizationId: orgData.organizationId,
                                },
                              },
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
                        defaultValue={orgData?.foundDate}
                        error={errors?.foundDate}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
            {isValidUuid(orgData.organizationId) && (
              <Relations
                organizationId={orgData.organizationId}
                data={orgData}
              />
            )}
          </form>
        )}
    </Container>
  )
}

export { Organization as default }
