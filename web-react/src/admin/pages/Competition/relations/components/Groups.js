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
import { setIdFromEntityId, decomposeNumber } from '../../../../../utils'

const GET_GROUPS = gql`
  query getCompetition($competitionId: ID) {
    competition: Competition(competitionId: $competitionId) {
      competitionId
      name
      groups {
        groupId
        name
        nick
        short
        teamsLimit
      }
    }
  }
`

const MERGE_COMPETITION_GROUP = gql`
  mutation mergeCompetitionGroup(
    $competitionId: ID!
    $groupId: ID!
    $name: String
    $nick: String
    $short: String
    $teamsLimit: Int
  ) {
    group: MergeGroup(
      groupId: $groupId
      name: $name
      nick: $nick
      short: $short
      teamsLimit: $teamsLimit
    ) {
      groupId
      name
    }
    groupCompetition: MergeGroupCompetition(
      from: { competitionId: $competitionId }
      to: { groupId: $groupId }
    ) {
      from {
        name
      }
      to {
        groupId
        name
        nick
        short
        teamsLimit
      }
    }
  }
`

const DELETE_GROUP = gql`
  mutation deleteGroup($groupId: ID!) {
    deleted: DeleteGroup(groupId: $groupId) {
      groupId
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  nick: string(),
  short: string(),
  teamsLimit: number().integer().positive().required('Teams limit is required'),
})

const Groups = props => {
  const { competitionId } = props

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
  ] = useLazyQuery(GET_GROUPS, {
    fetchPolicy: 'cache-and-network',
  })

  const competition = queryData?.competition?.[0]

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { competitionId } })
    }
  }, [])

  const handleOpenDialog = useCallback(data => {
    formData.current = data
    setOpenDialog(true)
  }, [])

  const [deleteGroup, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_GROUP,
    {
      update(cache, { data: { deleted } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_GROUPS,
            variables: {
              competitionId,
            },
          })
          const updatedData = queryResult.competition[0].groups.filter(
            p => p.groupId !== deleted.groupId
          )

          const updatedResult = {
            competition: [
              {
                ...queryResult.competition[0],
                groups: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_GROUPS,
            data: updatedResult,
            variables: {
              competitionId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        enqueueSnackbar(`Group was deleted!`, {
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

  const competitionGroupsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },

      {
        field: 'nick',
        headerName: 'Nick',
        width: 100,
      },
      {
        field: 'short',
        headerName: 'Short',
        width: 100,
      },
      {
        field: 'teamsLimit',
        headerName: 'Teams Limit',
        width: 150,
      },
      {
        field: 'groupId',
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
              dialogTitle={'Do you really want to delete this group?'}
              dialogDescription={'Group will be completely delete'}
              dialogNegativeText={'No, keep group'}
              dialogPositiveText={'Yes, delete group'}
              onDialogClosePositive={() =>
                deleteGroup({
                  variables: {
                    groupId: params.row.groupId,
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
        aria-controls="groups-content"
        id="groups-header"
      >
        <Typography className={classes.accordionFormTitle}>Groups</Typography>
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
                columns={competitionGroupsColumns}
                rows={setIdFromEntityId(competition.groups, 'groupId')}
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
        competition={competition}
        competitionId={competitionId}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        data={formData.current}
      />
    </Accordion>
  )
}

const FormDialog = props => {
  const {
    competition,
    competitionId,
    openDialog,
    handleCloseDialog,
    data,
  } = props

  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [mergeCompetitionGroup, { loading: loadingMergeGroup }] = useMutation(
    MERGE_COMPETITION_GROUP,
    {
      update(cache, { data: { groupCompetition } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_GROUPS,
            variables: {
              competitionId,
            },
          })

          const existingData = queryResult.competition[0].groups
          const newItem = groupCompetition.to
          let updatedData = []
          if (existingData.find(ed => ed.groupId === newItem.groupId)) {
            // replace if item exist in array
            updatedData = existingData.map(ed =>
              ed.groupId === newItem.groupId ? newItem : ed
            )
          } else {
            // add new item if item not in array
            updatedData = [newItem, ...existingData]
          }

          const updatedResult = {
            competition: [
              {
                ...queryResult.competition[0],
                groups: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_GROUPS,
            data: updatedResult,
            variables: {
              competitionId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: data => {
        enqueueSnackbar(
          `${data.groupCompetition.to.name} added to ${competition.name}!`,
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
        const { teamsLimit, ...rest } = dataToCheck

        mergeCompetitionGroup({
          variables: {
            ...rest,
            teamsLimit: decomposeNumber(teamsLimit),
            competitionId,
            groupId: data?.groupId || uuidv4(),
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    [competitionId, data]
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
        <DialogTitle id="alert-dialog-title">{`Add new group to ${competition?.name}`}</DialogTitle>
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

                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={data?.nick}
                      control={control}
                      name="nick"
                      label="Nick"
                      fullWidth
                      variant="standard"
                      error={errors?.nick}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={data?.short}
                      control={control}
                      name="short"
                      label="Short"
                      fullWidth
                      variant="standard"
                      error={errors?.short}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={data?.teamsLimit}
                      control={control}
                      name="teamsLimit"
                      label="Teams Limit"
                      fullWidth
                      required
                      variant="standard"
                      error={errors?.teamsLimit}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </DialogContent>

        <DialogActions>
          <Button type="button" onClick={handleCloseDialog}>
            {'Cancel'}
          </Button>
          <LoadingButton type="submit" pending={loadingMergeGroup}>
            {loadingMergeGroup ? 'Saving...' : 'Save'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

Groups.propTypes = {
  competitionId: PropTypes.string,
}

export { Groups }
