# Build box Android (Docker)

Compila o **APK dev-client** num container Linux, contornando o limite de caminho
do Windows (`MAX_PATH 260`) que quebra o build nativo C++ de libs como
`react-native-keyboard-controller` sob New Architecture.

> **Modelo:** o Docker só **compila o APK**. O **emulador** e o **Metro** continuam
> no Windows. Você instala o APK no emulador e desenvolve com hot reload normal.
> O emulador **não** roda dentro do Docker no Windows (precisa de KVM, que o
> Docker Desktop não fornece de forma confiável).

## Pré-requisitos

- **Docker Desktop** (backend WSL2) com pelo menos ~4–6 GB de RAM no engine
  (Settings → Resources). O Gradle usa `-Xmx2048m`.
- **adb** no Windows (vem com o Android Studio / platform-tools) e um **emulador**
  (AVD) rodando — normalmente imagem **x86_64**.

## Uso

```powershell
# 1. Construir a imagem (uma vez; recria só se mudar o Dockerfile)
docker compose build

# 2. Compilar o APK (recria só quando muda DEPENDÊNCIA NATIVA)
docker compose run --rm android-build
#    → gera build-output\app-debug.apk

# 3. Instalar no emulador do Windows
adb install -r build-output\app-debug.apk

# 4. Desenvolver no Windows com hot reload (JS/TS)
npx expo start --dev-client
```

No app (dev launcher), conecte ao Metro que subiu no passo 4.

### Device físico ARM (em vez de emulador x86_64)

```powershell
$env:REACT_NATIVE_ARCH="arm64-v8a"; docker compose run --rm android-build
```

## Notas

- **node_modules, `.cxx`, `build/`, `.gradle`** ficam em **volumes Docker** (não no
  NTFS) — por isso o limite de caminho não volta e os rebuilds são rápidos. O
  primeiro `run` baixa dependências do Gradle (alguns minutos); os próximos são
  incrementais.
- O APK é um **dev-client**: embute o nativo e carrega o JS do Metro. Você só
  precisa recompilá-lo quando alguém **adiciona/atualiza uma lib nativa**. No resto
  do tempo é só `expo start --dev-client` no Windows.
- Para limpar os caches do build: `docker compose down -v` (apaga os volumes).
- Recomendado adicionar ao `.gitignore`: `build-output/`.
```
