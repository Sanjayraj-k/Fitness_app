import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import BicepsScreen from './BicepsScreen'; // Keep the import for reference, though not used directly here

// Import images (adjust paths based on your project structure)
import chestImage from '../assets/images/chest_man.jpg';
import bicepsImage from '../assets/images/biceps_man.jpg';
import tricepsImage from '../assets/images/triceps_man.jpg';
import shoulderImage from '../assets/images/shoulder_man.jpg';
import latImage from '../assets/images/lat_man.jpg';
import legImage from '../assets/images/leg_man.jpg';
import absImage from '../assets/images/abs_man.jpg';

const BeginnerContentScreen = () => {
  const navigation = useNavigation();

  const muscleGroups = [
    { name: 'Chest', screen: 'ChestScreen', image: chestImage },
    { name: 'Biceps', screen: 'BicepsScreen', image: bicepsImage }, // Fixed: Use string 'BicepsScreen'
    { name: 'Triceps', screen: 'TricepsScreen', image: tricepsImage },
    { name: 'Shoulder', screen: 'ShoulderScreen', image: shoulderImage },
    { name: 'Lat', screen: 'LatScreen', image: latImage },
    { name: 'Leg', screen: 'LegScreen', image: legImage },
    { name: 'Abs', screen: 'AbsScreen', image: absImage }, 
  ];

  return (
    <LinearGradient
      colors={['#6e45e2', '#88d3ce']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Beginner Workouts</Text>
        <View style={styles.cardsContainer}>
          {muscleGroups.map((muscle, index) => (
            <MuscleCard key={index} muscle={muscle} navigation={navigation} />
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

// Separate component for the muscle card to handle animation
const MuscleCard = ({ muscle, navigation }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current; // Initial scale value

  const handlePressIn = () => {
    // Scale up the image when the user presses the card
    Animated.timing(scaleAnim, {
      toValue: 1.2,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    // Scale back down when the user releases the press
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(muscle.screen)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{muscle.name}</Text>
        <Animated.Image
          source={muscle.image}
          style={[styles.cardImage, { transform: [{ scale: scaleAnim }] }]}
          resizeMode="cover"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 25,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'left',
    marginBottom: 20,
    fontFamily: 'sans-serif',
  },
  cardsContainer: {
    marginBottom: 30,
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginBottom: 20,
    padding: 20,
    height: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ scale: 1 }],
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'sans-serif',
  },
  cardImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
});

export default BeginnerContentScreen;