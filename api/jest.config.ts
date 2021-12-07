export default {
  displayName: 'HMS-API',
  moduleDirectories: ['node_modules'],
  name: 'HMS-API',
  rootDir: './../',
  testMatch: ['<rootDir>/api/**/*.test.ts'],
  transform: {
    '\\.[jt]sx?$': ['ts-jest'],
  },
  // testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
