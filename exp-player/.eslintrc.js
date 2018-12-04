module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  extends: 'eslint:recommended',
  env: {
    'browser': true,
    'es6': true
  },
  rules: {
    'no-console': 0 // allow console.log
  }
};
