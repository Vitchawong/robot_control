import React from "react";
import { View, Button, StyleSheet, Alert } from "react-native";

export default function ControlButtons({ apiUrl, deviceId = "robot01" }) {
  const sendCmd = async (cmd) => {
    try {
      const res = await fetch(`${apiUrl}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cmd, device_id: deviceId }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Request failed");

      console.log("Sent command:", cmd, json);
    } catch (e) {
      console.log("Control error:", e.message);
      Alert.alert("Control error", e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Forward" onPress={() => sendCmd("forward")} />
      <Button title="Backward" onPress={() => sendCmd("backward")} />
      <Button title="Left" onPress={() => sendCmd("left")} />
      <Button title="Right" onPress={() => sendCmd("right")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    width: "80%",
    gap: 10,
  },
});