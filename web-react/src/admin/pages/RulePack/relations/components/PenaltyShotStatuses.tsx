import React, { useCallback, useState, useMemo, useRef } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'

import { useSnackbar } from 'notistack'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { object, string } from 'yup'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import CreateIcon from '@mui/icons-material/Create'
import Toolbar from '@mui/material/Toolbar'

import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'

import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import LoadingButton from '@mui/lab/LoadingButton'
import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

import { RHFInput, Error, Loader } from 'components'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from 'utils'
import { PenaltyShotStatus } from 'utils/types'
const GET_PENALTY_SHOT_STATUSES = gql`
  query getRulePack($where: PenaltyShotStatusWhere) {
    penaltyShotStatuses(where: $where) {
      penaltyShotStatusId
      name
      code
    }
  }
`

const CREATE_PENALTY_SHOT_STATUS = gql`
  mutation createPenaltyShotStatus($input: [PenaltyShotStatusCreateInput!]!) {
    createPenaltyShotStatuses(input: $input) {
      penaltyShotStatuses {
        penaltyShotStatusId
        name
        code
      }
    }
  }
`

const UPDATE_PENALTY_SHOT_STATUS = gql`
  mutation updatePenaltyShotStatus(
    $where: PenaltyShotStatusWhere
    $update: PenaltyShotStatusUpdateInput
  ) {
    updatePenaltyShotStatuses(where: $where, update: $update) {
      penaltyShotStatuses {
        penaltyShotStatusId
        name
        code
      }
    }
  }
`

const DELETE_PENALTY_SHOT_STATUS = gql`
  mutation deletePenaltyShotStatus($where: PenaltyShotStatusWhere) {
    deletePenaltyShotStatuses(where: $where) {
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
  penaltyShotStatuses: PenaltyShotStatus[]
}

type TQueryTypeVars = {
  where: {
    rulePack: {
      rulePackId: string
    }
  }
}
const PenaltyShotStatuses: React.FC<TRelations> = props => {
  const { rulePackId } = props

  const classes = useStyles()
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef<PenaltyShotStatus | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery<TQueryTypeData, TQueryTypeVars>(GET_PENALTY_SHOT_STATUSES, {
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

  const [deletePenaltyShotStatus, { loading: mutationLoadingRemove }] =
    useMutation(DELETE_PENALTY_SHOT_STATUS, {
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_PENALTY_SHOT_STATUSES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const updatedData = queryResult?.penaltyShotStatuses?.filter(
            p => p.penaltyShotStatusId !== formData.current?.penaltyShotStatusId
          )

          const updatedResult = {
            penaltyShotStatuses: updatedData,
          }
          cache.writeQuery({
            query: GET_PENALTY_SHOT_STATUSES,
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
        enqueueSnackbar(`PenaltyShotStatus was deleted!`, {
          variant: 'info',
        })
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    })

  const rulePackPenaltyShotStatusesColumns = useMemo<GridColumns>(
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
        field: 'penaltyShotStatusId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <Button
              onClick={() => handleOpenDialog(params.row)}
              variant={'outlined'}
              size="small"
              className={classes.submit}
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
              dialogTitle={
                'Do you really want to delete this penalty shot status?'
              }
              dialogDescription={
                'Penalty shot status will be completely delete'
              }
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() => {
                formData.current = params.row
                deletePenaltyShotStatus({
                  variables: {
                    where: {
                      penaltyShotStatusId: params.row.penaltyShotStatusId,
                    },
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
        aria-controls="penalty-shot-statuses-content"
        id="penalty-shot-statuses-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Penalty Shot Status
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
            <Toolbar disableGutters className={classes.toolbarForm}>
              <div />
              <div>
                <Button
                  onClick={handleOpenDialog}
                  variant={'outlined'}
                  size="small"
                  className={classes.submit}
                  startIcon={<CreateIcon />}
                >
                  Create
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <DataGridPro
                columns={rulePackPenaltyShotStatusesColumns}
                rows={setIdFromEntityId(
                  queryData?.penaltyShotStatuses,
                  'penaltyShotStatusId'
                )}
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
  data: PenaltyShotStatus | null
}

const FormDialog: React.FC<TFormDialog> = React.memo(props => {
  const { rulePackId, openDialog, handleCloseDialog, data } = props

  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [createPenaltyShotStatus, { loading: mutationLoadingCreate }] =
    useMutation(CREATE_PENALTY_SHOT_STATUS, {
      update(cache, { data: { createPenaltyShotStatuses } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_PENALTY_SHOT_STATUSES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const newItem = createPenaltyShotStatuses?.penaltyShotStatuses?.[0]

          const existingData = queryResult?.penaltyShotStatuses || []
          const updatedData = [newItem, ...existingData]
          const updatedResult = {
            penaltyShotStatuses: updatedData,
          }
          cache.writeQuery({
            query: GET_PENALTY_SHOT_STATUSES,
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
    })

  const [updatePenaltyShotStatus, { loading: mutationLoadingUpdate }] =
    useMutation(UPDATE_PENALTY_SHOT_STATUS, {
      update(cache, { data: { updatePenaltyShotStatuses } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_PENALTY_SHOT_STATUSES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })

          const newItem = updatePenaltyShotStatuses?.penaltyShotStatuses?.[0]

          const existingData = queryResult?.penaltyShotStatuses || []
          const updatedData = existingData?.map(ed =>
            ed.penaltyShotStatusId === newItem.penaltyShotStatusId
              ? newItem
              : ed
          )
          const updatedResult = {
            penaltyShotStatuses: updatedData,
          }
          cache.writeQuery({
            query: GET_PENALTY_SHOT_STATUSES,
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
    })

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { name, code } = dataToCheck
        data?.penaltyShotStatusId
          ? updatePenaltyShotStatus({
              variables: {
                where: {
                  penaltyShotStatusId: data?.penaltyShotStatusId,
                },
                update: {
                  name,
                  code,
                },
              },
            })
          : createPenaltyShotStatus({
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
        <DialogTitle id="alert-dialog-title">{`Add new penalty shot status`}</DialogTitle>
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
})

export { PenaltyShotStatuses }
