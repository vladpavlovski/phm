import React, { useCallback, useState, useMemo, useRef } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { v4 as uuidv4 } from 'uuid'
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
import {
  setIdFromEntityId,
  getXGridValueFromArray,
  checkId,
} from '../../../../../utils'

const GET_SHOT_TYPES = gql`
  query getRulePack($rulePackId: ID) {
    rulePack: RulePack(rulePackId: $rulePackId) {
      rulePackId
      name
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

const MERGE_RULEPACK_SHOT_TYPE = gql`
  mutation mergeRulePackShotType(
    $rulePackId: ID!
    $shotTypeId: ID!
    $name: String
    $code: String
  ) {
    shotType: MergeShotType(shotTypeId: $shotTypeId, name: $name, code: $code) {
      shotTypeId
      name
    }
    shotTypeRulePack: MergeShotTypeRulePack(
      from: { rulePackId: $rulePackId }
      to: { shotTypeId: $shotTypeId }
    ) {
      from {
        name
      }
      to {
        shotTypeId
        name
        code
      }
    }
  }
`

const DELETE_SHOT_TYPE = gql`
  mutation deleteShotType($shotTypeId: ID!) {
    deleted: DeleteShotType(shotTypeId: $shotTypeId) {
      shotTypeId
    }
  }
`

const MERGE_SHOT_TYPE_SHOT_SUB_TYPE = gql`
  mutation mergeRulePackShotSubType(
    $shotTypeId: ID!
    $shotSubTypeId: ID!
    $name: String
    $code: String
  ) {
    shotType: MergeShotSubType(
      shotSubTypeId: $shotSubTypeId
      name: $name
      code: $code
    ) {
      shotSubTypeId
      name
    }
    shotTypeShotSubType: MergeShotSubTypeShotType(
      from: { shotTypeId: $shotTypeId }
      to: { shotSubTypeId: $shotSubTypeId }
    ) {
      from {
        name
      }
      to {
        shotSubTypeId
        name
        code
      }
    }
  }
`

const DELETE_SHOT_SUB_TYPE = gql`
  mutation deleteShotSubType($shotSubTypeId: ID!) {
    deleted: DeleteShotSubType(shotSubTypeId: $shotSubTypeId) {
      shotSubTypeId
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
    fetchPolicy: 'cache-and-network',
  })

  const rulePack = queryData?.rulePack?.[0]

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { rulePackId } })
    }
  }, [])

  const handleOpenDialog = useCallback(data => {
    formData.current = data
    setOpenDialog(true)
  }, [])

  const [deleteShotType, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_SHOT_TYPE,
    {
      update(cache, { data: { deleted } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_SHOT_TYPES,
            variables: {
              rulePackId,
            },
          })
          const updatedData = queryResult.rulePack[0].shotTypes.filter(
            p => p.shotTypeId !== deleted.shotTypeId
          )

          const updatedResult = {
            rulePack: [
              {
                ...queryResult.rulePack[0],
                shotTypes: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_SHOT_TYPES,
            data: updatedResult,
            variables: {
              rulePackId,
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
              onDialogClosePositive={() =>
                deleteShotType({
                  variables: {
                    shotTypeId: params.row.shotTypeId,
                  },
                })
              }
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
                rows={setIdFromEntityId(rulePack.shotTypes, 'shotTypeId')}
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
        rulePack={rulePack}
        rulePackId={rulePackId}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        data={rulePack?.shotTypes?.find(
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

  const [
    mergeRulePackShotType,
    { loading: loadingMergeShotType },
  ] = useMutation(MERGE_RULEPACK_SHOT_TYPE, {
    update(cache, { data: { shotTypeRulePack } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_SHOT_TYPES,
          variables: {
            rulePackId,
          },
        })

        const existingData = queryResult.rulePack[0].shotTypes
        const newItem = shotTypeRulePack.to
        let updatedData = []
        if (existingData.find(ed => ed.shotTypeId === newItem.shotTypeId)) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.shotTypeId === newItem.shotTypeId ? newItem : ed
          )
        } else {
          // add new item if item not in array
          updatedData = [newItem, ...existingData]
        }

        const updatedResult = {
          rulePack: [
            {
              ...queryResult.rulePack[0],
              shotTypes: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_SHOT_TYPES,
          data: updatedResult,
          variables: {
            rulePackId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.shotTypeRulePack.to.name} added to ${rulePack.name}!`,
        {
          variant: 'success',
        }
      )
      handleCloseDialog()
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

        mergeRulePackShotType({
          variables: {
            rulePackId,
            name,
            code,
            shotTypeId: data?.shotTypeId || uuidv4(),
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
              key={st.shotSubTypeId}
              rulePack={rulePack}
              rulePackId={rulePackId}
              shotTypeId={data?.shotTypeId}
              setNewSubType={setNewSubType}
              data={st}
            />
          ))}
        </div>
        <div style={{ margin: '2rem 0' }}>
          {data?.shotTypeId && newSubType ? (
            <SubType
              rulePack={rulePack}
              rulePackId={rulePackId}
              shotTypeId={data?.shotTypeId}
              setNewSubType={setNewSubType}
              data={{
                shotSubTypeId: null,
                name: '',
                code: '',
              }}
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
          pending={loadingMergeShotType}
        >
          {loadingMergeShotType ? 'Saving...' : 'Save'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

const SubType = props => {
  const { rulePack, rulePackId, shotTypeId, data, setNewSubType } = props
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [
    mergeShotTypeShotSubType,
    { loading: loadingMergeShotSubType },
  ] = useMutation(MERGE_SHOT_TYPE_SHOT_SUB_TYPE, {
    update(cache, { data: { shotTypeShotSubType } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_SHOT_TYPES,
          variables: {
            rulePackId,
          },
        })

        const shotType = queryResult.rulePack[0].shotTypes.find(
          gt => gt.shotTypeId === shotTypeId
        )
        const existingData = shotType.subTypes
        const newItem = shotTypeShotSubType.to

        let updatedData = []
        if (
          existingData.find(ed => ed.shotSubTypeId === newItem.shotSubTypeId)
        ) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.shotSubTypeId === newItem.shotSubTypeId ? newItem : ed
          )
        } else {
          // add new item if item not in array
          updatedData = [...existingData, newItem]
        }

        const updatedResult = {
          rulePack: [
            {
              ...queryResult.rulePack[0],
              shotTypes: [
                ...queryResult.rulePack[0].shotTypes.filter(
                  gt => gt.shotTypeId !== shotTypeId
                ),
                { ...shotType, subTypes: updatedData },
              ],
            },
          ],
        }
        cache.writeQuery({
          query: GET_SHOT_TYPES,
          data: updatedResult,
          variables: {
            rulePackId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.shotTypeShotSubType.to.name} added to ${rulePack.name}!`,
        {
          variant: 'success',
        }
      )
      setNewSubType(false)
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const [
    deleteShotSubType,
    { loading: mutationLoadingDeleteShotSubType },
  ] = useMutation(DELETE_SHOT_SUB_TYPE, {
    variables: {
      shotSubTypeId: data?.shotSubTypeId,
    },
    update(cache, { data: { deleted } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_SHOT_TYPES,
          variables: {
            rulePackId,
          },
        })

        const shotType = queryResult.rulePack[0].shotTypes.find(
          gt => gt.shotTypeId === shotTypeId
        )

        const updatedData = shotType.subTypes.filter(
          p => p.shotSubTypeId !== deleted.shotSubTypeId
        )

        const updatedResult = {
          rulePack: [
            {
              ...queryResult.rulePack[0],
              shotTypes: [
                ...queryResult.rulePack[0].shotTypes.filter(
                  gt => gt.shotTypeId !== shotTypeId
                ),
                {
                  ...shotType,
                  subTypes: updatedData,
                },
              ],
            },
          ],
        }
        cache.writeQuery({
          query: GET_SHOT_TYPES,
          data: updatedResult,
          variables: {
            rulePackId,
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

        mergeShotTypeShotSubType({
          variables: {
            shotTypeId,
            name,
            code,
            shotSubTypeId: checkId(data?.shotSubTypeId || 'new'),
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
                    pending={mutationLoadingDeleteShotSubType}
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
                  pending={loadingMergeShotSubType}
                >
                  {loadingMergeShotSubType ? 'Saving...' : 'Save'}
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
