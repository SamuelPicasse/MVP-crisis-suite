module.exports = {
  extends: ['@crisis-suite/eslint-config-custom', 'next/core-web-vitals'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  ignorePatterns: ['next-env.d.ts']
};