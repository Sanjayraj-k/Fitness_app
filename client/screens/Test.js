import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Alert,
  Image // For potential local icons if not using vector-icons for everything
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Using MaterialCommunityIcons

// Backend URL
const API_URL = 'https://fitness-tracker-4-irsu.onrender.com/ask';
// const API_URL = 'http://YOUR_LOCAL_IP:5000/ask'; // For local testing

// Initialize react-native-vector-icons (if needed for your setup, ensure linked)
Icon.loadFont();

export default function App() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'initial-ai-message',
      text: "Hello! I'm your Fitness AI Coach. Ask me anything about fitness, workouts, nutrition, or healthy habits!",
      type: 'ai',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleAskQuestion = async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      Alert.alert('Input Required', 'Please enter a fitness question.');
      return;
    }

    const newUserMessage = {
      id: Date.now().toString(),
      text: trimmedQuestion,
      type: 'user',
      timestamp: new Date()
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setQuestion('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: trimmedQuestion }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (data.answer) {
        const newAiMessage = {
          id: Date.now().toString() + '_ai',
          text: data.answer,
          type: 'ai',
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, newAiMessage]);
      } else {
        throw new Error('Received an empty answer from the server.');
      }

    } catch (e) {
      console.error("API Error:", e);
      const errorMessage = e.message || 'Failed to fetch answer. Please check your connection and try again.';
      setError(errorMessage);
      // Optionally, add error message to chat or use Alert
      // Alert.alert('Error', errorMessage);
       const errorAiMessage = {
          id: Date.now().toString() + '_error',
          text: `Sorry, I encountered an error: ${errorMessage}`,
          type: 'ai_error', // Special type for error messages from AI side
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageItem = (item) => {
    const isUser = item.type === 'user';
    const isError = item.type === 'ai_error';

    return (
      <View
        key={item.id}
        style={[
          styles.messageBubbleWrapper,
          isUser ? styles.userBubbleWrapper : styles.aiBubbleWrapper,
        ]}
      >
        {!isUser && (
          <Icon
            name={isError ? "alert-circle-outline" : "robot-happy-outline"}
            size={28}
            color={isError ? styles.errorText.color : styles.aiIcon.color}
            style={styles.avatarIcon}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : (isError ? styles.errorBubble : styles.aiBubble),
          ]}
        >
          <Text style={isUser ? styles.userMessageText : (isError ? styles.errorMessageText : styles.aiMessageText)}>
            {item.text}
          </Text>
           {/* Optional: Timestamp
           <Text style={styles.timestampText}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text> */}
        </View>
        {isUser && (
          <Icon name="account-circle" size={28} color={styles.userIcon.color} style={styles.avatarIcon} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoiding}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // Adjust if header is part of KAV
      >
        <View style={styles.header}>
          <Text style={styles.title}>Fitness AI Coach</Text>
          <Text style={styles.subtitle}>Your smart companion for fitness queries.</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatAreaContent}
        >
          {messages.map(renderMessageItem)}
          {isLoading && (
            <View style={styles.loadingIndicatorContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.thinkingText}>AI is thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Display general error if needed, though individual errors are in chat now */}
        {error && !isLoading && messages.every(m => m.type !== 'ai_error') && (
            <View style={styles.errorContainerGlobal}>
              <Text style={styles.errorTextGlobal}>{error}</Text>
            </View>
          )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about workouts, nutrition..."
            placeholderTextColor="#8e8e93"
            value={question}
            onChangeText={setQuestion}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleAskQuestion} // Allows sending with keyboard "send" button
          />
          <TouchableOpacity
            style={[styles.sendButton, (isLoading || !question.trim()) && styles.sendButtonDisabled]}
            onPress={handleAskQuestion}
            disabled={isLoading || !question.trim()}
          >
            <Icon name="send" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20, // Adjust for status bar
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#F8F8F8', // Light gray for header differentiation
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50', // Darker, more professional blue-gray
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'Roboto-Medium',
  },
  subtitle: {
    fontSize: 15,
    color: '#555555', // Medium gray
    textAlign: 'center',
    marginTop: 4,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 10,
  },
  chatAreaContent: {
    paddingVertical: 15,
  },
  messageBubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align icon with bottom of bubble
    marginVertical: 8,
    maxWidth: '85%', // Prevent bubbles from taking full width
  },
  userBubbleWrapper: {
    alignSelf: 'flex-end',
    marginLeft: '15%', // Ensure space if it wraps
  },
  aiBubbleWrapper: {
    alignSelf: 'flex-start',
    marginRight: '15%',
  },
  avatarIcon: {
    marginHorizontal: 8,
    marginBottom: 5, // Align with text baseline better
  },
  userIcon: {
    color: '#007AFF',
  },
  aiIcon: {
    color: '#E91E63', // A distinct AI color (pink/magenta)
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userBubble: {
    backgroundColor: '#007AFF', // Bright blue for user
    borderTopRightRadius: 5, // Flatter corner towards avatar
  },
  aiBubble: {
    backgroundColor: '#E9E9EB', // Light gray for AI
    borderTopLeftRadius: 5, // Flatter corner towards avatar
  },
  errorBubble: {
    backgroundColor: '#FFCDD2', // Light red for AI error messages
    borderTopLeftRadius: 5,
  },
  userMessageText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  aiMessageText: {
    fontSize: 16,
    color: '#2C2C2E', // Dark text on light AI bubble
  },
  errorMessageText: {
    fontSize: 16,
    color: '#D32F2F', // Darker red for error text
  },
  timestampText: {
    fontSize: 10,
    color: '#999999',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F8F8F8', // Slightly off-white for input area
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#CDCDCD',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    marginRight: 10,
    minHeight: 44, // Ensure good tap target and initial size
    maxHeight: 120, // Limit multiline growth
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 22, // Make it circular
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    width: 44,
  },
  sendButtonDisabled: {
    backgroundColor: '#B0C4DE', // Lighter, desaturated blue
  },
  loadingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    alignSelf: 'flex-start', // Align with AI messages
    marginLeft: 10, // Indent like AI messages
  },
  thinkingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#777777',
    fontStyle: 'italic',
  },
  // Global error display (if not shown in chat)
  errorContainerGlobal: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  errorTextGlobal: {
    color: '#D32F2F',
    fontSize: 14,
  },
});