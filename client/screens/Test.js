import React, { useState } from 'react';
   import { View, Text, Button, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
   import * as ImagePicker from 'expo-image-picker';
   import axios from 'axios';
   import tw from 'twrnc';

   const Test = () => {
     const [beforeImage, setBeforeImage] = useState(null);
     const [afterImage, setAfterImage] = useState(null);
     const [transformationScore, setTransformationScore] = useState(null);
     const [plot, setPlot] = useState(null);
     const [loading, setLoading] = useState(false);

     const requestPermissions = async () => {
       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
       if (status !== 'granted') {
         Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to select images.');
         return false;
       }
       return true;
     };

     const pickBeforeImage = async () => {
       const hasPermission = await requestPermissions();
       if (!hasPermission) return;

       let result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.Images,
         allowsEditing: false,
         quality: 1,
       });

       if (!result.canceled) {
         setBeforeImage(result.assets[0]);
       }
     };

     const pickAfterImage = async () => {
       const hasPermission = await requestPermissions();
       if (!hasPermission) return;

       let result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.Images,
         allowsEditing: false,
         quality: 1,
       });

       if (!result.canceled) {
         setAfterImage(result.assets[0]);
       }
     };

     const getFileInfo = (uri) => {
       const extension = uri.split('.').pop().toLowerCase();
       const name = `image.${extension}`;
       const type = extension === 'png' ? 'image/png' : 'image/jpeg';
       return { name, type };
     };

     const analyzeImages = async () => {
       if (!beforeImage || !afterImage) {
         Alert.alert('Error', 'Please select both before and after images.');
         return;
       }

       setLoading(true);
       const formData = new FormData();
       const beforeInfo = getFileInfo(beforeImage.uri);
       const afterInfo = getFileInfo(afterImage.uri);

       formData.append('before', {
         uri: beforeImage.uri,
         name: beforeInfo.name,
         type: beforeInfo.type,
       });
       formData.append('after', {
         uri: afterImage.uri,
         name: afterInfo.name,
         type: afterInfo.type,
       });

       try {
         const response = await axios.post('http://127.0.0.1:5000/analyze', formData, {
           headers: {
             'Content-Type': 'multipart/form-data',
           },
         });

         setTransformationScore(response.data.transformation_score);
         setPlot(response.data.plot);
       } catch (error) {
         console.error('Error details:', error.message, error.response?.data, error.response?.status);
         Alert.alert('Error', error.response?.data?.error || 'Failed to analyze images.');
       } finally {
         setLoading(false);
       }
     };

     return (
       <ScrollView style={tw`flex-1 bg-gray-100`}>
         <View style={tw`p-4`}>
           <Text style={tw`text-2xl font-bold text-center mb-4`}>Image Transformation Analyzer</Text>

           <View style={tw`mb-4`}>
             <Button title="Pick Before Image" onPress={pickBeforeImage} color="#1E90FF" />
             {beforeImage && (
               <Image
                 source={{ uri: beforeImage.uri }}
                 style={tw`w-full h-40 mt-2 rounded-lg`}
                 resizeMode="contain"
               />
             )}
           </View>

           <View style={tw`mb-4`}>
             <Button title="Pick After Image" onPress={pickAfterImage} color="#1E90FF" />
             {afterImage && (
               <Image
                 source={{ uri: afterImage.uri }}
                 style={tw`w-full h-40 mt-2 rounded-lg`}
                 resizeMode="contain"
               />
             )}
           </View>

           <View style={tw`mb-4`}>
             <Button
               title="Analyze Transformation"
               onPress={analyzeImages}
               color="#32CD32"
               disabled={loading}
             />
           </View>

           {loading && <ActivityIndicator size="large" color="#1E90FF" style={tw`mb-4`} />}

           {transformationScore !== null && (
             <View style={tw`bg-white p-4 rounded-lg shadow-md`}>
               <Text style={tw`text-lg font-semibold text-center`}>
                 Transformation Score: {transformationScore}%
               </Text>
             </View>
           )}

           {plot && (
             <View style={tw`mt-4`}>
               <Text style={tw`text-lg font-semibold text-center mb-2`}>Analysis Plot</Text>
               <Image
                 source={{ uri: plot }}
                 style={tw`w-full h-80 rounded-lg`}
                 resizeMode="contain"
               />
             </View>
           )}
         </View>
       </ScrollView>
     );
   };

   export default Test;