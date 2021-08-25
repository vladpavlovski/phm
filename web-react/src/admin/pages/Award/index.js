import React from 'react'

import { useParams, useHistory } from 'react-router-dom'

import { gql, useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { Helmet } from 'react-helmet'

import { yupResolver } from '@hookform/resolvers/yup'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Toolbar from '@material-ui/core/Toolbar'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'

import { RHFDatepicker } from '../../../components/RHFDatepicker'
import { RHFInput } from '../../../components/RHFInput'
import { isValidUuid, decomposeDate } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { getAdminOrgAwardsRoute, getAdminOrgAwardRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'

import { Relations } from './relations'
import OrganizationContext from '../../../context/organization'

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
      # seasons {
      #   seasonId
      #   name
      #   nick
      #   startDate
      #   endDate
      # }
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
    updateAward: updateAwards(where: $where, update: $update) {
      awards {
        awardId
        name
        nick
        short
        description
        type
        foundDate
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

const Award = () => {
  const history = useHistory()
  const classes = useStyles()
  const { awardId, organizationSlug } = useParams()
  const { organizationData } = React.useContext(OrganizationContext)
  const { enqueueSnackbar } = useSnackbar()

  const {
    loading: queryLoading,
    data: queryData,
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

  const awardData = queryData?.awards?.[0]

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
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationErrorMerge && !mutationLoadingMerge && (
        <Error
          message={mutationErrorMerge?.message || mutationErrorCreate?.message}
        />
      )}
      {(awardData || awardId === 'new') &&
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
