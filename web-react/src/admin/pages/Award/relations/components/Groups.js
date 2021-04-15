import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const REMOVE_AWARD_GROUP = gql`
  mutation removeAwardGroup($awardId: ID!, $groupId: ID!) {
    awardGroup: RemoveAwardGroups(
      from: { awardId: $awardId }
      to: { groupId: $groupId }
    ) {
      from {
        awardId
        name
      }
      to {
        groupId
        name
      }
    }
  }
`

export const GET_ALL_GROUPS = gql`
  query getGroups {
    groups: Group {
      groupId
      name
      nick
      competition {
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

const MERGE_AWARD_GROUP = gql`
  mutation mergeAwardGroup($awardId: ID!, $groupId: ID!) {
    awardGroup: MergeAwardGroups(
      from: { awardId: $awardId }
      to: { groupId: $groupId }
    ) {
      from {
        awardId
        name
      }
      to {
        groupId
        name
      }
    }
  }
`

const Groups = props => {
  const { awardId } = props

  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_GROUPS)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { awardId } })
    }
  }, [])

  const awardGroupsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Group Name',
        width: 150,
      },

      {
        field: 'competitionName',
        headerName: 'Competition Name',
        width: 200,
        valueGetter: params => params.row?.competition?.name,
      },
      {
        field: 'hasAward',
        headerName: 'Has award',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleAward
              groupId={params.row.groupId}
              awardId={awardId}
              group={params.row}
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
            {/* {place for toolbar} */}
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                disableMultipleSelection
                disableSelectionOnClick
                columns={awardGroupsColumns}
                rows={setIdFromEntityId(queryData?.groups, 'groupId')}
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
  const { groupId, awardId, group } = props
  const [isMember, setIsMember] = useState(
    !!group?.awards?.find(p => p.awardId === awardId)
  )
  const { enqueueSnackbar } = useSnackbar()
  const [mergeAwardGroup] = useMutation(MERGE_AWARD_GROUP, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardGroup.to.name} add to ${data.awardGroup.from.name} group!`,
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

  const [removeAwardGroup] = useMutation(REMOVE_AWARD_GROUP, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardGroup.to.name} remove from ${data.awardGroup.from.name} group`,
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
              ? removeAwardGroup({
                  variables: {
                    awardId,
                    groupId,
                  },
                })
              : mergeAwardGroup({
                  variables: {
                    awardId,
                    groupId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="groupMember"
          color="primary"
        />
      }
      label={isMember ? 'Award' : 'Not award'}
    />
  )
}

ToggleAward.propTypes = {
  playerId: PropTypes.string,
  awardId: PropTypes.string,
  award: PropTypes.object,
  remove: PropTypes.func,
  merge: PropTypes.func,
}

Groups.propTypes = {
  awardId: PropTypes.string,
}

export { Groups }
