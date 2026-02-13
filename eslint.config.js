//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    ignores: [
      'dist/**',
      'build/**',
      '.output/**',
      'node_modules/**',
      '**/routeTree.gen.ts',
      '*.config.js',
      '*.config.ts',
    ],
  },
]
