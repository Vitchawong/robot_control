import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import ControlButtons from "./components/ControlButtons";
import { WebView } from "react-native-webview";

const API_URL = "http://10.54.12.38:3000";

// PUT YOUR ESP32-CAM STREAM URL HERE:
const CAM_STREAM_URL = "http://10.54.12.113:81/stream"; // <-- change IP

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLatest = async () => {
    try {
      const res = await fetch(`${API_URL}/latest`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const camHtml = `
    <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0; background:#000; display:flex; align-items:center; justify-content:center;">
        <img src="${CAM_STREAM_URL}" style="width:100%; height:auto;" />
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Robot Sensor Info</Text>

      {/* Camera stream */}
      <View style={styles.cameraBox}>
        <WebView
          originWhitelist={["*"]}
          source={{ html: camHtml }}
          javaScriptEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      </View>

      {/* Sensor values */}
      <Text>Temp: {data?.temp ?? "--"}</Text>
      <Text>Air Pollution: {data?.airpollution ?? "--"}</Text>
      <Text>Speed: {data?.speed ?? "--"}</Text>
      <Text>Time: {data?.created_at ?? "--"}</Text>

      <ControlButtons apiUrl={API_URL} deviceId="robot01" />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cameraBox: {
    width: "92%",
    height: 220,          // adjust
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
});