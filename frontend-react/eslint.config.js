import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Los contextos deben exportar su Provider (un componente) y ademas el hook que lo
    // consume (useAuth, useCart) mas datos como METODOS_ENVIO y METODOS_PAGO.
    // La regla react-refresh/only-export-components solo admite componentes en el archivo
    // para que el Fast Refresh no recargue toda la app al guardar. Separar el hook en otro
    // archivo obligaria a los importarlo desde dos sitios distintos, asi que aqui se
    // desactiva la regla solo para los contextos.
    files: ['src/context/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
