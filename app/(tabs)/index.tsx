import BreathPacer from "@/components/BreathPacer";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { Platform } from "react-native";

export default function HomeScreen() {
  // Web a11y: ensure no element remains focused when this tab loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (Platform.OS === 'web' && typeof document !== 'undefined') {
          const active = document.activeElement as HTMLElement | null;
          if (active && typeof active.blur === 'function') {
            active.blur();
          }
        }
      };
    }, [])
  );
  return <BreathPacer />;
}
