import React, { useCallback } from 'react'

import { useParams, useHistory } from 'react-router-dom'

import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { Helmet } from 'react-helmet'
import Img from 'react-cool-img'
import { yupResolver } from '@hookform/resolvers/yup'
import { v4 as uuidv4 } from 'uuid'
import { Container, Grid, Paper } from '@material-ui/core'

import Toolbar from '@material-ui/core/Toolbar'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'
import { Uploader } from '../../../components/Uploader'
import { RHFColorpicker } from '../../../components/RHFColorpicker'
import { RHFDatepicker } from '../../../components/RHFDatepicker'
import { RHFInput } from '../../../components/RHFInput'
import { dateExist, decomposeDate, isValidUuid } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { ADMIN_TEAMS, getAdminTeamRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'
import placeholderOrganization from '../../../img/placeholderOrganization.png'
import { Relations } from './relations'

const GET_TEAM = gql`
  query getTeam($teamId: ID!) {
    team: Team(teamId: $teamId) {
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
      foundDate {
        formatted
      }
      jerseys {
        jerseyId
        number
      }
      players {
        playerId
        firstName
        lastName
      }
    }
  }
`

const MERGE_TEAM = gql`
  mutation mergeTeam(
    $teamId: ID!
    $name: String
    $fullName: String
    $nick: String
    $short: String
    $status: String
    $externalId: String
    $logo: String
    $primaryColor: String
    $secondaryColor: String
    $tertiaryColor: String
    $foundDateDay: Int
    $foundDateMonth: Int
    $foundDateYear: Int
  ) {
    mergeTeam: MergeTeam(
      teamId: $teamId
      name: $name
      fullName: $fullName
      nick: $nick
      short: $short
      status: $status
      externalId: $externalId
      logo: $logo
      primaryColor: $primaryColor
      secondaryColor: $secondaryColor
      tertiaryColor: $tertiaryColor
      foundDate: {
        day: $foundDateDay
        month: $foundDateMonth
        year: $foundDateYear
      }
    ) {
      teamId
    }
  }
`

const DELETE_TEAM = gql`
  mutation deleteTeam($teamId: ID!) {
    deleteTeam: DeleteTeam(teamId: $teamId) {
      teamId
    }
  }
`

const Team = () => {
  const history = useHistory()
  const classes = useStyles()
  const { teamId } = useParams()
  const { enqueueSnackbar } = useSnackbar()
  const client = useApolloClient()
  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_TEAM, {
    fetchPolicy: 'network-only',
    variables: { teamId },
    skip: teamId === 'new',
  })

  const [
    mergeTeam,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(MERGE_TEAM, {
    onCompleted: data => {
      if (teamId === 'new') {
        const newId = data.mergeTeam.teamId
        history.replace(getAdminTeamRoute(newId))
      }
      enqueueSnackbar('Team saved!', { variant: 'success' })
    },
  })

  const [
    deleteTeam,
    { loading: loadingDelete, error: errorDelete },
  ] = useMutation(DELETE_TEAM, {
    onCompleted: () => {
      history.push(ADMIN_TEAMS)
      enqueueSnackbar('Team was deleted!')
    },
  })

  const teamData = queryData?.team[0] || {}

  const { handleSubmit, control, errors, formState, setValue } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { foundDate, ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          teamId: teamId === 'new' ? uuidv4() : teamId,
          ...decomposeDate(foundDate, 'foundDate'),
        }

        mergeTeam({
          variables: dataToSubmit,
        })
      } catch (error) {
        console.error(error)
      }
    },
    [teamId]
  )

  const updateLogo = useCallback(
    url => {
      setValue('logo', url, true)

      const queryResult = client.readQuery({
        query: GET_TEAM,
        variables: {
          teamId,
        },
      })

      client.writeQuery({
        query: GET_TEAM,
        data: {
          team: [
            {
              ...queryResult.team[0],
              logo: url,
            },
          ],
        },
        variables: {
          teamId,
        },
      })
      handleSubmit(onSubmit)()
    },
    [client, teamId]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationErrorMerge && !mutationLoadingMerge && (
        <Error message={mutationErrorMerge.message} />
      )}
      {(teamData || teamId === 'new') &&
        !queryLoading &&
        !queryError &&
        !mutationErrorMerge && (
          <>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={classes.form}
              noValidate
              autoComplete="off"
            >
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
                        folderName="teams"
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
                          <ButtonSave loading={mutationLoadingMerge} />
                        )}
                        {teamId !== 'new' && (
                          <ButtonDelete
                            loading={loadingDelete}
                            onClick={() => {
                              deleteTeam({ variables: { teamId } })
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
                        <RHFInput
                          defaultValue={teamData.status}
                          control={control}
                          name="status"
                          label="Status"
                          fullWidth
                          variant="standard"
                          error={errors.status}
                        />
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
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        logo
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFColorpicker
                          name="primaryColor"
                          label="Primary Color"
                          fullWidth
                          variant="standard"
                          control={control}
                          defaultValue={teamData.primaryColor}
                          error={errors.primaryColor}
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
                            teamData.foundDate &&
                            dateExist(teamData.foundDate.formatted)
                              ? teamData.foundDate.formatted
                              : null
                          }
                          error={errors.foundDate}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </form>
            {isValidUuid(teamId) && <Relations teamId={teamId} />}
          </>
        )}
    </Container>
  )
}

export { Team as default }
