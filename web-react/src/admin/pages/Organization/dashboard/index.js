import React, { useContext, useEffect } from 'react'
import { useTheme } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { gql, useLazyQuery } from '@apollo/client'
import { useParams, useHistory } from 'react-router-dom'
import * as ROUTES from '../../../../routes'
import LayoutContext from '../../../../context/layout'
import OrganizationContext from '../../../../context/organization'
import { Loader } from '../../../../components/Loader'
import { Error } from '../../../../components/Error'
import { useStyles } from '../../commonComponents/styled'

const GET_ORGANIZATIONS = gql`
  query getOrganizations($where: OrganizationWhere) {
    organizations(where: $where) {
      organizationId
      name
      nick
      urlSlug
    }
  }
`

const OrganizationDashboard = () => {
  const theme = useTheme()
  const history = useHistory()
  const { organizationSlug } = useParams()
  const { setBarTitle } = useContext(LayoutContext)
  const { organizationData, setOrganizationData } =
    useContext(OrganizationContext)

  const [getOrganizations, { loading: queryLoading, error: queryError }] =
    useLazyQuery(GET_ORGANIZATIONS, {
      variables: { where: { urlSlug: organizationSlug } },
      onCompleted: ({ organizations }) => {
        if (organizations) {
          const { organizationId, urlSlug, name, nick } = organizations?.[0]
          setOrganizationData({
            organizationId,
            urlSlug,
            name,
            nick,
          })
        } else {
          history.replace(ROUTES.NOT_FOUND)
        }
      },
    })

  useEffect(() => {
    if (
      organizationData?.organizationId &&
      organizationData?.organizationSlug === organizationSlug
    ) {
      setBarTitle(organizationData?.name)
    } else {
      getOrganizations()
    }
    return () => {
      setBarTitle('')
    }
  }, [])

  const classes = useStyles(theme)

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}
      {organizationData?.organizationId && !queryLoading && !queryError && (
        <>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8} lg={7}>
              <Paper
                className={classes.paper}
              >{`Organization Info: ${organizationData?.name}`}</Paper>
            </Grid>
            <Grid item xs={12} md={4} lg={5}>
              <Paper className={classes.paper}>{/* <UserCount /> */}</Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}></Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  )
}

export { OrganizationDashboard as default }
