import React, { useCallback, useEffect, useRef } from 'react';
import { ImageBackground, ImageSourcePropType, Platform, StyleSheet, View } from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';

interface SoundWaveProps {
  amplitude: number; // 0 to 1, controls wave height
  color: string;
  phase: 'inhale' | 'exhale' | 'pause1' | 'pause2' | 'ready' | 'complete';
  phaseProgress: number; // 0 to 1, progress within current phase
  sessionStarted: boolean; // Whether the breathing session has actually started
  width?: number;
  height?: number;
  // Optional container visuals and layout
  backgroundImage?: ImageSourcePropType;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
}

export const SoundWave: React.FC<SoundWaveProps> = ({
  amplitude,
  color,
  phase,
  phaseProgress,
  sessionStarted,
  width = 300,
  height = 120,
  backgroundImage,
  backgroundColor = 'rgba(255,255,255,0.03)',
  borderRadius = 16,
  padding,
}) => {
  const [currentPath, setCurrentPath] = React.useState('');
  const [dotPosition, setDotPosition] = React.useState({ x: width / 2, y: height / 2 });
  // Breathing-driven phase (theta) and a cumulative base that ensures continuous forward scrolling across cycles
  const prevThetaRef = useRef<number | null>(null);
  const phaseBaseRef = useRef<number>(0); // increases by 2π when theta wraps to keep wave flowing in one direction

  // Wave configuration
  const WAVELENGTH = 150; // Wavelength in pixels

  // Compute breathing angle theta (0.. ~3π/2) from phase and progress
  // Mapping: inhale -> 0..π/2 (rise), pause1 -> π/2, exhale -> π/2..3π/2 (fall), pause2 -> 3π/2, ready/complete -> 0
  const getTheta = useCallback(() => {
    if (phase === 'inhale') {
      return (Math.PI / 2) * Math.min(1, Math.max(0, phaseProgress));
    }
    if (phase === 'pause1') {
      return Math.PI / 2;
    }
    if (phase === 'exhale') {
      return Math.PI / 2 + Math.PI * Math.min(1, Math.max(0, phaseProgress));
    }
    if (phase === 'pause2') {
      return (3 * Math.PI) / 2;
    }
    // ready/complete
    return 0;
  }, [phase, phaseProgress]);

  // Generate an anchored sine wave path with phaseOffset controlling horizontal scroll
  const generateWavePath = useCallback((phaseOffset: number): string => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Use a larger visual amplitude for the wave to make it more pronounced
    const baseWaveAmp = Math.min(height * 0.3, 40); // 30% of height or max 40px
    const visualWaveAmplitude = baseWaveAmp * (0.5 + amplitude * 0.5);
    
    let path = '';
    const step = 2; // Pixels between points
    
    for (let x = 0; x <= width; x += step) {
      const relativeX = x - centerX;
      const wavePhase = (relativeX / WAVELENGTH) * Math.PI * 2 + phaseOffset;
      const y = centerY + Math.sin(wavePhase) * visualWaveAmplitude; // anchored to centerY
      
      if (x === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
    
    return path;
  }, [width, height, amplitude]);

  useEffect(() => {
    // Compute theta from breathing phase/progress
    const theta = getTheta();

    // Detect wrap (e.g., from ~3π/2 back to 0 at new cycle) and adjust base
    // Add exactly the theta drop to keep wavePhase continuous (no jump)
    if (prevThetaRef.current !== null) {
      const prevTheta = prevThetaRef.current;
      const drop = theta - prevTheta; // negative on wrap
      if (drop < -Math.PI / 2) {
        // Advance base by the amount we lost so (base+theta) stays continuous
        phaseBaseRef.current += prevTheta - theta;
      }
    }
    prevThetaRef.current = theta;

    // Phase that drives the whole wave
    const wavePhase = phaseBaseRef.current + theta;

    // Dimensions and amplitude
    const centerX = width / 2;
    const centerY = height / 2;
    const baseWaveAmp = Math.min(height * 0.3, 40);
    const visualWaveAmplitude = baseWaveAmp * (0.5 + amplitude * 0.5);
    const innerPad = padding ?? Math.min(12, height * 0.08);

    // Dot stays centered horizontally and rides the wave vertically
    const dotX = centerX;
    let dotY = centerY + Math.sin(wavePhase) * visualWaveAmplitude;
    // Clamp for safety
    const minY = innerPad;
    const maxY = height - innerPad;
    if (dotY < minY) dotY = minY;
    if (dotY > maxY) dotY = maxY;

    // Generate wave path with current phase
    const wavePath = generateWavePath(wavePhase);
    setCurrentPath(wavePath);
    setDotPosition({ x: dotX, y: dotY });
  }, [getTheta, generateWavePath, width, height, amplitude, padding]);

  return (
    <View style={[styles.container, { width, height }]}> 
      {backgroundImage ? (
        <ImageBackground
          source={backgroundImage}
          resizeMode="cover"
          style={[styles.waveContainer, { borderRadius, overflow: 'hidden' }]}
          imageStyle={{ borderRadius }}
        >
          <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
            {/* Forward-moving wave that perfectly aligns with dot */}
            <Path d={currentPath} stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Breathing dot - always sits exactly on the wave */}
            <Circle cx={dotPosition.x} cy={dotPosition.y} r={6} fill={color} opacity={0.9} />
            {/* Dot glow effect */}
            <Circle cx={dotPosition.x} cy={dotPosition.y} r={12} fill={color} opacity={0.3} />
          </Svg>
        </ImageBackground>
      ) : (
        <View style={[styles.waveContainer, { backgroundColor, borderRadius, overflow: 'hidden' }]}> 
          <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
            {/* Forward-moving wave that perfectly aligns with dot */}
            <Path d={currentPath} stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Breathing dot - always sits exactly on the wave */}
            <Circle cx={dotPosition.x} cy={dotPosition.y} r={6} fill={color} opacity={0.9} />
            {/* Dot glow effect */}
            <Circle cx={dotPosition.x} cy={dotPosition.y} r={12} fill={color} opacity={0.3} />
          </Svg>
        </View>
      )}
      
      {/* Glow effect container */}
      <View
        style={[
          styles.glow,
          // Dimensions (all platforms)
          { width: width * 0.9, height: height * 0.7 },
          // Platform-specific shadow presentation
          Platform.select({
            web: {
              // Use CSS box-shadow on web
              boxShadow: `0px 0px 25px ${color}` as any,
            },
            ios: {
              shadowColor: color,
            },
            android: {
              shadowColor: color,
            },
            default: {},
          }),
          { pointerEvents: 'none' as any },
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
  waveContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    borderRadius: 60,
    backgroundColor: 'transparent',
    // Only apply native shadow props on native platforms
    ...Platform.select({
      web: {},
      default: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 25,
        elevation: 10,
      },
    }),
  },
});