import { object, string, date, number } from 'yup'

export const schema = object().shape({
  name: string().required('Name is required'),
  nick: string(),
  short: string(),
  web: string(),
  description: string(),
  location: string(),
  capacity: number().integer().positive(),
  tertiaryColor: string(),
  foundDate: date().nullable(),
})
