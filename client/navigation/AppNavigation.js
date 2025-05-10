import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from '../firebaseconfig';
import LoginScreen from '../screens/LoginScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import BeginnerContentScreen from '../screens/BeginnerContentScreen';
import IntermediateContentScreen from '../screens/IntermediateContentScreen';
import ExpertContentScreen from '../screens/ExpertContentScreen';
import Dashboard from '../screens/Dashboard';
import ProfileScreen from '../screens/ProfileScreen';
import Test from '../screens/Test';

const CreateScreen = () => <Text>Create Screen</Text>;
const SettingsScreen = () => <Text>Settings Screen</Text>;

WebBrowser.maybeCompleteAuthSession();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const clerkPublishableKey = Constants.expoConfig?.extra?.clerkPublishableKey || 'pk_test_d2lzZS1tdXNrb3gtNDYuY2xlcmsuYWNjb3VudHMuZGV2JA';

if (!clerkPublishableKey) {
  console.error('Clerk Publishable Key is missing. Check app.json "extra" field or provide a fallback key.');
}

// Stack for the auth flow (before login)
function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// Stack for the content tabs
function ContentStack() {
  return (
    <Stack.Navigator initialRouteName="ContentTab">
      <Stack.Screen 
        name="ContentTab" 
        component={ContentTab} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator for content screens
function ContentTab() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'BeginnerTab') {
            iconName = focused ? 'walk' : 'walk-outline'; // Icon for Beginner
          } else if (route.name === 'IntermediateTab') {
            iconName = focused ? 'barbell' : 'barbell-outline'; // Icon for Intermediate
          } else if (route.name === 'ExpertTab') {
            iconName = focused ? 'trophy' : 'trophy-outline'; // Icon for Expert
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'CreateTab') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'ProfileScreen') {
            iconName = focused ? 'person' : 'person-outline'; // Icon for Profile
          } else if (route.name === 'DashboardTab') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline'; // Icon for Dashboard
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00C4B4',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#F5F5F5',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={Dashboard} 
        options={{ tabBarLabel: 'Dashboard', headerShown: false }} 
      />
      <Tab.Screen 
        name="Addworkout" 
        component={IntermediateContentScreen} 
        options={{ tabBarLabel: 'Addworkout', headerShown: false }} 
      />
      <Tab.Screen 
        name="Test" 
        component={Test} 
        options={{ tabBarLabel: 'Evaluate', headerShown: false }} 
      />
      <Tab.Screen 
        name="Tutorial" 
        component={Dashboard} 
        options={{ tabBarLabel: 'Tutorial', headerShown: false }} 
      />
      <Tab.Screen 
        name="ProfileScreen" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profile', headerShown: false }} 
      />
      
    </Tab.Navigator>
  );
}

// Main Stack Navigator
function MainStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Content" 
        component={ContentStack} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

// Main Navigation Wrapper
function NavigationWrapper() {
  const { isSignedIn } = useAuth();
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // If either Clerk (social login) or Firebase (email/password) user is authenticated, show MainStack
  return isSignedIn || firebaseUser ? <MainStack /> : <AuthStack />;
}

export default function AppNavigation() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <NavigationWrapper />
    </ClerkProvider>
  );
}