import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const REMOVE_AWARD_PHASE = gql`
  mutation removeAwardPhase($awardId: ID!, $phaseId: ID!) {
    awardPhase: RemoveAwardPhases(
      from: { awardId: $awardId }
      to: { phaseId: $phaseId }
    ) {
      from {
        awardId
        name
      }
      to {
        phaseId
        name
      }
    }
  }
`

export const GET_ALL_PHASES = gql`
  query getPhases {
    phases: Phase {
      phaseId
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

const MERGE_AWARD_PHASE = gql`
  mutation mergeAwardPhase($awardId: ID!, $phaseId: ID!) {
    awardPhase: MergeAwardPhases(
      from: { awardId: $awardId }
      to: { phaseId: $phaseId }
    ) {
      from {
        awardId
        name
      }
      to {
        phaseId
        name
      }
    }
  }
`

const Phases = props => {
  const { awardId } = props

  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_PHASES)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { awardId } })
    }
  }, [])

  const awardPhasesColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Phase Name',
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
              phaseId={params.row.phaseId}
              awardId={awardId}
              phase={params.row}
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
        aria-controls="phases-content"
        id="phases-header"
      >
        <Typography className={classes.accordionFormTitle}>Phases</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
            {/* {place for toolbar} */}
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <DataGridPro
                disableMultipleSelection
                disableSelectionOnClick
                columns={awardPhasesColumns}
                rows={setIdFromEntityId(queryData?.phases, 'phaseId')}
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
  const { phaseId, awardId, phase } = props
  const [isMember, setIsMember] = useState(
    !!phase?.awards?.find(p => p.awardId === awardId)
  )
  const { enqueueSnackbar } = useSnackbar()
  const [mergeAwardPhase] = useMutation(MERGE_AWARD_PHASE, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardPhase.to.name} add to ${data.awardPhase.from.name} phase!`,
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

  const [removeAwardPhase] = useMutation(REMOVE_AWARD_PHASE, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardPhase.to.name} remove from ${data.awardPhase.from.name} phase`,
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
    <Switch
      checked={isMember}
      onChange={() => {
        isMember
          ? removeAwardPhase({
              variables: {
                awardId,
                phaseId,
              },
            })
          : mergeAwardPhase({
              variables: {
                awardId,
                phaseId,
              },
            })
        setIsMember(!isMember)
      }}
      name="phaseMember"
      color="primary"
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

Phases.propTypes = {
  awardId: PropTypes.string,
}

export { Phases }
