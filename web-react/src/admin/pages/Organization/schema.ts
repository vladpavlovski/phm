import { object, string, date } from 'yup'

export const schema = object().shape({
  name: string().required('Name is required'),
  nick: string(),
  short: string(),
  status: string(),
  legalName: string(),
  foundDate: date().nullable(),
  urlSlug: string().required('Url slug is required'),
  urlGameLinks: string(),
})
