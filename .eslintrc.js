module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 11,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/essential',
    '@vue/standard',
    '@vue/typescript'
  ],
  plugins: [
    '@typescript-eslint',
    'vue'
  ],
  rules: {
    semi: [2, 'never'],
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-console': process.env.NODE_ENV === 'production'
      ? ['error', { allow: ['info', 'warn', 'error'] }]
      : 'off'
  }
}
