import React from 'react'
import { useStyles } from '../../commonComponents/styled'
type TRelations = {
  personId: string
}
const Relations: React.FC<TRelations> = () => {
  const classes = useStyles()

  return <div className={classes.accordionWrapper}></div>
}

export { Relations }
