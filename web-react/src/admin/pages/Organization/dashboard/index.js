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

const GET_ORGANIZATION_BY_SLUG = gql`
  query getOrganizationBySlug($urlSlug: String!) {
    organization: organizationBySlug(urlSlug: $urlSlug) {
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
  const { organizationSlug: urlSlug } = useParams()
  const { setBarTitle } = useContext(LayoutContext)
  const { organizationData, setOrganizationData } = useContext(
    OrganizationContext
  )

  const [
    getOrganizationBySlug,
    { loading: queryLoading, error: queryError },
  ] = useLazyQuery(GET_ORGANIZATION_BY_SLUG, {
    variables: { urlSlug },
    onCompleted: ({ organization }) => {
      console.log(organization)
      if (organization) {
        const { organizationId, urlSlug, name, nick } = organization
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
      organizationData?.urlSlug === urlSlug
    ) {
      setBarTitle(organizationData?.name)
    } else {
      getOrganizationBySlug()
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
            {/* User Count */}
            <Grid item xs={12} md={4} lg={5}>
              <Paper className={classes.paper}>{/* <UserCount /> */}</Paper>
            </Grid>
            {/* Recent Reviews */}
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
