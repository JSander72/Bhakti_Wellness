// App.js
// Expo-ready React Native screen matching the provided mockup
import React, { useMemo, useState } from "react";
import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import Navigation from './app/navigation';

export default function App() {
  return <Navigation />;
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
