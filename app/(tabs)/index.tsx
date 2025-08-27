import React from "react";
import { SafeAreaView } from "react-native";
import BreathPacer from "../../components/BreathPacer"; // <- your file path

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BreathPacer />
    </SafeAreaView>
  );
}
