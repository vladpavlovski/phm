import React from 'react'

import { useParams, useHistory } from 'react-router-dom'

import { gql, useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { Helmet } from 'react-helmet-async'

import { yupResolver } from '@hookform/resolvers/yup'

import { Container, Grid, Paper, Toolbar } from '@mui/material'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'
import { useStyles } from '../commonComponents/styled'
import { RHFDatepicker, RHFInput, Title, Loader, Error } from 'components'
import { schema } from './schema'

import { getAdminOrgAwardsRoute, getAdminOrgAwardRoute } from 'router/routes'
import OrganizationContext from '../../../context/organization'
import { isValidUuid, decomposeDate } from 'utils'

import { Relations } from './relations'

const GET_AWARD = gql`
  query getAward($where: AwardWhere) {
    awards(where: $where) {
      awardId
      name
      nick
      short
      description
      type
      foundDate
      competitions {
        competitionId
        name
      }
      seasons {
        seasonId
        name
      }
      phases {
        phaseId
        name
        competition {
          name
        }
      }
      groups {
        groupId
        name
        competition {
          name
        }
      }
      teams {
        teamId
        name
        status
      }
    }
  }
`

const CREATE_AWARD = gql`
  mutation createAward($input: [AwardCreateInput!]!) {
    createAwards(input: $input) {
      awards {
        awardId
      }
    }
  }
`

export const UPDATE_AWARD = gql`
  mutation updateAward($where: AwardWhere, $update: AwardUpdateInput) {
    updateAwards(where: $where, update: $update) {
      awards {
        awardId
        name
        nick
        short
        description
        type
        foundDate
        competitions {
          competitionId
          name
        }
        seasons {
          seasonId
          name
        }
        phases {
          phaseId
          name
          competition {
            name
          }
        }
        groups {
          groupId
          name
          competition {
            name
          }
        }
        teams {
          teamId
          name
          status
        }
      }
    }
  }
`

const DELETE_AWARD = gql`
  mutation deleteAward($where: AwardWhere) {
    deleteAwards(where: $where) {
      nodesDeleted
    }
  }
`

type TParams = {
  awardId: string
  organizationSlug: string
}

const Award: React.FC = () => {
  const history = useHistory()
  const classes = useStyles()
  const { awardId, organizationSlug } = useParams<TParams>()
  const { organizationData } = React.useContext(OrganizationContext)
  const { enqueueSnackbar } = useSnackbar()

  const {
    loading: queryLoading,
    data: { awards: [awardData] } = { awards: [] },
    error: queryError,
  } = useQuery(GET_AWARD, {
    variables: { where: { awardId } },
    skip: awardId === 'new',
  })

  const [
    createAward,
    { loading: mutationLoadingCreate, error: mutationErrorCreate },
  ] = useMutation(CREATE_AWARD, {
    onCompleted: data => {
      if (awardId === 'new') {
        const newId = data?.createAwards?.awards?.[0]?.awardId
        newId && history.replace(getAdminOrgAwardRoute(organizationSlug, newId))
      }
      enqueueSnackbar('Award saved!', { variant: 'success' })
    },
    onError: error => {
      enqueueSnackbar(`Error: ${error}`, {
        variant: 'error',
      })
    },
  })

  const [
    updateAward,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(UPDATE_AWARD, {
    update(cache, { data }) {
      try {
        cache.writeQuery({
          query: GET_AWARD,
          data: {
            awards: data?.updateAwards?.awards,
          },
          variables: { where: { awardId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      enqueueSnackbar('Award updated!', { variant: 'success' })
    },
    onError: error => {
      enqueueSnackbar(`Error: ${error}`, {
        variant: 'error',
      })
    },
  })

  const [deleteAward, { loading: loadingDelete, error: errorDelete }] =
    useMutation(DELETE_AWARD, {
      variables: { where: { awardId } },
      onCompleted: () => {
        history.push(getAdminOrgAwardsRoute(organizationSlug))
        enqueueSnackbar('Award was deleted!')
      },
      onError: error => {
        enqueueSnackbar(`Error: ${error}`, {
          variant: 'error',
        })
      },
    })

  const { handleSubmit, control, errors, formState } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = React.useCallback(
    dataToCheck => {
      try {
        const { foundDate, ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          ...decomposeDate(foundDate, 'foundDate'),
          orgs: {
            connect: {
              where: {
                node: { organizationId: organizationData?.organizationId },
              },
            },
          },
        }

        awardId === 'new'
          ? createAward({
              variables: {
                input: dataToSubmit,
              },
            })
          : updateAward({
              variables: {
                where: {
                  awardId,
                },
                update: dataToSubmit,
              },
            })
      } catch (error) {
        console.error(error)
      }
    },
    [awardId, organizationData]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && <Loader />}
      <Error
        message={
          mutationErrorMerge?.message ||
          mutationErrorCreate?.message ||
          queryError?.message ||
          errorDelete?.message
        }
      />

      {(awardData || awardId === 'new') && (
        <>
          <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
            <Helmet>
              <title>{awardData?.name || 'Award'}</title>
            </Helmet>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <Paper className={classes.paper}>
                  <Toolbar disableGutters className={classes.toolbarForm}>
                    <div>
                      <Title>{'Award'}</Title>
                    </div>
                    <div>
                      {formState.isDirty && (
                        <ButtonSave
                          loading={
                            mutationLoadingMerge || mutationLoadingCreate
                          }
                        />
                      )}
                      {awardId !== 'new' && (
                        <ButtonDelete
                          loading={loadingDelete}
                          onClick={deleteAward}
                        />
                      )}
                    </div>
                  </Toolbar>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={awardData?.name}
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
                        defaultValue={awardData?.nick}
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
                        defaultValue={awardData?.short}
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
                        defaultValue={awardData?.description}
                        control={control}
                        name="description"
                        label="Description"
                        fullWidth
                        variant="standard"
                        error={errors.description}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                      <RHFInput
                        defaultValue={awardData?.type}
                        control={control}
                        name="type"
                        label="Type"
                        fullWidth
                        variant="standard"
                        error={errors.type}
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
                        inputFormat={'DD/MM/YYYY'}
                        views={['year', 'month', 'day']}
                        defaultValue={awardData?.foundDate}
                        error={errors.foundDate}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </form>
          {isValidUuid(awardId) && (
            <Relations
              awardId={awardId}
              award={awardData}
              updateAward={updateAward}
            />
          )}
        </>
      )}
    </Container>
  )
}

export { Award as default }
