import { Error } from 'components/Error'
import { activityStatusList } from 'components/lists'
import { Loader } from 'components/Loader'
import { RHFColorpicker } from 'components/RHFColorpicker'
import { RHFDatepicker } from 'components/RHFDatepicker'
import { RHFInput } from 'components/RHFInput'
import { RHFSelect } from 'components/RHFSelect'
import { Title } from 'components/Title'
import { Uploader } from 'components/Uploader'
import placeholderOrganization from 'img/placeholderOrganization.png'
import { useSnackbar } from 'notistack'
import React, { useCallback } from 'react'
import Img from 'react-cool-img'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'
import { getAdminOrgTeamRoute, getAdminOrgTeamsRoute } from 'router/routes'
import { decomposeDate, isValidUuid } from 'utils'
import { Team as TeamType } from 'utils/types'
import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client'
import { yupResolver } from '@hookform/resolvers/yup'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import { Container, Grid, Paper } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import { ButtonDelete } from '../commonComponents/ButtonDelete'
import { ButtonSave } from '../commonComponents/ButtonSave'
import { useStyles } from '../commonComponents/styled'
import { Relations } from './relations'
import { schema } from './schema'

export type TGetTeam = {
  teams: TeamType[]
}
export const GET_TEAM = gql`
  query getTeam($where: TeamWhere) {
    teams(where: $where) {
      teamId
      name
      fullName
      nick
      short
      status
      externalId
      logo
      primaryColor
      secondaryColor
      tertiaryColor
      foundDate
      jerseys {
        jerseyId
        name
        number
        player {
          firstName
          lastName
          name
        }
      }
      players {
        playerId
        firstName
        lastName
        name
        avatar
        activityStatus
        levelCode
        positions {
          positionId
          name
        }
        jerseys {
          jerseyId
          name
          number
        }
      }
      positions {
        positionId
        name
        short
        description
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
        description
      }
      sponsors {
        sponsorId
        name
        description
      }
    }
  }
`

const CREATE_TEAM = gql`
  mutation createTeam($input: [TeamCreateInput!]!) {
    createTeams(input: $input) {
      teams {
        teamId
      }
    }
  }
`

const UPDATE_TEAM = gql`
  mutation updateTeam(
    $where: TeamWhere
    $update: TeamUpdateInput
    $create: TeamRelationInput
  ) {
    updateTeams(where: $where, update: $update, create: $create) {
      teams {
        teamId
        name
        fullName
        nick
        short
        status
        externalId
        logo
        primaryColor
        secondaryColor
        tertiaryColor
        foundDate
        jerseys {
          jerseyId
          number
        }
        players {
          playerId
          firstName
          lastName
          name
          avatar
          activityStatus
          levelCode
          positions {
            positionId
            name
          }
          jerseys {
            jerseyId
            name
            number
          }
        }
        positions {
          positionId
          name
          short
          description
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
          description
        }
        sponsors {
          sponsorId
          name
          description
        }
      }
    }
  }
`

const DELETE_TEAM = gql`
  mutation deleteTeam($where: TeamWhere) {
    deleteTeams(where: $where) {
      nodesDeleted
    }
  }
`

type TTeamParams = {
  teamId: string
  organizationSlug: string
}

const Team: React.FC = () => {
  const history = useHistory()
  const classes = useStyles()
  const { teamId, organizationSlug } = useParams<TTeamParams>()
  const { enqueueSnackbar } = useSnackbar()
  const client = useApolloClient()
  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_TEAM, {
    fetchPolicy: 'network-only',
    variables: { where: { teamId } },
    skip: teamId === 'new',
  })

  const [
    createTeam,
    { loading: mutationLoadingCreate, error: mutationErrorCreate },
  ] = useMutation(CREATE_TEAM, {
    onCompleted: data => {
      if (teamId === 'new') {
        const newId = data?.createTeams?.teams?.[0]?.teamId
        newId && history.replace(getAdminOrgTeamRoute(organizationSlug, newId))
      }
      enqueueSnackbar('Team saved!', { variant: 'success' })
    },
  })

  const [
    updateTeam,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(UPDATE_TEAM, {
    update(cache, { data }) {
      try {
        cache.writeQuery({
          query: GET_TEAM,
          data: {
            teams: data?.updateTeams?.teams,
          },
          variables: { where: { teamId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      enqueueSnackbar('Team updated!', { variant: 'success' })
    },
  })

  const [deleteTeam, { loading: loadingDelete, error: errorDelete }] =
    useMutation(DELETE_TEAM, {
      variables: { where: { teamId } },
      onCompleted: () => {
        history.push(getAdminOrgTeamsRoute(organizationSlug))
        enqueueSnackbar('Team was deleted!')
      },
    })

  const teamData = queryData?.teams[0] || {}

  const { handleSubmit, control, errors, formState, setValue } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { foundDate, ...rest } = dataToCheck
        const dataToSubmit = {
          ...rest,
          ...decomposeDate(foundDate, 'foundDate'),
        }

        teamId === 'new'
          ? createTeam({
              variables: {
                input: dataToSubmit,
              },
            })
          : updateTeam({
              variables: {
                where: {
                  teamId: teamId,
                },
                update: dataToSubmit,
              },
            })
      } catch (error) {
        console.error(error)
      }
    },
    [teamId]
  )

  const updateLogo = useCallback(
    url => {
      setValue('logo', url)

      const queryResult = client.readQuery({
        query: GET_TEAM,
        variables: {
          where: { teamId },
        },
      })

      client.writeQuery({
        query: GET_TEAM,
        data: {
          teams: [
            {
              ...queryResult.teams[0],
              logo: url,
            },
          ],
        },
        variables: {
          where: { teamId },
        },
      })
      handleSubmit(onSubmit)()
    },
    [client, teamId]
  )

  return (
    <Container maxWidth="lg">
      {queryLoading && <Loader />}
      <Error
        message={
          mutationErrorMerge?.message ||
          mutationErrorCreate?.message ||
          errorDelete?.message ||
          queryError?.message
        }
      />
      {(teamData || teamId === 'new') && !queryLoading && (
        <>
          <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
            <Helmet>
              <title>{teamData.name || 'Team'}</title>
            </Helmet>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4} lg={3}>
                <Paper className={classes.paper}>
                  <Img
                    placeholder={placeholderOrganization}
                    src={teamData.logo}
                    className={classes.logo}
                    alt={teamData.name}
                  />

                  <RHFInput
                    style={{ display: 'none' }}
                    defaultValue={teamData.logo}
                    control={control}
                    name="logo"
                    label="Logo URL"
                    disabled
                    fullWidth
                    variant="standard"
                    error={errors.logo}
                  />

                  {isValidUuid(teamId) && (
                    <Uploader
                      buttonText={'Change logo'}
                      onSubmit={updateLogo}
                      folderName="images/teams"
                    />
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={12} lg={9}>
                <Paper className={classes.paper}>
                  <Toolbar disableGutters className={classes.toolbarForm}>
                    <div>
                      <Title>{'Team'}</Title>
                    </div>
                    <div>
                      {formState.isDirty && (
                        <ButtonSave
                          loading={
                            mutationLoadingMerge || mutationLoadingCreate
                          }
                        />
                      )}
                      {teamId !== 'new' && (
                        <ButtonDelete
                          loading={loadingDelete}
                          onClick={() => {
                            deleteTeam()
                          }}
                        />
                      )}
                    </div>
                  </Toolbar>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={teamData.name}
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
                        defaultValue={teamData.fullName}
                        control={control}
                        name="fullName"
                        label="Full name"
                        fullWidth
                        variant="standard"
                        error={errors.fullName}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={teamData.nick}
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
                        defaultValue={teamData.short}
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
                        control={control}
                        name="status"
                        label="Status"
                        defaultValue={teamData?.status || ''}
                        error={errors.status}
                      >
                        {activityStatusList.map(s => {
                          return (
                            <MenuItem key={s.value} value={s.value}>
                              {s.name}
                            </MenuItem>
                          )
                        })}
                      </RHFSelect>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={teamData.externalId}
                        control={control}
                        name="externalId"
                        label="External Id"
                        fullWidth
                        variant="standard"
                        error={errors.externalId}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={teamData.logo}
                        control={control}
                        name="logo"
                        label="Logo URL"
                        fullWidth
                        variant="standard"
                        error={errors.logo}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}></Grid>
                    <Grid item>
                      <RHFColorpicker
                        name="primaryColor"
                        label="Primary Color"
                        fullWidth
                        variant="standard"
                        control={control}
                        defaultValue={teamData.primaryColor}
                        error={errors.primaryColor}
                        iconEnd={<AccountBoxIcon />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFColorpicker
                        name="secondaryColor"
                        label="Secondary Color"
                        fullWidth
                        variant="standard"
                        control={control}
                        defaultValue={teamData.secondaryColor}
                        error={errors.secondaryColor}
                        iconEnd={<AccountBoxIcon />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFColorpicker
                        name="tertiaryColor"
                        label="Tertiary Color"
                        fullWidth
                        variant="standard"
                        control={control}
                        defaultValue={teamData.tertiaryColor}
                        error={errors.tertiaryColor}
                        iconEnd={<AccountBoxIcon />}
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
                        defaultValue={teamData?.foundDate}
                        error={errors?.foundDate}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </form>
          {isValidUuid(teamId) && (
            <Relations
              teamId={teamId}
              team={teamData}
              updateTeam={updateTeam}
            />
          )}
        </>
      )}
    </Container>
  )
}

export { Team as default }
