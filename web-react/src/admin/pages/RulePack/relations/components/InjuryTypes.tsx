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
import { InjuryType } from 'utils/types'
const GET_INJURIES = gql`
  query getRulePack($where: InjuryTypeWhere) {
    injuryTypes(where: $where) {
      injuryTypeId
      name
    }
  }
`

const CREATE_INJURY = gql`
  mutation createInjuryType($input: [InjuryTypeCreateInput!]!) {
    createInjuryTypes(input: $input) {
      injuryTypes {
        injuryTypeId
        name
      }
    }
  }
`

const UPDATE_INJURY = gql`
  mutation updateInjuryType(
    $where: InjuryTypeWhere
    $update: InjuryTypeUpdateInput
  ) {
    updateInjuryTypes(where: $where, update: $update) {
      injuryTypes {
        injuryTypeId
        name
      }
    }
  }
`

const DELETE_INJURY = gql`
  mutation deleteInjuryType($where: InjuryTypeWhere) {
    deleteInjuryTypes(where: $where) {
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
  injuryTypes: InjuryType[]
}

type TQueryTypeVars = {
  where: {
    rulePack: {
      rulePackId: string
    }
  }
}

const InjuryTypes: React.FC<TRelations> = props => {
  const { rulePackId } = props

  const classes = useStyles()
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef<InjuryType | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery<TQueryTypeData, TQueryTypeVars>(GET_INJURIES, {
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

  const [deleteInjuryType, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_INJURY,
    {
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_INJURIES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const updatedData = queryResult?.injuryTypes?.filter(
            p => p.injuryTypeId !== formData.current?.injuryTypeId
          )

          const updatedResult = {
            injuryTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_INJURIES,
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
        enqueueSnackbar(`InjuryType was deleted!`, {
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

  const rulePackInjuryTypesColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'injuryTypeId',
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
              dialogTitle={'Do you really want to delete this injury type?'}
              dialogDescription={'Injury type will be completely delete'}
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() => {
                formData.current = params.row
                deleteInjuryType({
                  variables: {
                    where: { injuryTypeId: params.row.injuryTypeId },
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
        aria-controls="injury-types-content"
        id="injury-types-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Injury Types
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
                columns={rulePackInjuryTypesColumns}
                rows={setIdFromEntityId(queryData?.injuryTypes, 'injuryTypeId')}
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
  data: InjuryType | null
}

const FormDialog: React.FC<TFormDialog> = React.memo(props => {
  const { rulePackId, openDialog, handleCloseDialog, data } = props
  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [createInjuryType, { loading: mutationLoadingCreate }] = useMutation(
    CREATE_INJURY,
    {
      update(cache, { data: { createInjuryTypes } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_INJURIES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })
          const newItem = createInjuryTypes?.injuryTypes?.[0]

          const existingData = queryResult?.injuryTypes || []
          const updatedData = [newItem, ...existingData]
          const updatedResult = {
            injuryTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_INJURIES,
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

  const [updateInjuryType, { loading: mutationLoadingUpdate }] = useMutation(
    UPDATE_INJURY,
    {
      update(cache, { data: { updateInjuryTypes } }) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_INJURIES,
            variables: {
              where: { rulePack: { rulePackId } },
            },
          })

          const newItem = updateInjuryTypes?.injuryTypes?.[0]

          const existingData = queryResult?.injuryTypes || []
          const updatedData = existingData?.map(ed =>
            ed.injuryTypeId === newItem.injuryTypeId ? newItem : ed
          )
          const updatedResult = {
            injuryTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_INJURIES,
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

        data?.injuryTypeId
          ? updateInjuryType({
              variables: {
                where: {
                  injuryTypeId: data?.injuryTypeId,
                },
                update: {
                  name,
                },
              },
            })
          : createInjuryType({
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
        <DialogTitle id="alert-dialog-title">{`Add new injury type`}</DialogTitle>
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
})

export { InjuryTypes }
