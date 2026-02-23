import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import ControlButtons from "./components/ControlButtons";

const API_URL = "http://192.168.1.35:3000";

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Robot Sensor Info</Text>
      <Text>Temp: {data?.temp ?? "--"}</Text>
      <Text>Air Pollution: {data?.airpollution ?? "--"}</Text>
      <Text>Speed: {data?.speed ?? "--"}</Text>
      <Text>Time: {data?.created_at ?? "--"}</Text>

      {/* Buttons are now in another file */}
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
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});