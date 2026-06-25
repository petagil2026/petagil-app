# PetÁgil

App mobile do **PetÁgil** (React Native + Expo) — plataforma que conecta tutores de pets
e veterinários. Este repositório contém a **fundação/esqueleto** do app: navegação por papel
(tutor / veterinário) com telas placeholder, tema PetÁgil e infraestrutura (auth mockado,
React Query, i18n pt-BR, Sentry) pronta para receber as features do MVP.

> O código do app vive nesta pasta `petagil-app/`. A raiz do repositório (`../`) guarda os
> artefatos de planejamento (`docs/`, `_bmad/`) e os mockups (`*.dc.html`).

## Status atual (fundação)

- Fluxo: **Splash → Seleção de papel → tabs do Tutor / tabs do Vet → Sair volta à seleção**.
- Tutor: tabs **Início / Busca / Consultas / Pets / Perfil**.
- Vet: tabs **Início / Agenda / Avaliações / Perfil**.
- Auth **mockado** (sem rede): `login(role)` cria um usuário fake, persiste sessão+papel em
  SecureStore e restaura no boot. **Sem lógica de negócio real** ainda (telas "Em construção").
- Tema PetÁgil (azul bebê / amarelo bebê / branco) com suporte a claro/escuro (toggle no Perfil).

## Plataformas

Mobile-only (iOS / Android). O app usa **Expo Dev Client** + libs nativas — **não roda no Expo Go**.

## Pré-requisitos

- Node conforme `.nvmrc` (Node 20).
- Um **dev client** instalado no device/emulador (build nativo). Android é o caminho mais direto.

## Setup

1. Instale as dependências (a partir de `petagil-app/`):
   ```bash
   npm install
   ```

2. Configure o ambiente:
   ```bash
   cp .env.dev .env   # placeholders de mocks; Sentry desabilita sozinho sem DSN
   ```

3. Gere os catálogos i18n:
   ```bash
   npm run i18n
   ```

## Rodando

- **Android (dev client):**
  ```bash
  npm run android        # roda i18n + expo run:android (compila o dev client)
  ```
- **Servidor de desenvolvimento** (com um dev client já instalado):
  ```bash
  npm run dev            # expo start --dev-client
  ```

## Scripts úteis

- `npm start` — inicia o Metro/Expo
- `npm run dev` — Expo com dev client
- `npm run android` / `npm run ios` — build + run nativo
- `npm test` — testes (Jest + React Native Testing Library)
- `npm run lint` — ESLint
- `npm run type-check` — checagem de tipos (tsc)
- `npm run validate` — type-check + lint + format:check
- `npm run i18n` — extrai (`--clean`) + compila os catálogos

## Estrutura

```
src/
├── app/            # App root + providers (Auth mockado, Theme, Query)
├── navigation/     # RootNavigator (Auth/Main) + tabs por papel (tutor/vet)
├── screens/        # RoleSelect, placeholders de tutor/vet, Splash, Perfil
├── features/       # Stubs feature-based (auth, tutor, vet, pets, appointments)
├── components/     # Design system (ui/) + layout/
├── theme/          # Tokens (cores PetÁgil, tipografia, spacing, shadows)
├── services/       # api (httpClient/React Query), storage (SecureStore), monitoring (Sentry)
├── hooks/ · lib/ · types/ · i18n
└── __tests__/      # Jest (espelha a árvore)
```

## Arquitetura

Features seguem **MVVM / feature-based**: `model/` (tipos, api, transformers),
`viewModel/` (hooks, queries, mutations) e `view/` (componentes). As pastas em
`features/` são stubs que fixam essa convenção para as próximas entregas.
