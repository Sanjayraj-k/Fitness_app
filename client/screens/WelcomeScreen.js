import React from 'react';
import { Text, StyleSheet, View, StatusBar, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
export default function WelcomeScreen() {
    const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={['#7F00FF', '#E100FF']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Let's Get Started</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/images/welcome.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupText}>Sign up</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginBold}>Log in</Text>
            </Text>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
  },
  titleContainer: {
    marginTop: 50,
  },
  title: {
    marginTop:100,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  imageContainer: {
    marginBottom:50,
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: -30,
  },
  image: {
    width: 300,
    height: 300,
  },
  buttonWrapper: {
    marginBottom: 30,
    width: '80%',
    alignItems: 'center',
  },
  signupButton: {
    marginBottom:15,
    backgroundColor: '#4B0082',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  signupText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 12,
  },
  loginText: {
    color: '#fff',
    fontSize: 14,
  },
  loginBold: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
