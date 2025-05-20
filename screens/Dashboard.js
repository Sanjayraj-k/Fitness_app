import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';

const Dashboard = ({ route }) => {
  // State variables for dashboard metrics
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Other state variables
  const [selectedDate, setSelectedDate] = useState(new Date()); // Changed to today's date
  const [userId, setUserId] = useState(route.params?.userId || null);
  const [caloriesBurnedData, setCaloriesBurnedData] = useState(Array(7).fill(0));
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
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0); // Normalize to startರ

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return { startOfWeek, endOfWeek };
  };

  // Fetch user-specific data for the selected week and dashboard metrics
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        const uid = route.params?.userId || user.uid;
        setUserId(uid);
        await fetchDashboardMetrics(uid);

        // Set up real-time listener for workouts
        const startOfMonth = new Date(year, currentMonth, 1);
        const endOfMonth = new Date(year, currentMonth + 1, 0);
        const workoutsQuery = query(
          collection(FIRESTORE_DB, `users/${uid}/workouts`),
          where('date', '>=', startOfMonth.toISOString()),
          where('date', '<=', endOfMonth.toISOString())
        );

        const unsubscribeWorkouts = onSnapshot(workoutsQuery, (snapshot) => {
          const { startOfWeek, endOfWeek } = getWeekRange(selectedDate);
          const newCaloriesData = Array(7).fill(0);
          const newActiveDays = [];
          const newWorkoutDataMap = {};

          console.log('Snapshot received, docs count:', snapshot.docs.length);
          snapshot.forEach((doc) => {
            const data = doc.data();
            const workoutDate = new Date(data.date);
            const day = workoutDate.getDate();
            const dateKey = `${workoutDate.getFullYear()}-${workoutDate.getMonth()}-${day}`;

            if (!newWorkoutDataMap[dateKey]) {
              newWorkoutDataMap[dateKey] = [];
            }
            newWorkoutDataMap[dateKey].push({
              type: data.type,
              calories: data.calories,
            });

            if (!newActiveDays.includes(day)) {
              newActiveDays.push(day);
            }

            if (workoutDate >= startOfWeek && workoutDate <= endOfWeek) {
              const dayIndex = Math.floor((workoutDate - startOfWeek) / (1000 * 60 * 60 * 24));
              newCaloriesData[dayIndex] += data.calories;
              console.log(`Adding ${data.calories} kcal to day ${dayIndex} (${workoutDate.toISOString()})`);
            }
          });

          console.log('Updated caloriesBurnedData:', newCaloriesData);
          setCaloriesBurnedData(newCaloriesData);
          setActiveDays(newActiveDays);
          setWorkoutDataMap(newWorkoutDataMap);
          setLoading(false);
        }, (error) => {
          console.error('Error listening to workouts:', error);
          setCaloriesBurnedData(Array(7).fill(0));
          setActiveDays([]);
          setWorkoutDataMap({});
          setLoading(false);
        });

        return () => unsubscribeWorkouts();
      } else {
        setUserId(null);
        setTotalCalories(0);
        setTotalWorkouts(0);
        setCurrentStreak(0);
        setCaloriesBurnedData(Array(7).fill(0));
        setActiveDays([]);
        setWorkoutDataMap({});
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [selectedDate, year, currentMonth]);

  // Fetch dashboard metrics (totalCalories, totalWorkouts, currentStreak) from Firestore
  const fetchDashboardMetrics = async (uid) => {
    try {
      const dashboardDocRef = doc(FIRESTORE_DB, `users/${uid}/dashboard`, 'metrics');
      const dashboardDoc = await getDoc(dashboardDocRef);
      if (dashboardDoc.exists()) {
        const data = dashboardDoc.data();
        setTotalCalories(data.totalCalories || 0);
        setTotalWorkouts(data.totalWorkouts || 0);
        setCurrentStreak(data.currentStreak || 0);
      } else {
        // Initialize with default values if no dashboard data exists
        const defaultMetrics = {
          totalCalories: 0,
          totalWorkouts: 0,
          currentStreak: 0,
        };
        await setDoc(dashboardDocRef, defaultMetrics);
        setTotalCalories(0);
        setTotalWorkouts(0);
        setCurrentStreak(0);
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      setTotalCalories(0);
      setTotalWorkouts(0);
      setCurrentStreak(0);
    }
  };

  // Function to update dashboard metrics in Firestore (optional, can be called when a new workout is added)
  const updateDashboardMetrics = async (uid, newCalories, newWorkoutCount, newStreak) => {
    try {
      const dashboardDocRef = doc(FIRESTORE_DB, `users/${uid}/dashboard`, 'metrics');
      const updatedMetrics = {
        totalCalories: newCalories,
        totalWorkouts: newWorkoutCount,
        currentStreak: newStreak,
      };
      await setDoc(dashboardDocRef, updatedMetrics, { merge: true });
      setTotalCalories(newCalories);
      setTotalWorkouts(newWorkoutCount);
      setCurrentStreak(newStreak);
    } catch (error) {
      console.error('Error updating dashboard metrics:', error);
    }
  };

  // Calendar setup
  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentMonth, 1).getDay();
  const calendarDays = Array(firstDayOfMonth).fill(null).concat([...Array(daysInMonth)].map((_, i) => i + 1));

  // Navigation to previous and next date
  const prevDate = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() - 1); // Move to the previous month
    setSelectedDate(newDate);
  };

  const nextDate = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + 1); // Move to the next month
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