import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface BreathingCircleProps {
  phase: 'inhale' | 'exhale' | 'pause1' | 'pause2' | 'ready' | 'complete';
  phaseProgress: number;
  color: string;
  size?: number;
}

export const BreathingCircle: React.FC<BreathingCircleProps> = ({
  phase,
  phaseProgress,
  color,
  size = 800, // 4x larger than before (was 200)
}) => {
  // Animation for the black center circle
  const centerCircleScale = useRef(new Animated.Value(0.2)).current; // Start small
  const outerCircleOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    let targetCenterScale = 0.2;
    let targetOuterOpacity = 0.7;

    switch (phase) {
      case 'inhale':
        // Expand center circle during inhale based on progress
        targetCenterScale = 0.2 + (phaseProgress * 0.6); // Scale from 0.2 to 0.8
        targetOuterOpacity = 0.7 + (phaseProgress * 0.3); // Opacity from 0.7 to 1.0
        break;
      case 'exhale':
        // Contract center circle during exhale based on progress
        targetCenterScale = 0.8 - (phaseProgress * 0.6); // Scale from 0.8 to 0.2
        targetOuterOpacity = 1.0 - (phaseProgress * 0.3); // Opacity from 1.0 to 0.7
        break;
      case 'pause1':
      case 'pause2':
        // Keep current state during holds
        return;
      case 'ready':
        targetCenterScale = 0.2;
        targetOuterOpacity = 0.5;
        break;
      case 'complete':
        targetCenterScale = 0.5;
        targetOuterOpacity = 1.0;
        break;
      default:
        targetCenterScale = 0.2;
        targetOuterOpacity = 0.7;
    }

    Animated.parallel([
      Animated.timing(centerCircleScale, {
        toValue: targetCenterScale,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(outerCircleOpacity, {
        toValue: targetOuterOpacity,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [phase, phaseProgress, centerCircleScale, outerCircleOpacity]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer colored circle - fixed size */}
      <Animated.View
        style={[
          styles.outerCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            opacity: outerCircleOpacity,
          },
        ]}
      />
      
      {/* Inner black circle - animated size */}
      <Animated.View
        style={[
          styles.centerCircle,
          {
            width: size * 0.8, // Max size when fully expanded
            height: size * 0.8,
            borderRadius: (size * 0.8) / 2,
            transform: [{ scale: centerCircleScale }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerCircle: {
    position: 'absolute',
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  centerCircle: {
    position: 'absolute',
    backgroundColor: '#000000',
  },
});