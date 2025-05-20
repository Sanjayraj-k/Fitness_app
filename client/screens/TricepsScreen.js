import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseconfig';
import { collection, addDoc, doc, getDoc, setDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// Define chest workouts with calorie values
const chestWorkouts = [
  { name: 'Tricep Dips', calories: 100 },             // Bodyweight exercise, high effort
  { name: 'Close-Grip Bench Press', calories: 120 },  // Compound movement, heavy load
  { name: 'Overhead Tricep Extension', calories: 90 },// Dumbbell or cable version
  { name: 'Tricep Pushdowns', calories: 95 },         // Cable machine, controlled reps
  { name: 'Diamond Push-Ups', calories: 100 },        // Push-up variation targeting triceps
];


const ChestScreen = () => {
  // State to track completed workouts
  const [completedWorkouts, setCompletedWorkouts] = useState({});
  const [userId, setUserId] = useState(null);

  // Get the current user and fetch completed workouts
  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      setUserId(user.uid);
      fetchCompletedWorkouts(user.uid);
    }
  }, []);

  // Fetch workouts completed within the last 24 hours
  const fetchCompletedWorkouts = async (uid) => {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const workoutsQuery = query(
        collection(FIRESTORE_DB, `users/${uid}/workouts`),
        where('date', '>=', twentyFourHoursAgo.toISOString()),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(workoutsQuery);

      const completed = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (chestWorkouts.some((workout) => workout.name === data.type)) {
          completed[data.type] = true;
        }
      });
      setCompletedWorkouts(completed);
    } catch (error) {
      console.error('Error fetching completed workouts:', error);
    }
  };

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
        updatedMetrics.totalCalories = (data.totalCalories || 0) + workout.calories;
        updatedMetrics.totalWorkouts = (data.totalWorkouts || 0) + 1;

        // Fetch the most recent workout to determine streak
        const workoutsQuery = query(
          collection(FIRESTORE_DB, `users/${userId}/workouts`),
          orderBy('date', 'desc'),
          limit(2) // Get the two most recent workouts
        );
        const querySnapshot = await getDocs(workoutsQuery);
        let lastWorkoutDate = null;
        let secondLastWorkoutDate = null;
        const docs = querySnapshot.docs;

        if (docs.length > 0) {
          lastWorkoutDate = new Date(docs[0].data().date);
          if (docs.length > 1) {
            secondLastWorkoutDate = new Date(docs[1].data().date);
          }
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day
        const lastWorkoutDay = lastWorkoutDate ? new Date(lastWorkoutDate) : null;
        if (lastWorkoutDay) lastWorkoutDay.setHours(0, 0, 0, 0);

        // If this is the first workout of the day (and not the very first workout)
        if (lastWorkoutDay && lastWorkoutDay.getTime() !== today.getTime()) {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);

          // Check if the last workout was yesterday to maintain streak
          if (lastWorkoutDay.getTime() === yesterday.getTime()) {
            updatedMetrics.currentStreak = (data.currentStreak || 0) + 1;
          } else {
            // If the last workout wasn't yesterday, reset streak to 1
            updatedMetrics.currentStreak = 1;
          }
        } else if (!lastWorkoutDay) {
          // First ever workout
          updatedMetrics.currentStreak = 1;
        } else {
          // Same day workout, streak doesn't change
          updatedMetrics.currentStreak = data.currentStreak || 0;
        }
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