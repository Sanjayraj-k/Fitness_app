// screens/ExpertContentScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ExpertContentScreen = () => {
  return (
    <LinearGradient
      colors={['#6e45e2', '#88d3ce']}
      style={styles.container}
    >
      <Text style={styles.title}>Veteran Workouts</Text>
      <Text style={styles.subtitle}>Here are your elite-level fitness routines!</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
});

export default ExpertContentScreen;