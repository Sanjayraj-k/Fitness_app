import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const BeginnerContentScreen = () => {
  const navigation = useNavigation();

  const muscleGroups = [
    { name: 'Chest', screen: 'ChestWorkouts' },
    { name: 'Biceps', screen: 'BicepsWorkouts' },
    { name: 'Triceps', screen: 'TricepsWorkouts' },
    { name: 'Shoulder', screen: 'ShoulderWorkouts' },
    { name: 'Lat', screen: 'LatWorkouts' },
    { name: 'Leg', screen: 'LegWorkouts' },
    { name: 'Abs', screen: 'AbsWorkouts' },
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
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => navigation.navigate(muscle.screen)}
            >
              <Text style={styles.cardTitle}>{muscle.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  cardsContainer: {
    marginBottom: 30,
  },
  card: {
    height: 100,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 1,
  },
});

export default BeginnerContentScreen;