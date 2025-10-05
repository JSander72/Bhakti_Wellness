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
  size = 200, // Increased default size
}) => {
  const scaleAnim = useRef(new Animated.Value(0.3)).current; // Start smaller
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    let targetScale = 0.3;
    let targetOpacity = 0.7;

    switch (phase) {
      case 'inhale':
        // Expand during inhale based on progress
        targetScale = 0.3 + (phaseProgress * 0.6); // Scale from 0.3 to 0.9
        targetOpacity = 0.7 + (phaseProgress * 0.3); // Opacity from 0.7 to 1.0
        break;
      case 'exhale':
        // Contract during exhale based on progress
        targetScale = 0.9 - (phaseProgress * 0.6); // Scale from 0.9 to 0.3
        targetOpacity = 1.0 - (phaseProgress * 0.3); // Opacity from 1.0 to 0.7
        break;
      case 'pause1':
      case 'pause2':
        // Keep current state during holds
        return;
      case 'ready':
        targetScale = 0.3;
        targetOpacity = 0.5;
        break;
      case 'complete':
        targetScale = 0.6;
        targetOpacity = 1.0;
        break;
      default:
        targetScale = 0.3;
        targetOpacity = 0.7;
    }

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: targetScale,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: targetOpacity,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [phase, phaseProgress, scaleAnim, opacityAnim]);

  // Don't render during hold phases
  if (phase === 'pause1' || phase === 'pause2') {
    return null;
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer circle ring */}
      <View style={[styles.outerRing, { 
        width: size, 
        height: size,
        borderColor: `${color}40`,
      }]} />
      
      {/* Inner expanding/contracting circle */}
      <Animated.View
        style={[
          styles.innerCircle,
          {
            backgroundColor: color,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glow,
          {
            shadowColor: color,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
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
  outerRing: {
    position: 'absolute',
    borderRadius: 150, // Larger border radius for bigger circle
    borderWidth: 3,
    opacity: 0.4,
  },
  innerCircle: {
    width: 120, // Larger inner circle
    height: 120,
    borderRadius: 60,
    position: 'absolute',
  },
  glow: {
    width: 120, // Larger glow effect
    height: 120,
    borderRadius: 60,
    position: 'absolute',
    backgroundColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 12,
  },
});