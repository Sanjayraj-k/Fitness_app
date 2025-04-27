import React from 'react';
import { Text, StyleSheet, View, StatusBar, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';

export default function SignupScreen() {
  const navigation = useNavigation();

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

  const handleSignup = () => {
    console.log('Sign up pressed');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={['#7F00FF', '#E100FF']}
        style={StyleSheet.absoluteFill}
      />

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
            source={require('../assets/images/welcome.png')} // Replace this with the uploaded illustration
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
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              placeholderTextColor="#999"
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