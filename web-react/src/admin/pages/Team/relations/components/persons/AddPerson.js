import React from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import PropTypes from 'prop-types'

import AddIcon from '@mui/icons-material/Add'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'

import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'
import { Loader } from '../../../../../../components/Loader'
import { Error } from '../../../../../../components/Error'
import { useStyles } from '../../../../commonComponents/styled'
import {
  setIdFromEntityId,
  getXGridValueFromArray,
} from '../../../../../../utils'

export const GET_ALL_PERSONS = gql`
  query getPersons {
    people {
      personId
      name
      firstName
      lastName
      teams {
        teamId
        name
      }
      occupations {
        occupationId
        name
      }
    }
  }
`

const AddPerson = props => {
  const { teamId, team, updateTeam } = props

  const classes = useStyles()

  const [openAddPerson, setOpenAddPerson] = React.useState(false)

  const handleCloseAddPerson = React.useCallback(() => {
    setOpenAddPerson(false)
  }, [])

  const [
    getAllPersons,
    {
      loading: queryAllPersonsLoading,
      error: queryAllPersonsError,
      data: queryAllPersonsData,
    },
  ] = useLazyQuery(GET_ALL_PERSONS, {
    fetchPolicy: 'cache-and-network',
  })

  const handleOpenAddPerson = React.useCallback(() => {
    if (!queryAllPersonsData) {
      getAllPersons()
    }
    setOpenAddPerson(true)
  }, [])

  const allPersonsColumns = React.useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },
      {
        field: 'teams',
        headerName: 'Teams',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.teams, 'name')
        },
      },
      {
        field: 'occupations',
        headerName: 'Occupations',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.occupations, 'name')
        },
      },

      {
        field: 'personId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewPerson
              personId={params.value}
              teamId={teamId}
              team={team}
              updateTeam={updateTeam}
            />
          )
        },
      },
    ],
    [team]
  )

  return (
    <>
      <Button
        type="button"
        onClick={handleOpenAddPerson}
        variant={'outlined'}
        size="small"
        className={classes.submit}
        startIcon={<AddIcon />}
      >
        Add Person
      </Button>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddPerson}
        onClose={handleCloseAddPerson}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllPersonsLoading && !queryAllPersonsError && <Loader />}
        {queryAllPersonsError && !queryAllPersonsLoading && (
          <Error message={queryAllPersonsError.message} />
        )}
        {queryAllPersonsData &&
          !queryAllPersonsLoading &&
          !queryAllPersonsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add new person to ${
                team && team.name
              }`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <DataGridPro
                    columns={allPersonsColumns}
                    rows={setIdFromEntityId(
                      queryAllPersonsData?.people,
                      'personId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllPersonsLoading}
                    components={{
                      Toolbar: GridToolbar,
                    }}
                  />
                </div>
              </DialogContent>
            </>
          )}
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseAddPerson()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const ToggleNewPerson = props => {
  const { personId, teamId, team, updateTeam } = props
  const [isMember, setIsMember] = React.useState(
    !!team.persons.find(p => p.personId === personId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updateTeam({
          variables: {
            where: {
              teamId,
            },
            update: {
              persons: {
                ...(!isMember
                  ? {
                      connect: {
                        where: {
                          node: {
                            personId,
                          },
                        },
                      },
                    }
                  : {
                      disconnect: {
                        where: {
                          node: {
                            personId,
                          },
                        },
                      },
                    }),
              },
            },
          },
        })
        setIsMember(!isMember)
      }}
      name="teamMember"
      color="primary"
      label={isMember ? 'Member' : 'Not member'}
    />
  )
}

ToggleNewPerson.propTypes = {
  personId: PropTypes.string,
  teamId: PropTypes.string,
  team: PropTypes.object,
  removeTeamPerson: PropTypes.func,
  mergeTeamPerson: PropTypes.func,
}

AddPerson.propTypes = {
  teamId: PropTypes.string,
}

export { AddPerson }
