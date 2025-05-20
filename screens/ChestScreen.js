import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseconfig';
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';

// Define chest workouts with calorie values
const chestWorkouts = [
  { name: 'Push-Ups', calories: 50 },
  { name: 'Bench Press', calories: 80 },
  { name: 'Dumbbell Flyes', calories: 60 },
  { name: 'Incline Push-Ups', calories: 40 },
  { name: 'Chest Dips', calories: 70 },
];

const ChestScreen = () => {
  // State to track completed workouts
  const [completedWorkouts, setCompletedWorkouts] = useState({});
  const [userId, setUserId] = useState(null);

  // Get the current user
  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      setUserId(user.uid);
    }
  }, []);

  // Function to handle workout completion
  const handleCompleteWorkout = async (workout) => {
    if (!userId) {
      alert('Please log in to record your workout.');
      return;
    }

    try {
      // 1. Store the workout in Firestore under users/{uid}/workouts
      const workoutData = {
        type: workout.name,
        calories: workout.calories,
        date: new Date().toISOString(),
      };
      await addDoc(collection(FIRESTORE_DB, `users/${userId}/workouts`), workoutData);

      // 2. Update dashboard metrics
      const dashboardDocRef = doc(FIRESTORE_DB, `users/${userId}/dashboard`, 'metrics');
      const dashboardDoc = await getDoc(dashboardDocRef);
      let updatedMetrics = {
        totalCalories: workout.calories,
        totalWorkouts: 1,
        currentStreak: 1,
      };

      if (dashboardDoc.exists()) {
        const data = dashboardDoc.data();
        updatedMetrics = {
          totalCalories: (data.totalCalories || 0) + workout.calories,
          totalWorkouts: (data.totalWorkouts || 0) + 1,
          currentStreak: (data.currentStreak || 0) + 1, // Simplified streak logic
        };
      }

      await setDoc(dashboardDocRef, updatedMetrics, { merge: true });

      // 3. Update local state to mark the workout as completed
      setCompletedWorkouts((prev) => ({
        ...prev,
        [workout.name]: true,
      }));
    } catch (error) {
      console.error('Error recording workout:', error);
      alert('Failed to record workout. Please try again.');
    }
  };

  return (
    <LinearGradient colors={['#6e45e2', '#88d3ce']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Chest Workouts</Text>
        <View style={styles.workoutContainer}>
          {chestWorkouts.map((workout, index) => (
            <View key={index} style={styles.workoutCard}>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutCalories}>{workout.calories} kcal</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  completedWorkouts[workout.name] && styles.doneButton,
                ]}
                onPress={() => handleCompleteWorkout(workout)}
                disabled={completedWorkouts[workout.name]}
              >
                <Text style={styles.buttonText}>
                  {completedWorkouts[workout.name] ? 'Done' : 'Complete'}
                </Text>
              </TouchableOpacity>
            </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'left',
    marginBottom: 20,
    fontFamily: 'sans-serif',
  },
  workoutContainer: {
    marginBottom: 30,
  },
  workoutCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'sans-serif',
  },
  workoutCalories: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'sans-serif',
  },
  completeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  doneButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ChestScreen;