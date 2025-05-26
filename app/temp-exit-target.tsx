// app/temp-exit-target.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function TempExitTargetScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Temporary Exit Target</Text>
      <Text style={styles.text}>If you see this, navigation worked.</Text>
      <Link href="/" style={styles.link}>Go to Home</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' },
  text: { color: 'white', fontSize: 18, marginVertical: 10 },
  link: { color: 'cyan', fontSize: 16, marginTop: 20, textDecorationLine: 'underline' },
});