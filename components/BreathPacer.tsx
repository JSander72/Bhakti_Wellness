import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from "react";
import { Alert, Dimensions, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

// # BreathPacer component lets user set breathing parameters
// # and start a session. It doesn't do any animation or timing itself;
// # that's handled in SessionScreen.


export default function BreathPacer() {
  // Get screen dimensions for responsive design
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;
  const isSmallPhone = screenWidth < 375;
  
  // Responsive sizing
  const responsiveSizes = {
    title: isTablet ? 42 : isSmallPhone ? 32 : 36,
    subtitle: isTablet ? 24 : isSmallPhone ? 18 : 20,
    inputPill: isTablet ? 72 : isSmallPhone ? 56 : 64,
    inputText: isTablet ? 48 : isSmallPhone ? 36 : 40,
    smallInput: isTablet ? 26 : isSmallPhone ? 20 : 22,
    timerText: isTablet ? 26 : isSmallPhone ? 20 : 22,
    startBtn: isTablet ? 80 : isSmallPhone ? 64 : 72,
    startText: isTablet ? 38 : isSmallPhone ? 30 : 34,
    padding: isTablet ? 32 : isSmallPhone ? 16 : 24,
  };

  const [bpm, setBpm] = useState<string>("6");
  const [inhale, setInhale] = useState<string>("0");
  const [pause1, setPause1] = useState<string>("0");
  const [exhale, setExhale] = useState<string>("0");
  const [pause2, setPause2] = useState<string>("0");
  const [timerMin, setTimerMin] = useState<string>("5");
  const [selectedSound, setSelectedSound] = useState<string>("none");

  // Track if user is returning from a session to optionally reset state
  const [hasNavigatedToSession, setHasNavigatedToSession] = useState(false);

  // Reset to default values
  const resetToDefaults = useCallback(() => {
    setBpm("6");
    setInhale("0");
    setPause1("0");
    setExhale("0");
    setPause2("0");
    setTimerMin("5");
    setSelectedSound("none");
  }, []);

  // Handle when the user focuses back on this screen from a session
  useFocusEffect(
    useCallback(() => {
      // If user navigated to session and is now back, they've completed a session
      if (hasNavigatedToSession) {
        // Reset the flag
        setHasNavigatedToSession(false);
        // Clear inputs back to defaults so a new session starts fresh
        resetToDefaults();
        console.log('User returned from session - inputs reset to defaults');
      }
    }, [hasNavigatedToSession, resetToDefaults])
  );

  const usingLengths = useMemo(() => {
    const n = [inhale, pause1, exhale, pause2].map((v) => Number(v || 0));
    return n.some((v) => v > 0);
  }, [inhale, pause1, exhale, pause2]);


  const handleStart = () => {
    // Validate inputs before proceeding
    const bpmValue = Number(bpm) || 6;
    const timerValue = Number(timerMin) || 5;
    
    if (bpmValue <= 0 || bpmValue > 60) {
      Alert.alert('Invalid BPM', 'Please enter a valid BPM between 1 and 60.');
      return;
    }
    
    if (timerValue <= 0 || timerValue > 60) {
      Alert.alert('Invalid Timer', 'Please enter a valid timer between 1 and 60 minutes.');
      return;
    }

    const cycleDurationMs = usingLengths
      ? ( ( +inhale + +pause1 + +exhale + +pause2 ) || 0 ) * 1000
      : Math.round(60000 / bpmValue);

    // Validate cycle duration
    if (cycleDurationMs <= 0) {
      Alert.alert('Invalid Settings', 'Please enter valid breathing timings.');
      return;
    }

    const totalBreaths = Math.max(1, Math.round((timerValue * 60_000) / Math.max(1, cycleDurationMs)));

    // Calculate individual phase durations in milliseconds
    let inhaleMs, pause1Ms, exhaleMs, pause2Ms;
    
    if (usingLengths) {
      // Using custom lengths - convert seconds to milliseconds
      inhaleMs = (+inhale || 0) * 1000;
      pause1Ms = (+pause1 || 0) * 1000;
      exhaleMs = (+exhale || 0) * 1000;
      pause2Ms = (+pause2 || 0) * 1000;
    } else {
      // Using BPM - split cycle into inhale/exhale (no pauses)
      inhaleMs = cycleDurationMs * 0.4;
      pause1Ms = 0;
      exhaleMs = cycleDurationMs * 0.6;
      pause2Ms = 0;
    }

    // Debug log the calculated parameters
    console.log('Starting session with parameters:', {
      cycleDurationMs,
      totalBreaths,
      inhaleMs,
      pause1Ms,
      exhaleMs,
      pause2Ms,
      selectedSound
    });

    // Track that user is navigating to a session
    setHasNavigatedToSession(true);

    router.push({
      pathname: '/(tabs)/session',
      params: {
        date: new Date().toISOString(),
        cycleDurationMs: String(cycleDurationMs),
        totalBreaths: String(totalBreaths),
        inhaleMs: String(inhaleMs),
        pause1Ms: String(pause1Ms),
        exhaleMs: String(exhaleMs),
        pause2Ms: String(pause2Ms),
        sound: selectedSound,
      },
    });
  };

  function changeNumber(setter: (v: string) => void) {
    return (text: string) => setter(text.replace(/[^0-9.]/g, ""));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.container, { paddingHorizontal: responsiveSizes.padding }]}>
        <View style={styles.logoBox}>
          <Text style={styles.logoLeaf}>🌱</Text>
        </View>
        <Text style={[styles.title, { fontSize: responsiveSizes.title }]}>Bhakti Breath Pacer</Text>
        <Text style={[styles.subtitle, { fontSize: responsiveSizes.subtitle }]}>How many breaths per minute{"\n"}do you want?</Text>
        <View style={[styles.inputPill, { height: responsiveSizes.inputPill }, usingLengths && styles.inputPillDisabled]}>
          <TextInput
            value={bpm}
            onChangeText={changeNumber(setBpm)}
            keyboardType="numeric"
            style={[styles.inputText, { fontSize: responsiveSizes.inputText }, usingLengths && styles.disabledText]}
            editable={!usingLengths}
            placeholder="6"
            placeholderTextColor={COLORS.bgDark}
          />
        </View>
        <Text style={styles.or}>OR</Text>
        <Text style={[styles.subtitle, { fontSize: responsiveSizes.subtitle }]}>Enter length of:</Text>
        <View style={styles.rows}>
          <FieldRow 
            label="Inhale" 
            value={inhale} 
            onChangeText={changeNumber(setInhale)} 
            responsiveSize={responsiveSizes.smallInput}
          />
          <FieldRow 
            label="Pause" 
            value={pause1} 
            onChangeText={changeNumber(setPause1)} 
            responsiveSize={responsiveSizes.smallInput}
          />
          <FieldRow 
            label="Exhale" 
            value={exhale} 
            onChangeText={changeNumber(setExhale)} 
            responsiveSize={responsiveSizes.smallInput}
          />
          <FieldRow 
            label="Pause" 
            value={pause2} 
            onChangeText={changeNumber(setPause2)} 
            responsiveSize={responsiveSizes.smallInput}
          />
        </View>
        <View style={styles.hairline} />
        <View style={styles.timerRow}>
          <Text style={styles.timerLabel}>Timer</Text>
          <View style={styles.timerPill}>
            <TextInput
              value={timerMin}
              onChangeText={changeNumber(setTimerMin)}
              keyboardType="numeric"
              style={[styles.timerText, { fontSize: responsiveSizes.timerText }]}
              placeholder="5"
              placeholderTextColor="#6B6B6B"
            />
            <Text style={[styles.minutesLabel, { fontSize: responsiveSizes.timerText }]}>minutes</Text>
          </View>
        </View>
        <View style={styles.hairline} />
        <View style={styles.soundSection}>
          <Text style={styles.soundLabel}>Background Sound</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.soundScroll}>
            {[
              { value: "none", label: "None" },
              { value: "ocean", label: "Ocean" },
              { value: "rain", label: "Rain" },
              { value: "forest", label: "Forest" },
              { value: "singing-bowl", label: "Singing Bowl" },
              { value: "white-noise", label: "White Noise" }
            ].map((option) => (
              <Pressable 
                key={option.value}
                style={[styles.soundOption, selectedSound === option.value && styles.soundOptionSelected]}
                onPress={() => setSelectedSound(option.value)}
              >
                <Text style={styles.soundOptionText}>{option.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        
        {/* Reset Button */}
        <Pressable 
          style={({ pressed }) => [
            styles.resetBtn, 
            pressed && { opacity: 0.7 }
          ]} 
          onPress={resetToDefaults}
        >
          <Text style={styles.resetText}>Reset to Defaults</Text>
        </Pressable>
        
        <Pressable 
          style={({ pressed }) => [
            styles.startBtn, 
            { height: responsiveSizes.startBtn }, 
            pressed && { opacity: 0.9 }
          ]} 
          onPress={handleStart}
        >
          <Text style={[styles.startText, { fontSize: responsiveSizes.startText }]}>Start</Text>
        </Pressable>
        
        {/* Privacy Policy Link */}
        <Pressable 
          style={styles.privacyLink}
          onPress={() => {
            // Using `as any` to avoid typed-route mismatch before Expo Router regenerates types
            router.push({ pathname: '/privacy-policy' as any });
          }}
        >
          <Text style={styles.privacyText}>Privacy Policy</Text>
        </Pressable>
        
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldRow({ 
  label, 
  value, 
  onChangeText, 
  responsiveSize 
}: { 
  label: string; 
  value: string; 
  onChangeText: (t: string) => void;
  responsiveSize: number;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.smallPill}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          style={[styles.smallInput, { fontSize: responsiveSize }]}
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
  container: { paddingTop: 24, paddingBottom: 40, alignItems: "center" },
  logoBox: { width: 82, height: 82, borderRadius: 16, borderWidth: 3, borderColor: COLORS.cream, alignItems: "center", justifyContent: "center", marginTop: 8 },
  logoLeaf: { fontSize: 36, color: COLORS.cream },
  title: { color: COLORS.creamText, fontWeight: "700", marginTop: 18, textAlign: "center" },
  subtitle: { color: COLORS.creamText, textAlign: "center", marginTop: 22, lineHeight: 28 },
  inputPill: { marginTop: 16, minWidth: '70%', backgroundColor: COLORS.cream, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  inputPillDisabled: { opacity: 0.45 },
  inputText: { fontWeight: "700", color: "#1A1A1A", textAlign: "center" },
  disabledText: { color: "#6B6B6B" },
  or: { color: COLORS.creamText, fontSize: 22, fontWeight: "800", marginTop: 18 },
  rows: { width: "100%", marginTop: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 },
  rowLabel: { color: COLORS.creamText, fontSize: 22, fontWeight: "600" },
  smallPill: { backgroundColor: COLORS.cream, borderRadius: 12, paddingHorizontal: 18, height: 56, alignItems: "center", justifyContent: "center", minWidth: '40%' },
  smallInput: { fontWeight: "700", color: "#1A1A1A", textAlign: "center", minWidth: 90 },
  hairline: { width: "96%", height: 2, backgroundColor: COLORS.cream, opacity: 0.5, alignSelf: "center", marginTop: 18 },
  timerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: 22 },
  timerLabel: { color: COLORS.creamText, fontSize: 22, fontWeight: "700" },
  timerPill: { backgroundColor: COLORS.cream, borderRadius: 12, paddingHorizontal: 18, height: 56, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  timerText: { fontWeight: "700", color: "#1A1A1A", minWidth: 40, textAlign: "center" },
  minutesLabel: { fontWeight: "700", color: "#1A1A1A" },
  resetBtn: { 
    marginTop: 16, 
    backgroundColor: "transparent", 
    borderRadius: 16, 
    alignItems: "center", 
    justifyContent: "center", 
    alignSelf: "stretch",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.cream + "50"
  },
  resetText: { 
    color: COLORS.creamText, 
    fontWeight: "600", 
    fontSize: 16,
    opacity: 0.8
  },
  startBtn: { marginTop: 16, backgroundColor: COLORS.red, borderRadius: 24, alignItems: "center", justifyContent: "center", alignSelf: "stretch" },
  startText: { color: "#fff", fontWeight: "800" },
  privacyLink: {
    marginTop: 12,
    paddingVertical: 8,
    alignSelf: "center",
  },
  privacyText: {
    color: COLORS.creamText,
    fontSize: 14,
    opacity: 0.6,
    textDecorationLine: "underline",
  },
  soundSection: { width: "100%", marginTop: 22 },
soundLabel: { color: COLORS.creamText, fontSize: 22, fontWeight: "700", marginBottom: 12 },
soundScroll: { flexDirection: "row" },
soundOption: { 
  backgroundColor: COLORS.bgDark, 
  borderRadius: 12, 
  paddingHorizontal: 18, 
  height: 48, 
  alignItems: "center", 
  justifyContent: "center",
  marginRight: 10,
  borderWidth: 2,
  borderColor: "transparent"
},
soundOptionSelected: { 
  borderColor: COLORS.cream,
  backgroundColor: COLORS.cream + "20"
},
soundOptionText: { fontSize: 16, fontWeight: "600", color: COLORS.creamText },
});