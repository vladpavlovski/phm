import { object, string } from 'yup'

export const schema = object().shape({
  name: string().required('Name is required'),
  legalName: string(),
  nick: string(),
  short: string(),
  claim: string(),
  web: string(),
  description: string(),
})
