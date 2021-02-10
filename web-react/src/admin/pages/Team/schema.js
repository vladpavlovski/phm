import { object, string, date } from 'yup'

export const schema = object().shape({
  name: string().required('Name is required'),
  fullName: string(),
  nick: string(),
  short: string(),
  status: string(),
  externalId: string(),
  primaryColor: string(),
  secondaryColor: string(),
  tertiaryColor: string(),
  foundDate: date().nullable(),
})
