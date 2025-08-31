import React, { useMemo, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { useKeepAwake } from "expo-keep-awake"; // keeps screen on during session

type SessionScreenProps = {
  route?: {
    params?: {
      cycleDurationMs?: number; // # total time for inhale+exhale; defaults 4000
      totalBreaths?: number;    // # total guided breaths; defaults 5
    };
  };
  navigation: any;
};

const SessionScreen: React.FC<SessionScreenProps> = ({ route, navigation }) => {
  useKeepAwake(); // # prevent device from sleeping mid-session

  // # Default knobs (you can pass overrides via navigation params)
  const cycleDurationMs = route?.params?.cycleDurationMs ?? 4000;
  const totalBreaths     = route?.params?.totalBreaths ?? 5;

  // # Build the HTML and inject RN-provided values into JS before content loads
  const injected = useMemo(
    () => `
      // # Make RN values available to the page before it starts
      window.__RN_CONFIG__ = {
        cycleDuration: ${cycleDurationMs},
        totalBreaths: ${totalBreaths}
      };
      true; // required for iOS
    `,
    [cycleDurationMs, totalBreaths]
  );

  const onMessage = useCallback((event:any) => {
    // # Receive messages from the web page (e.g., "session-complete")
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === "session-complete") {
        Alert.alert("Breath Session", "Great job! Session complete 🌟", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      }
    } catch {
      // ignore non-JSON messages
    }
  }, [navigation]);

  // # Your original HTML, with two small changes:
  //    (1) cycleDuration & totalBreaths read from window.__RN_CONFIG__
  //    (2) window.ReactNativeWebView.postMessage(...) when session completes
  const SESSION_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Breathing Wave Pacer</title>
<style>
  body {
    background: #111;
    color: #fff;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    margin: 0;
    padding: 20px;
  }
  canvas {
    display: block;
    margin: 20px auto;
    background: #222;
  }
  #instructions {
    font-size: 2rem;
    margin-top: 20px;
  }
</style>
</head>
<body>
  <canvas id="wave" width="800" height="300"></canvas>
  <div id="instructions">Get Ready…</div>
  <div id="breathCount"></div>

  <script>
    // # Pull cycleDuration/totalBreaths from RN (injected before load)
    const cfg = (window.__RN_CONFIG__ || {});
    const cycleDuration = Number(cfg.cycleDuration) || 4000; // # ms for inhale+exhale
    const totalBreaths  = Number(cfg.totalBreaths)  || 5;    // # breaths to guide

    const canvas = document.getElementById("wave");
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    const instructionEl = document.getElementById("instructions");
    const breathCountEl = document.getElementById("breathCount");

    let time = 0;
    const speed = 0.02;

    let breathsRemaining = totalBreaths;
    let lastCycle = Math.floor(Date.now() / cycleDuration);

    function drawWave(amplitude) {
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();
      ctx.moveTo(0, H / 2);

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
      const t = (now % cycleDuration) / cycleDuration; // # phase: 0 → 1
      const amplitude = H/4 * Math.sin(t * Math.PI);   // # inhale↑, exhale↓

      const cycleIndex = Math.floor(now / cycleDuration);

      // # Detect new inhale/exhale cycle rollover & decrement breaths
      if (cycleIndex !== lastCycle) {
        lastCycle = cycleIndex;
        if (breathsRemaining > 0) breathsRemaining--;
      }

      if (breathsRemaining === 0) {
        instructionEl.textContent = "Session Complete 🌟";
        breathCountEl.textContent = "";

        // # Notify React Native once (idempotent)
        if (!window.__sentComplete__) {
          window.__sentComplete__ = true;
          try {
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
              JSON.stringify({ type: "session-complete" })
            );
          } catch (e) {}
        }
      } else {
        // # First half: inhale; second half: exhale
        instructionEl.textContent = (t < 0.5) ? "Inhale…" : "Exhale…";
        breathCountEl.textContent = "Breaths Remaining: " + breathsRemaining;
      }

      drawWave(amplitude);
    }

    animate();
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: SESSION_HTML }}
        onMessage={onMessage}
        injectedJavaScriptBeforeContentLoaded={injected}
        allowsInlineMediaPlayback
        javaScriptEnabled
        setSupportMultipleWindows={false}
        // # Improves performance on Android; keeps hardware acceleration on
        // # If you see any GPU artifacts, you can temporarily disable layerType
        // androidLayerType="hardware"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" }
});

export default SessionScreen;
