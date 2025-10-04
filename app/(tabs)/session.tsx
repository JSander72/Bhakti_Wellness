import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function Session() {
  useKeepAwake();
  
  const webViewRef = useRef<WebView>(null);
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
  console.log(selectedSound) 
  const router = useRouter();

  const cycleDurationMs = Number(params.cycleDurationMs ?? 4000);
  const totalBreaths = Number(params.totalBreaths ?? 5);
  
  // Calculate individual phase durations if not provided
  const inhaleMs = Number(params.inhaleMs ?? cycleDurationMs * 0.4);
  const pause1Ms = Number(params.pause1Ms ?? 0);
  const exhaleMs = Number(params.exhaleMs ?? cycleDurationMs * 0.6);
  const pause2Ms = Number(params.pause2Ms ?? 0);

  const injected = useMemo(
    () => `
      window.__RN_CONFIG__ = {
        cycleDuration: ${cycleDurationMs},
        totalBreaths: ${totalBreaths},
        phases: {
          inhale: ${inhaleMs},
          pause1: ${pause1Ms},
          exhale: ${exhaleMs},
          pause2: ${pause2Ms}
        }
        
      };
      window.__SOUND_SELECTION__ = '${selectedSound}';

      true;
    `,
    [cycleDurationMs, totalBreaths, inhaleMs, pause1Ms, exhaleMs, pause2Ms, selectedSound]
  );

  const onMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'session-complete') {
        Alert.alert('Breath Session Complete', 'Great job! You completed your breathing session 🌟', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch {
      // ignore non-JSON messages
    }
  }, [router]);

  const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"/>
<title>Breathing Session</title>
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    background: linear-gradient(to bottom, #0a0a0a, #1a1a1a);
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  #instructions {
    font-size: 2rem;
    font-weight: 300;
    letter-spacing: 4px;
    text-transform: uppercase;
    margin-bottom: 20px;
    transition: all 0.5s ease;
    height: 40px;
  }
  
  #counter {
    font-size: 1rem;
    opacity: 0.7;
    margin-bottom: 40px;
    height: 20px;
  }
  
  #waveContainer {
    position: relative;
    width: 100%;
    max-width: 1000px;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  #waveCanvas {
    width: 100%;
    height: 100%;
  }
  
  #progressBar {
    margin-top: 40px;
    width: 80%;
    max-width: 400px;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
  }
  
  #progressFill {
    height: 100%;
    background: linear-gradient(90deg, #00ffcc, #00ccff);
    width: 0%;
    transition: width 0.3s linear;
  }
  
  .inhaling { color: #00ffcc; }
  .holding { color: #ffcc00; }
  .exhaling { color: #ff6b9d; }
  .complete { color: #4ecdc4; animation: pulse 1s ease-in-out infinite; }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }
  
  #breathingBall {
    position: absolute;
    width: 24px;
    height: 24px;
    background: radial-gradient(circle at 30% 30%, #fff, #00ffcc);
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(0, 255, 204, 0.8);
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    transition: all 0.1s linear;
  }
  
  #centerLine {
    position: absolute;
    width: 2px;
    height: 100%;
    background: rgba(255, 255, 255, 0.2);
    left: 50%;
    transform: translateX(-50%);
  }
  
  #pauseIndicator {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 204, 0, 0.1);
    border: 1px solid rgba(255, 204, 0, 0.3);
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 0.9rem;
    letter-spacing: 2px;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  
  #pauseIndicator.visible {
    opacity: 1;
  }
</style>
</head>
<body>
  <div id="instructions">Get Ready</div>
  <div id="counter"></div>
  
  <div id="waveContainer">
    <canvas id="waveCanvas"></canvas>
    <div id="centerLine"></div>
    <div id="breathingBall"></div>
    <div id="pauseIndicator">HOLD</div>
  </div>
  
  <div id="progressBar">
    <div id="progressFill"></div>
  </div>

<script>
  const cfg = window.__RN_CONFIG__ || {};
  const selectedSound = window.__SOUND_SELECTION__ || 'none';
  
  const totalBreaths = cfg.totalBreaths || 5;
  const phases = cfg.phases || { inhale: 1600, pause1: 0, exhale: 2400, pause2: 0 };
  const cycleDuration = phases.inhale + phases.pause1 + phases.exhale + phases.pause2;
  
  const instructions = document.getElementById('instructions');
  const counter = document.getElementById('counter');
  const progressFill = document.getElementById('progressFill');
  const waveCanvas = document.getElementById('waveCanvas');
  const ctx = waveCanvas.getContext('2d');
  const breathingBall = document.getElementById('breathingBall');
  const pauseIndicator = document.getElementById('pauseIndicator');
  
  // Audio setup
  let audioContext = null;
  let oscillator = null;
  let gainNode = null;
  let noiseBuffer = null;

  // Initialize audio
  if (selectedSound !== 'none') {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
          if (audioContext.state === 'suspended') {
      // Try to resume on any user interaction
      const resumeAudio = () => {
        audioContext.resume().then(() => {
          console.log('Audio resumed');
          document.removeEventListener('touchstart', resumeAudio);
          document.removeEventListener('click', resumeAudio);
        });
      };
      document.addEventListener('touchstart', resumeAudio, { once: true });
      document.addEventListener('click', resumeAudio, { once: true });
    }
      gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
      gainNode.gain.value = 0;
      console.log('Audio context created, state:', audioContext.state);
      console.log('Selected sound:', selectedSound);
      
      // Create different sound types
      if (selectedSound === 'ocean') {
        createOceanSound();
      } else if (selectedSound === 'rain') {
        createRainSound();
      } else if (selectedSound === 'forest') {
        createForestSound();
      } else if (selectedSound === 'singing-bowl') {
        createSingingBowlSound();
      } else if (selectedSound === 'white-noise') {
        createWhiteNoiseSound();
      }
    } catch (e) {
      console.log('Audio not supported');
    }
  }

  function createOceanSound() {
    const bufferSize = audioContext.sampleRate * 2;
    noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    
    noise.connect(filter);
    filter.connect(gainNode);
    noise.start(0);
  }

  function createRainSound() {
    const bufferSize = audioContext.sampleRate * 2;
    noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    
    noise.connect(filter);
    filter.connect(gainNode);
    noise.start(0);
  }

  function createForestSound() {
    // Combination of filtered noise for wind/leaves
    createOceanSound(); // Reuse ocean for wind effect
    
    // Add occasional bird chirps (simplified)
    setInterval(() => {
      if (Math.random() > 0.7 && audioContext) {
        const osc = audioContext.createOscillator();
        const g = audioContext.createGain();
        osc.frequency.setValueAtTime(2000 + Math.random() * 1000, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.1);
        g.gain.setValueAtTime(0, audioContext.currentTime);
        g.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        g.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
        osc.connect(g);
        g.connect(gainNode);
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.1);
      }
    }, 3000);
  }

  function createSingingBowlSound() {
    // Create multiple oscillators for harmonics
    const fundamentalFreq = 110; // A2
    const harmonics = [1, 2, 3, 4.2, 5.4];
    
    harmonics.forEach((harmonic, index) => {
      const osc = audioContext.createOscillator();
      osc.frequency.value = fundamentalFreq * harmonic;
      osc.type = 'sine';
      
      const harmonicGain = audioContext.createGain();
      harmonicGain.gain.value = 1 / (index + 1); // Decrease volume for higher harmonics
      
      osc.connect(harmonicGain);
      harmonicGain.connect(gainNode);
      osc.start(0);
    });
  }

  function createWhiteNoiseSound() {
    const bufferSize = audioContext.sampleRate * 2;
    noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    noise.connect(gainNode);
    noise.start(0);
  }

  // Update volume based on breathing
  function updateSoundVolume(phase) {
    if (!gainNode) console.log('No gain node');
    if (selectedSound === 'none') console.log('No sound selected');
    if (!gainNode || selectedSound === 'none') return;
    
    const targetVolume = phase.name === 'inhale' 
      ? 0.7 * phase.progress  // Fade in during inhale
      : phase.name === 'exhale'
      ? 0.7 * (1 - phase.progress)  // Fade out during exhale
      : phase.name === 'pause1'
      ? 0.7  // Full volume during pause after inhale
      : 0;  // Silent during pause after exhale
      
    gainNode.gain.linearRampToValueAtTime(targetVolume, audioContext.currentTime + 0.1);
  }
  
  // Setup canvas
  function resizeCanvas() {
    const rect = waveCanvas.getBoundingClientRect();
    waveCanvas.width = rect.width;
    waveCanvas.height = rect.height;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  let sessionStartTime = null;
  let currentBreath = 0;
  let sessionComplete = false;
  let scrollOffset = 0;
  
  function getPhaseInfo(elapsed) {
    const cycleTime = elapsed % cycleDuration;
    let accumTime = 0;
    
    if (cycleTime < (accumTime += phases.inhale)) {
      return { name: 'inhale', progress: cycleTime / phases.inhale };
    }
    if (phases.pause1 > 0 && cycleTime < (accumTime += phases.pause1)) {
      return { name: 'pause1', progress: (cycleTime - phases.inhale) / phases.pause1 };
    }
    if (cycleTime < (accumTime += phases.exhale)) {
      const start = phases.inhale + phases.pause1;
      return { name: 'exhale', progress: (cycleTime - start) / phases.exhale };
    }
    if (phases.pause2 > 0) {
      const start = phases.inhale + phases.pause1 + phases.exhale;
      return { name: 'pause2', progress: (cycleTime - start) / phases.pause2 };
    }
    
    return { name: 'inhale', progress: 0 };
  }
  
  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }
  
  function getWaveY(x, elapsed) {
    const width = waveCanvas.width;
    const height = waveCanvas.height;
    const centerY = height / 2;
    const amplitude = height * 0.35;
    
    // Calculate total phase proportions
    const totalDuration = phases.inhale + phases.pause1 + phases.exhale + phases.pause2;
    const inhaleRatio = phases.inhale / totalDuration;
    const pause1Ratio = phases.pause1 / totalDuration;
    const exhaleRatio = phases.exhale / totalDuration;
    const pause2Ratio = phases.pause2 / totalDuration;
    
    // Calculate position in wave cycle (0 to 1)
    const pixelsPerCycle = width * 0.8;
    const adjustedX = x + scrollOffset;
    const cyclePosition = (adjustedX % pixelsPerCycle) / pixelsPerCycle;
    
    let y = centerY;
    
    if (cyclePosition < inhaleRatio) {
      // Inhale phase - rise
      const localProgress = cyclePosition / inhaleRatio;
      y = centerY - amplitude * easeInOutSine(localProgress);
    } else if (cyclePosition < inhaleRatio + pause1Ratio) {
      // Pause 1 - stay at top
      y = centerY - amplitude;
    } else if (cyclePosition < inhaleRatio + pause1Ratio + exhaleRatio) {
      // Exhale phase - fall
      const localProgress = (cyclePosition - inhaleRatio - pause1Ratio) / exhaleRatio;
      y = centerY - amplitude + (2 * amplitude * easeInOutSine(localProgress));
    } else {
      // Pause 2 - stay at bottom
      y = centerY + amplitude;
    }
    
    return { y, cyclePosition };
  }
  
  function drawWave(elapsed) {
    ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
    
    const width = waveCanvas.width;
    const height = waveCanvas.height;
    const centerY = height / 2;
    const amplitude = height * 0.35;
    
    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw pause zone indicators
    const totalDuration = phases.inhale + phases.pause1 + phases.exhale + phases.pause2;
    const inhaleRatio = phases.inhale / totalDuration;
    const pause1Ratio = phases.pause1 / totalDuration;
    const exhaleRatio = phases.exhale / totalDuration;
    const pixelsPerCycle = width * 0.8;
    
    // Draw shaded areas for pauses
    ctx.fillStyle = 'rgba(255, 204, 0, 0.05)';
    
    for (let offset = -pixelsPerCycle; offset <= width + pixelsPerCycle; offset += pixelsPerCycle) {
      // Pause 1 area
      if (phases.pause1 > 0) {
        const pause1Start = offset + (inhaleRatio * pixelsPerCycle) - scrollOffset;
        const pause1Width = pause1Ratio * pixelsPerCycle;
        ctx.fillRect(pause1Start, 0, pause1Width, height);
      }
      
      // Pause 2 area
      if (phases.pause2 > 0) {
        const pause2Start = offset + ((inhaleRatio + pause1Ratio + exhaleRatio) * pixelsPerCycle) - scrollOffset;
        const pause2Width = phases.pause2 / totalDuration * pixelsPerCycle;
        ctx.fillRect(pause2Start, 0, pause2Width, height);
      }
    }
    
    // Draw the wave
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.5)';
    ctx.lineWidth = 3;
    
    let isPause = false;
    for (let x = -50; x <= width + 50; x += 2) {
      const { y, cyclePosition } = getWaveY(x, elapsed);
      
      if (x === -50) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Get ball position and phase info
    const { y: ballY } = getWaveY(width / 2, elapsed);
    breathingBall.style.top = ballY + 'px';
    
    // Update pause indicator position
    const phase = getPhaseInfo(elapsed);
    if (phase.name === 'pause1' || phase.name === 'pause2') {
      pauseIndicator.classList.add('visible');
      pauseIndicator.style.top = (ballY + 40) + 'px';
    } else {
      pauseIndicator.classList.remove('visible');
    }
    
    // Update ball appearance based on phase
    if (phase.name === 'inhale') {
      breathingBall.style.background = 'radial-gradient(circle at 30% 30%, #fff, #00ffcc)';
      breathingBall.style.boxShadow = '0 0 30px rgba(0, 255, 204, 1)';
    } else if (phase.name === 'exhale') {
      breathingBall.style.background = 'radial-gradient(circle at 30% 30%, #fff, #ff6b9d)';
      breathingBall.style.boxShadow = '0 0 30px rgba(255, 107, 157, 1)';
    } else {
      breathingBall.style.background = 'radial-gradient(circle at 30% 30%, #fff, #ffcc00)';
      breathingBall.style.boxShadow = '0 0 30px rgba(255, 204, 0, 1)';
    }
    
    // Draw phase labels on the wave
    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    
    for (let offset = -pixelsPerCycle; offset <= width + pixelsPerCycle; offset += pixelsPerCycle) {
      // Inhale label
      const inhaleX = offset + (inhaleRatio * 0.5 * pixelsPerCycle) - scrollOffset;
      if (inhaleX > 0 && inhaleX < width) {
        ctx.fillText('INHALE', inhaleX - 25, height - 20);
      }
      
      // Exhale label
      const exhaleX = offset + ((inhaleRatio + pause1Ratio + exhaleRatio * 0.5) * pixelsPerCycle) - scrollOffset;
      if (exhaleX > 0 && exhaleX < width) {
        ctx.fillText('EXHALE', exhaleX - 25, height - 20);
      }
    }
  }
  
  function animate() {
    if (!sessionStartTime) {
      sessionStartTime = Date.now();
    }
    
    const elapsed = Date.now() - sessionStartTime;
    const newBreath = Math.floor(elapsed / cycleDuration);
    
    if (newBreath > currentBreath && newBreath <= totalBreaths) {
      currentBreath = newBreath;
    }
    
    const breathsRemaining = Math.max(0, totalBreaths - currentBreath);
    const overallProgress = Math.min(1, currentBreath / totalBreaths);
    
    // Update progress bar
    progressFill.style.width = (overallProgress * 100) + '%';
    
if (breathsRemaining === 0 && elapsed >= totalBreaths * cycleDuration) {
  if (!sessionComplete) {
    sessionComplete = true;
    instructions.className = 'complete';
    instructions.textContent = 'Complete!';
    counter.textContent = 'Great session!';
    breathingBall.style.display = 'none';
    pauseIndicator.style.display = 'none';
    
    // ADD THIS - Clean up audio
    if (audioContext) {
      audioContext.close();
    }
    
    setTimeout(() => {
      try {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'session-complete' })
          );
        } else {
          console.log('ReactNativeWebView not available');
        }
      } catch (error) {
        console.log('Error posting message:', error);
      }
    }, 1500);
  }
  return;
}
    
    const phase = getPhaseInfo(elapsed);
    updateSoundVolume(phase); 
    
    // Update instructions
    instructions.className = '';
    if (phase.name === 'inhale') {
      instructions.classList.add('inhaling');
      instructions.textContent = 'Inhale';
    } else if (phase.name === 'pause1' || phase.name === 'pause2') {
      instructions.classList.add('holding');
      instructions.textContent = 'Hold';
    } else if (phase.name === 'exhale') {
      instructions.classList.add('exhaling');
      instructions.textContent = 'Exhale';
    }
    
    // Update counter
    counter.textContent = 'Breath ' + (currentBreath + 1) + ' of ' + totalBreaths;
    
    // Scroll the wave continuously
    const timingOffset = 2700; // milliseconds - increase to make ball lag behind
    const adjustedElapsed = elapsed + timingOffset; // Add offset to make wave ahead of phase
    const pixelsPerCycle = waveCanvas.width * 0.8;
    const pixelsPerMs = pixelsPerCycle / cycleDuration;
    scrollOffset = (adjustedElapsed * pixelsPerMs) % pixelsPerCycle;

    // Draw the wave and update ball
    drawWave(elapsed);
    
    requestAnimationFrame(animate);
  }
  
  // Start animation after a delay
  setTimeout(() => {
    instructions.textContent = 'Begin';
    requestAnimationFrame(animate);
  }, 1000);
</script>

</body>
</html>`;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: HTML }}
        injectedJavaScriptBeforeContentLoaded={injected}
        onMessage={onMessage}
        style={styles.webview}
        scrollEnabled={false}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
        }}
        onLoadStart={() => {
          console.log('WebView load started');
        }}
        onLoadEnd={() => {
          console.log('WebView load ended');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
});