import React, { useCallback, useMemo } from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { Helmet } from 'react-helmet'

import { yupResolver } from '@hookform/resolvers/yup'

import { Container, Grid, Paper } from '@material-ui/core'

import Toolbar from '@material-ui/core/Toolbar'

import { ButtonSave } from '../commonComponents/ButtonSave'

import { RHFInput } from '../../../components/RHFInput'
import { checkId } from '../../../utils'
import { Title } from '../../../components/Title'
import { useStyles } from '../commonComponents/styled'
import { schema } from './schema'

import { Loader } from '../../../components/Loader'
import { Error } from '../../../components/Error'

import { Relations } from './relations'

const GET_SYSTEM_SETTINGS = gql`
  query getSystemSettings($systemSettingsId: ID!) {
    systemSettings: SystemSettings(systemSettingsId: $systemSettingsId) {
      systemSettingsId
      name
      language
    }
  }
`

const MERGE_SYSTEM_SETTINGS = gql`
  mutation mergeSystemSettings(
    $systemSettingsId: ID!
    $name: String
    $language: String
  ) {
    mergeSystemSettings: MergeSystemSettings(
      systemSettingsId: $systemSettingsId
      name: $name
      language: $language
    ) {
      systemSettingsId
    }
  }
`

const SystemSettings = () => {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const systemSettingsId = useMemo(() => 'system-settings', [])

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_SYSTEM_SETTINGS, {
    fetchPolicy: 'network-only',
    variables: { systemSettingsId },
  })

  const [
    mergeSystemSettings,
    { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(MERGE_SYSTEM_SETTINGS, {
    onCompleted: () => {
      enqueueSnackbar('SystemSettings saved!', { variant: 'success' })
    },
  })

  const systemSettingsData = useMemo(
    () => (queryData && queryData.systemSettings[0]) || {},
    [queryData]
  )

  const { handleSubmit, control, errors, formState } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { ...rest } = dataToCheck

        const dataToSubmit = {
          ...rest,
          systemSettingsId: checkId(systemSettingsId),
        }

        mergeSystemSettings({
          variables: dataToSubmit,
        })
      } catch (error) {
        console.error(error)
      }
    },
    [systemSettingsId]
  )

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {mutationErrorMerge && !mutationLoadingMerge && (
        <Error message={mutationErrorMerge.message} />
      )}
      {systemSettingsData &&
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
                <title>{systemSettingsData.name || 'SystemSettings'}</title>
              </Helmet>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12} lg={12}>
                  <Paper className={classes.paper}>
                    <Toolbar disableGutters className={classes.toolbarForm}>
                      <div>
                        <Title>{'SystemSettings'}</Title>
                      </div>
                      <div>
                        {formState.isDirty && (
                          <ButtonSave loading={mutationLoadingMerge} />
                        )}
                      </div>
                    </Toolbar>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={6} lg={6}>
                        <RHFInput
                          defaultValue={systemSettingsData.name}
                          control={control}
                          name="name"
                          label="Name"
                          required
                          fullWidth
                          variant="standard"
                          error={errors.name}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} lg={6}>
                        <RHFInput
                          defaultValue={systemSettingsData.language}
                          control={control}
                          name="language"
                          label="Language"
                          fullWidth
                          variant="standard"
                          error={errors.language}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </form>
            {systemSettingsData && (
              <Relations systemSettingsId={systemSettingsId} />
            )}
          </>
        )}
    </Container>
  )
}

export { SystemSettings as default }
