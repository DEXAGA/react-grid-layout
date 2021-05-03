// .eslintrc.js
module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 8, project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  }, // to enable features such as async/await
  ignorePatterns: ['node_modules/*', '.next/*', '.out/*', '!.prettierrc.js'], // We don't want to lint generated files nor node_modules, but we want to lint .prettierrc.js (ignored by default by eslint)
  extends: ['eslint:recommended'],
  overrides: [
    // This configuration will apply only to TypeScript files
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      settings: {react: {version: 'detect'}},
      env: {
        browser: true,
        node: true,
        es6: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended', // TypeScript rules
        'plugin:@typescript-eslint/recommended-requiring-type-checking', // TypeScript rules
        'plugin:react/recommended', // React rules
        'plugin:react-hooks/recommended', // React hooks rules
        'plugin:jsx-a11y/recommended', // Accessibility rules
      ],
      rules: {
        // We will use TypeScript's types for component props instead
        'react/prop-types': 'off',

        // No need to import React when using Next.js
        'react/react-in-jsx-scope': 'off',

        // This rule is not compatible with Next.js's <Link /> components
        'jsx-a11y/anchor-is-valid': 'off',

        // Why would you want unused vars?
        '@typescript-eslint/no-unused-vars': ['error'],
        '@typescript-eslint/array-type': ['error'],
        '@typescript-eslint/no-confusing-void-expression': ['warn'],
        '@typescript-eslint/no-dynamic-delete': ['warn'],
        'no-case-declarations': ['warn'],
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': ['warn', {
          allowComparingNullableBooleansToTrue: true,
          allowComparingNullableBooleansToFalse: true,
        }],
        '@typescript-eslint/no-unnecessary-condition': ['off'],
        '@typescript-eslint/consistent-indexed-object-style': ['warn'],
        '@typescript-eslint/no-unsafe-return': ['warn'],
        '@typescript-eslint/no-unnecessary-type-arguments': ['warn'],
        '@typescript-eslint/prefer-as-const': ['warn'],
        '@typescript-eslint/prefer-enum-initializers': ['warn'],
        '@typescript-eslint/ban-ts-comment': ['warn'],
        '@typescript-eslint/restrict-template-expressions': ['warn'],
        '@typescript-eslint/prefer-includes': ['warn'],
        '@typescript-eslint/prefer-reduce-type-parameter': ['error'],
        '@typescript-eslint/prefer-ts-expect-error': ['warn'],
        '@typescript-eslint/quotes': ['error', "backtick", {allowTemplateLiterals: true}],
        '@typescript-eslint/no-unsafe-member-access': ['off'],
        '@typescript-eslint/no-unsafe-assignment': ['off'],
        '@typescript-eslint/no-unsafe-call': ['off'],
        'jsx-a11y/no-noninteractive-tabindex': ['off'],
        'jsx-a11y/no-static-element-interactions': ['off'],
        "react/jsx-sort-props": ['warn', {
          "callbacksLast": true,
          "shorthandFirst": true,
          "shorthandLast": false,
          "ignoreCase": true,
          "noSortAlphabetically": false,
          "reservedFirst": false,
        }],
        "react/jsx-boolean-value": ['warn', "always", {"never": []}],
        "react/jsx-closing-bracket-location": ['warn', 'line-aligned'],
        "react/jsx-closing-tag-location": ['warn'],
        "react/jsx-curly-brace-presence": ['warn', {"props": "always", "children": "always"}],
        "react/jsx-equals-spacing": ['warn', "never"],
        "react/jsx-first-prop-new-line": ['warn', "always"],
        "react/jsx-fragments": ['warn', "element"],
        "react/jsx-props-no-multi-spaces": ['warn'],
        "react/jsx-wrap-multilines": ['warn', {
          "declaration": "parens-new-line",
          "assignment": "parens-new-line",
          "return": "parens-new-line",
          "arrow": "parens-new-line",
          "condition": "parens-new-line",
          "logical": "parens-new-line",
          "prop": "parens-new-line",
        }],
        "react/jsx-one-expression-per-line": ['warn', {"allow": "single-child"}],
        '@typescript-eslint/explicit-function-return-type': [
          'warn',
          {
            allowExpressions: true,
            allowConciseArrowFunctionExpressionsStartingWithVoid: true,
          },
        ],
      },
    },
    {
      files: ['**/*.tsx'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': [
          'off',
        ],
        '@typescript-eslint/explicit-module-boundary-types': [
          'off',
        ],
      },
    },
  ],
}
