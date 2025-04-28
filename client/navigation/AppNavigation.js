import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import LoginScreen from '../screens/LoginScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';

// Handle OAuth redirect for social logins
WebBrowser.maybeCompleteAuthSession();

const Stack = createNativeStackNavigator();

// Use Clerk Publishable Key from app.json with fallback
const clerkPublishableKey = Constants.expoConfig?.extra?.clerkPublishableKey || 'pk_test_bGFyZ2UtbWFybW9zZXQtMC5jbGVyay5hY2NvdW50cy5kZXYk';

if (!clerkPublishableKey) {
  console.error(
    'Clerk Publishable Key is missing. Check app.json "extra" field or provide a fallback key.'
  );
}

function NavigationWrapper() {
  const { isSignedIn } = useAuth();

  return (
    <Stack.Navigator initialRouteName={isSignedIn ? 'Home' : 'Welcome'}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <NavigationWrapper />
    </ClerkProvider>
  );
}