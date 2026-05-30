// ESLint v9 flat config
export default [
  {
    files: ['assets/*.js', 'api/catalog-helpers.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',    // vanilla JS, no modules (window globals)
      globals: {
        window:   'readonly',
        document: 'readonly',
        fetch:    'readonly',
        console:  'readonly',
        sessionStorage: 'readonly',
        localStorage:   'readonly',
        alert:    'readonly',
        confirm:  'readonly',
        prompt:   'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        FormData: 'readonly',
        URLSearchParams: 'readonly',
        // Site globals exposed on window
        gtag:             'readonly',
        dataLayer:        'writable',
      },
    },
    rules: {
      'no-undef':         'error',
      'no-unused-vars':   ['warn', { vars: 'all', args: 'none' }],
      'no-var':           'off',    // legacy codebase uses var intentionally
      'eqeqeq':           ['error', 'smart'],
      'no-eval':          'error',
      'no-implied-eval':  'error',
      'no-console':       ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
