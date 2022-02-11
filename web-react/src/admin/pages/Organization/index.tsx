import React, { useCallback, useContext } from 'react'

import { useParams, useHistory } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet-async'
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
  NOT_FOUND,
} from 'router/routes'
import { Loader, Error } from 'components'

import placeholderOrganization from 'img/placeholderOrganization.png'
import { Relations } from './relations'
import OrganizationContext from 'context/organization'

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
      urlGameLinks
      bankAccountNumber
      bankAccountCurrency
      bankCode
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
        urlGameLinks
        ownerId
        foundDate
        bankAccountNumber
        bankAccountCurrency
        bankCode
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
        urlGameLinks
        ownerId
        foundDate
        bankAccountNumber
        bankAccountCurrency
        bankCode
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

type TParams = {
  organizationSlug: string
}

const Organization: React.FC = () => {
  const history = useHistory()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { organizationSlug } = useParams<TParams>()
  const client = useApolloClient()
  const { user } = useAuth0()
  const { setOrganizationData } = useContext(OrganizationContext)

  const {
    data: { organizations: [orgData] } = { organizations: [] },
    loading: queryLoading,
    error: queryError,
  } = useQuery(GET_ORGANIZATION, {
    variables: { where: { urlSlug: organizationSlug } },
    skip: organizationSlug === 'new',
    onCompleted: data => {
      if (data?.organizations?.length > 0) {
        const { organizationId, urlSlug, name, nick } = data?.organizations?.[0]
        setOrganizationData({
          organizationId,
          urlSlug,
          name,
          nick,
        })
      } else {
        history.replace(NOT_FOUND)
      }
    },
  })

  const [
    createOrganization,
    { loading: mutationLoadingCreate, error: mutationErrorCreate },
  ] = useMutation(CREATE_ORGANIZATION, {
    onCompleted: data => {
      if (organizationSlug === 'new') {
        const newId = data?.createOrganizations?.organizations?.[0]?.urlSlug
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
      variables: {
        where: {
          organizationId: orgData?.organizationId,
        },
      },
      onCompleted: () => {
        history.push(ADMIN_ORGANIZATIONS)
      },
    })

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

        orgData?.organizationId
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
      setValue('logo', url, { shouldValidate: true, shouldDirty: true })

      const queryResult = client.readQuery({
        query: GET_ORGANIZATION,
        variables: {
          where: { urlSlug: orgData?.organizationSlug },
        },
      })

      client.writeQuery({
        query: GET_ORGANIZATION,
        data: {
          organizations: [
            {
              ...queryResult?.organizations?.[0],
              logo: url,
            },
          ],
        },
        variables: {
          where: { urlSlug: orgData?.organizationSlug },
        },
      })
      handleSubmit(onSubmit)()
    },
    [client, orgData]
  )

  return (
    <Container maxWidth={false} className={classes.container}>
      {queryLoading && <Loader />}

      <Error
        message={
          mutationErrorCreate?.message ||
          queryError?.message ||
          errorDelete?.message
        }
      />

      {(orgData || organizationSlug === 'new') && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
          <Helmet>
            <title>{orgData?.name || 'Organization'}</title>
          </Helmet>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4} lg={3}>
              <Paper className={classes.paper}>
                <Img
                  placeholder={placeholderOrganization}
                  src={orgData?.logo}
                  className={classes.logo}
                  alt={orgData?.name}
                />

                <RHFInput
                  style={{ display: 'none' }}
                  defaultValue={orgData?.logo}
                  control={control}
                  name="logo"
                  label="Logo URL"
                  disabled
                  fullWidth
                  variant="standard"
                  error={errors?.logo}
                />

                {isValidUuid(orgData?.organizationId) && (
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
                        loading={mutationLoadingCreate || mutationLoadingUpdate}
                      />
                    )}
                    {organizationSlug !== 'new' && (
                      <ButtonDelete
                        loading={loadingDelete}
                        onClick={() => {
                          deleteOrganization()
                        }}
                      />
                    )}
                  </div>
                </Toolbar>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={orgData?.name}
                      control={control}
                      name="name"
                      label="Name"
                      required
                      fullWidth
                      variant="standard"
                      error={errors?.name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={orgData?.legalName}
                      control={control}
                      name="legalName"
                      label="Legal name"
                      fullWidth
                      variant="standard"
                      error={errors?.legalName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={orgData?.nick}
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
                      defaultValue={orgData?.short}
                      control={control}
                      name="short"
                      label="Short"
                      fullWidth
                      variant="standard"
                      error={errors?.short}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={orgData?.urlSlug}
                      control={control}
                      name="urlSlug"
                      label="Url Slug"
                      required
                      fullWidth
                      variant="standard"
                      error={errors?.urlSlug}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={orgData?.status}
                      control={control}
                      name="status"
                      label="Status"
                      fullWidth
                      variant="standard"
                      error={errors?.status}
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
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={orgData?.urlGameLinks}
                      control={control}
                      name="urlGameLinks"
                      label="Url Game Links"
                      fullWidth
                      variant="standard"
                      error={errors?.urlGameLinks}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={orgData?.bankAccountNumber}
                      control={control}
                      name="bankAccountNumber"
                      label="Bank Account Number"
                      fullWidth
                      variant="standard"
                      error={errors?.bankAccountNumber}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={orgData?.bankCode}
                      control={control}
                      name="bankCode"
                      label="Bank Code"
                      fullWidth
                      variant="standard"
                      error={errors?.bankCode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={orgData?.bankAccountCurrency}
                      control={control}
                      name="bankAccountCurrency"
                      label="Bank Account Currency"
                      fullWidth
                      variant="standard"
                      error={errors?.bankAccountCurrency}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
          {isValidUuid(orgData?.organizationId) && (
            <Relations
              organizationId={orgData.organizationId}
              organization={orgData}
            />
          )}
        </form>
      )}
    </Container>
  )
}

export { Organization as default }
