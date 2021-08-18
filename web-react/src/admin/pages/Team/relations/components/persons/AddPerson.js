import React from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import PropTypes from 'prop-types'

import AddIcon from '@material-ui/icons/Add'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'
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
      name
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
                  <XGrid
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
    <FormControlLabel
      control={
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
        />
      }
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
