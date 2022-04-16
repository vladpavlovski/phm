export default {
  displayName: 'WebReactAdmin',
  // moduleDirectories: ['node_modules'],
  name: 'WebReactAdmin',
  rootDir: './../',
  testMatch: ['<rootDir>/web-react/**/*.test.ts'],
  transform: {
    '\\.[jt]sx?$': ['ts-jest'],
    '\\.ts$': ['ts-node'],
  },
  testEnvironment: 'jsdom',
  // testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
