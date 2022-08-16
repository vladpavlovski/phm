import { Error, Loader, RHFInput } from 'components'
import { useSnackbar } from 'notistack'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { setIdFromEntityId } from 'utils'
import { ShotTarget } from 'utils/types'
import { object, string } from 'yup'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { yupResolver } from '@hookform/resolvers/yup'
import CreateIcon from '@mui/icons-material/Create'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LoadingButton from '@mui/lab/LoadingButton'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

const GET_SHOT_TARGETS = gql`
  query getRulePack($where: ShotTargetWhere, $whereRulePack: RulePackWhere) {
    shotTargets(where: $where) {
      shotTargetId
      name
      code
    }
    rulePacks(where: $whereRulePack) {
      name
    }
  }
`

const CREATE_SHOT_TARGET = gql`
  mutation createShotTarget($input: [ShotTargetCreateInput!]!) {
    createShotTargets(input: $input) {
      shotTargets {
        shotTargetId
        name
        code
      }
    }
  }
`

const UPDATE_SHOT_TARGET = gql`
  mutation updateShotTarget(
    $where: ShotTargetWhere
    $update: ShotTargetUpdateInput
  ) {
    updateShotTargets(where: $where, update: $update) {
      shotTargets {
        shotTargetId
        name
        code
      }
    }
  }
`

const DELETE_SHOT_TARGET = gql`
  mutation deleteShotTarget($where: ShotTargetWhere) {
    deleteShotTargets(where: $where) {
      nodesDeleted
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  code: string().required('Code is required'),
})

type TRelations = {
  rulePackId: string
}

type TQueryTypeData = {
  shotTargets: ShotTarget[]
}

type TQueryTypeVars = {
  where: {
    rulePack: {
      rulePackId: string
    }
  }
}

const ShotTargets: React.FC<TRelations> = props => {
  const { rulePackId } = props

  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef<ShotTarget | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery<TQueryTypeData, TQueryTypeVars>(GET_SHOT_TARGETS, {
    variables: {
      where: { rulePack: { rulePackId } },
    },
  })

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData()
    }
  }, [])

  const handleOpenDialog = useCallback(data => {
    formData.current = data
    setOpenDialog(true)
  }, [])

  const [deleteShotTarget, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_SHOT_TARGET,
    {
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_SHOT_TARGETS,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const updatedData = queryResult?.shotTargets?.filter(
            p => p.shotTargetId !== formData.current?.shotTargetId
          )

          const updatedResult = {
            shotTargets: updatedData,
          }
          cache.writeQuery({
            query: GET_SHOT_TARGETS,
            data: updatedResult,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        enqueueSnackbar(`ShotTarget was deleted!`, {
          variant: 'info',
        })
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  const rulePackShotTargetsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'code',
        headerName: 'Code',
        width: 100,
      },
      {
        field: 'shotTargetId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <Button
              onClick={() => handleOpenDialog(params.row)}
              variant={'outlined'}
              size="small"
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
          )
        },
      },
      {
        field: 'removeButton',
        headerName: 'Delete',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ButtonDialog
              text={'Delete'}
              textLoading={'Deleting...'}
              loading={mutationLoadingRemove}
              dialogTitle={'Do you really want to delete this shot target?'}
              dialogDescription={'Shot target will be completely delete'}
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() => {
                formData.current = params.row
                deleteShotTarget({
                  variables: {
                    where: { shotTargetId: params.row.shotTargetId },
                  },
                })
              }}
            />
          )
        },
      },
    ],
    []
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="shot-targets-content"
        id="shot-targets-header"
      >
        <Typography>Shot Targets</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
            <Toolbar
              disableGutters
              sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
            >
              <div />
              <div>
                <Button
                  onClick={handleOpenDialog}
                  variant={'outlined'}
                  size="small"
                  startIcon={<CreateIcon />}
                >
                  Create
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600, width: '100%' }}>
              <DataGridPro
                columns={rulePackShotTargetsColumns}
                rows={setIdFromEntityId(queryData?.shotTargets, 'shotTargetId')}
                loading={queryLoading}
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </div>
          </>
        )}
      </AccordionDetails>

      <FormDialog
        rulePackId={rulePackId}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        data={formData.current}
      />
    </Accordion>
  )
}

type TFormDialog = {
  rulePackId: string
  openDialog: boolean
  handleCloseDialog: () => void
  data: ShotTarget | null
}
const FormDialog: React.FC<TFormDialog> = props => {
  const { rulePackId, openDialog, handleCloseDialog, data } = props

  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [createShotTarget, { loading: mutationLoadingCreate }] = useMutation(
    CREATE_SHOT_TARGET,
    {
      update(cache, { data: { createShotTargets } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_SHOT_TARGETS,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const newItem = createShotTargets?.shotTargets?.[0]

          const existingData = queryResult?.shotTargets || []
          const updatedData = [newItem, ...existingData]
          const updatedResult = {
            shotTargets: updatedData,
          }
          cache.writeQuery({
            query: GET_SHOT_TARGETS,
            data: updatedResult,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        enqueueSnackbar('Position type saved!', { variant: 'success' })
        handleCloseDialog()
      },
      onError: error => {
        enqueueSnackbar(`Error: ${error}`, {
          variant: 'error',
        })
      },
    }
  )

  const [updateShotTarget, { loading: mutationLoadingUpdate }] = useMutation(
    UPDATE_SHOT_TARGET,
    {
      update(cache, { data: { updateShotTargets } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_SHOT_TARGETS,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })

          const newItem = updateShotTargets?.shotTargets?.[0]

          const existingData = queryResult?.shotTargets || []
          const updatedData = existingData?.map(ed =>
            ed.shotTargetId === newItem.shotTargetId ? newItem : ed
          )
          const updatedResult = {
            shotTargets: updatedData,
          }
          cache.writeQuery({
            query: GET_SHOT_TARGETS,
            data: updatedResult,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        enqueueSnackbar('Position type updated!', { variant: 'success' })
        handleCloseDialog()
      },
      onError: error => {
        enqueueSnackbar(`Error: ${error}`, {
          variant: 'error',
        })
      },
    }
  )

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { name, code } = dataToCheck

        data?.shotTargetId
          ? updateShotTarget({
              variables: {
                where: {
                  shotTargetId: data?.shotTargetId,
                },
                update: {
                  name,
                  code,
                },
              },
            })
          : createShotTarget({
              variables: {
                input: {
                  name,
                  code,

                  rulePack: {
                    connect: {
                      where: {
                        node: { rulePackId },
                      },
                    },
                  },
                },
              },
            })
      } catch (error) {
        console.error(error)
      }
    },
    [rulePackId, data]
  )

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={openDialog}
      onClose={handleCloseDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
        <DialogTitle id="alert-dialog-title">{`Add new shot target`}</DialogTitle>
        <DialogContent>
          <Container>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <RHFInput
                      control={control}
                      defaultValue={data?.name || ''}
                      name="name"
                      label="Name"
                      required
                      fullWidth
                      variant="standard"
                      error={errors?.name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <RHFInput
                      control={control}
                      defaultValue={data?.code || ''}
                      name="code"
                      label="Code"
                      required
                      fullWidth
                      variant="standard"
                      error={errors?.code}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </DialogContent>

        <DialogActions>
          <Button
            type="button"
            onClick={() => {
              handleCloseDialog()
            }}
          >
            {'Cancel'}
          </Button>
          <LoadingButton
            type="submit"
            loading={mutationLoadingCreate || mutationLoadingUpdate}
          >
            {mutationLoadingCreate || mutationLoadingUpdate
              ? 'Saving...'
              : 'Save'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export { ShotTargets }
