import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface SoundWaveProps {
  amplitude: number; // 0 to 1, controls wave height
  color: string;
  phase: 'inhale' | 'exhale' | 'pause1' | 'pause2' | 'ready' | 'complete';
  phaseProgress: number; // 0 to 1, progress within current phase
  width?: number;
  height?: number;
}

export const SoundWave: React.FC<SoundWaveProps> = ({
  amplitude,
  color,
  phase,
  phaseProgress,
  width = 300,
  height = 120,
}) => {
  const opacityAnim = useRef(new Animated.Value(0.8)).current;
  const animationTime = useRef(0);
  const animationRef = useRef<number | null>(null);
  const [currentPath, setCurrentPath] = React.useState('');
  const [dotPosition, setDotPosition] = React.useState({ x: 0, y: height / 2 });

  useEffect(() => {
    // Animate opacity based on phase
    let targetOpacity = 0.8;
    switch (phase) {
      case 'inhale':
        targetOpacity = 1;
        break;
      case 'exhale':
        targetOpacity = 0.6;
        break;
      case 'pause1':
      case 'pause2':
        targetOpacity = 0.9;
        break;
      default:
        targetOpacity = 0.8;
    }

    Animated.timing(opacityAnim, {
      toValue: targetOpacity,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [phase, opacityAnim]);

  const generateWavePath = React.useCallback((time: number, waveAmplitude: number, verticalShift: number = 0, waveOffset: number = 0) => {
    const points = 80;
    const centerY = height / 2;
    let path = '';
    
    // Get wave properties based on phase - slower, more meditative curves
    let frequency = 1.5; // Base frequency for calmer waves
    let dampening = 1;
    
    switch (phase) {
      case 'inhale':
        frequency = 2; // Moderate curves for inhale
        dampening = 1.2; // Slightly more pronounced
        break;
      case 'exhale':
        frequency = 1.5; // Slower, gentler curves for exhale
        dampening = 1;
        break;
      case 'pause1':
      case 'pause2':
        frequency = 0; // Completely flat during holds
        dampening = 0;
        break;
      default:
        frequency = 1.5;
        dampening = 0.8;
    }
    
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      // Add wave offset to create right-to-left movement
      const waveY = Math.sin((x / width) * Math.PI * frequency + time + waveOffset) * waveAmplitude * dampening;
      const y = centerY + waveY + verticalShift;
      
      if (i === 0) {
        path = `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
    
    return path;
  }, [width, height, phase]);

  useEffect(() => {
    const animate = () => {
      // Much slower animation speed for calm, meditative pace
      let animationSpeed = 0.005; // Reduced from 0.02 for mississippi pace
      
      switch (phase) {
        case 'inhale':
          animationSpeed = 0.008; // Slightly faster for inhale
          break;
        case 'exhale':
          animationSpeed = 0.006; // Medium pace for exhale
          break;
        case 'pause1':
        case 'pause2':
          animationSpeed = 0; // Completely stop wave movement during holds
          break;
        default:
          animationSpeed = 0.005;
      }
      
      animationTime.current += animationSpeed;
      
      // Calculate vertical shift based on phase
      let verticalShift = 0;
      const baseAmplitude = amplitude * (height * 0.2);
      
      switch (phase) {
        case 'inhale':
          verticalShift = -baseAmplitude * 0.6; // Move up
          break;
        case 'exhale':
          verticalShift = baseAmplitude * 0.6; // Move down
          break;
        case 'pause1':
        case 'pause2':
          verticalShift = 0; // Stay centered and flat
          break;
        default:
          verticalShift = 0;
      }
      
      // Wave moves right to left (negative offset creates right-to-left movement)
      const waveOffset = -animationTime.current;
      
      const newPath = generateWavePath(0, baseAmplitude, verticalShift, waveOffset);
      setCurrentPath(newPath);
      
      // Fixed dot position - always center of screen horizontally
      const dotX = width / 2; // Fixed center position
      
      // Calculate dot Y position based on the wave at center X position
      let frequency = 1.5; // Reduced frequency for slower, more pronounced curves
      let dampening = 1;
      
      switch (phase) {
        case 'inhale':
          frequency = 2; // Moderate frequency for inhale
          dampening = 1.2; // Slightly more pronounced
          break;
        case 'exhale':
          frequency = 1.5; // Slower curves for exhale
          dampening = 1;
          break;
        case 'pause1':
        case 'pause2':
          frequency = 0; // No wave movement during holds
          dampening = 0;
          break;
        default:
          frequency = 2;
          dampening = 0.5;
      }
      
      const centerY = height / 2;
      // Calculate wave Y at center position with wave offset
      const waveY = Math.sin((0.5) * Math.PI * frequency + waveOffset) * baseAmplitude * dampening;
      const dotY = centerY + waveY + verticalShift;
      
      setDotPosition({ x: dotX, y: dotY });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [amplitude, generateWavePath, phase, width, height]);

  return (
    <View style={[styles.container, { width, height }]}>
      <Animated.View style={[styles.waveContainer, { opacity: opacityAnim }]}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
          {/* Main wave */}
          <Path
            d={currentPath}
            stroke={color}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Secondary wave for depth */}
          <Path
            d={generateWavePath(0, amplitude * (height * 0.15), 0, -animationTime.current + 1)}
            stroke={color}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.5}
          />
          
          {/* Fixed center dot indicator */}
          <Circle
            cx={dotPosition.x}
            cy={dotPosition.y}
            r={6}
            fill={color}
            opacity={0.9}
          />
          
          {/* Dot glow effect */}
          <Circle
            cx={dotPosition.x}
            cy={dotPosition.y}
            r={12}
            fill={color}
            opacity={0.3}
          />
        </Svg>
      </Animated.View>
      
      {/* Glow effect container */}
      <View style={[styles.glow, { 
        shadowColor: color,
        width: width * 0.9,
        height: height * 0.7,
      }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  waveContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    borderRadius: 60,
    backgroundColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 10,
  },
});