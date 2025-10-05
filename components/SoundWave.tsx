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
  const animationRef = useRef<number | null>(null);
  const animationTime = useRef(0);
  const [currentPath, setCurrentPath] = React.useState('');
  const [dotPosition, setDotPosition] = React.useState({ x: width / 2, y: height / 2 });
  const [currentWaveOffset, setCurrentWaveOffset] = React.useState(Math.PI); // Start in valley

  // Single consistent wave properties - no changes between phases
  const WAVE_FREQUENCY = 2;
  const WAVE_DAMPENING = 1.8; // Increased from 1.2 for more dramatic waves
  const ANIMATION_SPEED = 0.008;

  const generateWavePath = React.useCallback((time: number, waveAmplitude: number, verticalShift: number = 0, waveOffset: number = 0) => {
    // Scale the number of points based on width for better quality on larger screens
    const points = Math.max(60, Math.min(120, Math.floor(width / 4)));
    const centerY = height / 2;
    let path = '';
    
    // Use consistent wave properties throughout - no changes between phases
    const frequency = WAVE_FREQUENCY;
    const dampening = WAVE_DAMPENING;
    
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
  }, [width, height]);

  useEffect(() => {
    // Don't animate opacity changes - keep it constant for smoother transitions
    // This prevents visual changes when transitioning between phases
  }, [phase, opacityAnim]);

  // Initialize wave on mount
  useEffect(() => {
    const centerY = height / 2;
    const baseAmplitude = amplitude * (height * 0.35);
    const initialOffset = Math.PI; // Start in valley position
    
    // Initialize path and dot position
    const initialPath = generateWavePath(0, baseAmplitude, 0, initialOffset);
    setCurrentPath(initialPath);
    setCurrentWaveOffset(initialOffset);
    
    const dotX = width / 2;
    const waveY = Math.sin((0.5) * Math.PI * WAVE_FREQUENCY + initialOffset) * baseAmplitude * WAVE_DAMPENING;
    const dotY = centerY + waveY;
    setDotPosition({ x: dotX, y: dotY });
  }, [width, height, amplitude, generateWavePath]);

  useEffect(() => {
    const animate = () => {
      const centerY = height / 2;
      const baseAmplitude = amplitude * (height * 0.35);
      
      // Continue right-to-left wave movement during breathing phases, stop during holds
      if (phase !== 'pause1' && phase !== 'pause2') {
        animationTime.current += ANIMATION_SPEED;
      }
      
      // Calculate timing-based offset for peak/valley alignment
      let timingOffset = 0;
      
      if (phase === 'inhale') {
        // During inhale: move from valley to peak
        // Start with valley at center (offset = π), move to peak at center (offset = 0)
        timingOffset = Math.PI * (1 - phaseProgress);
      } else if (phase === 'pause1') {
        // Hold with peak at center
        timingOffset = 0;
      } else if (phase === 'exhale') {
        // During exhale: move from peak to valley
        // Start with peak at center (offset = 0), move to valley at center (offset = π)
        timingOffset = Math.PI * phaseProgress;
      } else if (phase === 'pause2') {
        // Hold with valley at center
        timingOffset = Math.PI;
      } else {
        // For 'ready' and 'complete' phases, start in valley position
        timingOffset = Math.PI;
      }
      
      // Combine right-to-left movement with timing-based positioning
      const totalWaveOffset = -animationTime.current + timingOffset;
      
      // Store the wave offset for use in render
      setCurrentWaveOffset(totalWaveOffset);
      
      const newPath = generateWavePath(0, baseAmplitude, 0, totalWaveOffset);
      setCurrentPath(newPath);
      
      // Fixed dot position - always center of screen horizontally
      const dotX = width / 2;
      
      // Calculate dot Y position to follow the wave at center position
      const waveY = Math.sin((0.5) * Math.PI * WAVE_FREQUENCY + totalWaveOffset) * baseAmplitude * WAVE_DAMPENING;
      const dotY = centerY + waveY;
      
      setDotPosition({ x: dotX, y: dotY });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [amplitude, generateWavePath, phase, phaseProgress, width, height]);

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
            d={generateWavePath(0, amplitude * (height * 0.25), 0, currentWaveOffset + 1)} // Use same sync offset but slightly shifted
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