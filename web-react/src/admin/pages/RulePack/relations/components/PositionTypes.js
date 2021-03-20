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
import { setIdFromEntityId } from '../../../../../utils'

const GET_POSITION_TYPES = gql`
  query getRulePack($rulePackId: ID) {
    rulePack: RulePack(rulePackId: $rulePackId) {
      rulePackId
      name
      positionTypes {
        positionTypeId
        name
        code
        description
      }
    }
  }
`

const MERGE_RULEPACK_POSITION_TYPE = gql`
  mutation mergeRulePackPositionType(
    $rulePackId: ID!
    $positionTypeId: ID!
    $name: String!
    $code: String
    $description: String
  ) {
    positionType: MergePositionType(
      positionTypeId: $positionTypeId
      name: $name
      code: $code
      description: $description
    ) {
      positionTypeId
      name
    }
    positionTypeRulePack: MergePositionTypeRulePack(
      from: { rulePackId: $rulePackId }
      to: { positionTypeId: $positionTypeId }
    ) {
      from {
        name
      }
      to {
        positionTypeId
        name
        code
        description
      }
    }
  }
`

const DELETE_POSITION_TYPE = gql`
  mutation deletePositionType($positionTypeId: ID!) {
    deleted: DeletePositionType(positionTypeId: $positionTypeId) {
      positionTypeId
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  description: string(),
  code: string(),
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

  const [deletePositionType, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_POSITION_TYPE,
    {
      update(cache, { data: { deleted } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_POSITION_TYPES,
            variables: {
              rulePackId,
            },
          })
          const updatedData = queryResult.rulePack[0].positionTypes.filter(
            p => p.positionTypeId !== deleted.positionTypeId
          )

          const updatedResult = {
            rulePack: [
              {
                ...queryResult.rulePack[0],
                positionTypes: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_POSITION_TYPES,
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
        field: 'code',
        headerName: 'Code',
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
              onDialogClosePositive={() =>
                deletePositionType({
                  variables: {
                    positionTypeId: params.row.positionTypeId,
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
                columns={rulePackPositionTypesColumns}
                rows={setIdFromEntityId(
                  rulePack.positionTypes,
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
        rulePack={rulePack}
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

  const [
    mergeRulePackPositionType,
    { loading: loadingMergePositionType },
  ] = useMutation(MERGE_RULEPACK_POSITION_TYPE, {
    update(cache, { data: { positionTypeRulePack } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_POSITION_TYPES,
          variables: {
            rulePackId,
          },
        })

        const existingData = queryResult.rulePack[0].positionTypes
        const newItem = positionTypeRulePack.to

        let updatedData = []
        if (
          existingData.find(ed => ed.positionTypeId === newItem.positionTypeId)
        ) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.positionTypeId === newItem.positionTypeId ? newItem : ed
          )
        } else {
          // add new item if item not in array
          updatedData = [newItem, ...existingData]
        }

        const updatedResult = {
          rulePack: [
            {
              ...queryResult.rulePack[0],
              positionTypes: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_POSITION_TYPES,
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
        `${data.positionTypeRulePack.to.name} saved to ${rulePack.name}!`,
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
        mergeRulePackPositionType({
          variables: {
            rulePackId,
            ...dataToCheck,
            positionTypeId: data?.positionTypeId || uuidv4(),
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
            onClick={() => {
              handleCloseDialog()
            }}
          >
            {'Cancel'}
          </Button>
          <LoadingButton type="submit" pending={loadingMergePositionType}>
            {loadingMergePositionType ? 'Saving...' : 'Save'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

PositionTypes.propTypes = {
  rulePackId: PropTypes.string,
}

export { PositionTypes }
