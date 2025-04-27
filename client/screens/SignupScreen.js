import React, { useState } from 'react';
import { Text, StyleSheet, View, StatusBar, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseconfig'; // Adjust path if needed

export default function SignupScreen() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = () => {
    console.log('Google login pressed');
  };

  const handleFacebookLogin = () => {
    console.log('Facebook login pressed');
  };

  const handleAppleLogin = () => {
    console.log('Apple login pressed');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;

      // Wait for authentication state to update
      return new Promise((resolve, reject) => {
        const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(async (authenticatedUser) => {
          if (authenticatedUser) {
            unsubscribe(); // Stop listening once authenticated
            try {
              await setDoc(doc(FIRESTORE_DB, 'users', user.uid), {
                fullName: fullName,
                email: email,
                createdAt: new Date(),
              });
              console.log('User data stored successfully:', user.uid);
              resolve();
            } catch (error) {
              reject(error);
            }
          }
        });
      }).then(() => {
        navigation.navigate('Home');
      });
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert(
          'Email Already in Use',
          'An account with this email already exists. Would you like to log in instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log In', onPress: () => navigation.navigate('Login') },
          ]
        );
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Weak Password', 'Password should be at least 6 characters long.');
      } else {
        Alert.alert('Signup Failed', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient colors={['#7F00FF', '#E100FF']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        {/* Back Arrow */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Welcome')}>
            <ArrowLeftIcon size={30} color="black" />
          </TouchableOpacity>
        </View>

        {/* Illustration */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/images/welcome.png')}
            style={styles.loginImage}
            resizeMode="contain"
          />
        </View>

        {/* Form Container */}
        <View style={styles.contentContainer}>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleSignup}>
              <Text style={styles.loginButtonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* OR Separator */}
            <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>Or</Text>
              <View style={styles.orLine} />
            </View>

            {/* Social login icons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity onPress={handleGoogleLogin}>
                <Image source={require('../assets/images/google.png')} style={styles.socialIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAppleLogin}>
                <Image source={require('../assets/images/apple.png')} style={styles.socialIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleFacebookLogin}>
                <Image source={require('../assets/images/communication.png')} style={styles.socialIcon} />
              </TouchableOpacity>
            </View>

            {/* Already have account */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.signupLink}>Login</Text>
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
    paddingTop: 10,
  },
  loginImage: {
    width: 200,
    height: 160,
  },
  contentContainer: {
    flex: 2,
    backgroundColor: 'white',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 20,
    justifyContent: 'center',
  },
  form: {
    marginTop: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
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
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
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