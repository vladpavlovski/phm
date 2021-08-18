import React, { useCallback, useState, useMemo, useRef } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
// import PropTypes from 'prop-types'
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

const GET_POSITION_TYPES = gql`
  query getRulePack($where: PositionTypeWhere, $whereRulePack: RulePackWhere) {
    positionTypes(where: $where) {
      positionTypeId
      name
      short
      description
    }
    rulePacks(where: $whereRulePack) {
      name
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

const PositionTypes = props => {
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
  ] = useLazyQuery(GET_POSITION_TYPES, {
    variables: {
      where: { rulePack: { rulePackId } },
      whereRulePack: { rulePackId },
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
          const deleted = formData.current
          const queryResult = cache.readQuery({
            query: GET_POSITION_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })
          const updatedData = queryResult.positionTypes.filter(
            p => p.positionTypeId !== deleted.positionTypeId
          )

          const updatedResult = {
            positionTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_POSITION_TYPES,
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

  const rulePackPositionTypesColumns = useMemo(
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
        <Typography className={classes.accordionFormTitle}>
          Position Types
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
                  type="button"
                  onClick={handleOpenDialog}
                  variant={'outlined'}
                  size="small"
                  className={classes.submit}
                  startIcon={<CreateIcon />}
                >
                  Create Position
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
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

  const [createPositionType, { loading: mutationLoadingCreate }] = useMutation(
    CREATE_POSITION_TYPE,
    {
      update(cache, { data: { createPositionTypes } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_POSITION_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })
          const newItem = createPositionTypes?.positionTypes?.[0]

          const existingData = queryResult?.positionTypes
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
          const queryResult = cache.readQuery({
            query: GET_POSITION_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={classes.form}
        noValidate
        autoComplete="off"
      >
        <DialogTitle id="alert-dialog-title">{`Add new positionType to ${rulePack?.name}`}</DialogTitle>
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
