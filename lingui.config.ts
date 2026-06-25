import type { LinguiConfig } from '@lingui/conf'

const config: LinguiConfig = {
  sourceLocale: 'pt-BR',
  locales: ['pt-BR', 'es'],
  catalogs: [
    {
      path: 'src/locales/{locale}/messages',
      include: ['src'],
    },
  ],
  compileNamespace: 'ts',
}

export default config
