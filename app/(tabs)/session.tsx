import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function Session() {
  useKeepAwake();
  
  // Read optional params: /(tabs)/session?cycleDurationMs=4800&totalBreaths=6
  const params = useLocalSearchParams<{
    cycleDurationMs?: string;
    totalBreaths?: string;
  }>();
  const router = useRouter();

  const cycleDurationMs = Number(params.cycleDurationMs ?? 4000);
  const totalBreaths = Number(params.totalBreaths ?? 5);


  const injected = useMemo(
    () => `
      window.__RN_CONFIG__ = {
        cycleDuration: ${cycleDurationMs},
        totalBreaths: ${totalBreaths}
      };
      true;
    `,
    [cycleDurationMs, totalBreaths]
  );

  const onMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'session-complete') {
        Alert.alert('Breath Session', 'Great job! Session complete 🌟', [
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
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Breathing Wave Pacer</title>
<style>
  body {
    background:#111; color:#fff; text-align:center;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    margin:0; padding:20px;
  }
  canvas { display:block; margin:20px auto; background:#222; }
  #instructions { font-size:2rem; margin-top:20px; }
</style>
</head>
<body>
  <canvas id="wave" width="800" height="300"></canvas>
  <div id="instructions">Get Ready…</div>
  <div id="breathCount"></div>

  <script>
    const cfg = (window.__RN_CONFIG__ || {});
    const cycleDuration = Number(cfg.cycleDuration) || 4000; // ms inhale+exhale
    const totalBreaths  = Number(cfg.totalBreaths)  || 5;    // # breaths

    const canvas = document.getElementById("wave");
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;

    const instructionEl = document.getElementById("instructions");
    const breathCountEl = document.getElementById("breathCount");

    let time = 0;
    const speed = 0.02;
    let breathsRemaining = totalBreaths;
    let lastCycle = Math.floor(Date.now() / cycleDuration);

    function drawWave(amplitude) {
      ctx.clearRect(0,0,W,H);
      ctx.beginPath();
      ctx.moveTo(0, H/2);
      for (let x = 0; x <= W; x++) {
        let y = H/2 + Math.sin(x * 0.02 + time) * amplitude;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#00ffcc";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    function animate() {
      requestAnimationFrame(animate);
      time += speed;

      const now = Date.now();
      const t = (now % cycleDuration) / cycleDuration; // 0→1
      const amplitude = H/4 * Math.sin(t * Math.PI);

      const cycleIndex = Math.floor(now / cycleDuration);
      if (cycleIndex !== lastCycle) {
        lastCycle = cycleIndex;
        if (breathsRemaining > 0) breathsRemaining--;
      }

      if (breathsRemaining === 0) {
        instructionEl.textContent = "Session Complete 🌟";
        breathCountEl.textContent = "";
        if (!window.__sentComplete__) {
          window.__sentComplete__ = true;
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: "session-complete" })
          );
        }
      } else {
        instructionEl.textContent = (t < 0.5) ? "Inhale…" : "Exhale…";
        breathCountEl.textContent = "Breaths Remaining: " + breathsRemaining;
      }

      drawWave(amplitude);
    }

    animate();
  </script>
</body>
</html>`;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: HTML }}
        injectedJavaScriptBeforeContentLoaded={injected}
        onMessage={onMessage}
        javaScriptEnabled
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
});
