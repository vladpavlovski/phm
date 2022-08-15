import { Error, Loader, RHFDatepicker, RHFInput, RHFSelect, Title, Uploader } from 'components'
import { activityStatusList } from 'components/lists'
import OrganizationContext from 'context/organization'
import placeholderOrganization from 'img/placeholderOrganization.png'
import { useSnackbar } from 'notistack'
import React, { useCallback, useContext } from 'react'
import Img from 'react-cool-img'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'
import { ADMIN_ORGANIZATIONS, getAdminOrganizationRoute, NOT_FOUND } from 'router/routes'
import { decomposeDate, isValidUuid } from 'utils'
import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client'
import { useAuth0 } from '@auth0/auth0-react'
import { yupResolver } from '@hookform/resolvers/yup'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import { ButtonDelete } from '../commonComponents/ButtonDelete'
import { ButtonSave } from '../commonComponents/ButtonSave'
import { Relations } from './relations'
import { schema } from './schema'

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
      sponsors {
        sponsorId
        name
        description
      }
      teams {
        teamId
        logo
        name
      }
      competitions {
        competitionId
        name
      }
      rulePacks {
        rulePackId
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
        sponsors {
          sponsorId
          name
          description
        }
        teams {
          teamId
          logo
          name
        }
        competitions {
          competitionId
          name
        }
        rulePacks {
          rulePackId
          name
        }
      }
    }
  }
`

const UPDATE_ORGANIZATION = gql`
  mutation updateOrganization(
    $where: OrganizationWhere
    $update: OrganizationUpdateInput
    $create: OrganizationRelationInput
  ) {
    updateOrganizations(where: $where, update: $update, create: $create) {
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
        sponsors {
          sponsorId
          name
          description
        }
        teams {
          teamId
          logo
          name
        }
        competitions {
          competitionId
          name
        }
        rulePacks {
          rulePackId
          name
        }
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
      update(cache, { data }) {
        try {
          cache.writeQuery({
            query: GET_ORGANIZATION,
            data: {
              organizations: data?.updateOrganizations?.organizations,
            },
            variables: { where: { urlSlug: organizationSlug } },
          })
        } catch (error) {
          console.error(error)
        }
      },
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
    <Container maxWidth={false}>
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
              <Paper sx={{ p: '16px' }}>
                <Img
                  placeholder={placeholderOrganization}
                  src={orgData?.logo}
                  style={{ width: '100%' }}
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
              <Paper sx={{ p: '16px' }}>
                <Toolbar
                  disableGutters
                  sx={{
                    p: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
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
                    <RHFSelect
                      fullWidth
                      control={control}
                      name="status"
                      label="Status"
                      defaultValue={orgData?.status || ''}
                      error={errors.status}
                    >
                      {activityStatusList
                        .filter(s => s.value !== 'RETIRED')
                        .map(s => {
                          return (
                            <MenuItem key={s.value} value={s.value}>
                              {s.name}
                            </MenuItem>
                          )
                        })}
                    </RHFSelect>
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
              updateOrganization={updateOrganization}
            />
          )}
        </form>
      )}
    </Container>
  )
}

export { Organization as default }
