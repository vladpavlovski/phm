import React, { useCallback, useState, useMemo, useRef } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { object, string } from 'yup'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import EditIcon from '@material-ui/icons/Edit'
import CreateIcon from '@material-ui/icons/Create'
import Toolbar from '@material-ui/core/Toolbar'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'

import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import LoadingButton from '@material-ui/lab/LoadingButton'
import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

import { RHFInput } from '../../../../../components/RHFInput'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

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

const ResultTypes = props => {
  const { rulePackId } = props

  const classes = useStyles()
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_RESULT_TYPES, {
    variables: {
      where: { rulePack: { rulePackId } },
      whereRulePack: { rulePackId },
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
          const deleted = formData.current
          const queryResult = cache.readQuery({
            query: GET_RESULT_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })
          const updatedData = queryResult.resultTypes.filter(
            p => p.resultTypeId !== deleted.resultTypeId
          )

          const updatedResult = {
            resultTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_RESULT_TYPES,
            data: updatedResult,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
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

  const rulePackResultTypesColumns = useMemo(
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
              size="small"
              startIcon={<DeleteForeverIcon />}
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
        <Typography className={classes.accordionFormTitle}>
          Result Types
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
              <XGrid
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
        rulePack={queryData?.rulePack}
        rulePackId={rulePackId}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        data={formData.current}
      />
    </Accordion>
  )
}

const FormDialog = props => {
  const { rulePack, rulePackId, openDialog, handleCloseDialog, data } = props

  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [createResultType, { loading: mutationLoadingCreate }] = useMutation(
    CREATE_RESULT_TYPE,
    {
      update(cache, { data: { createResultTypes } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_RESULT_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })
          const newItem = createResultTypes?.resultTypes?.[0]

          const existingData = queryResult?.resultTypes
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
          const queryResult = cache.readQuery({
            query: GET_RESULT_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })

          const newItem = updateResultTypes?.resultTypes?.[0]

          const existingData = queryResult?.resultTypes
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
                        rulePackId,
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={classes.form}
        noValidate
        autoComplete="off"
      >
        <DialogTitle id="alert-dialog-title">{`Add new result type to ${rulePack?.name}`}</DialogTitle>
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

ResultTypes.propTypes = {
  rulePackId: PropTypes.string,
}

export { ResultTypes }
