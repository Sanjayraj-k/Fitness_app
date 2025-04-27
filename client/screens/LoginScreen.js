import React from 'react';
import { Text, StyleSheet, View, StatusBar, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
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

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={['#7F00FF', '#E100FF']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.navigate('Welcome')}
          >
            <ArrowLeftIcon size={30} color="black" />
          </TouchableOpacity>
        </View>

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/images/welcome.png')}
            style={styles.loginImage}
            resizeMode="contain"
          />
        </View>

        {/* White rounded form container */}
        <View style={styles.contentContainer}>
          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="john@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="********"
              secureTextEntry
            />
            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Login</Text>
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

            {/* ✅ Signup prompt inside white container */}
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