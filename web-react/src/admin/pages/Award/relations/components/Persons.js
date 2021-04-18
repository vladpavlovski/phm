import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AccountBox from '@material-ui/icons/AccountBox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { getAdminPersonRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId, getXGridValueFromArray } from '../../../../../utils'

const REMOVE_AWARD_PERSON = gql`
  mutation removeAwardPerson($awardId: ID!, $personId: ID!) {
    awardPerson: RemoveAwardPerson(
      from: { personId: $personId }
      to: { awardId: $awardId }
    ) {
      from {
        personId
        firstName
        lastName
        name
      }
      to {
        awardId
        name
      }
    }
  }
`

export const GET_ALL_PERSONS = gql`
  query getPersons {
    persons: Person {
      personId
      firstName
      lastName
      name
      teams {
        teamId
        name
      }
      games {
        gameId
        name
      }
      competitions {
        competitionId
        name
      }
      awards {
        awardId
        name
      }
    }
  }
`

const MERGE_AWARD_PERSON = gql`
  mutation mergeAwardPerson($awardId: ID!, $personId: ID!) {
    awardPerson: MergeAwardPerson(
      from: { personId: $personId }
      to: { awardId: $awardId }
    ) {
      from {
        personId
        firstName
        lastName
        name
      }
      to {
        awardId
        name
      }
    }
  }
`

const Persons = props => {
  const { awardId } = props

  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_PERSONS)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { awardId } })
    }
  }, [])

  const awardPersonsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'teamName',
        headerName: 'Team Name',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row?.teams, 'name')
        },
      },

      {
        field: 'gameName',
        headerName: 'Game Name',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row?.games, 'name')
        },
      },
      {
        field: 'competitionName',
        headerName: 'Competition Name',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row?.competition, 'name')
        },
      },
      {
        field: 'hasAward',
        headerName: 'Has award',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleAward
              personId={params.row.personId}
              awardId={awardId}
              person={params.row}
            />
          )
        },
      },

      {
        field: 'personId',
        headerName: 'Profile',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminPersonRoute(params.value)}
              target="_blank"
            >
              Profile
            </LinkButton>
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
        aria-controls="persons-content"
        id="persons-header"
      >
        <Typography className={classes.accordionFormTitle}>Persons</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
            {/* {place for toolbar} */}
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                disableMultipleSelection
                disableSelectionOnClick
                columns={awardPersonsColumns}
                rows={setIdFromEntityId(queryData?.persons, 'personId')}
                loading={queryLoading}
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </div>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

const ToggleAward = props => {
  const { personId, awardId, person } = props
  const [isMember, setIsMember] = useState(
    !!person?.awards?.find(p => p.awardId === awardId)
  )
  const { enqueueSnackbar } = useSnackbar()
  const [mergeAwardPerson] = useMutation(MERGE_AWARD_PERSON, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardPerson.to.name} add to ${data.awardPerson.from.name} person!`,
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

  const [removeAwardPerson] = useMutation(REMOVE_AWARD_PERSON, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardPerson.to.name} remove from ${data.awardPerson.from.name} person`,
        {
          variant: 'info',
        }
      )
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
    },
  })

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            isMember
              ? removeAwardPerson({
                  variables: {
                    awardId,
                    personId,
                  },
                })
              : mergeAwardPerson({
                  variables: {
                    awardId,
                    personId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="personMember"
          color="primary"
        />
      }
      label={isMember ? 'Award' : 'Not award'}
    />
  )
}

ToggleAward.propTypes = {
  personId: PropTypes.string,
  awardId: PropTypes.string,
  award: PropTypes.object,
  remove: PropTypes.func,
  merge: PropTypes.func,
}

Persons.propTypes = {
  awardId: PropTypes.string,
}

export { Persons }
