import React from 'react'

import { useParams, useHistory } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet'
import Img from 'react-cool-img'
import { yupResolver } from '@hookform/resolvers/yup'

import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import MenuItem from '@mui/material/MenuItem'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'
import { Uploader } from 'components/Uploader'
import { RHFDatepicker } from 'components/RHFDatepicker'
import { RHFInput } from 'components/RHFInput'
import { RHFSelect } from 'components/RHFSelect'
import { decomposeDate, isValidUuid } from 'utils'
import { Title } from 'components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'
import { timeUnitStatusList } from 'components/lists'
import OrganizationContext from '../../../context/organization'
import {
  getAdminOrgCompetitionsRoute,
  getAdminOrgCompetitionRoute,
} from 'router/routes'
import { Loader } from 'components/Loader'
import { Error } from 'components/Error'
import placeholderOrganization from 'img/placeholderOrganization.png'
import { Relations } from './relations'

const GET_COMPETITION = gql`
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
    }
  }
`

const CREATE_COMPETITION = gql`
  mutation createCompetition($input: [CompetitionCreateInput!]!) {
    createCompetitions(input: $input) {
      competitions {
        competitionId
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

const Competition = () => {
  const history = useHistory()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { competitionId, organizationSlug } = useParams()
  const client = useApolloClient()
  const { organizationData } = React.useContext(OrganizationContext)
  const {
    loading: queryLoading,
    data: queryData,
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

  const competitionData = queryData?.competitions?.[0] || {}

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
      setValue('logo', url, true)

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
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationErrorMerge ||
        (mutationErrorCreate && (
          <Error
            message={mutationErrorMerge.message || mutationErrorCreate.message}
          />
        ))}
      {(competitionData || competitionId === 'new') &&
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
              <title>{competitionData.name || 'Competition'}</title>
            </Helmet>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4} lg={3}>
                <Paper className={classes.paper}>
                  <Img
                    placeholder={placeholderOrganization}
                    src={competitionData.logo}
                    className={classes.logo}
                    alt={competitionData.name}
                  />

                  <RHFInput
                    style={{ display: 'none' }}
                    defaultValue={competitionData.logo}
                    control={control}
                    name="logo"
                    label="Logo URL"
                    disabled
                    fullWidth
                    variant="standard"
                    error={errors.logo}
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
                <Paper className={classes.paper}>
                  <Toolbar disableGutters className={classes.toolbarForm}>
                    <div>
                      <Title>{'Competition'}</Title>
                    </div>
                    <div>
                      {formState.isDirty && (
                        <ButtonSave
                          loading={
                            mutationLoadingCreate || mutationLoadingMerge
                          }
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
                        error={errors.name}
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
                        error={errors.nick}
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
                        error={errors.short}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFSelect
                        fullWidth
                        control={control}
                        name="status"
                        label="Status"
                        defaultValue={competitionData?.status || ''}
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
                        error={errors.foundDate}
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
