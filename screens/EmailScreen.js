import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';

export default function VerifyEmail({ route }) {
  const { email, fullName } = route.params;
  const { signUp, setActive } = useSignUp();
  const [code, setCode] = useState('');
  const navigation = useNavigation();

  const handleVerify = async () => {
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', error.message || 'Verification failed.');
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Enter verification code"
        value={code}
        onChangeText={setCode}
      />
      <Button title="Verify" onPress={handleVerify} />
    </View>
  );
}