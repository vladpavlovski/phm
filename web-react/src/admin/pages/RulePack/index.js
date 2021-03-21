import React, { useCallback } from 'react'

import { useParams, useHistory } from 'react-router-dom'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { Helmet } from 'react-helmet'

import { yupResolver } from '@hookform/resolvers/yup'
import { v4 as uuidv4 } from 'uuid'
import { Container, Grid, Paper } from '@material-ui/core'

import Toolbar from '@material-ui/core/Toolbar'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'

import { RHFInput } from '../../../components/RHFInput'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { ADMIN_RULEPACKS, getAdminRulePackRoute } from '../../../routes'
import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'

import { Relations } from './relations'

const GET_RULEPACK = gql`
  query getRulePack($rulePackId: ID!) {
    rulePack: RulePack(rulePackId: $rulePackId) {
      rulePackId
      name
    }
  }
`

const MERGE_RULEPACK = gql`
  mutation mergeRulePack($rulePackId: ID!, $name: String) {
    mergeRulePack: MergeRulePack(rulePackId: $rulePackId, name: $name) {
      rulePackId
    }
  }
`

const DELETE_RULEPACK = gql`
  mutation deleteRulePack($rulePackId: ID!) {
    deleteRulePack: DeleteRulePack(rulePackId: $rulePackId) {
      rulePackId
    }
  }
`

const RulePack = () => {
  const history = useHistory()
  const classes = useStyles()
  const { rulePackId } = useParams()
  const { enqueueSnackbar } = useSnackbar()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_RULEPACK, {
    fetchPolicy: 'network',
    variables: { rulePackId },
    skip: rulePackId === 'new',
  })

  const [
    mergeRulePack,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(MERGE_RULEPACK, {
    onCompleted: data => {
      if (rulePackId === 'new') {
        const newId = data.mergeRulePack.rulePackId
        history.replace(getAdminRulePackRoute(newId))
      }
      enqueueSnackbar('RulePack saved!', { variant: 'success' })
    },
  })

  const [
    deleteRulePack,
    { loading: loadingDelete, error: errorDelete },
  ] = useMutation(DELETE_RULEPACK, {
    onCompleted: () => {
      history.push(ADMIN_RULEPACKS)
      enqueueSnackbar('RulePack was deleted!')
    },
  })

  const rulePackData = queryData?.rulePack[0] || {}

  const { handleSubmit, control, errors, formState } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          rulePackId: rulePackId === 'new' ? uuidv4() : rulePackId,
        }

        mergeRulePack({
          variables: dataToSubmit,
        })
      } catch (error) {
        console.error(error)
      }
    },
    [rulePackId]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {errorDelete && !loadingDelete && <Error message={errorDelete.message} />}
      {mutationErrorMerge && !mutationLoadingMerge && (
        <Error message={mutationErrorMerge.message} />
      )}
      {(rulePackData || rulePackId === 'new') &&
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
                <title>{rulePackData.name || 'RulePack'}</title>
              </Helmet>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12} lg={12}>
                  <Paper className={classes.paper}>
                    <Toolbar disableGutters className={classes.toolbarForm}>
                      <div>
                        <Title>{'RulePack'}</Title>
                      </div>
                      <div>
                        {formState.isDirty && (
                          <ButtonSave loading={mutationLoadingMerge} />
                        )}
                        {rulePackId !== 'new' && (
                          <ButtonDelete
                            loading={loadingDelete}
                            onClick={() => {
                              deleteRulePack({ variables: { rulePackId } })
                            }}
                          />
                        )}
                      </div>
                    </Toolbar>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <RHFInput
                          defaultValue={rulePackData.name}
                          control={control}
                          name="name"
                          label="Name"
                          required
                          fullWidth
                          variant="standard"
                          error={errors.name}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </form>
            <Relations rulePackId={rulePackId} />
          </>
        )}
    </Container>
  )
}

export { RulePack as default }
