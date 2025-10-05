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
  const ANIMATION_SPEED = 0.006; // Balanced speed for breathing rhythm

  // Phase alignment helpers (ensure valley/peak happen at the center x)
  // For a sine wave: peak at angle = π/2, valley at angle = 3π/2
  const KX_CENTER = 0.5 * Math.PI * WAVE_FREQUENCY; // phase contribution at x = width/2
  const PEAK_OFFSET = (Math.PI / 2) - KX_CENTER;     // offset so center shows a peak
  const VALLEY_OFFSET = (3 * Math.PI / 2) - KX_CENTER; // offset so center shows a valley
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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
    const initialOffset = VALLEY_OFFSET; // Start with valley at center
    
    // Initialize path and dot position
    const initialPath = generateWavePath(0, baseAmplitude, 0, initialOffset);
    setCurrentPath(initialPath);
    setCurrentWaveOffset(initialOffset);
    
    const dotX = width / 2;
    const waveY = Math.sin(KX_CENTER + initialOffset) * baseAmplitude * WAVE_DAMPENING;
    const dotY = centerY + waveY;
    setDotPosition({ x: dotX, y: dotY });
  }, [width, height, amplitude, generateWavePath, VALLEY_OFFSET, KX_CENTER]);

  useEffect(() => {
    const animate = () => {
      const centerY = height / 2;
      const baseAmplitude = amplitude * (height * 0.35);
      
      // Two-speed system: move during inhale/exhale, freeze during holds
      if (phase === 'inhale' || phase === 'exhale') {
        // Active breathing phases - wave moves
        animationTime.current += ANIMATION_SPEED;
      }
      // During pause1 and pause2: animationTime stays the same (freeze)
      // During ready: wave moves gently
      if (phase === 'ready') {
        animationTime.current += ANIMATION_SPEED * 0.5; // Slower during ready
      }
      
      // Keep path drift independent of breathing to avoid direction flips
      // Always start with center valley alignment and drift left over time
      const PATH_BASE_OFFSET = VALLEY_OFFSET;
      const totalWaveOffset = animationTime.current + PATH_BASE_OFFSET;
      
      // Store the wave offset for use in render
      setCurrentWaveOffset(totalWaveOffset);
      
      const newPath = generateWavePath(0, baseAmplitude, 0, totalWaveOffset);
      setCurrentPath(newPath);
      
      // Fixed dot position - always center of screen horizontally
      const dotX = width / 2;
      
      // Calculate dot Y position purely from breathing phase (center alignment)
      let centerPhaseAngle = KX_CENTER + VALLEY_OFFSET; // default valley
      const clamp = (t: number) => Math.min(1, Math.max(0, t));
      if (phase === 'inhale') {
        centerPhaseAngle = KX_CENTER + lerp(VALLEY_OFFSET, PEAK_OFFSET, clamp(phaseProgress));
      } else if (phase === 'pause1') {
        centerPhaseAngle = KX_CENTER + PEAK_OFFSET;
      } else if (phase === 'exhale') {
        centerPhaseAngle = KX_CENTER + lerp(PEAK_OFFSET, VALLEY_OFFSET, clamp(phaseProgress));
      } else if (phase === 'pause2') {
        centerPhaseAngle = KX_CENTER + VALLEY_OFFSET;
      } else if (phase === 'ready') {
        centerPhaseAngle = KX_CENTER + VALLEY_OFFSET;
      }
      const waveY = Math.sin(centerPhaseAngle) * baseAmplitude * WAVE_DAMPENING;
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
  }, [amplitude, generateWavePath, phase, phaseProgress, width, height, PEAK_OFFSET, VALLEY_OFFSET, KX_CENTER]);

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