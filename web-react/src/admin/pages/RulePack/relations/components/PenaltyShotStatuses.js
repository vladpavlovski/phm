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

const GET_PENALTY_SHOT_STATUSES = gql`
  query getRulePack($rulePackId: ID) {
    rulePack: RulePack(rulePackId: $rulePackId) {
      rulePackId
      name
      penaltyShotStatuses {
        penaltyShotStatusId
        name
        code
      }
    }
  }
`

const GET_RULEPACK_PENALTY_SHOT_STATUS = gql`
  mutation mergeRulePackPenaltyShotStatus(
    $rulePackId: ID!
    $penaltyShotStatusId: ID!
    $name: String
    $code: String
  ) {
    penaltyShotStatus: MergePenaltyShotStatus(
      penaltyShotStatusId: $penaltyShotStatusId
      name: $name
      code: $code
    ) {
      penaltyShotStatusId
      name
    }
    penaltyShotStatusRulePack: MergePenaltyShotStatusRulePack(
      from: { rulePackId: $rulePackId }
      to: { penaltyShotStatusId: $penaltyShotStatusId }
    ) {
      from {
        name
      }
      to {
        penaltyShotStatusId
        name
        code
      }
    }
  }
`

const DELETE_PENALTY_SHOT_STATUS = gql`
  mutation deletePenaltyShotStatus($penaltyShotStatusId: ID!) {
    deleted: DeletePenaltyShotStatus(
      penaltyShotStatusId: $penaltyShotStatusId
    ) {
      penaltyShotStatusId
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  code: string().required('Code is required'),
})

const PenaltyShotStatuses = props => {
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
  ] = useLazyQuery(GET_PENALTY_SHOT_STATUSES, {
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

  const [
    deletePenaltyShotStatus,
    { loading: mutationLoadingRemove },
  ] = useMutation(DELETE_PENALTY_SHOT_STATUS, {
    update(cache, { data: { deleted } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_PENALTY_SHOT_STATUSES,
          variables: {
            rulePackId,
          },
        })
        const updatedData = queryResult.rulePack[0].penaltyShotStatuses.filter(
          p => p.penaltyShotStatusId !== deleted.penaltyShotStatusId
        )

        const updatedResult = {
          rulePack: [
            {
              ...queryResult.rulePack[0],
              penaltyShotStatuses: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_PENALTY_SHOT_STATUSES,
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

  const rulePackPenaltyShotStatusesColumns = useMemo(
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
              size="small"
              startIcon={<DeleteForeverIcon />}
              dialogTitle={
                'Do you really want to delete this penalty shot status?'
              }
              dialogDescription={
                'Penalty shot status will be completely delete'
              }
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() =>
                deletePenaltyShotStatus({
                  variables: {
                    penaltyShotStatusId: params.row.penaltyShotStatusId,
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
              <XGrid
                columns={rulePackPenaltyShotStatusesColumns}
                rows={setIdFromEntityId(
                  rulePack.penaltyShotStatuses,
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
    mergeRulePackPenaltyShotStatus,
    { loading: loadingMergePenaltyShotStatus },
  ] = useMutation(GET_RULEPACK_PENALTY_SHOT_STATUS, {
    update(cache, { data: { penaltyShotStatusRulePack } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_PENALTY_SHOT_STATUSES,
          variables: {
            rulePackId,
          },
        })

        const existingData = queryResult.rulePack[0].penaltyShotStatuses
        const newItem = penaltyShotStatusRulePack.to
        let updatedData = []
        if (
          existingData.find(
            ed => ed.penaltyShotStatusId === newItem.penaltyShotStatusId
          )
        ) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.penaltyShotStatusId === newItem.penaltyShotStatusId
              ? newItem
              : ed
          )
        } else {
          // add new item if item not in array
          updatedData = [newItem, ...existingData]
        }

        const updatedResult = {
          rulePack: [
            {
              ...queryResult.rulePack[0],
              penaltyShotStatuses: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_PENALTY_SHOT_STATUSES,
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
        `${data.penaltyShotStatusRulePack.to.name} added to ${rulePack.name}!`,
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

        mergeRulePackPenaltyShotStatus({
          variables: {
            rulePackId,
            name,
            code,
            penaltyShotStatusId: data?.penaltyShotStatusId || uuidv4(),
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
        <DialogTitle id="alert-dialog-title">{`Add new penalty shot status to ${rulePack?.name}`}</DialogTitle>
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
            onClick={() => {
              handleCloseDialog()
            }}
          >
            {'Cancel'}
          </Button>
          <LoadingButton type="submit" pending={loadingMergePenaltyShotStatus}>
            {loadingMergePenaltyShotStatus ? 'Saving...' : 'Save'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

PenaltyShotStatuses.propTypes = {
  rulePackId: PropTypes.string,
}

export { PenaltyShotStatuses }
