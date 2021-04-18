import { object, string, date } from 'yup'

export const schema = object().shape({
  name: string().required('Name is required'),
  description: string(),
  short: string(),
  date: date().nullable(),
  time: date().nullable(),
})
