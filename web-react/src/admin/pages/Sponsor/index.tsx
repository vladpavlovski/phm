import { Error, Loader, RHFInput, Title, Uploader } from 'components'
import OrganizationContext from 'context/organization'
import placeholderOrganization from 'img/placeholderOrganization.png'
import { useSnackbar } from 'notistack'
import React from 'react'
import Img from 'react-cool-img'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'
import { getAdminOrgSponsorRoute, getAdminOrgSponsorsRoute } from 'router/routes'
import { isValidUuid } from 'utils'
import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client'
import { yupResolver } from '@hookform/resolvers/yup'
import { Container, Grid, Paper } from '@mui/material'
import Toolbar from '@mui/material/Toolbar'
import { ButtonDelete } from '../commonComponents/ButtonDelete'
import { ButtonSave } from '../commonComponents/ButtonSave'
import { Relations } from './relations'
import { schema } from './schema'

const GET_SPONSOR = gql`
  query getSponsor($where: SponsorWhere) {
    sponsors(where: $where) {
      sponsorId
      name
      legalName
      nick
      short
      claim
      web
      description
      logo
      teams {
        teamId
        name
      }
      players {
        playerId
        firstName
        lastName
        name
        teams {
          teamId
          name
        }
        positions {
          name
        }
      }
      awards {
        awardId
        name
        description
      }
      competitions {
        competitionId
        name
        nick
      }
      phases {
        phaseId
        name
        nick
        status
        startDate
        endDate
        competition {
          name
        }
      }
      groups {
        groupId
        name
        nick
        competition {
          name
        }
      }
    }
  }
`

const CREATE_SPONSOR = gql`
  mutation createSponsor($input: [SponsorCreateInput!]!) {
    createSponsors(input: $input) {
      sponsors {
        sponsorId
      }
    }
  }
`

const UPDATE_SPONSOR = gql`
  mutation updateSponsor(
    $where: SponsorWhere
    $update: SponsorUpdateInput
    $create: SponsorRelationInput
  ) {
    updateSponsors(where: $where, update: $update, create: $create) {
      sponsors {
        sponsorId
        name
        legalName
        nick
        short
        claim
        web
        description
        logo
        teams {
          teamId
          name
        }
        players {
          playerId
          firstName
          lastName
          name
          teams {
            teamId
            name
          }
          positions {
            name
          }
        }
        awards {
          awardId
          name
          description
        }
        competitions {
          competitionId
          name
          nick
        }
        phases {
          phaseId
          name
          nick
          status
          startDate
          endDate
          competition {
            name
          }
        }
        groups {
          groupId
          name
          nick
          competition {
            name
          }
        }
      }
    }
  }
`

const DELETE_SPONSOR = gql`
  mutation deleteSponsor($where: SponsorWhere) {
    deleteSponsors(where: $where) {
      nodesDeleted
    }
  }
`

type TParams = {
  sponsorId: string
  organizationSlug: string
}

const Sponsor: React.FC = () => {
  const history = useHistory()
  const { sponsorId, organizationSlug } = useParams<TParams>()
  const { organizationData } = React.useContext(OrganizationContext)
  const { enqueueSnackbar } = useSnackbar()
  const client = useApolloClient()
  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_SPONSOR, {
    fetchPolicy: 'network-only',
    variables: { where: { sponsorId } },
    skip: sponsorId === 'new',
  })

  const sponsorData = queryData?.sponsors?.[0]

  const [
    createSponsor,
    { loading: mutationLoadingCreate, error: mutationErrorCreate },
  ] = useMutation(CREATE_SPONSOR, {
    onCompleted: data => {
      if (sponsorId === 'new') {
        const newId = data?.createSponsors?.sponsors?.[0]?.sponsorId
        newId &&
          history.replace(getAdminOrgSponsorRoute(organizationSlug, newId))
      }
      enqueueSnackbar('Sponsor saved!', { variant: 'success' })
    },
  })

  const [
    updateSponsor,
    { loading: mutationLoadingUpdate, error: mutationErrorUpdate },
  ] = useMutation(UPDATE_SPONSOR, {
    update(cache, { data }) {
      try {
        cache.writeQuery({
          query: GET_SPONSOR,
          data: {
            sponsors: data?.updateSponsors?.sponsors,
          },
          variables: { where: { sponsorId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      enqueueSnackbar('Sponsor updated!', { variant: 'success' })
    },
  })

  const [deleteSponsor, { loading: loadingDelete, error: errorDelete }] =
    useMutation(DELETE_SPONSOR, {
      variables: { where: { sponsorId } },
      onCompleted: () => {
        history.push(getAdminOrgSponsorsRoute(organizationSlug))
        enqueueSnackbar('Sponsor was deleted!')
      },
    })

  const { handleSubmit, control, errors, formState, setValue } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = React.useCallback(
    dataToCheck => {
      try {
        const dataToSubmit = {
          ...dataToCheck,
          orgs: {
            connect: {
              where: {
                node: { organizationId: organizationData?.organizationId },
              },
            },
          },
        }

        sponsorId === 'new'
          ? createSponsor({
              variables: {
                input: dataToSubmit,
              },
            })
          : updateSponsor({
              variables: {
                where: {
                  sponsorId,
                },
                update: dataToSubmit,
              },
            })
      } catch (error) {
        console.error(error)
      }
    },
    [sponsorId, organizationData]
  )

  const updateLogo = React.useCallback(
    url => {
      setValue('logo', url, { shouldValidate: true, shouldDirty: true })

      const queryResult = client.readQuery({
        query: GET_SPONSOR,
        variables: {
          sponsorId,
        },
      })

      client.writeQuery({
        query: GET_SPONSOR,
        data: {
          sponsor: [
            {
              ...queryResult.sponsor[0],
              logo: url,
            },
          ],
        },
        variables: {
          sponsorId,
        },
      })
      handleSubmit(onSubmit)()
    },
    [client, sponsorId]
  )

  return (
    <Container maxWidth={false}>
      {queryLoading && <Loader />}
      <Error
        message={
          mutationErrorCreate?.message ||
          mutationErrorUpdate?.message ||
          queryError?.message ||
          errorDelete?.message
        }
      />

      {(sponsorData || sponsorId === 'new') && (
        <>
          <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
            <Helmet>
              <title>{sponsorData.name || 'Sponsor'}</title>
            </Helmet>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4} lg={3}>
                <Paper sx={{ p: '16px' }}>
                  <Img
                    placeholder={placeholderOrganization}
                    src={sponsorData.logo}
                    style={{ width: '100%' }}
                    alt={sponsorData.name}
                  />

                  <RHFInput
                    style={{ display: 'none' }}
                    defaultValue={sponsorData.logo}
                    control={control}
                    name="logo"
                    label="Logo URL"
                    disabled
                    fullWidth
                    variant="standard"
                    error={errors.logo}
                  />

                  {isValidUuid(sponsorId) && (
                    <Uploader
                      buttonText={'Change logo'}
                      onSubmit={updateLogo}
                      folderName="images/sponsors"
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
                      <Title>{'Sponsor'}</Title>
                    </div>
                    <div>
                      {formState.isDirty && (
                        <ButtonSave
                          loading={
                            mutationLoadingUpdate || mutationLoadingCreate
                          }
                        />
                      )}
                      {sponsorId !== 'new' && (
                        <ButtonDelete
                          loading={loadingDelete}
                          onClick={() => {
                            deleteSponsor({
                              variables: { where: { sponsorId } },
                            })
                          }}
                        />
                      )}
                    </div>
                  </Toolbar>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={sponsorData?.name}
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
                        defaultValue={sponsorData?.legalName}
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
                        defaultValue={sponsorData?.nick}
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
                        defaultValue={sponsorData?.short}
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
                        defaultValue={sponsorData?.claim}
                        control={control}
                        name="claim"
                        label="Claim"
                        fullWidth
                        variant="standard"
                        error={errors.claim}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={sponsorData?.web}
                        control={control}
                        name="web"
                        label="Web"
                        fullWidth
                        variant="standard"
                        error={errors.web}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={sponsorData?.description}
                        control={control}
                        name="description"
                        label="Description"
                        fullWidth
                        variant="standard"
                        error={errors.description}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </form>
          {isValidUuid(sponsorId) && (
            <Relations
              sponsorId={sponsorId}
              sponsor={sponsorData}
              updateSponsor={updateSponsor}
            />
          )}
        </>
      )}
    </Container>
  )
}

export { Sponsor as default }
