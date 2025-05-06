import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDCZFMplWzCgjN-VZE0htmQgXXnH1qppjE',
  authDomain: 'fitness-app-c3aab.firebaseapp.com',
  projectId: 'fitness-app-c3aab',
  storageBucket: 'fitness-app-c3aab.appspot.com',
  messagingSenderId: '974601936464',
  appId: '1:974601936464:web:2c8beb1b023687ea127b55',
  measurementId: 'G-STQ1QVKS8P',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const Dashboard = ({ route }) => {
  // Sample static data
  const totalCalories = 1350;
  const totalWorkouts = 3;
  const currentStreak = 4;

  // State variables
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 3, 20));
  const [userId, setUserId] = useState(route.params?.userId || null);
  const [caloriesBurnedData, setCaloriesBurnedData] = useState(Array(7).fill(0)); // 7 days for the week
  const [activeDays, setActiveDays] = useState([]);
  const [workoutDataMap, setWorkoutDataMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Derived month and year
  const currentMonth = selectedDate.getMonth();
  const year = selectedDate.getFullYear();

  // Helper function to get the week's start (Sunday) and end (Saturday)
  const getWeekRange = (date) => {
    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek); // Set to Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Saturday
    return { startOfWeek, endOfWeek };
  };

  // Fetch user-specific data for the selected week
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = route.params?.userId || user.uid;
        setUserId(uid);
        await fetchUserData(uid);
      } else {
        setUserId(null);
        setCaloriesBurnedData(Array(7).fill(0));
        setActiveDays([]);
        setWorkoutDataMap({});
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [selectedDate]); // Re-fetch when selectedDate changes

  const fetchUserData = async (uid) => {
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get week range for the selected date
      const { startOfWeek, endOfWeek } = getWeekRange(selectedDate);
      // Fetch workouts for the entire month to populate activeDays for calendar
      const startOfMonth = new Date(year, currentMonth, 1);
      const endOfMonth = new Date(year, currentMonth + 1, 0);
      const workoutsQuery = query(
        collection(db, `users/${uid}/workouts`),
        where('date', '>=', startOfMonth.toISOString()),
        where('date', '<=', endOfMonth.toISOString())
      );
      const querySnapshot = await getDocs(workoutsQuery);

      const newCaloriesData = Array(7).fill(0);
      const newActiveDays = [];
      const newWorkoutDataMap = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const workoutDate = new Date(data.date);
        const day = workoutDate.getDate();
        const dateKey = `${workoutDate.getFullYear()}-${workoutDate.getMonth()}-${day}`;

        // Populate workout data map
        if (!newWorkoutDataMap[dateKey]) {
          newWorkoutDataMap[dateKey] = [];
        }
        newWorkoutDataMap[dateKey].push({
          type: data.type,
          calories: data.calories,
        });

        // Add to active days for calendar
        if (!newActiveDays.includes(day)) {
          newActiveDays.push(day);
        }

        // Add to calories data if within the week
        if (workoutDate >= startOfWeek && workoutDate <= endOfWeek) {
          const dayIndex = Math.floor((workoutDate - startOfWeek) / (1000 * 60 * 60 * 24)); // Index from 0 to 6
          newCaloriesData[dayIndex] += data.calories;
        }
      });

      setCaloriesBurnedData(newCaloriesData);
      setActiveDays(newActiveDays);
      setWorkoutDataMap(newWorkoutDataMap);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setCaloriesBurnedData(Array(7).fill(0));
      setActiveDays([]);
      setWorkoutDataMap({});
    } finally {
      setLoading(false);
    }
  };

  // Calendar setup
  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentMonth, 1).getDay();
  const calendarDays = Array(firstDayOfMonth).fill(null).concat([...Array(daysInMonth)].map((_, i) => i + 1));

  // Navigation to previous and next date
  const prevDate = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDate = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Handle date click
  const handleDateClick = (day) => {
    if (day) {
      setSelectedDate(new Date(year, currentMonth, day));
    }
  };

  // Get workouts for the selected date
  const selectedDateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
  const selectedWorkouts = workoutDataMap[selectedDateKey] || [];

  // Month names for display
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.header}>
        <View style={styles.headerItem}>
          <Text style={styles.headerValue}>{totalCalories} kcal</Text>
          <Text style={styles.headerLabel}>CALORIES</Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.headerValue}>{totalWorkouts}</Text>
          <Text style={styles.headerLabel}>WORKOUTS</Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.headerValue}>{currentStreak} days</Text>
          <Text style={styles.headerLabel}>CURRENT STREAK</Text>
        </View>
      </View>

      {/* Calendar Section */}
      <View style={styles.section}>
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={prevDate}>
            <Text style={styles.navButton}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>{months[currentMonth]} {year}</Text>
          <TouchableOpacity onPress={nextDate}>
            <Text style={styles.navButton}>{">"}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.calendar}>
          <View style={styles.weekDays}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Text key={index} style={styles.weekDay}>{day}</Text>
            ))}
          </View>
          <View style={styles.days}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dayContainer}
                onPress={() => handleDateClick(day)}
              >
                {day ? (
                  <Text
                    style={[
                      styles.day,
                      activeDays.includes(day) && styles.activeDay,
                      day === selectedDate.getDate() && currentMonth === selectedDate.getMonth() && styles.selectedDay,
                    ]}
                  >
                    {day}
                  </Text>
                ) : (
                  <Text style={styles.day}></Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Workout Details for Selected Date */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Workouts for {months[selectedDate.getMonth()]} {selectedDate.getDate()}
        </Text>
        {selectedWorkouts.length > 0 ? (
          selectedWorkouts.map((workout, index) => (
            <View key={index} style={styles.workoutItem}>
              <Text style={styles.workoutType}>{workout.type}</Text>
              <Text style={styles.workoutCalories}>{workout.calories} kcal</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noWorkouts}>No workouts recorded for this date.</Text>
        )}
      </View>

      {/* Calories Burned Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calories Burned This Week</Text>
        {userId ? (
          <BarChart
            data={{
              labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
              datasets: [
                {
                  data: caloriesBurnedData,
                },
              ],
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix=" kcal"
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '0',
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        ) : (
          <Text style={styles.noWorkouts}>Please log in to view your data.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    width: '30%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headerValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navButton: {
    fontSize: 18,
    paddingHorizontal: 10,
  },
  calendar: {
    marginBottom: 10,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  day: {
    fontSize: 14,
    textAlign: 'center',
  },
  activeDay: {
    backgroundColor: '#d3f9d8',
    borderRadius: 20,
    padding: 5,
  },
  selectedDay: {
    backgroundColor: '#28a745',
    color: '#fff',
    borderRadius: 20,
    padding: 5,
  },
  workoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  workoutType: {
    fontSize: 16,
  },
  workoutCalories: {
    fontSize: 16,
    color: '#666',
  },
  noWorkouts: {
    fontSize: 16,
    color: '#666',
  },
});

export default Dashboard;