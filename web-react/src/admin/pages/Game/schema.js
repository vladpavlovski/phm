import { object, string, date } from 'yup'

export const schema = object().shape({
  name: string().required('Name is required'),
  type: string(),
  foreignId: string(),
  info: string(),
  description: string(),
  short: string(),
  startDate: date().nullable(),
  endDate: date().nullable(),
  startTime: date().nullable(),
  endTime: date().nullable(),
})