import React, { useCallback, useState, useMemo } from 'react'
import { gql, useMutation, MutationFunction } from '@apollo/client'

import { useSnackbar } from 'notistack'

import AddIcon from '@mui/icons-material/Add'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'

import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'
import { useStyles } from '../../../../commonComponents/styled'
import { setIdFromEntityId } from 'utils'

import { OrganizationPersonsContext } from './index'
import { Person, Organization } from 'utils/types'

const MERGE_PERSON_OCCUPATION = gql`
  mutation mergePersonOccupation($personId: ID!, $occupationId: ID!) {
    mergePersonOccupation: MergePersonOccupations(
      from: { personId: $personId }
      to: { occupationId: $occupationId }
    ) {
      from {
        personId
        firstName
        lastName
        name
        occupations {
          occupationId
          name
        }
      }
      to {
        occupationId
        name
      }
    }
  }
`

const REMOVE_PERSON_OCCUPATION = gql`
  mutation removePersonOccupation($personId: ID!, $occupationId: ID!) {
    removePersonOccupation: RemovePersonOccupations(
      from: { personId: $personId }
      to: { occupationId: $occupationId }
    ) {
      from {
        personId
        firstName
        lastName
        name
        occupations {
          occupationId
          name
        }
      }
      to {
        occupationId
        name
      }
    }
  }
`

type TSetPersonOccupation = {
  person: Person
}

export const SetPersonOccupation: React.FC<TSetPersonOccupation> = React.memo(
  props => {
    const { person } = props
    const classes = useStyles()

    const { update } = React.useContext(OrganizationPersonsContext)

    return (
      <Button
        type="button"
        onClick={() => {
          update({ personData: person, personOccupationDialogOpen: true })
        }}
        variant={'outlined'}
        size="small"
        className={classes.submit}
        startIcon={<AddIcon />}
      >
        Set Occupation
      </Button>
    )
  }
)

type TPersonOccupationDialog = {
  organization: Organization
}

export const PersonOccupationDialog: React.FC<TPersonOccupationDialog> =
  props => {
    const { organization } = props
    const { enqueueSnackbar } = useSnackbar()
    const classes = useStyles()
    const {
      // personOccupationDialogOpen,
      // setPersonOccupationDialogOpen,
      // personData: person,
      // setPersonData,
      state,
      update,
    } = React.useContext(OrganizationPersonsContext)

    const handleCloseDialog = useCallback(() => {
      update({ personData: null, personOccupationDialogOpen: false })
    }, [])

    const [mergePersonOccupation] = useMutation(MERGE_PERSON_OCCUPATION, {
      // update(cache, { data: { mergePersonOccupation } }) {
      //   try {
      //     const queryResult = cache.readQuery({
      //       query: GET_ORGANIZATION,
      //       variables: {
      //         organizationId,
      //       },
      //     })

      //     const existingData = queryResult?.organization?.[0].persons
      //     const updatedPerson = mergePersonOccupation.from

      //     let updatedData = []
      //     if (existingData.find(ed => ed.personId === updatedPerson.personId)) {
      //       // replace if item exist in array
      //       updatedData = existingData.map(ed =>
      //         ed.personId === updatedPerson.personId ? updatedPerson : ed
      //       )
      //     }

      //     const updatedResult = {
      //       organization: [
      //         {
      //           ...queryResult.organization[0],
      //           persons: updatedData,
      //         },
      //       ],
      //     }
      //     cache.writeQuery({
      //       query: GET_ORGANIZATION,
      //       data: updatedResult,
      //       variables: {
      //         organizationId,
      //       },
      //     })
      //   } catch (error) {
      //     console.error(error)
      //   }
      // },
      onCompleted: data => {
        enqueueSnackbar(
          `${data.mergePersonOccupation.from.name} now is ${data.mergePersonOccupation.to.name} for ${organization?.name}!`,
          {
            variant: 'success',
          }
        )
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    })

    const [removePersonOccupation] = useMutation(REMOVE_PERSON_OCCUPATION, {
      // update(cache, { data: { removePersonOccupation } }) {
      //   try {
      //     const queryResult = cache.readQuery({
      //       query: GET_ORGANIZATION,
      //       variables: {
      //         organizationId,
      //       },
      //     })
      //     const existingData = queryResult?.organization?.[0].persons
      //     const updatedPerson = removePersonOccupation.from

      //     let updatedData = []
      //     if (existingData.find(ed => ed.personId === updatedPerson.personId)) {
      //       // replace if item exist in array
      //       updatedData = existingData.map(ed =>
      //         ed.personId === updatedPerson.personId ? updatedPerson : ed
      //       )
      //     }

      //     const updatedResult = {
      //       organization: [
      //         {
      //           ...queryResult.organization[0],
      //           persons: updatedData,
      //         },
      //       ],
      //     }
      //     cache.writeQuery({
      //       query: GET_ORGANIZATION,
      //       data: updatedResult,
      //       variables: {
      //         organizationId,
      //       },
      //     })
      //   } catch (error) {
      //     console.error(error)
      //   }
      // },
      onCompleted: data => {
        enqueueSnackbar(
          `${data?.removePersonOccupation?.from?.name} not anymore ${data?.removePersonOccupation?.to?.name} for ${organization?.name}!`,
          {
            variant: 'info',
          }
        )
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    })

    const organizationOccupationsColumns = useMemo<GridColumns>(
      () => [
        {
          field: 'name',
          headerName: 'Name',
          width: 200,
        },
        {
          field: 'occupationId',
          headerName: 'Has Occupation',
          width: 250,
          disableColumnMenu: true,
          renderCell: params => {
            return (
              state.personData && (
                <ToggleOccupation
                  occupationId={params.value}
                  person={state.personData}
                  merge={mergePersonOccupation}
                  remove={removePersonOccupation}
                />
              )
            )
          },
        },
      ],
      [state]
    )
    return (
      <Dialog
        fullWidth
        maxWidth="md"
        open={state?.personOccupationDialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {organization?.occupations && (
          <>
            <DialogTitle id="alert-dialog-title">{`Set ${state?.personData?.name} occupations for ${organization?.name}`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600 }} className={classes.xGridDialog}>
                <DataGridPro
                  columns={organizationOccupationsColumns}
                  rows={setIdFromEntityId(
                    organization?.occupations,
                    'occupationId'
                  )}
                  disableSelectionOnClick
                  components={{
                    Toolbar: GridToolbar,
                  }}
                />
              </div>
            </DialogContent>
          </>
        )}
        <DialogActions>
          <Button onClick={handleCloseDialog}>{'Done'}</Button>
        </DialogActions>
      </Dialog>
    )
  }

type TToggleOccupation = {
  occupationId: string
  person: Person
  remove: MutationFunction
  merge: MutationFunction
}

const ToggleOccupation: React.FC<TToggleOccupation> = props => {
  const { occupationId, person, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!person?.occupations?.find(p => p.occupationId === occupationId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        isMember
          ? remove({
              variables: {
                occupationId,
                personId: person.personId,
              },
            })
          : merge({
              variables: {
                occupationId,
                personId: person.personId,
              },
            })
        setIsMember(!isMember)
      }}
      name="organizationMember"
      color="primary"
    />
  )
}
