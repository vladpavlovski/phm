import { Error, Loader, RHFInput } from 'components'
import { useSnackbar } from 'notistack'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { setIdFromEntityId } from 'utils'
import { ResultPoint } from 'utils/types'
import { number, object, string } from 'yup'
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

const GET_RESULT_POINTS = gql`
  query getRulePack($where: ResultPointWhere) {
    resultPoints(where: $where) {
      resultPointId
      name
      code
      points
    }
  }
`

const CREATE_RESULT_POINT = gql`
  mutation createResultPoint($input: [ResultPointCreateInput!]!) {
    createResultPoints(input: $input) {
      resultPoints {
        resultPointId
        name
        code
        points
      }
    }
  }
`

const UPDATE_RESULT_POINT = gql`
  mutation updateResultPoint(
    $where: ResultPointWhere
    $update: ResultPointUpdateInput
  ) {
    updateResultPoints(where: $where, update: $update) {
      resultPoints {
        resultPointId
        name
        code
        points
      }
    }
  }
`

const DELETE_RESULT_POINT = gql`
  mutation deleteResultPoint($where: ResultPointWhere) {
    deleteResultPoints(where: $where) {
      nodesDeleted
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  code: string(),
  points: number().integer().required('Points is required'),
})

type TRelations = {
  rulePackId: string
}

type TQueryTypeData = {
  resultPoints: ResultPoint[]
}

type TQueryTypeVars = {
  where: {
    rulePack: {
      rulePackId: string
    }
  }
}

const ResultPoints: React.FC<TRelations> = props => {
  const { rulePackId } = props
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef<ResultPoint | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery<TQueryTypeData, TQueryTypeVars>(GET_RESULT_POINTS, {
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

  const [deleteResultPoint, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_RESULT_POINT,
    {
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_RESULT_POINTS,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const updatedData = queryResult?.resultPoints?.filter(
            p => p.resultPointId !== formData.current?.resultPointId
          )

          const updatedResult = {
            resultPoints: updatedData,
          }
          cache.writeQuery({
            query: GET_RESULT_POINTS,
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
        enqueueSnackbar(`ResultPoint was deleted!`, {
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

  const rulePackResultPointsColumns = useMemo<GridColumns>(
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
        field: 'points',
        headerName: 'Points',
        width: 100,
      },
      {
        field: 'resultPointId',
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
              dialogTitle={'Do you really want to delete this result point?'}
              dialogDescription={'Result point will be completely delete'}
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() => {
                formData.current = params.row
                deleteResultPoint({
                  variables: {
                    where: { resultPointId: params.row.resultPointId },
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
        aria-controls="result-points-content"
        id="result-points-header"
      >
        <Typography>Result Points</Typography>
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
                columns={rulePackResultPointsColumns}
                rows={setIdFromEntityId(
                  queryData?.resultPoints,
                  'resultPointId'
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
  data: ResultPoint | null
}

const FormDialog: React.FC<TFormDialog> = React.memo(props => {
  const { rulePackId, openDialog, handleCloseDialog, data } = props

  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [createResultPoint, { loading: mutationLoadingCreate }] = useMutation(
    CREATE_RESULT_POINT,
    {
      update(cache, { data: { createResultPoints } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_RESULT_POINTS,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const newItem = createResultPoints?.resultPoints?.[0]

          const existingData = queryResult?.resultPoints || []
          const updatedData = [newItem, ...existingData]
          const updatedResult = {
            resultPoints: updatedData,
          }
          cache.writeQuery({
            query: GET_RESULT_POINTS,
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

  const [updateResultPoint, { loading: mutationLoadingUpdate }] = useMutation(
    UPDATE_RESULT_POINT,
    {
      update(cache, { data: { updateResultPoints } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_RESULT_POINTS,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })

          const newItem = updateResultPoints?.resultPoints?.[0]

          const existingData = queryResult?.resultPoints || []
          const updatedData = existingData?.map(ed =>
            ed.resultPointId === newItem.resultPointId ? newItem : ed
          )
          const updatedResult = {
            resultPoints: updatedData,
          }
          cache.writeQuery({
            query: GET_RESULT_POINTS,
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
        const { name, points, code } = dataToCheck

        data?.resultPointId
          ? updateResultPoint({
              variables: {
                where: {
                  resultPointId: data?.resultPointId,
                },
                update: {
                  name,
                  code,
                  points: `${points}` || null,
                },
              },
            })
          : createResultPoint({
              variables: {
                input: {
                  name,
                  code,
                  points: `${points}` || null,
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
        <DialogTitle id="alert-dialog-title">{`Add new result point`}</DialogTitle>
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
                      fullWidth
                      variant="standard"
                      error={errors?.code}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <RHFInput
                      control={control}
                      defaultValue={data?.points}
                      name="points"
                      label="Points"
                      required
                      fullWidth
                      variant="standard"
                      error={errors?.points}
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

export { ResultPoints }
