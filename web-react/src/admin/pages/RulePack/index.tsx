import React, { useCallback, useContext } from 'react'

import { useParams, useHistory } from 'react-router-dom'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { Helmet } from 'react-helmet-async'

import { yupResolver } from '@hookform/resolvers/yup'

import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'

import { ButtonSave } from '../commonComponents/ButtonSave'
import { ButtonDelete } from '../commonComponents/ButtonDelete'

import { RHFInput, Title, Loader, Error } from 'components'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'
import { isValidUuid } from 'utils'

import {
  getAdminOrgRulePacksRoute,
  getAdminOrgRulePackRoute,
} from 'router/routes'

import { Relations } from './relations'
import OrganizationContext from '../../../context/organization'

const GET_RULEPACK = gql`
  query getRulePack($where: RulePackWhere) {
    rulePacks(where: $where) {
      rulePackId
      name
    }
  }
`

const CREATE_RULEPACK = gql`
  mutation createRulePack($input: [RulePackCreateInput!]!) {
    createRulePacks(input: $input) {
      rulePacks {
        rulePackId
      }
    }
  }
`

const UPDATE_RULEPACK = gql`
  mutation updateRulePack($where: RulePackWhere, $update: RulePackUpdateInput) {
    updateRulePacks(where: $where, update: $update) {
      rulePacks {
        rulePackId
        name
      }
    }
  }
`

const DELETE_RULEPACK = gql`
  mutation deleteRulePack($where: RulePackWhere) {
    deleteRulePacks(where: $where) {
      nodesDeleted
    }
  }
`

type TParams = {
  rulePackId: string
  organizationSlug: string
}

const RulePack: React.FC = () => {
  const history = useHistory()
  const classes = useStyles()
  const { rulePackId, organizationSlug } = useParams<TParams>()
  const { organizationData } = useContext(OrganizationContext)
  const { enqueueSnackbar } = useSnackbar()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_RULEPACK, {
    variables: { where: { rulePackId } },
    skip: rulePackId === 'new',
  })

  const [
    createRulePack,
    { loading: mutationLoadingCreate, error: mutationErrorCreate },
  ] = useMutation(CREATE_RULEPACK, {
    onCompleted: data => {
      if (rulePackId === 'new') {
        const newId = data?.createRulePacks?.rulePacks?.[0]?.rulePackId
        newId &&
          history.replace(getAdminOrgRulePackRoute(organizationSlug, newId))
      }
      enqueueSnackbar('RulePack saved!', { variant: 'success' })
    },
  })

  const [
    updateRulePack,
    { loading: mutationLoadingUpdate, error: mutationErrorUpdate },
  ] = useMutation(UPDATE_RULEPACK, {
    update(cache, { data }) {
      try {
        cache.writeQuery({
          query: GET_RULEPACK,
          data: {
            rulePacks: data?.updateRulePacks?.rulePacks,
          },
          variables: { where: { rulePackId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      enqueueSnackbar('RulePack updated!', { variant: 'success' })
    },
  })

  const [deleteRulePack, { loading: loadingDelete, error: errorDelete }] =
    useMutation(DELETE_RULEPACK, {
      onCompleted: () => {
        history.push(getAdminOrgRulePacksRoute(organizationSlug))
        enqueueSnackbar('RulePack was deleted!')
      },
    })

  const rulePackData = queryData?.rulePacks?.[0]

  const { handleSubmit, control, errors, formState } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        rulePackId === 'new'
          ? createRulePack({
              variables: {
                input: dataToCheck,
              },
            })
          : updateRulePack({
              variables: {
                where: {
                  rulePackId,
                },
                update: dataToCheck,
              },
            })
      } catch (error) {
        console.error(error)
      }
    },
    [rulePackId, organizationData]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && <Loader />}
      <Error
        message={
          mutationErrorCreate?.message ||
          mutationErrorUpdate?.message ||
          errorDelete?.message ||
          queryError?.message
        }
      />
      {(rulePackData || rulePackId === 'new') && (
        <>
          <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
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
                        <ButtonSave
                          loading={
                            mutationLoadingUpdate || mutationLoadingCreate
                          }
                        />
                      )}
                      {rulePackId !== 'new' && (
                        <ButtonDelete
                          loading={loadingDelete}
                          onClick={() => {
                            deleteRulePack({
                              variables: { where: { rulePackId } },
                            })
                          }}
                        />
                      )}
                    </div>
                  </Toolbar>

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
                </Paper>
              </Grid>
            </Grid>
          </form>
          {isValidUuid(rulePackId) && <Relations rulePackId={rulePackId} />}
        </>
      )}
    </Container>
  )
}

export { RulePack as default }
