import React, { useMemo, useState } from "react";
import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import {router} from 'expo-router';

// # BreathPacer component lets user set breathing parameters
// # and start a session. It doesn’t do any animation or timing itself;
// # that’s handled in SessionScreen.


export default function BreathPacer() {
  const [bpm, setBpm] = useState<string>("6");
  const [inhale, setInhale] = useState<string>("0");
  const [pause1, setPause1] = useState<string>("0");
  const [exhale, setExhale] = useState<string>("0");
  const [pause2, setPause2] = useState<string>("0");
  const [timerMin, setTimerMin] = useState<number>(5);

  const usingLengths = useMemo(() => {
    const n = [inhale, pause1, exhale, pause2].map((v) => Number(v || 0));
    return n.some((v) => v > 0);
  }, [inhale, pause1, exhale, pause2]);

  const handleStart = () => {
  // Example mapping:
  // - If using BPM, you might compute a cycle (inhale+exhale) from bpm: 60_000 / bpm
  // - If using custom lengths, compute cycle = (inhale + pause1 + exhale + pause2) * 1000
  const cycleDurationMs = usingLengths
    ? ( ( +inhale + +pause1 + +exhale + +pause2 ) || 0 ) * 1000
    : Math.round(60000 / ( +bpm || 6 ));

  const totalBreaths = Math.max(1, Math.round((timerMin * 60_000) / Math.max(1, cycleDurationMs)));

  router.push({
    pathname: '/(tabs)/session',
    params: {
      date: new Date().toISOString(),
      cycleDurationMs: String(cycleDurationMs),
      totalBreaths: String(totalBreaths),
    },
  });
};

  function changeNumber(setter: (v: string) => void) {
    return (text: string) => setter(text.replace(/[^0-9.]/g, ""));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoBox}>
          <Text style={styles.logoLeaf}>🌱</Text>
        </View>
        <Text style={styles.title}>Bhakti Breath Pacer</Text>
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
        <Text style={styles.or}>OR</Text>
        <Text style={styles.subtitle}>Enter length of:</Text>
        <View style={styles.rows}>
          <FieldRow label="Inhale" value={inhale} onChangeText={changeNumber(setInhale)} />
          <FieldRow label="Pause" value={pause1} onChangeText={changeNumber(setPause1)} />
          <FieldRow label="Exhale" value={exhale} onChangeText={changeNumber(setExhale)} />
          <FieldRow label="Pause" value={pause2} onChangeText={changeNumber(setPause2)} />
        </View>
        <View style={styles.hairline} />
        <View style={styles.timerRow}>
          <Text style={styles.timerLabel}>Timer</Text>
          <Pressable style={styles.timerPill} onPress={() => setTimerMin((m) => (m === 5 ? 10 : m === 10 ? 15 : 5))}>
            <Text style={styles.timerText}>{timerMin} minutes</Text>
          </Pressable>
        </View>
        <Pressable style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.9 }]} onPress={handleStart}>
          <Text style={styles.startText}>Start</Text>
        </Pressable>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldRow({ label, value, onChangeText }: { label: string; value: string; onChangeText: (t: string) => void }) {
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
  bg: "#0D3B34",
  bgDark: "#0A2B27",
  cream: "#F1DEB4",
  creamText: "#F7E9C9",
  red: "#B7272C",
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, alignItems: "center" },
  logoBox: { width: 82, height: 82, borderRadius: 16, borderWidth: 3, borderColor: COLORS.cream, alignItems: "center", justifyContent: "center", marginTop: 8 },
  logoLeaf: { fontSize: 36, color: COLORS.cream },
  title: { fontSize: 36, color: COLORS.creamText, fontWeight: "700", marginTop: 18, textAlign: "center" },
  subtitle: { fontSize: 20, color: COLORS.creamText, textAlign: "center", marginTop: 22, lineHeight: 28 },
  inputPill: { marginTop: 16, height: 64, minWidth: 260, backgroundColor: COLORS.cream, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  inputPillDisabled: { opacity: 0.45 },
  inputText: { fontSize: 40, fontWeight: "700", color: "#1A1A1A", textAlign: "center" },
  disabledText: { color: "#6B6B6B" },
  or: { color: COLORS.creamText, fontSize: 22, fontWeight: "800", marginTop: 18 },
  rows: { width: "100%", marginTop: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 },
  rowLabel: { color: COLORS.creamText, fontSize: 22, fontWeight: "600" },
  smallPill: { backgroundColor: COLORS.cream, borderRadius: 12, paddingHorizontal: 18, height: 56, alignItems: "center", justifyContent: "center", minWidth: 150 },
  smallInput: { fontSize: 22, fontWeight: "700", color: "#1A1A1A", minWidth: 90, textAlign: "center" },
  hairline: { width: "96%", height: 2, backgroundColor: COLORS.cream, opacity: 0.5, alignSelf: "center", marginTop: 18 },
  timerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: 22 },
  timerLabel: { color: COLORS.creamText, fontSize: 22, fontWeight: "700" },
  timerPill: { backgroundColor: COLORS.cream, borderRadius: 12, paddingHorizontal: 18, height: 56, alignItems: "center", justifyContent: "center" },
  timerText: { fontSize: 22, fontWeight: "700", color: "#1A1A1A" },
  startBtn: { marginTop: 26, backgroundColor: COLORS.red, borderRadius: 24, height: 72, alignItems: "center", justifyContent: "center", alignSelf: "stretch" },
  startText: { color: "#fff", fontSize: 34, fontWeight: "800" },
});