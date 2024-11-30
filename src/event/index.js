import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { firestore, auth } from '../database/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

const EventScreen = ({ route, navigation }) => {
  const { event = null, isEdit = false } = route.params || {}; // Ensure default values
  const [title, setTitle] = useState(event ? event.title : '');
  const [date, setDate] = useState(event ? event.date : '');
  const [description, setDescription] = useState(event ? event.description : '');
  const userId = auth.currentUser.uid;

  // Handle form submission for creating or editing an event
  const handleSubmit = async () => {
    if (!title || !date || !description) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    try {
      if (isEdit && event && event.id) {
        // If it's editing, update the existing event
        await updateDoc(doc(firestore, 'events', event.id), {
          title,
          date,
          description,
        });
      } else {
        // If it's creating a new event, add it to Firestore
        const newEventId = isEdit ? event.id : Date.now().toString(); // Ensure a valid ID for new events
        await setDoc(doc(firestore, 'events', newEventId), {
          title,
          date,
          description,
          userId,
        });
      }

      Alert.alert('Success', `Event ${isEdit ? 'updated' : 'created'} successfully!`);
      navigation.goBack(); // Navigate back to the previous screen
    } catch (error) {
      Alert.alert('Error', 'Failed to save event. Please try again.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>{isEdit ? 'Edit Event' : 'Create Event'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Event Title"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Event Date (e.g., 2024-12-01)"
        value={date}
        onChangeText={setDate}
        placeholderTextColor="#888"
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Event Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{isEdit ? 'Update Event' : 'Create Event'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top', // Align text at the top for multiline inputs
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EventScreen;
