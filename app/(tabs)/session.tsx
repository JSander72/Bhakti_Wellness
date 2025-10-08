import { BreathingCircle } from '@/components/BreathingCircle';
import { SoundWave } from '@/components/SoundWave';
import { ProductionSoundManager } from '@/utils/productionSoundManager';
import { useKeepAwake } from 'expo-keep-awake';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Platform, StyleSheet, Text, View } from 'react-native';

export default function Session() {
  useKeepAwake();
  
  const router = useRouter();
  
  // Get screen dimensions for responsive design
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isTablet = screenWidth >= 768; // iPad and larger
  const isSmallPhone = screenWidth < 375; // iPhone SE and smaller
  
  // Responsive sizing calculations
  const responsiveWaveWidth = Math.min(screenWidth * 0.9, isTablet ? 400 : 320);
  const responsiveWaveHeight = Math.min(screenHeight * 0.15, isTablet ? 150 : 120);
  const responsiveCircleSize = Math.min(screenWidth * 0.8, screenHeight * 0.4, isTablet ? 500 : 350);
  const responsiveFontSizes = {
    instructions: isTablet ? 38 : isSmallPhone ? 28 : 32,
    counter: isTablet ? 18 : 16,
    timer: isTablet ? 16 : 14,
    phaseLabel: isTablet ? 20 : 18,
    phaseCountdown: isTablet ? 36 : 32,
  };
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
  
  // Validate and parse timing parameters with proper defaults
  const cycleDurationMs = Number(params.cycleDurationMs) || 4000;
  const totalBreaths = Number(params.totalBreaths) || 5;
  const inhaleMs = Number(params.inhaleMs) || Math.round(cycleDurationMs * 0.4);
  const pause1Ms = Number(params.pause1Ms) || 0;
  const exhaleMs = Number(params.exhaleMs) || Math.round(cycleDurationMs * 0.6);
  const pause2Ms = Number(params.pause2Ms) || 0;

  // Debug log the received parameters
  console.log('Session Parameters:', {
    cycleDurationMs,
    totalBreaths,
    inhaleMs,
    pause1Ms,
    exhaleMs,
    pause2Ms,
    selectedSound
  });

  // Calculate total session duration
  const totalSessionMs = totalBreaths * cycleDurationMs;

  // Animation and state
  const [currentBreath, setCurrentBreath] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'ready' | 'inhale' | 'pause1' | 'exhale' | 'pause2' | 'complete'>('ready');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [remainingTimeMs, setRemainingTimeMs] = useState(totalSessionMs);
  const [currentPhaseProgress, setCurrentPhaseProgress] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(10);
  const [showCountdown, setShowCountdown] = useState(true);
  const [currentPhaseTimeRemaining, setCurrentPhaseTimeRemaining] = useState(0);
  
  // Animated values
  const [waveAmplitude] = useState(0.85); // Constant amplitude for consistent wave effect
  const instructionOpacity = useRef(new Animated.Value(1)).current;
  const completionScale = useRef(new Animated.Value(0)).current;
  const countdownScale = useRef(new Animated.Value(1)).current;
  
  // Audio
  const soundManager = useRef<ProductionSoundManager | null>(null);
  
  // Session timing
  const sessionStartTime = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize audio
  const setupAudio = useCallback(async () => {
    try {
      // Note: Audio mode is now handled by ProductionSoundManager
      // Start background sound if one is selected
      if (selectedSound !== 'none' && soundManager.current) {
        await soundManager.current.start(selectedSound);
        console.log('Background sound started:', selectedSound);
      }
    } catch (error) {
      console.log('Audio setup failed:', error);
    }
  }, [selectedSound]);

  // Reset session state when new parameters are received (new session starting)
  useEffect(() => {
    console.log('Resetting session state for new session');
    
    // Reset all state variables to initial values
    setCurrentBreath(0);
    setCurrentPhase('ready');
    setSessionStarted(false);
    setRemainingTimeMs(totalSessionMs);
    setCurrentPhaseProgress(0);
    setCountdownSeconds(10);
    setShowCountdown(true);
    setCurrentPhaseTimeRemaining(0);
    
    // Reset animated values
    instructionOpacity.setValue(1);
    completionScale.setValue(0);
    countdownScale.setValue(1);
    
    // Reset session timing
    sessionStartTime.current = null;
    
    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    console.log('✅ Session state reset complete');
  }, [params.cycleDurationMs, params.totalBreaths, params.inhaleMs, params.pause1Ms, params.exhaleMs, params.pause2Ms, totalSessionMs, instructionOpacity, completionScale, countdownScale]);

  useEffect(() => {
    // Initialize sound manager
    soundManager.current = new ProductionSoundManager();
    
    if (selectedSound !== 'none') {
      setupAudio();
    }
    
    // Cleanup function - runs when component unmounts or dependencies change
    return () => {
      console.log('Session component cleanup - stopping audio');
      if (soundManager.current) {
        soundManager.current.stop();
        console.log('✅ Audio stopped during component cleanup');
      }
    };
  }, [selectedSound, setupAudio]);

  // Handle navigation focus/blur to stop sounds when leaving the tab
  useFocusEffect(
    useCallback(() => {
      console.log('Session tab focused');
      
      // Tab is focused - restart audio if needed and session is active
      if (selectedSound !== 'none' && soundManager.current && sessionStarted) {
        if (!soundManager.current.getIsPlaying()) {
          console.log('Restarting audio on focus:', selectedSound);
          setupAudio();
        }
      }

      // Return cleanup function for when tab loses focus
      return () => {
        console.log('Session tab lost focus - stopping audio');
        // Web a11y: blur any focused element so it doesn't remain inside an aria-hidden ancestor
        if (Platform.OS === 'web' && typeof document !== 'undefined') {
          const active = document.activeElement as HTMLElement | null;
          if (active && typeof active.blur === 'function') {
            active.blur();
          }
        }
        // Tab is losing focus - always stop any playing sounds
        if (soundManager.current) {
          soundManager.current.stop();
          console.log('✅ Background sound stopped due to navigation away from session');
        }
      };
    }, [selectedSound, setupAudio, sessionStarted])
  );

  const getPhaseInfo = useCallback((elapsed: number) => {
    const cycleTime = elapsed % cycleDurationMs;
    let accumTime = 0;
    
    if (cycleTime < (accumTime += inhaleMs)) {
      return { 
        name: 'inhale' as const, 
        progress: cycleTime / inhaleMs,
        phaseElapsed: cycleTime,
        phaseDuration: inhaleMs
      };
    }
    if (pause1Ms > 0 && cycleTime < (accumTime += pause1Ms)) {
      const phaseElapsed = cycleTime - inhaleMs;
      return { 
        name: 'pause1' as const, 
        progress: phaseElapsed / pause1Ms,
        phaseElapsed,
        phaseDuration: pause1Ms
      };
    }
    if (cycleTime < (accumTime += exhaleMs)) {
      const start = inhaleMs + pause1Ms;
      const phaseElapsed = cycleTime - start;
      return { 
        name: 'exhale' as const, 
        progress: phaseElapsed / exhaleMs,
        phaseElapsed,
        phaseDuration: exhaleMs
      };
    }
    if (pause2Ms > 0) {
      const start = inhaleMs + pause1Ms + exhaleMs;
      const phaseElapsed = cycleTime - start;
      return { 
        name: 'pause2' as const, 
        progress: phaseElapsed / pause2Ms,
        phaseElapsed,
        phaseDuration: pause2Ms
      };
    }
    
    return { 
      name: 'inhale' as const, 
      progress: 0, 
      phaseElapsed: 0,
      phaseDuration: inhaleMs
    };
  }, [cycleDurationMs, inhaleMs, pause1Ms, exhaleMs, pause2Ms]);

  const updateSession = useCallback(() => {
    if (!sessionStartTime.current) return;

    const elapsed = Date.now() - sessionStartTime.current;
    const newBreath = Math.floor(elapsed / cycleDurationMs);
    
    // Update remaining time
    const remaining = Math.max(0, totalSessionMs - elapsed);
    setRemainingTimeMs(remaining);

    // Check if session is complete
    if (newBreath >= totalBreaths && elapsed >= totalBreaths * cycleDurationMs) {
      setCurrentPhase('complete');
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Stop background sound
      if (soundManager.current) {
        soundManager.current.stop();
      }
      
      // Animate completion celebration
      Animated.spring(completionScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
      
      // Auto-redirect to home after a brief celebration
      setTimeout(() => {
        try {
          // Navigate back to the Tabs home screen
          router.push('/(tabs)');
        } catch {
          // Fallback to root if typing complains, root will redirect accordingly
          router.push('/');
        }
      }, 3000); // Show celebration for ~3s before redirect
      return;
    }

    // Update current breath if needed
    if (newBreath > currentBreath && newBreath < totalBreaths) {
      setCurrentBreath(newBreath);
    }

    // Get current phase info
    const phaseInfo = getPhaseInfo(elapsed);
    
    // Update current phase progress
    setCurrentPhaseProgress(phaseInfo.progress);
    
    // Calculate and update phase time remaining
    const phaseTimeRemaining = Math.max(0, phaseInfo.phaseDuration - phaseInfo.phaseElapsed);
    setCurrentPhaseTimeRemaining(Math.ceil(phaseTimeRemaining / 1000)); // Convert to seconds
    
    // Update phase if it changed
    if (phaseInfo.name !== currentPhase) {
      setCurrentPhase(phaseInfo.name);
      
      // Animate instruction text transition
      Animated.sequence([
        Animated.timing(instructionOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(instructionOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Continue animation
    animationRef.current = requestAnimationFrame(updateSession);
  }, [
    currentBreath, 
    currentPhase, 
    cycleDurationMs, 
    totalBreaths, 
    totalSessionMs,
    getPhaseInfo, 
    instructionOpacity,
    completionScale,
    router
  ]);

  const startSession = useCallback(() => {
    // Validate parameters before starting
    if (cycleDurationMs <= 0 || totalBreaths <= 0 || (inhaleMs + pause1Ms + exhaleMs + pause2Ms) <= 0) {
      console.error('Invalid breathing parameters:', {
        cycleDurationMs,
        totalBreaths,
        inhaleMs,
        pause1Ms,
        exhaleMs,
        pause2Ms
      });
      Alert.alert('Error', 'Invalid breathing parameters. Please go back and set valid values.');
      return;
    }

    console.log('Starting session with parameters:', {
      cycleDurationMs,
      totalBreaths,
      inhaleMs,
      pause1Ms,
      exhaleMs,
      pause2Ms
    });

    setSessionStarted(true);
    setCurrentPhase('inhale');
    setCurrentPhaseProgress(0); // Start at beginning of inhale
    sessionStartTime.current = Date.now();
    animationRef.current = requestAnimationFrame(updateSession);
  }, [updateSession, cycleDurationMs, totalBreaths, inhaleMs, pause1Ms, exhaleMs, pause2Ms]);

  // Start session after countdown
  useEffect(() => {
    if (!showCountdown) return;

    const countdownInterval = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          // Countdown finished, start the session
          clearInterval(countdownInterval);
          setShowCountdown(false);
          setTimeout(() => {
            startSession();
          }, 500); // Brief pause after "GO"
          return 0;
        }
        
        // Animate countdown numbers
        if (prev <= 3) {
          Animated.sequence([
            Animated.timing(countdownScale, {
              toValue: 1.3,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(countdownScale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Stop background sound on cleanup
      if (soundManager.current) {
        soundManager.current.stop();
      }
    };
  }, [startSession, showCountdown, countdownScale]);

  const getInstructionText = () => {
    if (showCountdown) {
      if (countdownSeconds > 3) {
        return 'Get Ready';
      } else if (countdownSeconds > 0) {
        return countdownSeconds.toString();
      } else {
        return 'Begin';
      }
    }

    switch (currentPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'pause1':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'pause2':
        return 'Hold';
      case 'complete':
        return 'Well Done!';
      default:
        return 'Breathe';
    }
  };

  const getPhaseDisplayName = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Inhale';
      case 'pause1':
        return 'Hold';
      case 'exhale':
        return 'Exhale';
      case 'pause2':
        return 'Hold';
      default:
        return '';
    }
  };

  const getInstructionStyle = () => {
    if (showCountdown) {
      if (countdownSeconds > 3) {
        return [styles.instructions, styles.getReady];
      } else if (countdownSeconds > 0) {
        return [styles.instructions, styles.countdown];
      } else {
        return [styles.instructions, styles.go];
      }
    }

    switch (currentPhase) {
      case 'complete':
        return [styles.instructions, styles.complete];
      default:
        // Use consistent style for all breathing phases
        return [styles.instructions, styles.breathing];
    }
  };

  const waveColor = '#00ffcc';

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={[
        getInstructionStyle(), 
        { 
          fontSize: responsiveFontSizes.instructions,
          opacity: instructionOpacity,
          transform: showCountdown && countdownSeconds <= 3 && countdownSeconds > 0 
            ? [{ scale: countdownScale }] 
            : []
        }
      ]}>
        {getInstructionText()}
      </Animated.Text>
      
      {sessionStarted && (
        <Text style={[styles.counter, { fontSize: responsiveFontSizes.counter }]}>
          Breath {currentBreath + 1} of {totalBreaths}
        </Text>
      )}

      {!sessionStarted && !showCountdown && currentPhase === 'ready' && (
        <Text style={styles.readyInfo}>
          {totalBreaths} breaths • {formatTime(totalSessionMs)} session
        </Text>
      )}

      {showCountdown && countdownSeconds > 3 && (
        <Text style={styles.readyInfo}>
          {totalBreaths} breaths • {formatTime(totalSessionMs)} session
        </Text>
      )}

      {sessionStarted && (
        <Text style={[styles.timer, { fontSize: responsiveFontSizes.timer }]}>
          Time Remaining: {formatTime(remainingTimeMs)}
        </Text>
      )}

      <View style={styles.breathingContainer}>
        {/* Sound Wave Animation - First */}
        <View style={styles.waveContainer}>
          <SoundWave
            amplitude={waveAmplitude}
            color={waveColor}
            phase={currentPhase}
            phaseProgress={currentPhaseProgress}
            sessionStarted={sessionStarted}
            width={responsiveWaveWidth}
            height={responsiveWaveHeight}
          />
        </View>
        
        {/* Breathing Circle - Second - Now responsive */}
        {!showCountdown && (
          <View style={styles.circleContainer}>
            <BreathingCircle
              phase={currentPhase}
              phaseProgress={currentPhaseProgress}
              color={waveColor}
              size={responsiveCircleSize}
            />
            
            {/* Phase countdown overlay centered in circle */}
            {sessionStarted && currentPhase !== 'complete' && (
              <View style={styles.phaseCountdownOverlay}>
                <Text style={[styles.phaseLabel, { fontSize: responsiveFontSizes.phaseLabel }]}>
                  {getPhaseDisplayName()}
                </Text>
                <Text style={[styles.phaseCountdown, { fontSize: responsiveFontSizes.phaseCountdown }]}>
                  {currentPhaseTimeRemaining}s
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Completion Celebration */}
      {currentPhase === 'complete' && (
        <Animated.View style={[styles.completionCelebration, { transform: [{ scale: completionScale }] }]}>
          <Text style={styles.celebrationText}>🌟</Text>
          <Text style={styles.celebrationMessage}>Session Complete!</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '5%', // Responsive horizontal padding
  },
  instructions: {
    fontWeight: '300',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: '3%',
    textAlign: 'center',
    color: '#fff',
    minHeight: 50,
  },
  breathing: {
    color: '#00ffcc',
  },
  complete: {
    color: '#4ecdc4',
  },
  getReady: {
    color: '#ffffff',
    fontSize: 36,
  },
  countdown: {
    color: '#ffcc00',
    fontSize: 48,
    fontWeight: '600',
  },
  go: {
    color: '#00ffcc',
    fontSize: 56,
    fontWeight: '700',
  },
  counter: {
    opacity: 0.7,
    marginBottom: '2%',
    color: '#fff',
    textAlign: 'center',
  },
  readyInfo: {
    opacity: 0.7,
    marginBottom: '2%',
    color: '#4ecdc4',
    textAlign: 'center',
    letterSpacing: 1,
  },
  timer: {
    opacity: 0.6,
    marginBottom: '5%',
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  breathCounter: {
    fontSize: 18,
    color: '#00ffcc',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 40,
    letterSpacing: 1,
  },
  phaseCountdownContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  phaseLabel: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 1,
    opacity: 0.9,
    marginBottom: '2%',
    // Cross-platform text shadow
    ...Platform.select({
      web: {
        textShadow: '0px 1px 2px rgba(0,0,0,0.5)',
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
  phaseCountdown: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 2,
    // Cross-platform text shadow
    ...Platform.select({
      web: {
        textShadow: '0px 1px 2px rgba(0,0,0,0.5)',
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
  breathingContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    paddingVertical: 20,
  },
  waveContainer: {
    marginBottom: '8%', // Responsive spacing between wave and circle
    alignItems: 'center',
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseCountdownOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  completionCelebration: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationText: {
    fontSize: 64,
    marginBottom: 10,
  },
  celebrationMessage: {
    fontSize: 20,
    color: '#4ecdc4',
    fontWeight: '600',
    textAlign: 'center',
  },
});