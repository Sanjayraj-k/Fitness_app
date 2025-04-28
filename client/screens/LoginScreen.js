import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import { useOAuth } from '@clerk/clerk-expo'; // Clerk for social logins
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseconfig'; // Adjust path if needed

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Clerk OAuth hooks for social logins
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startFacebookOAuth } = useOAuth({ strategy: 'oauth_facebook' });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: 'oauth_apple' });

  const handleGoogleLogin = async () => {
    try {
      console.log('Initiating Google OAuth flow'); // Debug
      const { createdSessionId, setActive, signIn } = await startGoogleOAuth();
      console.log('Google OAuth response:', { createdSessionId }); // Debug
      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        // Attempt to store user data in Firestore
        const userData = {
          fullName: signIn.firstName || signIn.lastName ? `${signIn.firstName} ${signIn.lastName}`.trim() : 'Google User',
          email: signIn.emailAddress || '',
          createdAt: new Date(),
          authProvider: 'google',
        };
        try {
          await setDoc(doc(FIRESTORE_DB, 'users', createdSessionId), userData, { merge: true });
          console.log('Google user data stored:', userData);
        } catch (firestoreError) {
          console.error('Firestore write error:', firestoreError.message);
          // Skip Firestore write for now and proceed with login
          Alert.alert('Warning', 'Failed to save user data, but login succeeded. Check permissions.');
        }
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Google login failed. Please try again.');
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      Alert.alert('Error', 'Failed to log in with Google.');
    }
  };

  const handleFacebookLogin = async () => {
    try {
      console.log('Initiating Facebook OAuth flow'); // Debug
      const { createdSessionId, setActive, signIn } = await startFacebookOAuth();
      console.log('Facebook OAuth response:', { createdSessionId }); // Debug
      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        const userData = {
          fullName: signIn.firstName || signIn.lastName ? `${signIn.firstName} ${signIn.lastName}`.trim() : 'Facebook User',
          email: signIn.emailAddress || '',
          createdAt: new Date(),
          authProvider: 'facebook',
        };
        try {
          await setDoc(doc(FIRESTORE_DB, 'users', createdSessionId), userData, { merge: true });
          console.log('Facebook user data stored:', userData);
        } catch (firestoreError) {
          console.error('Firestore write error:', firestoreError.message);
          Alert.alert('Warning', 'Failed to save user data, but login succeeded. Check permissions.');
        }
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Facebook login failed. Please try again.');
      }
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      Alert.alert('Error', 'Failed to log in with Facebook.');
    }
  };

  const handleAppleLogin = async () => {
    try {
      console.log('Initiating Apple OAuth flow'); // Debug
      const { createdSessionId, setActive, signIn } = await startAppleOAuth();
      console.log('Apple OAuth response:', { createdSessionId }); // Debug
      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        const userData = {
          fullName: signIn.firstName || signIn.lastName ? `${signIn.firstName} ${signIn.lastName}`.trim() : 'Apple User',
          email: signIn.emailAddress || '',
          createdAt: new Date(),
          authProvider: 'apple',
        };
        try {
          await setDoc(doc(FIRESTORE_DB, 'users', createdSessionId), userData, { merge: true });
          console.log('Apple user data stored:', userData);
        } catch (firestoreError) {
          console.error('Firestore write error:', firestoreError.message);
          Alert.alert('Warning', 'Failed to save user data, but login succeeded. Check permissions.');
        }
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Apple login failed. Please try again.');
      }
    } catch (error) {
      console.error('Apple OAuth error:', error);
      Alert.alert('Error', 'Failed to log in with Apple.');
    }
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;
      console.log('User logged in successfully:', user.uid);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        Alert.alert('User Not Found', 'No account exists with this email. Please sign up.');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Incorrect Password', 'The password you entered is incorrect.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else {
        Alert.alert('Login Failed', error.message);
      }
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'This feature is not implemented yet.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#7F00FF', '#E100FF']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Welcome')}
          >
            <ArrowLeftIcon size={30} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/images/welcome.png')}
            style={styles.loginImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="john@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="********"
              secureTextEntry
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>Or</Text>
              <View style={styles.orLine} />
            </View>

            <View style={styles.socialContainer}>
              <TouchableOpacity onPress={handleGoogleLogin}>
                <Image
                  source={require('../assets/images/google.png')}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAppleLogin}>
                <Image
                  source={require('../assets/images/apple.png')}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleFacebookLogin}>
                <Image
                  source={require('../assets/images/communication.png')}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignup}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingLeft: 10,
  },
  backButton: {
    backgroundColor: '#FACC15',
    padding: 2,
    borderTopRightRadius: 16,
    alignSelf: 'flex-start',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  loginImage: {
    width: 200,
    height: 200,
  },
  contentContainer: {
    flex: 2,
    backgroundColor: 'white',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 20,
  },
  form: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#7F00FF',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#FACC15',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 10,
    color: '#666',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  socialIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  signupText: {
    fontSize: 14,
    color: '#333',
  },
  signupLink: {
    fontSize: 14,
    color: '#7F00FF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});