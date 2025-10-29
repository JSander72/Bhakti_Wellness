
# Bhakti Breath Pacer – Expo Router App 🌱

This project is an [Expo](https://expo.dev) app scaffolded with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app) and using [Expo Router](https://docs.expo.dev/router/introduction/) for navigation. The app guides users through a simple, focused breathing session with a clear, step-by-step navigation flow.

## App Navigation Flow

1. **App Launch:**

- The app starts and immediately redirects to the splash screen (`/splash`).

2. **Splash Screen:**

- The user sees a welcome message and taps **Start**.
- Tapping Start navigates to the Home screen (`/(tabs)`), which shows the BreathPacer UI.

3. **Home (BreathPacer):**

- The user sets their breathing parameters (BPM or custom lengths, timer duration).
- Pressing **Start** computes the session parameters and navigates to the Session screen, passing the config.

4. **Session Screen:**

- The session screen receives the parameters and (in future) will animate the breathing cycle and countdown.

## Project structure

```
app/
  index.tsx            // Redirects to splash screen
  splash.tsx           // Splash / Welcome screen
  (tabs)/
   _layout.tsx        // Tabs layout (Home + Explore)
   index.tsx          // Home tab – shows BreathPacer screen
   explore.tsx        // Explore tab (default template)
   session.tsx        // Breathing session screen (after Start)
components/
  BreathPacer.tsx      // Main breathing pacer UI
```

- `app/index.tsx` redirects to the splash screen.
- `app/splash.tsx` is the welcome screen with a Start button.
- `app/(tabs)/index.tsx` is the Home tab, rendering the `BreathPacer` screen.
- `app/(tabs)/session.tsx` is the session screen (receives params from BreathPacer).
- The project uses **TypeScript** by default, but JS will work too.

## Getting Started

1. **Install dependencies**

  ```bash
  npm install
  ```

2. **Start Metro bundler (Tunnel recommended)**

  Works reliably across iOS, Android, and Web:

  ```bash
  npm run start:tunnel
  ```

  Optional: LAN mode (may work on Web and some networks; devices often fail). Use only if your network allows it:

  ```bash
  npm run start:lan
  ```

3. **Open on your device**

- In the Expo terminal, press `c` to show the QR and scan it with **Expo Go** (App Store / Play Store).
- Or launch on simulators: press `i` for iOS simulator, `a` for Android emulator.

## Development Notes

- If you see version mismatches, run:
  
  ```bash
  npx expo install --check

  ```

  and sync dependencies (e.g., `react-native` must match the expected version for the Expo SDK).

- Clear cache if needed:
  
  ```bash
  npx expo start -c
  ```

- **Expo Router** uses file-based routing. The file/folder structure inside `app/` defines the navigation.

## User Flow Example

1. Launch the app (in Expo Go or simulator).
2. See the splash screen. Tap **Start**.
3. On the Home screen, set your breathing parameters and tap **Start**.
4. The app navigates to the Session screen, where your session will run (animation coming soon).

## Adding New Features

### Splash Page → Home Screen Link

- Add a new file: `app/splash.tsx`

- Example:
<!-- tsx
  import { View, Text, Pressable } from "react-native";
  import { router } from "expo-router";

  export default function Splash() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 28, marginBottom: 20 }}>Welcome to Bhakti Breath Pacer 🌱</Text>
        <Pressable
          style={{ backgroundColor: "#B7272C", padding: 16, borderRadius: 12 }}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={{ color: "white", fontSize: 20 }}>Start</Text>
        </Pressable>
      </View>
    );
  } -->

- This creates a **Splash page**. Pressing **Start** will navigate the user into the Tabs layout (where `index.tsx` shows the BreathPacer).

### Start → Session Flow

The app includes a **Session** screen at `app/(tabs)/session.tsx` and the `BreathPacer` component navigates there with the selected configuration.

- **In `components/BreathPacer.tsx`**, replace the existing `handleStart` with:
<!-- tsx
  import { router } from "expo-router";
  // ...
  const handleStart = () => {
    const cfg = usingLengths
      ? { mode: "lengths" as const, inhale: +inhale || 0, pause1: +pause1 || 0, exhale: +exhale || 0, pause2: +pause2 || 0, timerMin }
      : { mode: "bpm" as const, bpm: +bpm || 0, timerMin };

    // Send config to Session screen
    router.push({
      pathname: "/session",
      params: Object.fromEntries(
        Object.entries(cfg).map(([k, v]) => [k, String(v)]) // ensure strings
      ),
    });
  }; -->

- **Create `app/session.tsx`** with a simple timing + animation demo (no extra libs needed):

<!-- tsx
  import React, { useEffect, useMemo, useRef, useState } from "react";
  import { View, Text, Pressable, Animated } from "react-native";
  import { useLocalSearchParams, router } from "expo-router";

  const COLORS = { bg: "#0D3B34", cream: "#F1DEB4", creamText: "#F7E9C9", red: "#B7272C" };

  type Params = {
    mode?: string; bpm?: string; inhale?: string; pause1?: string; exhale?: string; pause2?: string; timerMin?: string;
  };

  export default function Session() {
    const params = useLocalSearchParams<Params>();

    // Parse config
    const mode = params.mode === "lengths" ? "lengths" : "bpm";
    const bpm = Number(params.bpm || 6);
    const inhale = Number(params.inhale || 0);
    const pause1 = Number(params.pause1 || 0);
    const exhale = Number(params.exhale || 0);
    const pause2 = Number(params.pause2 || 0);
    const timerMin = Number(params.timerMin || 5);

    // Build a breathing pattern in milliseconds
    const pattern = useMemo(() => {
      if (mode === "lengths" && (inhale + pause1 + exhale + pause2) > 0) {
        return [
          { label: "Inhale", ms: inhale * 1000, kind: "inhale" as const },
          { label: "Hold",   ms: pause1 * 1000, kind: "hold" as const },
          { label: "Exhale", ms: exhale * 1000, kind: "exhale" as const },
          { label: "Hold",   ms: pause2 * 1000, kind: "hold" as const },
        ].filter(p => p.ms > 0);
      }
      // BPM fallback: split evenly (50% inhale, 50% exhale)
      const totalMs = (60 / Math.max(bpm, 1)) * 1000;
      return [
        { label: "Inhale", ms: totalMs / 2, kind: "inhale" as const },
        { label: "Exhale", ms: totalMs / 2, kind: "exhale" as const },
      ];
    }, [mode, bpm, inhale, pause1, exhale, pause2]);

    // Countdown timer state
    const [remainingMs, setRemainingMs] = useState(timerMin * 60 * 1000);
    const [phaseIndex, setPhaseIndex] = useState(0);

    // Simple pulsing circle animation
    const scale = useRef(new Animated.Value(0.8)).current;
    const animatePhase = (kind: "inhale" | "exhale" | "hold", duration: number) => {
      const toValue = kind === "inhale" ? 1.15 : kind === "exhale" ? 0.85 : 1.0;
      Animated.timing(scale, { toValue, duration: Math.max(duration, 200), useNativeDriver: true }).start();
    };

    // Phase loop + overall countdown
    useEffect(() => {
      let canceled = false;
      let phaseStart = Date.now();

      const tick = () => {
        if (canceled) return;
        const now = Date.now();
        setRemainingMs((prev) => Math.max(prev - (now - phaseStart), 0));
        phaseStart = now;
        const phase = pattern[phaseIndex];
        animatePhase(phase.kind, phase.ms);
        const timeout = setTimeout(() => {
          if (canceled) return;
          setPhaseIndex((i) => (i + 1) % pattern.length);
        }, phase.ms);
        return () => clearTimeout(timeout);
      };

      // Kick off immediately
      const cleanup = tick();

      // Also tick every phase change
      return () => { canceled = true; cleanup && cleanup(); };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phaseIndex, pattern]);

    // Auto-exit when timer hits zero
    useEffect(() => {
      if (remainingMs <= 0) {
        router.back();
      }
    }, [remainingMs]);

    const mm = Math.floor(remainingMs / 60000);
    const ss = Math.floor((remainingMs % 60000) / 1000).toString().padStart(2, "0");
    const phase = pattern[phaseIndex];

    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ color: COLORS.creamText, fontSize: 20, marginBottom: 10 }}>Time Remaining</Text>
        <Text style={{ color: COLORS.creamText, fontSize: 42, fontWeight: "800", marginBottom: 30 }}>{mm}:{ss}</Text>

        <Text style={{ color: COLORS.creamText, fontSize: 22, marginBottom: 12 }}>{phase?.label ?? ""}</Text>

        <Animated.View
          style={{
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: COLORS.cream,
            opacity: 0.9,
            transform: [{ scale }],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#1A1A1A" }}>{phase?.label ?? ""}</Text>
        </Animated.View>

        <Pressable onPress={() => router.back()} style={{ marginTop: 28, backgroundColor: COLORS.red, paddingVertical: 14, paddingHorizontal: 26, borderRadius: 16 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>End Session</Text>
        </Pressable>
      </View>
    );
  }
-->

> Notes:
>
> - This is a minimal demo: it animates a circle size for **Inhale / Exhale / Hold** and tracks a session countdown. When time hits 0, it navigates back.
> - If you passed BPM instead of lengths, it defaults to 50/50 inhale/exhale.
> - You can refine the pattern split or add haptics/sounds (we already include `expo-haptics` in dependencies).

## iOS connection tips (ERR_NGROK_3200 / exp.direct 404)

If you see “HTTP response error 404 … exp.direct is offline (ERR_NGROK_3200)”, the old tunnel URL in your QR has expired.

- Prefer Tunnel for development:
  - Start a fresh tunnel and rescan the new QR in Expo Go:

    ```bash
    npm run start:tunnel
    ```

  - Pull‑to‑refresh the Expo Go home screen before rescanning. It’s normal for the old exp.direct link to 404 once the tunnel is replaced.

- If the tunnel is blocked (corporate/VPN networks), try:
  - Disabling VPN/proxy or switching to a different network/hotspot.
  - As a fallback, use LAN on the same Wi‑Fi (may work for Web and sometimes devices):

    ```bash
    npm run start:lan
    ```

    Quick LAN checks from the device browser:
    - http://YOUR_LAN_IP:19000 should return JSON
    - http://YOUR_LAN_IP:8081/status should say `packager-status:running`

## Tunnel connection issues (ngrok timeout)

If `npm run start:tunnel` fails with:

> CommandError: ngrok tunnel took too long to connect

Try the following, in order:

1. Force IPv4 DNS and pin ngrok region (helps when IPv6 routing is flaky):

  ```bash
  npm run start:tunnel:ipv4
  ```

1. Clear caches and restart the tunnel:

  ```bash
  npx expo start -c --tunnel
  ```

1. Network checks (tunnels commonly fail behind VPNs/proxies/firewalls): Temporarily disable VPN/proxy and retry. Switch to a different network or mobile hotspot. Ensure these domains are reachable: `ngrok.com`, `api.ngrok.com`.

1. As a fallback, use LAN on the same Wi‑Fi:

  ```bash
  npm run start:lan
  ```

Notes:

- You can also try a different ngrok region by setting `NGROK_REGION` (e.g., `eu`, `ap`).
- If the issue persists, update the Expo CLI (`npx expo --version`) to the latest 54.x and retry.

## Team Workflow

- All team members should:
  1. Pull latest code.
  2. Run `npm install`.
  3. Prefer `npm run start:tunnel` for day‑to‑day development (works across iOS, Android, and Web). Use `npm run start:lan` only if your network setup allows it and devices connect reliably.
  4. Edit or add screens inside the `app/` directory.

## Learn More

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router introduction](https://docs.expo.dev/router/introduction/)
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/)

## Community

- [Expo on GitHub](https://github.com/expo/expo)
- [Discord community](https://chat.expo.dev)
