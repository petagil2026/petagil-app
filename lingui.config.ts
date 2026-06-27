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
  // Não gravar comentários `#: arquivo:linha` nos catálogos .po: eles mudam a cada
  // deslocamento de linha do código, poluindo o diff sem que nenhuma tradução mude.
  formatOptions: { origins: false },
}

export default config
