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
  size = 400, // Default size, will be responsive from parent
}) => {
  // Animation for the black center circle
  const centerCircleScale = useRef(new Animated.Value(0.5)).current; // Start at 50% scale
  const outerCircleOpacity = useRef(new Animated.Value(0.7)).current;
  
  // Calculate responsive inner circle size based on outer circle size
  const baseInnerSize = Math.min(size * 0.5, 200); // Max 200px, or 50% of outer size

  useEffect(() => {
    let targetCenterScale = 0.5; // 100px default (0.5 * 200px base size)
    let targetOuterOpacity = 0.7;

    switch (phase) {
      case 'inhale':
        // Expand center circle during inhale: 50% to 100% scale
        targetCenterScale = 0.5 + (phaseProgress * 0.5); // Scale from 0.5 to 1.0
        targetOuterOpacity = 0.7 + (phaseProgress * 0.3); // Opacity from 0.7 to 1.0
        break;
      case 'exhale':
        // Contract center circle during exhale: 100% to 50% scale
        targetCenterScale = 1.0 - (phaseProgress * 0.5); // Scale from 1.0 to 0.5
        targetOuterOpacity = 1.0 - (phaseProgress * 0.3); // Opacity from 1.0 to 0.7
        break;
      case 'pause1':
        // Hold at inhale size (100% scale)
        targetCenterScale = 1.0;
        targetOuterOpacity = 1.0;
        break;
      case 'pause2':
        // Hold at exhale size (50% scale)
        targetCenterScale = 0.5;
        targetOuterOpacity = 0.7;
        break;
      case 'ready':
        targetCenterScale = 0.5;
        targetOuterOpacity = 0.5;
        break;
      case 'complete':
        targetCenterScale = 0.75;
        targetOuterOpacity = 1.0;
        break;
      default:
        targetCenterScale = 0.5;
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
      {/* Outer colored circle - solid filled */}
      <Animated.View
        style={[
          styles.outerCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color, // Solid colored background
            opacity: outerCircleOpacity,
          },
        ]}
      />
      
      {/* Inner black circle - animated size (responsive to outer circle size) */}
      <Animated.View
        style={[
          styles.centerCircle,
          {
            width: baseInnerSize, // Responsive inner size
            height: baseInnerSize,
            borderRadius: baseInnerSize / 2,
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
    // Removed border, now using solid backgroundColor
  },
  centerCircle: {
    position: 'absolute',
    backgroundColor: '#000000',
  },
});