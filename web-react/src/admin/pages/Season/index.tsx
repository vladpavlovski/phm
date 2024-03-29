import { Error } from 'components/Error'
import { timeUnitStatusList } from 'components/lists'
import { Loader } from 'components/Loader'
import { RHFDatepicker } from 'components/RHFDatepicker'
import { RHFInput } from 'components/RHFInput'
import { RHFSelect } from 'components/RHFSelect'
import { Title } from 'components/Title'
import { useSnackbar } from 'notistack'
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'
import { getAdminOrgSeasonRoute, getAdminOrgSeasonsRoute } from 'router/routes'
import { decomposeDate, isValidUuid } from 'utils'
import { gql, useMutation, useQuery } from '@apollo/client'
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

const GET_SEASON = gql`
  query getSeason($where: SeasonWhere) {
    seasons(where: $where) {
      seasonId
      name
      nick
      short
      startDate
      endDate
      status
      competitions {
        competitionId
        name
      }
      teams {
        teamId
        name
      }
      phases {
        phaseId
        name
        status
        startDate
        endDate
        competition {
          competitionId
          name
        }
      }
      groups {
        groupId
        name
        status
        competition {
          name
        }
      }
      venues {
        venueId
        name
        nick
        capacity
      }
      org {
        organizationId
        name
      }
    }
  }
`

const CREATE_SEASON = gql`
  mutation createSeason($input: [SeasonCreateInput!]!) {
    createSeasons(input: $input) {
      seasons {
        seasonId
      }
    }
  }
`

const UPDATE_SEASON = gql`
  mutation updateSeason($where: SeasonWhere, $update: SeasonUpdateInput) {
    updateSeasons(where: $where, update: $update) {
      seasons {
        seasonId
        name
        nick
        short
        startDate
        endDate
        status
        competitions {
          competitionId
          name
        }
        teams {
          teamId
          name
        }
        phases {
          phaseId
          name
          status
          startDate
          endDate
          competition {
            competitionId
            name
          }
        }
        groups {
          groupId
          name
          status
          competition {
            name
          }
        }
        venues {
          venueId
          name
          nick
          capacity
        }
        org {
          organizationId
          name
        }
      }
    }
  }
`

const DELETE_SEASON = gql`
  mutation deleteSeason($where: SeasonWhere) {
    deleteSeasons(where: $where) {
      nodesDeleted
    }
  }
`

type TSeasonParams = {
  seasonId: string
  organizationSlug: string
}

const Season: React.FC = () => {
  const history = useHistory()
  const { seasonId, organizationSlug } = useParams<TSeasonParams>()
  const { enqueueSnackbar } = useSnackbar()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_SEASON, {
    variables: { where: { seasonId } },
    skip: seasonId === 'new',
  })

  const [
    createSeason,
    { loading: mutationLoadingCreate, error: mutationErrorCreate },
  ] = useMutation(CREATE_SEASON, {
    onCompleted: data => {
      if (seasonId === 'new') {
        const newId = data?.createSeasons?.seasons?.[0]?.seasonId
        newId &&
          history.replace(getAdminOrgSeasonRoute(organizationSlug, newId))
      }
      enqueueSnackbar('Season saved!', { variant: 'success' })
    },
  })

  const [
    updateSeason,
    { loading: mutationLoadingUpdate, error: mutationErrorUpdate },
  ] = useMutation(UPDATE_SEASON, {
    update(cache, { data }) {
      try {
        cache.writeQuery({
          query: GET_SEASON,
          data: {
            seasons: data?.updateSeasons?.seasons,
          },
          variables: { where: { seasonId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      enqueueSnackbar('Season updated!', { variant: 'success' })
    },
  })

  const [deleteSeason, { loading: loadingDelete, error: errorDelete }] =
    useMutation(DELETE_SEASON, {
      variables: { where: { seasonId } },
      onCompleted: () => {
        history.push(getAdminOrgSeasonsRoute(organizationSlug))
        enqueueSnackbar('Season was deleted!')
      },
    })

  const seasonData = queryData && queryData?.seasons?.[0]

  const { handleSubmit, control, errors, formState } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = React.useCallback(
    dataToCheck => {
      try {
        const { startDate, endDate, ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          ...decomposeDate(startDate, 'startDate'),
          ...decomposeDate(endDate, 'endDate'),
          org: {
            ...(seasonId !== 'new' && {
              disconnect: {
                where: {
                  node: {},
                },
              },
            }),
            connect: {
              where: {
                node: { urlSlug: organizationSlug },
              },
            },
          },
        }

        seasonId === 'new'
          ? createSeason({
              variables: {
                input: dataToSubmit,
              },
            })
          : updateSeason({
              variables: {
                where: {
                  seasonId,
                },
                update: dataToSubmit,
              },
            })
      } catch (error) {
        console.error(error)
      }
    },
    [seasonId]
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
      {(seasonData || seasonId === 'new') && (
        <>
          <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
            <Helmet>
              <title>{seasonData?.name || 'Season'}</title>
            </Helmet>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
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
                      <Title>{'Season'}</Title>
                    </div>
                    <div>
                      {formState.isDirty && (
                        <ButtonSave
                          loading={
                            mutationLoadingCreate || mutationLoadingUpdate
                          }
                        />
                      )}
                      {seasonId !== 'new' && (
                        <ButtonDelete
                          loading={loadingDelete}
                          onClick={() => {
                            deleteSeason()
                          }}
                        />
                      )}
                    </div>
                  </Toolbar>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={seasonData?.name}
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
                        defaultValue={seasonData?.nick}
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
                        defaultValue={seasonData?.short}
                        control={control}
                        name="short"
                        label="Short"
                        fullWidth
                        variant="standard"
                        error={errors.short}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFSelect
                        fullWidth
                        required
                        control={control}
                        name="status"
                        label="Status"
                        defaultValue={seasonData?.status || ''}
                        error={errors.status}
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
                        required
                        control={control}
                        variant="standard"
                        name="startDate"
                        label="Start Date"
                        id="startDate"
                        openTo="year"
                        inputFormat={'DD/MM/YYYY'}
                        views={['year', 'month', 'day']}
                        defaultValue={seasonData?.startDate}
                        error={errors.startDate}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFDatepicker
                        fullWidth
                        required
                        control={control}
                        variant="standard"
                        name="endDate"
                        label="End Date"
                        id="endDate"
                        openTo="year"
                        inputFormat={'DD/MM/YYYY'}
                        views={['year', 'month', 'day']}
                        defaultValue={seasonData?.endDate}
                        error={errors.endDate}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </form>
          {isValidUuid(seasonId) && (
            <Relations
              seasonId={seasonId}
              season={seasonData}
              updateSeason={updateSeason}
            />
          )}
        </>
      )}
    </Container>
  )
}

export { Season as default }
