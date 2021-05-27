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

const GET_INJURY_TYPES = gql`
  query getRulePack($rulePackId: ID) {
    rulePack: RulePack(rulePackId: $rulePackId) {
      rulePackId
      name
      injuryTypes {
        injuryTypeId
        name
      }
    }
  }
`

const MERGE_RULEPACK_INJURY_TYPE = gql`
  mutation mergeRulePackInjuryType(
    $rulePackId: ID!
    $injuryTypeId: ID!
    $name: String
  ) {
    injuryType: MergeInjuryType(injuryTypeId: $injuryTypeId, name: $name) {
      injuryTypeId
      name
    }
    injuryTypeRulePack: MergeInjuryTypeRulePack(
      from: { rulePackId: $rulePackId }
      to: { injuryTypeId: $injuryTypeId }
    ) {
      from {
        name
      }
      to {
        injuryTypeId
        name
      }
    }
  }
`

const DELETE_INJURY_TYPE = gql`
  mutation deleteInjuryType($injuryTypeId: ID!) {
    deleted: DeleteInjuryType(injuryTypeId: $injuryTypeId) {
      injuryTypeId
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
})

const InjuryTypes = props => {
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
  ] = useLazyQuery(GET_INJURY_TYPES, {
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

  const [deleteInjuryType, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_INJURY_TYPE,
    {
      update(cache, { data: { deleted } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_INJURY_TYPES,
            variables: {
              rulePackId,
            },
          })
          const updatedData = queryResult.rulePack[0].injuryTypes.filter(
            p => p.injuryTypeId !== deleted.injuryTypeId
          )

          const updatedResult = {
            rulePack: [
              {
                ...queryResult.rulePack[0],
                injuryTypes: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_INJURY_TYPES,
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

  const rulePackInjuryTypesColumns = useMemo(
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
              size="small"
              startIcon={<DeleteForeverIcon />}
              dialogTitle={'Do you really want to delete this injury type?'}
              dialogDescription={'Injury type will be completely delete'}
              dialogNegativeText={'No, keep it'}
              dialogPositiveText={'Yes, delete it'}
              onDialogClosePositive={() =>
                deleteInjuryType({
                  variables: {
                    injuryTypeId: params.row.injuryTypeId,
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
              <XGrid
                columns={rulePackInjuryTypesColumns}
                rows={setIdFromEntityId(rulePack.injuryTypes, 'injuryTypeId')}
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
    mergeRulePackInjuryType,
    { loading: loadingMergeInjuryType },
  ] = useMutation(MERGE_RULEPACK_INJURY_TYPE, {
    update(cache, { data: { injuryTypeRulePack } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_INJURY_TYPES,
          variables: {
            rulePackId,
          },
        })

        const existingData = queryResult.rulePack[0].injuryTypes
        const newItem = injuryTypeRulePack.to
        let updatedData = []
        if (existingData.find(ed => ed.injuryTypeId === newItem.injuryTypeId)) {
          // replace if item exist in array
          updatedData = existingData.map(ed =>
            ed.injuryTypeId === newItem.injuryTypeId ? newItem : ed
          )
        } else {
          // add new item if item not in array
          updatedData = [newItem, ...existingData]
        }

        const updatedResult = {
          rulePack: [
            {
              ...queryResult.rulePack[0],
              injuryTypes: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_INJURY_TYPES,
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
        `${data.injuryTypeRulePack.to.name} added to ${rulePack.name}!`,
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

        mergeRulePackInjuryType({
          variables: {
            rulePackId,
            name,
            code,
            injuryTypeId: data?.injuryTypeId || uuidv4(),
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
        <DialogTitle id="alert-dialog-title">{`Add new injury type to ${rulePack?.name}`}</DialogTitle>
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
          <LoadingButton type="submit" loading={loadingMergeInjuryType}>
            {loadingMergeInjuryType ? 'Saving...' : 'Save'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

InjuryTypes.propTypes = {
  rulePackId: PropTypes.string,
}

export { InjuryTypes }
