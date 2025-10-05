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

  // Generate a center-anchored drifting wave: the phase at center stays aligned with baseOffset,
  // while the sides drift with `driftPhase` to create leftward flow without desynchronizing the center.
  const generateWavePath = React.useCallback((driftPhase: number, waveAmplitude: number, verticalShift: number = 0, baseOffset: number = 0) => {
    // Scale the number of points based on width for better quality on larger screens
    const points = Math.max(60, Math.min(120, Math.floor(width / 4)));
    const centerY = height / 2;
    let path = '';
    
    // Use consistent wave properties throughout - no changes between phases
    const frequency = WAVE_FREQUENCY;
    const dampening = WAVE_DAMPENING;
    
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      // Center-anchored phase gradient: keeps center aligned, drifts edges
      const xNorm = (x / width) - 0.5; // -0.5..0.5 (0 at center)
      const phase = (x / width) * Math.PI * frequency + baseOffset + driftPhase * xNorm * 2; // zero drift at center
      const waveY = Math.sin(phase) * waveAmplitude * dampening;
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
    const initialBaseOffset = VALLEY_OFFSET; // Start with valley at center
    
    // Initialize path and dot position
    const initialPath = generateWavePath(0, baseAmplitude, 0, initialBaseOffset);
    setCurrentPath(initialPath);
    
    const dotX = width / 2;
  const waveY = Math.sin(KX_CENTER + initialBaseOffset) * baseAmplitude * WAVE_DAMPENING;
    const dotY = centerY + waveY;
    setDotPosition({ x: dotX, y: dotY });
  }, [width, height, amplitude, generateWavePath, VALLEY_OFFSET, KX_CENTER]);

  useEffect(() => {
    const animate = () => {
      const centerY = height / 2;
      const baseAmplitude = amplitude * (height * 0.35);
      
      // Two-speed system for drift (unidirectional): move on inhale/exhale, freeze on holds, gentle on ready
      if (phase === 'inhale' || phase === 'exhale') animationTime.current += ANIMATION_SPEED;
      else if (phase === 'ready') animationTime.current += ANIMATION_SPEED * 0.5;
      
      // Calculate dot Y position purely from breathing phase (center alignment)
      // Also use this to lock the path's center to the breathing phase while adding drift.
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

  // Build path with center-anchored baseOffset and driftPhase
  const baseOffset = centerPhaseAngle - KX_CENTER;
  const driftPhase = animationTime.current;
  const newPath = generateWavePath(driftPhase, baseAmplitude, 0, baseOffset);
      setCurrentPath(newPath);

  // Fixed center dot position - always center of screen horizontally
      const dotX = width / 2;
  const waveYCenter = Math.sin(centerPhaseAngle) * baseAmplitude * WAVE_DAMPENING;
  const dotY = centerY + waveYCenter;
      
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
          {/* Rebuilt wave aligned to the center dot with unidirectional drift */}
          <Path
            d={currentPath}
            stroke={color}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
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