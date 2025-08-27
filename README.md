# Bhakti Breath Pacer – Expo Router App 🌱

This project is an [Expo](https://expo.dev) app scaffolded with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app) and using [Expo Router](https://docs.expo.dev/router/introduction/) for navigation.

## Project structure

```
app/
  _layout.tsx          // Root stack layout
  (tabs)/
    _layout.tsx        // Tabs layout (Home + Explore)
    index.tsx          // Home tab – shows BreathPacer screen
    explore.tsx        // Explore tab (default template)
  splash.tsx           // Splash / Welcome screen
  session.tsx          // Breathing session screen (after Start)
components/
  BreathPacer.tsx      // Main breathing pacer UI
```

- `app/(tabs)/index.tsx` is the **Home tab**, rendering the `BreathPacer` screen.
- `app/index.tsx` was removed to avoid duplicate `index` routes. The root now redirects straight into the `(tabs)` group.
- The project uses **TypeScript** by default, but JS will work too.

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start Metro bundler with tunnel (recommended for WSL2/Windows)**

   ```bash
   npx expo start --tunnel
   ```

   > Tunnel mode ensures Expo Go on your phone can connect reliably, even on strict Wi-Fi.

3. **Open on your device**
   - Scan the QR code with the **Expo Go** app (from App/Play Store).
   - Or use iOS simulator / Android emulator.

## Development notes

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

## Adding new features

### Splash Page → Home screen link

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

### Start → Session flow (sample implementation)

We included a sample **Session** screen at `app/session.tsx` and updated `components/BreathPacer.tsx` to navigate there with the selected configuration.

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

## Team workflow

- All team members should:
  1. Pull latest code.
  2. Run `npm install`.
  3. Use `npx expo start --tunnel` for consistent device testing.
  4. Edit or add screens inside the `app/` directory.


- All team members should:
  1. Pull latest code.
  2. Run `npm install`.
  3. Use `npx expo start --tunnel` for consistent device testing.
  4. Edit or add screens inside the `app/` directory.

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router introduction](https://docs.expo.dev/router/introduction/)
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/)

## Community

- [Expo on GitHub](https://github.com/expo/expo)
- [Discord community](https://chat.expo.dev)
