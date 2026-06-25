# Convenções do Projeto

## Estrutura MVVM

Features organizadas no padrão **MVVM (Model-View-ViewModel)**:

- **model/** - Tipos, API calls, schemas
- **view/** - Componentes React Native (UI)
- **viewModel/** - Hooks, queries, lógica

**Exemplo:** `features/chat/`

    ├── model/       # types.ts, api.ts
    ├── view/        # ChatPanel.tsx, MessageList.tsx
    └── viewModel/   # useChatViewModel.ts

## Ordem de Imports

1. **React/React Native**
2. **Third-party libraries**
3. **@/ path aliases**
4. **Relative imports**
5. **Types**

Exemplo:

    import React from 'react'
    import { View } from 'react-native'
    import { useNavigation } from '@react-navigation/native'
    import { api } from '@/services/api'
    import { MessageList } from './components/MessageList'
    import type { ChatMessage } from '@/features/chat/model'

## Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componentes | PascalCase | `ChatPanel.tsx` |
| Hooks | useCamelCase | `useAuth.ts` |
| Utils | camelCase | `formatDate.ts` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Types | PascalCase | `User`, `ChatMessage` |

Componentes: `.tsx` / Hooks/utils: `.ts` / Barrels: `index.ts`

## Path Aliases

Usar `@/` para imports:

    // ✅ Recomendado
    import { httpClient } from '@/services/api'

    // ❌ Evitar
    import { httpClient } from '../../../services/api'

**Relative imports:** Mesma feature ou arquivo próximo

## Barrel Exports

Cada pasta tem `index.ts`:

    // src/services/api/index.ts
    export { httpClient } from './httpClient'
    export type { ApiResponse } from './httpClient'

    // Uso
    import { httpClient } from '@/services/api'

## Secure Storage

O projeto usa `expo-secure-store` para armazenamento seguro de dados sensíveis (tokens, credenciais):

- **iOS:** Keychain Services
- **Android:** SharedPreferences com AES-256 / Android Keystore

**Wrapper:** `@/services/storage` (implementado na Story 2.2)

**Limitações:** Máximo 2KB por item (iOS Keychain)
