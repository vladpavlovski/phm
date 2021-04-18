import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
// import AccountBox from '@material-ui/icons/AccountBox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'
// import { getAdminStarRoute } from '../../../../../routes'
// import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const REMOVE_AWARD_STAR = gql`
  mutation removeAwardStar($awardId: ID!, $starId: ID!) {
    awardStar: RemoveAwardStar(
      from: { starId: $starId }
      to: { awardId: $awardId }
    ) {
      from {
        starId
        name
      }
      to {
        awardId
        name
      }
    }
  }
`

export const GET_ALL_STARS = gql`
  query getStars {
    stars: Star {
      starId
      name
      award {
        awardId
        name
      }
    }
  }
`

const MERGE_AWARD_STAR = gql`
  mutation mergeAwardStar($awardId: ID!, $starId: ID!) {
    awardStar: MergeAwardStar(
      from: { starId: $starId }
      to: { awardId: $awardId }
    ) {
      from {
        starId
        name
      }
      to {
        awardId
        name
      }
    }
  }
`

const Stars = props => {
  const { awardId } = props

  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_STARS)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { awardId } })
    }
  }, [])

  const awardStarsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'hasAward',
        headerName: 'Has award',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleAward
              starId={params.row.starId}
              awardId={awardId}
              star={params.row}
            />
          )
        },
      },

      // {
      //   field: 'starId',
      //   headerName: 'Profile',
      //   width: 120,
      //   disableColumnMenu: true,
      //   renderCell: params => {
      //     return (
      //       <LinkButton
      //         startIcon={<AccountBox />}
      //         to={getAdminStarRoute(params.value)}
      //         target="_blank"
      //       >
      //         Profile
      //       </LinkButton>
      //     )
      //   },
      // },
    ],
    []
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="stars-content"
        id="stars-header"
      >
        <Typography className={classes.accordionFormTitle}>Stars</Typography>
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
                columns={awardStarsColumns}
                rows={setIdFromEntityId(queryData?.stars, 'starId')}
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
  const { starId, awardId, star } = props
  const [isMember, setIsMember] = useState(!!star?.awards?.awardId === awardId)
  const { enqueueSnackbar } = useSnackbar()
  const [mergeAwardStar] = useMutation(MERGE_AWARD_STAR, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardStar.to.name} add to ${data.awardStar.from.name} star!`,
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

  const [removeAwardStar] = useMutation(REMOVE_AWARD_STAR, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardStar.to.name} remove from ${data.awardStar.from.name} star`,
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
              ? removeAwardStar({
                  variables: {
                    awardId,
                    starId,
                  },
                })
              : mergeAwardStar({
                  variables: {
                    awardId,
                    starId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="starMember"
          color="primary"
        />
      }
      label={isMember ? 'Award' : 'Not award'}
    />
  )
}

ToggleAward.propTypes = {
  starId: PropTypes.string,
  awardId: PropTypes.string,
  award: PropTypes.object,
  remove: PropTypes.func,
  merge: PropTypes.func,
}

Stars.propTypes = {
  awardId: PropTypes.string,
}

export { Stars }
