import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      '.next/**',
      '.vercel/**',
      'next-env.d.ts',
      'extension-comandas/**',
      'presencia-carta/**',
      'sagrado-sushi-carta/**',
      'skills/**',
      'landing/**',
      'scripts/*.cjs',
    ],
  },
];

export default eslintConfig;
