import { Error, Loader, RHFInput, Title } from 'components'
import { useSnackbar } from 'notistack'
import React, { useCallback, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { gql, useMutation, useQuery } from '@apollo/client'
import { yupResolver } from '@hookform/resolvers/yup'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import { ButtonSave } from '../commonComponents/ButtonSave'
import { Relations } from './relations'
import { schema } from './schema'

const GET_SYSTEM_SETTINGS = gql`
  query getSystemSettings($where: SystemSettingsWhere) {
    systemSettings(where: $where) {
      systemSettingsId
      name
      language
      rulePack {
        rulePackId
        name
      }
    }
  }
`

const UPDATE_SYSTEM_SETTINGS = gql`
  mutation updateSystemSettings(
    $where: SystemSettingsWhere
    $update: SystemSettingsUpdateInput
  ) {
    updateSystemSettings(where: $where, update: $update) {
      systemSettings {
        systemSettingsId
        name
        language
      }
    }
  }
`

const SystemSettings: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar()
  const systemSettingsId = useMemo(() => 'system-settings', [])

  const {
    loading: queryLoading,
    data: { systemSettings: [systemSettingsData] } = {
      systemSettings: [],
    },
    error: queryError,
  } = useQuery(GET_SYSTEM_SETTINGS, {
    variables: { where: { systemSettingsId } },
  })

  const [
    updateSystemSettings,
    {
      loading: mutationLoadingMerge,
      error: mutationErrorMerge,
      data: mutationDataMerge,
    },
  ] = useMutation(UPDATE_SYSTEM_SETTINGS, {
    update(cache, { data }) {
      try {
        cache.writeQuery({
          query: GET_SYSTEM_SETTINGS,
          data: {
            systemSettings: data?.updateSystemSettings?.systemSettings,
          },
          variables: { where: { systemSettingsId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: () => {
      enqueueSnackbar('SystemSettings saved!', { variant: 'success' })
    },
  })

  // const systemSettingsData = queryData?.systemSettings?.[0]

  const { handleSubmit, control, errors, formState } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    dataToSubmit => {
      try {
        updateSystemSettings({
          variables: {
            where: {
              systemSettingsId,
            },
            update: dataToSubmit,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    [systemSettingsId]
  )

  return (
    <Container maxWidth="lg">
      {queryLoading && <Loader />}
      <Error message={queryError?.message || mutationErrorMerge?.message} />

      {systemSettingsData && (
        <>
          <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
            <Helmet>
              <title>{systemSettingsData?.name || 'SystemSettings'}</title>
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
                        defaultValue={systemSettingsData?.name}
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
                        defaultValue={systemSettingsData?.language}
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
          {(systemSettingsData || mutationDataMerge) && (
            <Relations
              systemSettingsId={systemSettingsId}
              systemSettings={systemSettingsData}
              updateSystemSettings={updateSystemSettings}
            />
          )}
        </>
      )}
    </Container>
  )
}

export { SystemSettings as default }
