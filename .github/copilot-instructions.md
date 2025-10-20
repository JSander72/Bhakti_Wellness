Title: Bhakti Breath Pacer — repo-specific guidance for AI coding assistants

This file contains concise, actionable notes to help an AI assistant be immediately productive in this repository.

- Project type: Expo React Native app using Expo Router (file-based routing). See `package.json` (scripts) and `README.md` for dev commands.

- Quick dev commands (source of truth: `package.json`):
  - Start dev server: `npm run start` (runs `expo start`). Use `npx expo start --tunnel` when testing on a real device.
  - Platform shortcuts: `npm run android`, `npm run ios`, `npm run web`.
  - Lint: `npm run lint` (runs `expo lint`).

- Routing and entry points:
  - App root is `app/`. File/folder names define routes (Expo Router).
  - `app/index.tsx` redirects to `/splash`.
  - Home screen is `app/(tabs)/index.tsx` which renders `components/BreathPacer.tsx`.
  - Session screen lives at `app/(tabs)/session.tsx` and accepts params from `BreathPacer` (see `router.push({ pathname: '/(tabs)/session', params: { ... } })`).

- Patterns and conventions to follow (discoverable in code):
  - Keep UI logic in `components/` and screen navigation in `app/` files. Example: `components/BreathPacer.tsx` computes session params and only navigates to `session` — the `Session` screen performs timing/animation.
  - Use `expo-router`'s `router` and `useLocalSearchParams` for navigation and params passing (see `BreathPacer.tsx` and `README.md` session example).
  - Use TypeScript types where present; the project is TypeScript-first (see `tsconfig.json`) but many files are `.tsx` with implicit `any` allowances — prefer explicit types for params and component props.
  - Responsive sizing: components compute screen size with `Dimensions.get('window')` and branch UI sizes (see `BreathPacer` responsiveSizes object).

- Important files to reference when making changes:
  - `package.json` — dev scripts and dependencies
  - `README.md` — project overview, dev tips (cache clearing, expo install checks)
  - `app/` — routing and screens
  - `components/BreathPacer.tsx` — input validation, param calculation, navigation example
  - `app/(tabs)/session.tsx` — session timing loop and animation example (parsing params)
  - `components/SoundWave.tsx` & `utils/productionSoundManager.ts` — audio handling and sound choices (background sounds list in BreathPacer matches `assets/sounds/`)

- Audio & haptics notes:
  - `expo-haptics` is included in dependencies; haptics and sounds are optional and implemented in `components`/`utils` files. If adding sound behavior, mirror names used in `BreathPacer` sound options (`ocean`, `rain`, `forest`, `singing-bowl`, `white-noise`) to files in `assets/sounds` and `productionSoundManager`.

- Build and platform quirks:
  - Expo SDK version is defined in `package.json` (expo ^54). Use `npx expo install --check` if dependency issues appear.
  - When debugging layout or navigation, remember Expo Router uses file system paths; changing a filename may change a route.
  - For simulator issues, clear Metro cache: `npx expo start -c`.

- Tests and CI:
  - This repo doesn't include a test harness. When adding tests, prefer lightweight unit tests for pure logic (e.g., param calculations in `BreathPacer`) and prefer `jest` with `@testing-library/react-native` if a test suite is introduced.

- Safety and boundaries for AI edits:
  - Avoid changing Expo SDK or React Native major versions without running `npx expo install` and smoke-testing on device/emulator.
  - Preserve file-based routing structure inside `app/` — do not rename or move files that represent routes without updating navigation code.
  - Keep user-facing strings in-place; small copy edits OK but avoid global text refactors without a follow-up plan.

If anything here is unclear or you want the instructions to emphasize other parts of the codebase (tests, accessibility, i18n), tell me what to expand and I'll iterate.
