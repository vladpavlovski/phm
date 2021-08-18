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
import { setIdFromEntityId, getXGridValueFromArray } from '../../../../../utils'

const GET_SHOT_TYPES = gql`
  query getRulePack($where: ShotTypeWhere, $whereRulePack: RulePackWhere) {
    shotTypes(where: $where) {
      shotTypeId
      name
      code
      subTypes {
        shotSubTypeId
        name
        code
      }
    }
    rulePacks(where: $whereRulePack) {
      name
    }
  }
`

const CREATE_SHOT_TYPE = gql`
  mutation createShotType($input: [ShotTypeCreateInput!]!) {
    createShotTypes(input: $input) {
      shotTypes {
        shotTypeId
        name
        code
        subTypes {
          shotSubTypeId
          name
          code
        }
      }
    }
  }
`

const UPDATE_SHOT_TYPE = gql`
  mutation updateShotType(
    $where: ShotTypeWhere
    $update: ShotTypeUpdateInput
    $create: ShotTypeRelationInput
  ) {
    updateShotTypes(where: $where, update: $update, create: $create) {
      shotTypes {
        shotTypeId
        name
        code
        subTypes {
          shotSubTypeId
          name
          code
        }
      }
    }
  }
`

const DELETE_SHOT_TYPE = gql`
  mutation deleteShotType($where: ShotTypeWhere) {
    deleteShotTypes(where: $where) {
      nodesDeleted
    }
  }
`

const DELETE_SHOT_SUB_TYPE = gql`
  mutation deleteShotSubType($where: ShotSubTypeWhere) {
    deleteShotSubTypes(where: $where) {
      nodesDeleted
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  code: string().required('Code is required'),
})

const ShotTypes = props => {
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
  ] = useLazyQuery(GET_SHOT_TYPES, {
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

  const [deleteShotType, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_SHOT_TYPE,
    {
      update(cache) {
        try {
          const deleted = formData.current
          const queryResult = cache.readQuery({
            query: GET_SHOT_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })
          const updatedData = queryResult.shotTypes.filter(
            p => p.shotTypeId !== deleted.shotTypeId
          )

          const updatedResult = {
            shotTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_SHOT_TYPES,
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
        enqueueSnackbar(`ShotType was deleted!`, {
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

  const rulePackShotTypesColumns = useMemo(
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
        field: 'subTypes',
        headerName: 'Sub Types',
        width: 300,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.subTypes, 'name')
        },
      },
      {
        field: 'shotTypeId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <Button
              onClick={() => handleOpenDialog(params.value)}
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
              dialogTitle={'Do you really want to delete this shot type?'}
              dialogDescription={'Shot type will be completely delete'}
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() => {
                formData.current = params.row
                deleteShotType({
                  variables: {
                    where: { shotTypeId: params.row.shotTypeId },
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
        aria-controls="shot-types-content"
        id="shot-types-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Shot Types
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
                columns={rulePackShotTypesColumns}
                rows={setIdFromEntityId(queryData?.shotTypes, 'shotTypeId')}
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
        data={queryData?.shotTypes?.find(
          gt => gt.shotTypeId === formData.current
        )}
      />
    </Accordion>
  )
}

const FormDialog = props => {
  const { rulePack, rulePackId, openDialog, handleCloseDialog, data } = props
  const [newSubType, setNewSubType] = useState(false)
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [createShotType, { loading: mutationLoadingCreate }] = useMutation(
    CREATE_SHOT_TYPE,
    {
      update(cache, { data: { createShotTypes } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_SHOT_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })
          const newItem = createShotTypes?.shotTypes?.[0]

          const existingData = queryResult?.shotTypes
          const updatedData = [newItem, ...existingData]
          const updatedResult = {
            shotTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_SHOT_TYPES,
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

  const [updateShotType, { loading: mutationLoadingUpdate }] = useMutation(
    UPDATE_SHOT_TYPE,
    {
      update(cache, { data: { updateShotTypes } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_SHOT_TYPES,
            variables: {
              where: { rulePack: { rulePackId } },
              whereRulePack: { rulePackId },
            },
          })

          const newItem = updateShotTypes?.shotTypes?.[0]

          const existingData = queryResult?.shotTypes
          const updatedData = existingData?.map(ed =>
            ed.shotTypeId === newItem.shotTypeId ? newItem : ed
          )
          const updatedResult = {
            shotTypes: updatedData,
          }
          cache.writeQuery({
            query: GET_SHOT_TYPES,
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
        setNewSubType(false)
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

        data?.shotTypeId
          ? updateShotType({
              variables: {
                where: {
                  shotTypeId: data?.shotTypeId,
                },
                update: {
                  name,
                  code,
                },
              },
            })
          : createShotType({
              variables: {
                input: {
                  name,
                  code,

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
      <DialogTitle id="alert-dialog-title">{`Add new shot type to ${rulePack?.name}`}</DialogTitle>
      <DialogContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={classes.form}
          noValidate
          autoComplete="off"
        >
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
        </form>

        <div style={{ margin: '2rem 0' }}>
          {data?.subTypes?.map(st => (
            <SubType
              updateShotType={updateShotType}
              key={st.shotSubTypeId}
              rulePack={rulePack}
              rulePackId={rulePackId}
              shotTypeId={data?.shotTypeId}
              data={st}
              mutationLoadingUpdate={mutationLoadingUpdate}
            />
          ))}
        </div>
        <div style={{ margin: '2rem 0' }}>
          {data?.shotTypeId && newSubType ? (
            <SubType
              updateShotType={updateShotType}
              rulePack={rulePack}
              rulePackId={rulePackId}
              shotTypeId={data?.shotTypeId}
              data={{
                shotSubTypeId: null,
                name: '',
                code: '',
              }}
              mutationLoadingUpdate={mutationLoadingUpdate}
            />
          ) : (
            data?.shotTypeId && (
              <Button
                type="button"
                variant="contained"
                onClick={() => {
                  setNewSubType(true)
                }}
              >
                Add new subType
              </Button>
            )
          )}
        </div>
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
          onClick={() => {
            handleSubmit(onSubmit)()
          }}
          type="button"
          loading={mutationLoadingCreate || mutationLoadingUpdate}
        >
          {mutationLoadingCreate || mutationLoadingUpdate
            ? 'Saving...'
            : 'Save'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

const SubType = props => {
  const {
    rulePackId,
    shotTypeId,
    data,
    updateShotType,
    mutationLoadingUpdate,
  } = props
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const shotSubTypeIdDelete = React.useRef(data?.shotSubTypeId)

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [
    deleteShotSubType,
    { loading: mutationLoadingDeleteShotSubType },
  ] = useMutation(DELETE_SHOT_SUB_TYPE, {
    variables: {
      where: { shotSubTypeId: data?.shotSubTypeId },
    },
    update(cache) {
      try {
        const queryResult = cache.readQuery({
          query: GET_SHOT_TYPES,
          variables: {
            where: { rulePack: { rulePackId } },
            whereRulePack: { rulePackId },
          },
        })

        const shotType = queryResult.shotTypes.find(
          gt => gt.shotTypeId === shotTypeId
        )

        const updatedData = shotType.subTypes.filter(
          p => p.shotSubTypeId !== shotSubTypeIdDelete.current
        )

        const updatedResult = {
          shotTypes: [
            ...queryResult.shotTypes.filter(gt => gt.shotTypeId !== shotTypeId),
            {
              ...shotType,
              subTypes: updatedData,
            },
          ],

          rulePacks: queryResult?.rulePacks,
        }

        cache.writeQuery({
          query: GET_SHOT_TYPES,
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
      enqueueSnackbar(`ShotSubType was deleted!`, {
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

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { name, code } = dataToCheck
        data?.shotSubTypeId
          ? updateShotType({
              variables: {
                where: {
                  shotTypeId,
                },
                update: {
                  subTypes: {
                    where: {
                      shotSubTypeId: data?.shotSubTypeId,
                    },
                    update: {
                      name,
                      code,
                    },
                  },
                },
              },
            })
          : updateShotType({
              variables: {
                where: {
                  shotTypeId,
                },

                create: {
                  subTypes: { node: { name, code } },
                },
              },
            })
      } catch (error) {
        console.error(error)
      }
    },
    [shotTypeId, data]
  )

  return (
    <Container>
      <form
        onSubmit={null}
        className={classes.form}
        noValidate
        autoComplete="off"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={12} lg={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={5} md={5} lg={5}>
                <RHFInput
                  control={control}
                  defaultValue={data?.name || ''}
                  name="name"
                  label="SubType Name"
                  required
                  fullWidth
                  variant="standard"
                  error={errors?.name}
                />
              </Grid>
              <Grid item xs={12} sm={5} md={5} lg={5}>
                <RHFInput
                  control={control}
                  defaultValue={data?.code || ''}
                  name="code"
                  label="SubType Code"
                  required
                  fullWidth
                  variant="standard"
                  error={errors?.code}
                />
              </Grid>

              <Grid item xs={12} sm={1} md={1} lg={1}>
                {data?.shotSubTypeId && (
                  <LoadingButton
                    onClick={() => {
                      deleteShotSubType()
                    }}
                    type="button"
                    loading={mutationLoadingDeleteShotSubType}
                  >
                    {mutationLoadingDeleteShotSubType
                      ? 'Deleting...'
                      : 'Delete'}
                  </LoadingButton>
                )}
              </Grid>

              <Grid item xs={12} sm={1} md={1} lg={1}>
                <LoadingButton
                  onClick={() => {
                    handleSubmit(onSubmit)()
                  }}
                  type="button"
                  loading={mutationLoadingUpdate}
                >
                  {mutationLoadingUpdate ? 'Saving...' : 'Save'}
                </LoadingButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Container>
  )
}

ShotTypes.propTypes = {
  rulePackId: PropTypes.string,
}

export { ShotTypes }
