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
import BicepsScreen from '../screens/BicepsScreen';
import AbsScreen from '../screens/AbsScreen';
import ChestScreen from '../screens/ChestScreen';
import LegScreen from '../screens/LegScreen';
import TricepsScreen from '../screens/TricepsScreen'; // Correct import
import ShoulderScreen from '../screens/ShoulderScreen';
import LatScreen from '../screens/LatScreen';
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
function ContentStack({ route }) {
  const skillLevel = route.params?.screen;
  return (
    <Stack.Navigator initialRouteName="ContentTab">
      <Stack.Screen
        name="ContentTab"
        component={ContentTab}
        options={{ headerShown: false }}
        initialParams={{ skillLevel }}
      />
      <Stack.Screen
        name="BicepsScreen"
        component={BicepsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AbsScreen"
        component={AbsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LatScreen"
        component={LatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LegScreen"
        component={LegScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShoulderScreen"
        component={ShoulderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TricepsScreen" // Fixed typo: "TricpesScreen" → "TricepsScreen"
        component={TricepsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChestScreen"
        component={ChestScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator for content screens
function ContentTab({ route }) {
  const skillLevel = route.params?.skillLevel;

  const getWorkoutScreen = () => {
    switch (skillLevel) {
      case 'BeginnerTab':
        return BeginnerContentScreen;
      case 'IntermediateTab':
        return IntermediateContentScreen;
      case 'ExpertTab':
        return ExpertContentScreen;
      default:
        return ExpertContentScreen;
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'BeginnerTab') {
            iconName = focused ? 'walk' : 'walk-outline';
          } else if (route.name === 'IntermediateTab') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'ExpertTab') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'CreateTab') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'ProfileScreen') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'DashboardTab') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Trainer') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={Dashboard}
        options={{ tabBarLabel: 'Dashboard', headerShown: false }}
      />
      <Tab.Screen
        name="ExpertTab"
        component={getWorkoutScreen()}
        options={{ tabBarLabel: 'Add Workout', headerShown: false }}
      />
      <Tab.Screen
        name="Trainer"
        component={Test}
        options={{ tabBarLabel: 'AI Trainer', headerShown: false }}
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  return isSignedIn || firebaseUser ? <MainStack /> : <AuthStack />;
}

export default function AppNavigation() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <NavigationWrapper />
    </ClerkProvider>
  );
}