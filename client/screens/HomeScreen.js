import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={['#6e45e2', '#88d3ce']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Fitness Expert</Text>
          <View style={styles.headerLine} />
        </View>

        {/* Skill Level Cards */}
        <View style={styles.cardsContainer}>
          {/* Beginner Card */}
          <TouchableOpacity 
            style={[styles.card, styles.beginnerCard]}
            onPress={() => navigation.navigate('Content', { screen: 'BeginnerTab' })}
          >
            <Text style={styles.cardTitle}>BEGINNER</Text>
            <Text style={styles.cardSubtitle}>Start your fitness journey</Text>
            <View style={styles.cardDecoration} />
          </TouchableOpacity>

          {/* Intermediate Card */}
          <TouchableOpacity 
            style={[styles.card, styles.intermediateCard]}
            onPress={() => navigation.navigate('Content', { screen: 'IntermediateTab' })}
          >
            <Text style={styles.cardTitle}>INTERMEDIATE</Text>
            <Text style={styles.cardSubtitle}>Level up your training</Text>
            <View style={styles.cardDecoration} />
          </TouchableOpacity>

          {/* Veteran Card */}
          <TouchableOpacity 
            style={[styles.card, styles.veteranCard]}
            onPress={() => navigation.navigate('Content', { screen: 'ExpertTab' })}
          >
            <Text style={styles.cardTitle}>Advanced</Text>
            <Text style={styles.cardSubtitle}>Elite performance mode</Text>
            <View style={styles.cardDecoration} />
          </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerLine: {
    height: 4,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginTop: 10,
    borderRadius: 2,
  },
  cardsContainer: {
    marginBottom: 30,
  },
  card: {
    height: 140,
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  beginnerCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  intermediateCard: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  veteranCard: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 5,
    letterSpacing: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
  },
  cardDecoration: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

export default HomeScreen;