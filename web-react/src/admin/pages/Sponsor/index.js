import React, { useCallback, useMemo } from 'react'

import { useParams, useHistory } from 'react-router-dom'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { Helmet } from 'react-helmet'
import 'react-imported-component/macro'
import { yupResolver } from '@hookform/resolvers/yup'

import { Container, Grid, Paper } from '@material-ui/core'

import Toolbar from '@material-ui/core/Toolbar'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'

import { RHFInput } from '../../../components/RHFInput'
import { checkId } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { ADMIN_SPONSORS, getAdminSponsorRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'

import { Relations } from './relations'

const READ_SPONSOR = gql`
  query getSponsor($sponsorId: ID!) {
    sponsor: Sponsor(sponsorId: $sponsorId) {
      sponsorId
      name
      legalName
      nick
      short
      claim
      web
      description
    }
  }
`

const MERGE_SPONSOR = gql`
  mutation mergeSponsor(
    $sponsorId: ID!
    $name: String
    $legalName: String
    $nick: String
    $short: String
    $claim: String
    $web: String
    $description: String
  ) {
    mergeSponsor: MergeSponsor(
      sponsorId: $sponsorId
      name: $name
      legalName: $legalName
      nick: $nick
      short: $short
      claim: $claim
      web: $web
      description: $description
    ) {
      sponsorId
    }
  }
`

const DELETE_SPONSOR = gql`
  mutation deleteSponsor($sponsorId: ID!) {
    deleteSponsor: DeleteSponsor(sponsorId: $sponsorId) {
      sponsorId
    }
  }
`

const Sponsor = () => {
  const history = useHistory()
  const classes = useStyles()
  const { sponsorId } = useParams()
  const { enqueueSnackbar } = useSnackbar()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(READ_SPONSOR, {
    fetchPolicy: 'network-only',
    variables: { sponsorId },
    skip: sponsorId === 'new',
  })

  const [
    mergeSponsor,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(MERGE_SPONSOR, {
    onCompleted: data => {
      if (sponsorId === 'new') {
        const newId = data.mergeSponsor.sponsorId
        history.replace(getAdminSponsorRoute(newId))
      }
      enqueueSnackbar('Sponsor saved!', { variant: 'success' })
    },
  })

  const [
    deleteSponsor,
    { loading: loadingDelete, error: errorDelete },
  ] = useMutation(DELETE_SPONSOR, {
    onCompleted: () => {
      history.push(ADMIN_SPONSORS)
      enqueueSnackbar('Sponsor was deleted!')
    },
  })

  const sponsorData = useMemo(() => (queryData && queryData.sponsor[0]) || {}, [
    queryData,
  ])

  const { handleSubmit, control, errors, formState } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const dataToSubmit = {
          ...dataToCheck,
          sponsorId: checkId(sponsorId),
        }

        mergeSponsor({
          variables: dataToSubmit,
        })
      } catch (error) {
        console.error(error)
      }
    },
    [sponsorId]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationErrorMerge && !mutationLoadingMerge && (
        <Error message={mutationErrorMerge.message} />
      )}
      {(sponsorData || sponsorId === 'new') &&
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
                <title>{sponsorData.name || 'Sponsor'}</title>
              </Helmet>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12} lg={12}>
                  <Paper className={classes.paper}>
                    <Toolbar disableGutters className={classes.toolbarForm}>
                      <div>
                        <Title>{'Sponsor'}</Title>
                      </div>
                      <div>
                        {formState.isDirty && (
                          <ButtonSave loading={mutationLoadingMerge} />
                        )}
                        {sponsorId !== 'new' && (
                          <ButtonDelete
                            loading={loadingDelete}
                            onClick={() => {
                              deleteSponsor({ variables: { sponsorId } })
                            }}
                          />
                        )}
                      </div>
                    </Toolbar>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={sponsorData.name}
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
                          defaultValue={sponsorData.legalName}
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
                          defaultValue={sponsorData.nick}
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
                          defaultValue={sponsorData.short}
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
                          defaultValue={sponsorData.claim}
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
                          defaultValue={sponsorData.web}
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
                          defaultValue={sponsorData.description}
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
            <Relations sponsorId={sponsorId} />
          </>
        )}
    </Container>
  )
}

export { Sponsor as default }
