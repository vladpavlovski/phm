import { Error } from 'components/Error'
import { timeUnitStatusList } from 'components/lists'
import { Loader } from 'components/Loader'
import { RHFDatepicker } from 'components/RHFDatepicker'
import { RHFInput } from 'components/RHFInput'
import { RHFSelect } from 'components/RHFSelect'
import { Title } from 'components/Title'
import { Uploader } from 'components/Uploader'
import placeholderOrganization from 'img/placeholderOrganization.png'
import { useSnackbar } from 'notistack'
import React from 'react'
import Img from 'react-cool-img'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'
import { getAdminOrgCompetitionRoute, getAdminOrgCompetitionsRoute } from 'router/routes'
import { decomposeDate, isValidUuid } from 'utils'
import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client'
import { yupResolver } from '@hookform/resolvers/yup'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import OrganizationContext from '../../../context/organization'
import { ButtonDelete } from '../commonComponents/ButtonDelete'
import { ButtonSave } from '../commonComponents/ButtonSave'
import { Relations } from './relations'
import { schema } from './schema'

export const GET_COMPETITION = gql`
  query getCompetition($where: CompetitionWhere) {
    competitions(where: $where) {
      competitionId
      name
      nick
      short
      status
      logo
      organizationId
      foundDate
      org {
        organizationId
        name
      }
      venues {
        venueId
        name
      }
      sponsors {
        sponsorId
        name
      }
      groups {
        groupId
        name
        nick
        short
        status
        teamsLimit
        season {
          seasonId
          name
        }
      }
      phases {
        phaseId
        name
        nick
        short
        status
        startDate
        endDate
        season {
          seasonId
          name
        }
      }
      seasons {
        seasonId
        name
      }
    }
  }
`

const CREATE_COMPETITION = gql`
  mutation createCompetition($input: [CompetitionCreateInput!]!) {
    createCompetitions(input: $input) {
      competitions {
        competitionId
        name
        nick
        short
        status
        logo
        organizationId
        foundDate
        org {
          organizationId
          name
        }
        venues {
          venueId
          name
        }
        sponsors {
          sponsorId
          name
        }
        groups {
          groupId
          name
          nick
          short
          status
          teamsLimit
          season {
            seasonId
            name
          }
        }
        phases {
          phaseId
          name
          nick
          short
          status
          startDate
          endDate
          season {
            seasonId
            name
          }
        }
        seasons {
          seasonId
          name
        }
      }
    }
  }
`

const UPDATE_COMPETITION = gql`
  mutation updateCompetition(
    $where: CompetitionWhere
    $update: CompetitionUpdateInput
  ) {
    updateCompetitions(where: $where, update: $update) {
      competitions {
        competitionId
        name
        nick
        short
        status
        logo
        organizationId
        foundDate
        org {
          organizationId
          name
        }
        venues {
          venueId
          name
        }
        sponsors {
          sponsorId
          name
        }
        groups {
          groupId
          name
          nick
          short
          status
          teamsLimit
          season {
            seasonId
            name
          }
        }
        phases {
          phaseId
          name
          nick
          short
          status
          startDate
          endDate
          season {
            seasonId
            name
          }
        }
        seasons {
          seasonId
          name
        }
      }
    }
  }
`

const DELETE_COMPETITION = gql`
  mutation deleteCompetition($where: CompetitionWhere) {
    deleteCompetitions(where: $where) {
      nodesDeleted
    }
  }
`

type TParams = {
  competitionId: string
  organizationSlug: string
}

const Competition: React.FC = () => {
  const history = useHistory()
  const { enqueueSnackbar } = useSnackbar()
  const { competitionId, organizationSlug } = useParams<TParams>()
  const client = useApolloClient()
  const { organizationData } = React.useContext(OrganizationContext)
  const {
    loading: queryLoading,
    data: { competitions: [competitionData] } = { competitions: [] },
    error: queryError,
  } = useQuery(GET_COMPETITION, {
    fetchPolicy: 'network-only',
    variables: { where: { competitionId } },
    skip: competitionId === 'new',
  })

  const [
    createCompetition,
    { loading: mutationLoadingCreate, error: mutationErrorCreate },
  ] = useMutation(CREATE_COMPETITION, {
    onCompleted: data => {
      if (competitionId === 'new') {
        const newId = data?.createCompetitions?.competitions?.[0]?.competitionId
        newId &&
          history.replace(getAdminOrgCompetitionRoute(organizationSlug, newId))
      }
      enqueueSnackbar('Competition saved!', { variant: 'success' })
    },
  })

  const [
    updateCompetition,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(UPDATE_COMPETITION, {
    update(cache, { data }) {
      try {
        cache.writeQuery({
          query: GET_COMPETITION,
          data: {
            competitions: data?.updateCompetitions?.competitions,
          },
          variables: { where: { competitionId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      enqueueSnackbar('Competition updated!', { variant: 'success' })
    },
  })

  const [deleteCompetition, { loading: loadingDelete, error: errorDelete }] =
    useMutation(DELETE_COMPETITION, {
      variables: { where: { competitionId } },
      onCompleted: () => {
        history.push(getAdminOrgCompetitionsRoute(organizationSlug))
        enqueueSnackbar('Competition was deleted!')
      },
    })

  const { handleSubmit, control, errors, formState, setValue } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = React.useCallback(
    dataToCheck => {
      try {
        const { foundDate, ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          organizationId:
            competitionData?.organizationId || organizationData?.organizationId,
          ...decomposeDate(foundDate, 'foundDate'),
        }

        competitionId === 'new'
          ? createCompetition({
              variables: {
                input: {
                  ...dataToSubmit,
                  org: {
                    connect: {
                      where: {
                        node: {
                          organizationId:
                            competitionData?.organizationId ||
                            organizationData?.organizationId,
                        },
                      },
                    },
                  },
                },
              },
            })
          : updateCompetition({
              variables: {
                where: {
                  competitionId,
                },
                update: dataToSubmit,
              },
            })
      } catch (error) {
        console.error(error)
      }
    },
    [competitionId, organizationData, competitionData]
  )

  const updateLogo = React.useCallback(
    url => {
      setValue('logo', url, { shouldValidate: true, shouldDirty: true })

      const queryResult = client.readQuery({
        query: GET_COMPETITION,
        variables: {
          where: { competitionId },
        },
      })

      client.writeQuery({
        query: GET_COMPETITION,
        data: {
          competition: [
            {
              ...queryResult?.competitions?.[0],
              logo: url,
            },
          ],
        },
        variables: {
          where: { competitionId },
        },
      })
      handleSubmit(onSubmit)()
    },
    [client, competitionId]
  )

  return (
    <Container maxWidth="lg">
      {queryLoading && <Loader />}
      <Error
        message={
          queryError?.message ||
          errorDelete?.message ||
          mutationErrorMerge?.message ||
          mutationErrorCreate?.message
        }
      />

      {(competitionData || competitionId === 'new') && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
          <Helmet>
            <title>{competitionData?.name || 'Competition'}</title>
          </Helmet>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4} lg={3}>
              <Paper sx={{ p: '16px' }}>
                <Img
                  placeholder={placeholderOrganization}
                  src={competitionData?.logo}
                  style={{ width: '100%' }}
                  alt={competitionData?.name}
                />

                <RHFInput
                  style={{ display: 'none' }}
                  defaultValue={competitionData?.logo}
                  control={control}
                  name="logo"
                  label="Logo URL"
                  disabled
                  fullWidth
                  variant="standard"
                  error={errors?.logo}
                />

                {isValidUuid(competitionId) && (
                  <Uploader
                    buttonText={'Change logo'}
                    onSubmit={updateLogo}
                    folderName="images/competitions"
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
                    <Title>{'Competition'}</Title>
                  </div>
                  <div>
                    {formState.isDirty && (
                      <ButtonSave
                        loading={mutationLoadingCreate || mutationLoadingMerge}
                      />
                    )}
                    {competitionId !== 'new' && (
                      <ButtonDelete
                        loading={loadingDelete}
                        onClick={() => {
                          deleteCompetition({
                            variables: { where: { competitionId } },
                          })
                        }}
                      />
                    )}
                  </div>
                </Toolbar>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={competitionData?.name}
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
                      defaultValue={competitionData?.nick}
                      control={control}
                      name="nick"
                      label="Nick"
                      fullWidth
                      variant="standard"
                      error={errors?.nick}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={competitionData?.short}
                      control={control}
                      name="short"
                      label="Short"
                      fullWidth
                      variant="standard"
                      error={errors?.short}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFSelect
                      fullWidth
                      control={control}
                      name="status"
                      label="Status"
                      defaultValue={competitionData?.status || ''}
                      error={errors?.status}
                    >
                      {timeUnitStatusList.map(s => {
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
                      defaultValue={competitionData?.foundDate}
                      error={errors?.foundDate}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
          {isValidUuid(competitionId) && (
            <Relations
              competitionId={competitionId}
              competition={competitionData}
              updateCompetition={updateCompetition}
            />
          )}
        </form>
      )}
    </Container>
  )
}

export { Competition as default }
