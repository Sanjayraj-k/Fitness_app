import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseconfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null); // Firebase user state
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    weight: '',
    height: '',
    profileImage: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), ms));

  useEffect(() => {
    const fetchProfileData = async () => {
      console.log('Starting fetchProfileData:', new Date().toISOString());
      if (!user) {
        console.log('No user:', new Date().toISOString());
        setProfileData({
          username: 'Guest',
          email: '',
          phoneNumber: '',
          weight: '',
          height: '',
          profileImage: null,
        });
        setLoading(false);
        return;
      }

      if (!FIRESTORE_DB) {
        console.error('Firestore DB not initialized:', new Date().toISOString());
        setProfileData({
          username: user.displayName || 'User',
          email: user.email || '',
          phoneNumber: '',
          weight: '',
          height: '',
          profileImage: null,
        });
        setLoading(false);
        Alert.alert('Error', 'Database not configured. Using default profile data.');
        return;
      }

      try {
        console.log('Fetching Firestore doc for userId:', user.uid, new Date().toISOString());
        const userRef = doc(FIRESTORE_DB, 'users', user.uid);
        const docSnap = await Promise.race([getDoc(userRef), timeout(5000)]);
        console.log('Firestore doc fetched:', new Date().toISOString());

        if (docSnap.exists()) {
          console.log('Document exists, setting data:', new Date().toISOString());
          setProfileData({
            username: docSnap.data().username || user.displayName || 'User',
            email: docSnap.data().email || user.email || '',
            phoneNumber: docSnap.data().phoneNumber || '',
            weight: docSnap.data().weight || '',
            height: docSnap.data().height || '',
            profileImage: docSnap.data().profileImage || null,
          });
        } else {
          console.log('No document, initializing data:', new Date().toISOString());
          setProfileData({
            username: user.displayName || 'User',
            email: user.email || '',
            phoneNumber: '',
            weight: '',
            height: '',
            profileImage: null,
          });

          console.log('Creating Firestore doc:', new Date().toISOString());
          await Promise.race([
            setDoc(userRef, {
              username: user.displayName || 'User',
              email: user.email || '',
              createdAt: new Date(),
              authProvider: 'firebase',
            }),
            timeout(5000),
          ]);
          console.log('Firestore doc created:', new Date().toISOString());
        }
      } catch (error) {
        console.error('Error fetching profile data:', error, new Date().toISOString());
        setProfileData({
          username: user.displayName || 'User',
          email: user.email || '',
          phoneNumber: '',
          weight: '',
          height: '',
          profileImage: null,
        });
        Alert.alert('Error', 'Failed to load profile from database. Using default data.');
      } finally {
        console.log('Finished fetchProfileData:', new Date().toISOString());
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached:', new Date().toISOString());
        setLoading(false);
        setProfileData({
          username: user?.displayName || 'User',
          email: user?.email || '',
          phoneNumber: '',
          weight: '',
          height: '',
          profileImage: null,
        });
        Alert.alert('Error', 'Profile loading timed out. Using default data.');
      }
    }, 5000);

    fetchProfileData();

    return () => clearTimeout(timer);
  }, [user]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(FIREBASE_AUTH);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  }, [navigation]);

  const handleUpdateProfile = useCallback(async () => {
    if (!user) return;

    try {
      const userRef = doc(FIRESTORE_DB, 'users', user.uid);
      await updateDoc(userRef, {
        username: profileData.username,
        phoneNumber: profileData.phoneNumber,
        weight: profileData.weight,
        height: profileData.height,
        ...(profileData.profileImage && { profileImage: profileData.profileImage }),
      });

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  }, [user, profileData]);

  const pickImage = useCallback(async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileData({ ...profileData, profileImage: result.assets[0].uri });
    }
  }, [profileData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#f5f5f5', '#ffffff']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage}>
          {profileData.profileImage ? (
            <Image source={{ uri: profileData.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <MaterialIcons name="person" size={60} color="#666" />
            </View>
          )}
        </TouchableOpacity>
        {isEditing ? (
          <TextInput
            style={[styles.text, styles.editableText]}
            value={profileData.username}
            onChangeText={(text) => setProfileData({ ...profileData, username: text })}
          />
        ) : (
          <Text style={styles.username}>{profileData.username}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{profileData.email}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Phone Number</Text>
          {isEditing ? (
            <TextInput
              style={[styles.text, styles.editableText]}
              value={profileData.phoneNumber}
              onChangeText={(text) => setProfileData({ ...profileData, phoneNumber: text })}
              keyboardType="phone-pad"
              placeholder="Add phone number"
            />
          ) : (
            <Text style={styles.infoValue}>{profileData.phoneNumber || 'Not provided'}</Text>
          )}
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Weight</Text>
          {isEditing ? (
            <View style={styles.measurementInputContainer}>
              <TextInput
                style={[styles.text, styles.editableText, styles.measurementInput]}
                value={profileData.weight}
                onChangeText={(text) => setProfileData({ ...profileData, weight: text })}
                keyboardType="numeric"
                placeholder="0"
              />
              <Text style={styles.measurementUnit}>kg</Text>
            </View>
          ) : (
            <Text style={styles.infoValue}>{profileData.weight ? `${profileData.weight} kg` : 'Not provided'}</Text>
          )}
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Height</Text>
          {isEditing ? (
            <View style={styles.measurementInputContainer}>
              <TextInput
                style={[styles.text, styles.editableText, styles.measurementInput]}
                value={profileData.height}
                onChangeText={(text) => setProfileData({ ...profileData, height: text })}
                keyboardType="numeric"
                placeholder="0"
              />
              <Text style={styles.measurementUnit}>cm</Text>
            </View>
          ) : (
            <Text style={styles.infoValue}>{profileData.height ? `${profileData.height} cm` : 'Not provided'}</Text>
          )}
        </View>
      </View>
      <View style={styles.buttonContainer}>
        {isEditing ? (
          <>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleUpdateProfile}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsEditing(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => setIsEditing(true)}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 0.5,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#28a745',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#28a745',
  },
  username: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 15,
    color: '#333',
    fontFamily: 'Helvetica Neue',
  },
  infoContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  infoItem: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  editableText: {
    borderBottomWidth: 1,
    borderBottomColor: '#28a745',
    paddingVertical: 5,
    fontSize: 16,
    color: '#333',
  },
  measurementInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  measurementInput: {
    flex: 1,
  },
  measurementUnit: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    margin: 20,
    marginTop: 30,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editButton: {
    backgroundColor: '#28a745',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default React.memo(ProfileScreen);