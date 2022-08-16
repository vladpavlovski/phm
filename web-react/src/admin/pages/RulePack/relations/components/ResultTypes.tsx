import { Error, Loader, RHFInput } from 'components'
import { useSnackbar } from 'notistack'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ResultType } from 'utils/types'
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
import { setIdFromEntityId } from '../../../../../utils'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

const GET_RESULT_TYPES = gql`
  query getRulePack($where: ResultTypeWhere, $whereRulePack: RulePackWhere) {
    resultTypes(where: $where) {
      resultTypeId
      name
    }
    rulePacks(where: $whereRulePack) {
      name
    }
  }
`

const CREATE_RESULT_TYPE = gql`
  mutation createResultType($input: [ResultTypeCreateInput!]!) {
    createResultTypes(input: $input) {
      resultTypes {
        resultTypeId
        name
      }
    }
  }
`

const UPDATE_RESULT_TYPE = gql`
  mutation updateResultType(
    $where: ResultTypeWhere
    $update: ResultTypeUpdateInput
  ) {
    updateResultTypes(where: $where, update: $update) {
      resultTypes {
        resultTypeId
        name
      }
    }
  }
`

const DELETE_RESULT_TYPE = gql`
  mutation deleteResultType($where: ResultTypeWhere) {
    deleteResultTypes(where: $where) {
      nodesDeleted
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
})

type TRelations = {
  rulePackId: string
}

type TQueryTypeData = {
  resultTypes: ResultType[]
}

type TQueryTypeVars = {
  where: {
    rulePack: {
      rulePackId: string
    }
  }
}

const ResultTypes: React.FC<TRelations> = props => {
  const { rulePackId } = props
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef<ResultType | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery<TQueryTypeData, TQueryTypeVars>(GET_RESULT_TYPES, {
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

  const [deleteResultType, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_RESULT_TYPE,
    {
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_RESULT_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const updatedData = queryResult?.resultTypes?.filter(
            p => p.resultTypeId !== formData.current?.resultTypeId
          )

          const updatedResult = {
            resultTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_RESULT_TYPES,
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
        enqueueSnackbar(`ResultType was deleted!`, {
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

  const rulePackResultTypesColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'resultTypeId',
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
              dialogTitle={'Do you really want to delete this result type?'}
              dialogDescription={'Result type will be completely delete'}
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() => {
                formData.current = params.row
                deleteResultType({
                  variables: {
                    where: { resultTypeId: params.row.resultTypeId },
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
        aria-controls="result-types-content"
        id="result-types-header"
      >
        <Typography>Result Types</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
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
                columns={rulePackResultTypesColumns}
                rows={setIdFromEntityId(queryData?.resultTypes, 'resultTypeId')}
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
  data: ResultType | null
}

const FormDialog: React.FC<TFormDialog> = props => {
  const { rulePackId, openDialog, handleCloseDialog, data } = props

  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [createResultType, { loading: mutationLoadingCreate }] = useMutation(
    CREATE_RESULT_TYPE,
    {
      update(cache, { data: { createResultTypes } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_RESULT_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const newItem = createResultTypes?.resultTypes?.[0]

          const existingData = queryResult?.resultTypes || []
          const updatedData = [newItem, ...existingData]
          const updatedResult = {
            resultTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_RESULT_TYPES,
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

  const [updateResultType, { loading: mutationLoadingUpdate }] = useMutation(
    UPDATE_RESULT_TYPE,
    {
      update(cache, { data: { updateResultTypes } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_RESULT_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })

          const newItem = updateResultTypes?.resultTypes?.[0]

          const existingData = queryResult?.resultTypes || []
          const updatedData = existingData?.map(ed =>
            ed.resultTypeId === newItem.resultTypeId ? newItem : ed
          )
          const updatedResult = {
            resultTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_RESULT_TYPES,
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
        const { name } = dataToCheck

        data?.resultTypeId
          ? updateResultType({
              variables: {
                where: {
                  resultTypeId: data?.resultTypeId,
                },
                update: {
                  name,
                },
              },
            })
          : createResultType({
              variables: {
                input: {
                  name,
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
        <DialogTitle id="alert-dialog-title">{`Add new result type`}</DialogTitle>
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

export { ResultTypes }
