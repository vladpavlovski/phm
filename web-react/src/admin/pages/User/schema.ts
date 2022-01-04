import { object, string } from 'yup'
import { phoneRegExp } from '../../../utils'

export const schema = object().shape({
  firstName: string().required('First name is required'),
  lastName: string().required('Last name is required'),
  phone: string().matches(phoneRegExp, {
    message: 'Phone number is not valid',
    excludeEmptyString: true,
  }),
  email: string().email('Email is not valid'),
})
