// App.js
// Expo-ready React Native screen matching the provided mockup
import React, { useMemo, useState } from "react";
import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";

export default function App() {
  const [bpm, setBpm] = useState("6");
  const [inhale, setInhale] = useState("0");
  const [pause1, setPause1] = useState("0");
  const [exhale, setExhale] = useState("0");
  const [pause2, setPause2] = useState("0");
  const [timerMin, setTimerMin] = useState(5);

  const usingLengths = useMemo(() => {
    const n = [inhale, pause1, exhale, pause2].map((v) => Number(v || 0));
    return n.some((v) => v > 0);
  }, [inhale, pause1, exhale, pause2]);

  const handleStart = () => {
    // TODO: Hook up animation/timer logic.
    // For now we just log the config.
    const cfg = usingLengths
      ? {
          mode: "lengths",
          inhale: Number(inhale || 0),
          pause1: Number(pause1 || 0),
          exhale: Number(exhale || 0),
          pause2: Number(pause2 || 0),
          timerMin,
        }
      : { mode: "bpm", bpm: Number(bpm || 0), timerMin };
    console.log("Start with:", cfg);
    alert("Start pressed. Check console for config.\nYou can wire this into your breathing animation next.");
  };

  const changeNumber = (setter) => (text) => {
    // Enforce numeric-only input
    const cleaned = text.replace(/[^0-9.]/g, "");
    setter(cleaned);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Logo */}
        <View style={styles.logoBox}>
          <Text style={styles.logoLeaf}>🌱</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Bhakti Breath Pacer</Text>

        {/* BPM selector */}
        <Text style={styles.subtitle}>How many breaths per minute{"\n"}do you want?</Text>
        <View style={[styles.inputPill, usingLengths && styles.inputPillDisabled]}> 
          <TextInput
            value={bpm}
            onChangeText={changeNumber(setBpm)}
            keyboardType="numeric"
            style={[styles.inputText, usingLengths && styles.disabledText]}
            editable={!usingLengths}
            placeholder="6"
            placeholderTextColor={COLORS.bgDark}
          />
        </View>

        {/* OR divider */}
        <Text style={styles.or}>OR</Text>
        <Text style={styles.subtitle}>Enter length of:</Text>

        {/* Length rows */}
        <View style={styles.rows}>
          <FieldRow label="Inhale" value={inhale} onChangeText={changeNumber(setInhale)} />
          <FieldRow label="Pause" value={pause1} onChangeText={changeNumber(setPause1)} />
          <FieldRow label="Exhale" value={exhale} onChangeText={changeNumber(setExhale)} />
          <FieldRow label="Pause" value={pause2} onChangeText={changeNumber(setPause2)} />
        </View>

        {/* Hairline */}
        <View style={styles.hairline} />

        {/* Timer */}
        <View style={styles.timerRow}>
          <Text style={styles.timerLabel}>Timer</Text>
          <Pressable style={styles.timerPill} onPress={() => setTimerMin((m) => (m === 5 ? 10 : m === 10 ? 15 : 5))}>
            <Text style={styles.timerText}>{timerMin} minutes</Text>
          </Pressable>
        </View>

        {/* Start button */}
        <Pressable style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.9 }]} onPress={handleStart}>
          <Text style={styles.startText}>Start</Text>
        </Pressable>

        {/* Spacing at bottom */}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldRow({ label, value, onChangeText }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.smallPill}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          style={styles.smallInput}
          placeholder="0 sec"
          placeholderTextColor={COLORS.bgDark}
        />
      </View>
    </View>
  );
}

const COLORS = {
  bg: "#0D3B34", // deep green
  bgDark: "#0A2B27",
  cream: "#F1DEB4", // warm beige
  creamText: "#F7E9C9",
  red: "#B7272C", // brand red for Start
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  logoBox: {
    width: 82,
    height: 82,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: COLORS.cream,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  logoLeaf: { fontSize: 36, color: COLORS.cream },
  title: {
    fontSize: 36,
    color: COLORS.creamText,
    fontWeight: "700",
    marginTop: 18,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    color: COLORS.creamText,
    textAlign: "center",
    marginTop: 22,
    lineHeight: 28,
  },
  inputPill: {
    marginTop: 16,
    height: 64,
    minWidth: 260,
    backgroundColor: COLORS.cream,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  inputPillDisabled: { opacity: 0.45 },
  inputText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
  },
  disabledText: { color: "#6B6B6B" },
  or: { color: COLORS.creamText, fontSize: 22, fontWeight: "800", marginTop: 18 },
  rows: { width: "100%", marginTop: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  rowLabel: { color: COLORS.creamText, fontSize: 22, fontWeight: "600" },
  smallPill: {
    backgroundColor: COLORS.cream,
    borderRadius: 12,
    paddingHorizontal: 18,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
  },
  smallInput: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    minWidth: 90,
    textAlign: "center",
  },
  hairline: {
    width: "96%",
    height: 2,
    backgroundColor: COLORS.cream,
    opacity: 0.5,
    alignSelf: "center",
    marginTop: 18,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 22,
  },
  timerLabel: { color: COLORS.creamText, fontSize: 22, fontWeight: "700" },
  timerPill: {
    backgroundColor: COLORS.cream,
    borderRadius: 12,
    paddingHorizontal: 18,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: { fontSize: 22, fontWeight: "700", color: "#1A1A1A" },
  startBtn: {
    marginTop: 26,
    backgroundColor: COLORS.red,
    borderRadius: 24,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  startText: { color: "#fff", fontSize: 34, fontWeight: "800" },
});
