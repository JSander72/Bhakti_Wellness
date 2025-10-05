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

  // Single consistent wave properties - no changes between phases
  const WAVE_FREQUENCY = 2;
  const WAVE_DAMPENING = 1.8; // Increased from 1.2 for more dramatic waves
  const ANIMATION_SPEED = 0.008;

  useEffect(() => {
    // Don't animate opacity changes - keep it constant for smoother transitions
    // This prevents visual changes when transitioning between phases
  }, [phase, opacityAnim]);

  const generateWavePath = React.useCallback((time: number, waveAmplitude: number, verticalShift: number = 0, waveOffset: number = 0) => {
    const points = 80;
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
    const animate = () => {
      // Use consistent animation speed, only stop during holds
      let animationSpeed = ANIMATION_SPEED;
      
      if (phase === 'pause1' || phase === 'pause2') {
        animationSpeed = 0; // Stop wave movement during holds
      }
      
      // Only update animation time if not in a hold phase
      if (phase !== 'pause1' && phase !== 'pause2') {
        animationTime.current += animationSpeed;
      }
      
      // No vertical shift - keep wave centered throughout entire process
      const verticalShift = 0;
      const baseAmplitude = amplitude * (height * 0.35); // Increased from 0.2 to 0.35 for more dramatic waves
      
      // Wave moves right to left (negative offset creates right-to-left movement)
      const waveOffset = -animationTime.current;
      
      const newPath = generateWavePath(0, baseAmplitude, verticalShift, waveOffset);
      setCurrentPath(newPath);
      
      // Fixed dot position - always center of screen horizontally
      const dotX = width / 2;
      
      // Calculate dot Y position based on the wave at center X position
      const centerY = height / 2;
      const waveY = Math.sin((0.5) * Math.PI * WAVE_FREQUENCY + waveOffset) * baseAmplitude * WAVE_DAMPENING;
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
            d={generateWavePath(0, amplitude * (height * 0.25), 0, -animationTime.current + 1)} // Increased from 0.15 to 0.25
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