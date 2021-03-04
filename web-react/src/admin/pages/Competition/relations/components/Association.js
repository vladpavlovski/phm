import React, { useCallback, useState } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'

import { TextField, Autocomplete, Grid } from '@material-ui/core'

const GET_ASSOCIATIONS = gql`
  query getCompetitionAssociations($competitionId: ID) {
    competition: Competition(competitionId: $competitionId) {
      competitionId
      name
      association {
        associationId
        name
      }
    }
    associations: Association {
      associationId
      name
    }
  }
`

const REMOVE_MERGE_COMPETITION_ASSOCIATION = gql`
  mutation removeMergeCompetitionAssociation(
    $competitionId: ID!
    $associationIdToRemove: ID!
    $associationIdToMerge: ID!
  ) {
    competitionAssociationRemove: RemoveCompetitionAssociation(
      from: { competitionId: $competitionId }
      to: { associationId: $associationIdToRemove }
    ) {
      from {
        competitionId
        name
      }
      to {
        associationId
        name
      }
    }
    competitionAssociationMerge: MergeCompetitionAssociation(
      from: { competitionId: $competitionId }
      to: { associationId: $associationIdToMerge }
    ) {
      from {
        competitionId
        name
      }
      to {
        associationId
        name
      }
    }
  }
`

const Association = props => {
  const { competitionId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()

  const [selectedAssociation, setSelectedAssociation] = useState(null)

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ASSOCIATIONS, {
    fetchPolicy: 'cache-and-network',
    onCompleted: data => {
      setSelectedAssociation(data?.competition?.[0]?.association)
    },
  })

  const competition = queryData?.competition?.[0]

  const [removeMergeAssociationCompetition] = useMutation(
    REMOVE_MERGE_COMPETITION_ASSOCIATION,
    {
      onCompleted: data => {
        enqueueSnackbar(
          `${competition.name} owned by ${data.competitionAssociationMerge.to.name}!`,
          {
            variant: 'success',
          }
        )
        setSelectedAssociation(data.competitionAssociationMerge.to)
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { competitionId } })
    }
  }, [])

  const handleAssociationChange = useCallback(
    data => {
      if (selectedAssociation.associationId !== data.associationId) {
        removeMergeAssociationCompetition({
          variables: {
            competitionId,
            associationIdToRemove: selectedAssociation.associationId,
            associationIdToMerge: data.associationId,
          },
        })
      }
    },
    [competitionId, selectedAssociation]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="associations-content"
        id="associations-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Association
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <Autocomplete
                  id="association-select"
                  name="association"
                  value={selectedAssociation}
                  getOptionLabel={option => option.name}
                  getOptionSelected={(option, value) =>
                    option.associationId === value.associationId
                  }
                  options={queryData.associations}
                  onChange={(_, data) => {
                    handleAssociationChange(data)
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.associationId}>
                      {option.name}
                    </li>
                  )}
                  renderInput={params => (
                    <TextField
                      {...params}
                      fullWidth
                      // label="Association"
                      variant="standard"
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password',
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

Association.propTypes = {
  competitionId: PropTypes.string,
}

export { Association }
