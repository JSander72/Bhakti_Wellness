import { SoundGenerator } from '@/utils/soundGenerator';
import { setAudioModeAsync } from 'expo-audio';
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

export default function Session() {
  useKeepAwake();
  
  const router = useRouter();
  const params = useLocalSearchParams<{
    cycleDurationMs?: string;
    totalBreaths?: string;
    inhaleMs?: string;
    pause1Ms?: string;
    exhaleMs?: string;
    pause2Ms?: string;
    sound?: string;
  }>();

  const selectedSound = params.sound || "none";
  
  const cycleDurationMs = Number(params.cycleDurationMs ?? 4000);
  const totalBreaths = Number(params.totalBreaths ?? 5);
  const inhaleMs = Number(params.inhaleMs ?? cycleDurationMs * 0.4);
  const pause1Ms = Number(params.pause1Ms ?? 0);
  const exhaleMs = Number(params.exhaleMs ?? cycleDurationMs * 0.6);
  const pause2Ms = Number(params.pause2Ms ?? 0);

  // Animation and state
  const [currentBreath, setCurrentBreath] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'ready' | 'inhale' | 'pause1' | 'exhale' | 'pause2' | 'complete'>('ready');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [phaseProgress, setPhaseProgress] = useState(0);
  
  // Animated values
  const breathingBallScale = useRef(new Animated.Value(1)).current;
  const breathingBallOpacity = useRef(new Animated.Value(0.8)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  
  // Audio
  const soundGenerator = useRef<SoundGenerator | null>(null);
  
  // Session timing
  const sessionStartTime = useRef<number | null>(null);
  const phaseStartTime = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Initialize audio
  useEffect(() => {
    // Initialize sound generator
    soundGenerator.current = new SoundGenerator();
    
    if (selectedSound !== 'none') {
      setupAudio();
    }
    
    // Cleanup function
    return () => {
      if (soundGenerator.current) {
        soundGenerator.current.stop();
      }
    };
  }, [selectedSound]);

  const setupAudio = async () => {
    try {
      await setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start background sound if one is selected
      if (selectedSound !== 'none' && soundGenerator.current) {
        if (soundGenerator.current.getIsSupported()) {
          await soundGenerator.current.start(selectedSound);
          console.log('Background sound started:', selectedSound);
        } else {
          console.log('Background sound not supported on this platform:', selectedSound);
        }
      }
    } catch (error) {
      console.log('Audio setup failed:', error);
    }
  };

  const getPhaseInfo = useCallback((elapsed: number) => {
    const cycleTime = elapsed % cycleDurationMs;
    let accumTime = 0;
    
    if (cycleTime < (accumTime += inhaleMs)) {
      return { 
        name: 'inhale' as const, 
        progress: cycleTime / inhaleMs,
        isNewCycle: cycleTime < 100 // First 100ms of new cycle
      };
    }
    if (pause1Ms > 0 && cycleTime < (accumTime += pause1Ms)) {
      return { 
        name: 'pause1' as const, 
        progress: (cycleTime - inhaleMs) / pause1Ms,
        isNewCycle: false
      };
    }
    if (cycleTime < (accumTime += exhaleMs)) {
      const start = inhaleMs + pause1Ms;
      return { 
        name: 'exhale' as const, 
        progress: (cycleTime - start) / exhaleMs,
        isNewCycle: false
      };
    }
    if (pause2Ms > 0) {
      const start = inhaleMs + pause1Ms + exhaleMs;
      return { 
        name: 'pause2' as const, 
        progress: (cycleTime - start) / pause2Ms,
        isNewCycle: false
      };
    }
    
    return { name: 'inhale' as const, progress: 0, isNewCycle: false };
  }, [cycleDurationMs, inhaleMs, pause1Ms, exhaleMs, pause2Ms]);

  const animateBreathingBall = useCallback((phase: string, progress: number) => {
    let targetScale = 1;
    let targetOpacity = 0.8;

    switch (phase) {
      case 'inhale':
        targetScale = 1 + (progress * 0.8); // Scale from 1 to 1.8
        targetOpacity = 0.6 + (progress * 0.4); // Opacity from 0.6 to 1
        break;
      case 'pause1':
        targetScale = 1.8;
        targetOpacity = 1;
        break;
      case 'exhale':
        targetScale = 1.8 - (progress * 0.8); // Scale from 1.8 to 1
        targetOpacity = 1 - (progress * 0.2); // Opacity from 1 to 0.8
        break;
      case 'pause2':
        targetScale = 1;
        targetOpacity = 0.8;
        break;
      default:
        targetScale = 1;
        targetOpacity = 0.8;
    }

    Animated.parallel([
      Animated.timing(breathingBallScale, {
        toValue: targetScale,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(breathingBallOpacity, {
        toValue: targetOpacity,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [breathingBallScale, breathingBallOpacity]);

  const updateSession = useCallback(() => {
    if (!sessionStartTime.current) return;

    const elapsed = Date.now() - sessionStartTime.current;
    const newBreath = Math.floor(elapsed / cycleDurationMs);
    const overallProgress = Math.min(1, elapsed / (totalBreaths * cycleDurationMs));

    // Update progress bar
    Animated.timing(progressWidth, {
      toValue: overallProgress,
      duration: 100,
      useNativeDriver: false,
    }).start();

    // Check if session is complete
    if (newBreath >= totalBreaths && elapsed >= totalBreaths * cycleDurationMs) {
      setCurrentPhase('complete');
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Stop background sound
      if (soundGenerator.current) {
        soundGenerator.current.stop();
      }
      
      setTimeout(() => {
        Alert.alert(
          'Breath Session Complete', 
          'Great job! You completed your breathing session 🌟', 
          [{ text: 'OK', onPress: () => router.push('/') }]
        );
      }, 1500);
      return;
    }

    // Update current breath if needed
    if (newBreath > currentBreath && newBreath < totalBreaths) {
      setCurrentBreath(newBreath);
    }

    // Get current phase info
    const phaseInfo = getPhaseInfo(elapsed);
    
    // Update phase if it changed
    if (phaseInfo.name !== currentPhase) {
      setCurrentPhase(phaseInfo.name);
      phaseStartTime.current = Date.now();
    }

    // Update phase progress
    setPhaseProgress(phaseInfo.progress);

    // Animate breathing ball
    animateBreathingBall(phaseInfo.name, phaseInfo.progress);

    // Continue animation
    animationRef.current = requestAnimationFrame(updateSession);
  }, [
    currentBreath, 
    currentPhase, 
    cycleDurationMs, 
    totalBreaths, 
    getPhaseInfo, 
    animateBreathingBall, 
    progressWidth, 
    router
  ]);

  const startSession = useCallback(() => {
    setSessionStarted(true);
    setCurrentPhase('inhale');
    sessionStartTime.current = Date.now();
    phaseStartTime.current = Date.now();
    animationRef.current = requestAnimationFrame(updateSession);
  }, [updateSession]);

  // Start session after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      startSession();
    }, 2000);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Stop background sound on cleanup
      if (soundGenerator.current) {
        soundGenerator.current.stop();
      }
    };
  }, [startSession]);

  const getInstructionText = () => {
    switch (currentPhase) {
      case 'ready':
        return 'Get Ready';
      case 'inhale':
        return 'Inhale';
      case 'pause1':
      case 'pause2':
        return 'Hold';
      case 'exhale':
        return 'Exhale';
      case 'complete':
        return 'Complete!';
      default:
        return 'Breathe';
    }
  };

  const getInstructionStyle = () => {
    switch (currentPhase) {
      case 'inhale':
        return [styles.instructions, styles.inhaling];
      case 'pause1':
      case 'pause2':
        return [styles.instructions, styles.holding];
      case 'exhale':
        return [styles.instructions, styles.exhaling];
      case 'complete':
        return [styles.instructions, styles.complete];
      default:
        return styles.instructions;
    }
  };

  const getBallColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return '#00ffcc';
      case 'exhale':
        return '#ff6b9d';
      case 'pause1':
      case 'pause2':
        return '#ffcc00';
      default:
        return '#00ffcc';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={getInstructionStyle()}>{getInstructionText()}</Text>
      
      {sessionStarted && (
        <Text style={styles.counter}>
          Breath {currentBreath + 1} of {totalBreaths}
        </Text>
      )}

      <View style={styles.breathingContainer}>
        {/* Breathing Ball */}
        <Animated.View
          style={[
            styles.breathingBall,
            {
              backgroundColor: getBallColor(),
              transform: [{ scale: breathingBallScale }],
              opacity: breathingBallOpacity,
            },
          ]}
        />
        
        {/* Pause Indicator */}
        {(currentPhase === 'pause1' || currentPhase === 'pause2') && (
          <View style={styles.pauseIndicator}>
            <Text style={styles.pauseText}>HOLD</Text>
          </View>
        )}

        {/* Breathing Guide Circles */}
        <View style={[styles.guideCircle, styles.innerCircle]} />
        <View style={[styles.guideCircle, styles.outerCircle]} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  instructions: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
    height: 50,
  },
  inhaling: {
    color: '#00ffcc',
  },
  holding: {
    color: '#ffcc00',
  },
  exhaling: {
    color: '#ff6b9d',
  },
  complete: {
    color: '#4ecdc4',
  },
  counter: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 40,
    color: '#fff',
    textAlign: 'center',
  },
  breathingContainer: {
    position: 'relative',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  breathingBall: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'absolute',
    shadowColor: '#00ffcc',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  pauseIndicator: {
    position: 'absolute',
    top: 120,
    backgroundColor: 'rgba(255, 204, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 204, 0, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  pauseText: {
    color: '#ffcc00',
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: '600',
  },
  guideCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 150,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  innerCircle: {
    width: 150,
    height: 150,
  },
  outerCircle: {
    width: 250,
    height: 250,
  },
  progressContainer: {
    marginTop: 40,
    width: '80%',
    maxWidth: 400,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ffcc',
  },
});