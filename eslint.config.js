import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['node_modules/**', 'docs/.vitepress/cache/**', 'docs/.vitepress/dist/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  { rules: { 'vue/multi-word-component-names': 'off' } },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { console: 'readonly', process: 'readonly', WebSocket: 'readonly', Event: 'readonly', fetch: 'readonly', setTimeout: 'readonly' } }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        KeyboardEvent: 'readonly',
        HTMLElement: 'readonly',
        MediaQueryList: 'readonly',
        URLSearchParams: 'readonly',
        location: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        HTMLInputElement: 'readonly',
        Event: 'readonly',
        FileReader: 'readonly'
      },
      parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.vue'] }
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off'
    }
  }
]
