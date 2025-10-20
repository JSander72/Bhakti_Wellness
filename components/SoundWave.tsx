import React, { useCallback, useEffect } from 'react';
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

  // Wave configuration
  const WAVELENGTH = 150; // Wavelength in pixels

  // Piecewise phase and amplitude to ensure perfect peak/valley alignment on pauses
  // Anchors: valley = 3π/2, peak = π/2
  const getPhaseAndAmplitude = useCallback(() => {
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const snap = (v: number, eps = 0.0001) => (v <= eps ? 0 : v >= 1 - eps ? 1 : v);

    const PHASE_VALLEY = 1.5 * Math.PI;
    const PHASE_PEAK = 0.5 * Math.PI;

    // Compute visual amplitude bounds from container height and provided amplitude prop
    const centerY = height / 2;
    const innerPad = padding ?? Math.min(12, height * 0.08);
    const maxVisual = Math.max(0, centerY - innerPad);
    // Base wave cap for visual pleasantness
    const baseWaveCap = Math.min(height * 0.35, 40);
    const A_MAX = Math.min(maxVisual, baseWaveCap) * (0.5 + amplitude * 0.5); // respect provided amplitude prop
    const A_MIN = Math.min(A_MAX, Math.min(height * 0.10, 12)); // small but non-zero valley amplitude

    let phaseOffset = PHASE_VALLEY;
    let visualAmp = (A_MIN + A_MAX) / 2;

    if (phase === 'inhale') {
      const p = snap(clamp01(phaseProgress));
      phaseOffset = PHASE_VALLEY + Math.PI * p; // valley -> peak
      visualAmp = A_MIN + (A_MAX - A_MIN) * p;  // ramp up
    } else if (phase === 'pause1') {
      phaseOffset = PHASE_PEAK; // hold at peak
      visualAmp = A_MAX;
    } else if (phase === 'exhale') {
      const p = snap(clamp01(phaseProgress));
      phaseOffset = PHASE_PEAK + Math.PI * p;   // peak -> valley
      visualAmp = A_MAX - (A_MAX - A_MIN) * p;  // ramp down
    } else if (phase === 'pause2') {
      phaseOffset = PHASE_VALLEY; // hold at valley
      visualAmp = A_MIN;
    } else {
      // ready/complete: default to gentle valley
      phaseOffset = PHASE_VALLEY;
      visualAmp = (A_MIN + A_MAX) / 2;
    }

    return { phaseOffset, visualAmp };
  }, [phase, phaseProgress, height, amplitude, padding]);

  // Generate an anchored sine wave path with phaseOffset controlling horizontal scroll
  const generateWavePath = useCallback((phaseOffset: number, amplitudeOverride?: number): string => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Use a larger visual amplitude for the wave to make it more pronounced
    const baseWaveAmp = Math.min(height * 0.3, 40); // 30% of height or max 40px
    const rawAmp = baseWaveAmp * (0.5 + amplitude * 0.5);
    const innerPad = padding ?? Math.min(12, height * 0.08);
    const maxAmp = Math.max(0, centerY - innerPad);
    const computedAmp = Math.min(rawAmp, maxAmp);
    const visualWaveAmplitude = amplitudeOverride !== undefined ? Math.min(amplitudeOverride, maxAmp) : computedAmp;
    
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
  }, [width, height, amplitude, padding]);

  useEffect(() => {
    // Compute unified phase offset and segment-aware amplitude
    const { phaseOffset, visualAmp } = getPhaseAndAmplitude();

    const centerX = width / 2;
    const centerY = height / 2;

    // Dot stays centered horizontally and rides the wave vertically using SAME function as path
    const dotX = centerX;
    const dotY = centerY + Math.sin(phaseOffset) * visualAmp;

    // Generate wave path with current piecewise-controlled phase
    const wavePath = generateWavePath(phaseOffset, visualAmp);
    setCurrentPath(wavePath);
    setDotPosition({ x: dotX, y: dotY });
  }, [getPhaseAndAmplitude, generateWavePath, width, height]);

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