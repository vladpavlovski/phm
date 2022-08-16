import { Error, Loader, RHFInput } from 'components'
import { useSnackbar } from 'notistack'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { setIdFromEntityId } from 'utils'
import { PositionType } from 'utils/types'
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

const GET_POSITION_TYPES = gql`
  query getRulePack($where: PositionTypeWhere) {
    positionTypes(where: $where) {
      positionTypeId
      name
      short
      description
    }
  }
`

const CREATE_POSITION_TYPE = gql`
  mutation createPositionType($input: [PositionTypeCreateInput!]!) {
    createPositionTypes(input: $input) {
      positionTypes {
        positionTypeId
        name
        short
        description
      }
    }
  }
`

const UPDATE_POSITION_TYPE = gql`
  mutation updatePositionType(
    $where: PositionTypeWhere
    $update: PositionTypeUpdateInput
  ) {
    updatePositionTypes(where: $where, update: $update) {
      positionTypes {
        positionTypeId
        name
        short
        description
      }
    }
  }
`

const DELETE_POSITION_TYPE = gql`
  mutation deletePositionType($where: PositionTypeWhere) {
    deletePositionTypes(where: $where) {
      nodesDeleted
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  description: string(),
  short: string(),
})

type TRelations = {
  rulePackId: string
}

type TQueryTypeData = {
  positionTypes: PositionType[]
}

type TQueryTypeVars = {
  where: {
    rulePack: {
      rulePackId: string
    }
  }
}

const PositionTypes: React.FC<TRelations> = props => {
  const { rulePackId } = props

  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef<PositionType | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery<TQueryTypeData, TQueryTypeVars>(GET_POSITION_TYPES, {
    variables: {
      where: { rulePack: { rulePackId } },
    },
    fetchPolicy: 'cache-and-network',
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

  const [deletePositionType, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_POSITION_TYPE,
    {
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_POSITION_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const updatedData = queryResult?.positionTypes?.filter(
            p => p.positionTypeId !== formData.current?.positionTypeId
          )

          const updatedResult = {
            positionTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_POSITION_TYPES,
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
        enqueueSnackbar(`Position type was deleted!`, {
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

  const rulePackPositionTypesColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'short',
        headerName: 'Short',
        width: 100,
      },
      {
        field: 'description',
        headerName: 'Description',
        width: 300,
      },
      {
        field: 'positionTypeId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <Button
              type="button"
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
              dialogTitle={'Do you really want to delete this position type?'}
              dialogDescription={'Position type will be completely delete'}
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() => {
                formData.current = params.row
                deletePositionType({
                  variables: {
                    where: { positionTypeId: params.row.positionTypeId },
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
        aria-controls="position-types-content"
        id="position-types-header"
      >
        <Typography>Position Types</Typography>
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
                  type="button"
                  onClick={handleOpenDialog}
                  variant={'outlined'}
                  size="small"
                  startIcon={<CreateIcon />}
                >
                  Create Position
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600, width: '100%' }}>
              <DataGridPro
                columns={rulePackPositionTypesColumns}
                rows={setIdFromEntityId(
                  queryData?.positionTypes,
                  'positionTypeId'
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
  data: PositionType | null
}

const FormDialog: React.FC<TFormDialog> = props => {
  const { rulePackId, openDialog, handleCloseDialog, data } = props

  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [createPositionType, { loading: mutationLoadingCreate }] = useMutation(
    CREATE_POSITION_TYPE,
    {
      update(cache, { data: { createPositionTypes } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_POSITION_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const newItem = createPositionTypes?.positionTypes?.[0]

          const existingData = queryResult?.positionTypes || []
          const updatedData = [newItem, ...existingData]
          const updatedResult = {
            positionTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_POSITION_TYPES,
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

  const [updatePositionType, { loading: mutationLoadingMerge }] = useMutation(
    UPDATE_POSITION_TYPE,
    {
      update(cache, { data: { updatePositionTypes } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_POSITION_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })

          const newItem = updatePositionTypes?.positionTypes?.[0]

          const existingData = queryResult?.positionTypes
          const updatedData = existingData?.map(ed =>
            ed.positionTypeId === newItem.positionTypeId ? newItem : ed
          )
          const updatedResult = {
            positionTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_POSITION_TYPES,
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
    dataToSubmit => {
      try {
        data?.positionTypeId
          ? updatePositionType({
              variables: {
                where: {
                  positionTypeId: data?.positionTypeId,
                },
                update: dataToSubmit,
              },
            })
          : createPositionType({
              variables: {
                input: {
                  ...dataToSubmit,
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
        <DialogTitle id="alert-dialog-title">{`Add new positionType`}</DialogTitle>
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
                      defaultValue={data?.short || ''}
                      name="short"
                      label="Short"
                      fullWidth
                      variant="standard"
                      error={errors?.short}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <RHFInput
                      control={control}
                      defaultValue={data?.description || ''}
                      name="description"
                      label="Description"
                      fullWidth
                      variant="standard"
                      error={errors?.description}
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
            loading={mutationLoadingCreate || mutationLoadingMerge}
          >
            {mutationLoadingCreate || mutationLoadingMerge
              ? 'Saving...'
              : 'Save'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export { PositionTypes }
