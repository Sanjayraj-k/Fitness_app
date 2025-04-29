import React from 'react';
import { View, StyleSheet } from 'react-native';
import WelcomeScreen from '../screens/WelcomeScreen';
import { ClerkProvider } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import AppNavigation from '../navigation/AppNavigation'; // <-- Adjust the import path as needed
// <-- Match the filename exactly

export default function Layout() {
  return (
    <View style={styles.container}>
      <AppNavigation></AppNavigation>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});