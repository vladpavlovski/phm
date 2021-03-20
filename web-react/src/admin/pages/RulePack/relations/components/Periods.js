import React, { useCallback, useState, useMemo, useRef } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { v4 as uuidv4 } from 'uuid'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { object, string, number } from 'yup'

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
import { setIdFromEntityId, showTimeAsMinutes } from '../../../../../utils'

const GET_PERIODS = gql`
  query getRulePack($rulePackId: ID) {
    rulePack: RulePack(rulePackId: $rulePackId) {
      rulePackId
      name
      periods {
        periodId
        name
        code
        duration
      }
    }
  }
`

const MERGE_RULEPACK_PERIOD = gql`
  mutation mergeRulePackPeriod(
    $rulePackId: ID!
    $periodId: ID!
    $name: String
    $code: String
    $duration: Int
  ) {
    period: MergePeriod(
      periodId: $periodId
      name: $name
      code: $code
      duration: $duration
    ) {
      periodId
      name
    }
    periodRulePack: MergePeriodRulePack(
      from: { rulePackId: $rulePackId }
      to: { periodId: $periodId }
    ) {
      from {
        name
      }
      to {
        periodId
        name
        code
        duration
      }
    }
  }
`

const DELETE_PERIOD = gql`
  mutation deletePeriod($periodId: ID!) {
    deleted: DeletePeriod(periodId: $periodId) {
      periodId
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  code: string(),
  duration: number().integer().positive().required('Duration is required'),
})

const Periods = props => {
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
  ] = useLazyQuery(GET_PERIODS, {
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

  const [deletePeriod, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_PERIOD,
    {
      update(cache, { data: { deleted } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_PERIODS,
            variables: {
              rulePackId,
            },
          })
          const updatedData = queryResult.rulePack[0].periods.filter(
            p => p.periodId !== deleted.periodId
          )

          const updatedResult = {
            rulePack: [
              {
                ...queryResult.rulePack[0],
                periods: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_PERIODS,
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
        enqueueSnackbar(`Period was deleted!`, {
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

  const rulePackPeriodsColumns = useMemo(
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
        field: 'duration',
        headerName: 'Duration',
        width: 200,
        valueFormatter: params => {
          return showTimeAsMinutes(params.value)
        },
      },
      {
        field: 'periodId',
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
              dialogTitle={'Do you really want to delete this period?'}
              dialogDescription={'Period will be completely delete'}
              dialogNegativeText={'No, keep period'}
              dialogPositiveText={'Yes, delete period'}
              onDialogClosePositive={() =>
                deletePeriod({
                  variables: {
                    periodId: params.row.periodId,
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
        aria-controls="periods-content"
        id="periods-header"
      >
        <Typography className={classes.accordionFormTitle}>Periods</Typography>
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
                columns={rulePackPeriodsColumns}
                rows={setIdFromEntityId(rulePack.periods, 'periodId')}
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

  const [mergeRulePackPeriod, { loading: loadingMergePeriod }] = useMutation(
    MERGE_RULEPACK_PERIOD,
    {
      update(cache, { data: { periodRulePack } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_PERIODS,
            variables: {
              rulePackId,
            },
          })

          const existingData = queryResult.rulePack[0].periods
          const newItem = periodRulePack.to
          let updatedData = []
          if (existingData.find(ed => ed.periodId === newItem.periodId)) {
            // replace if item exist in array
            updatedData = existingData.map(ed =>
              ed.periodId === newItem.periodId ? newItem : ed
            )
          } else {
            // add new item if item not in array
            updatedData = [newItem, ...existingData]
          }

          const updatedResult = {
            rulePack: [
              {
                ...queryResult.rulePack[0],
                periods: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_PERIODS,
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
          `${data.periodRulePack.to.name} saved to ${rulePack.name}!`,
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
    }
  )

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { name, duration, code } = dataToCheck

        mergeRulePackPeriod({
          variables: {
            rulePackId,
            name,
            code,
            duration: !isNaN(parseInt(duration)) && parseInt(duration),
            periodId: data?.periodId || uuidv4(),
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
        <DialogTitle id="alert-dialog-title">{`Add new period to ${rulePack?.name}`}</DialogTitle>
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
                      defaultValue={data?.duration || ''}
                      name="duration"
                      label="Duration in minutes"
                      required
                      fullWidth
                      variant="standard"
                      error={errors?.duration}
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
          <LoadingButton type="submit" pending={loadingMergePeriod}>
            {loadingMergePeriod ? 'Saving...' : 'Save'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

Periods.propTypes = {
  rulePackId: PropTypes.string,
}

export { Periods }
