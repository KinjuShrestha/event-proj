import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { firestore, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const FirebaseTest = () => {
  const testFirestore = async () => {
    try {
      const docRef = await addDoc(collection(firestore, 'testCollection'), {
        name: 'Test User',
        createdAt: new Date(),
      });
      console.log('Document written with ID:', docRef.id);
      alert('Firestore: Document added successfully!');
    } catch (error) {
      console.error('Error adding document:', error);
      alert(`Firestore Error: ${error.message}`);
    }
  };

  const testAuthSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, 'test@example.com', 'password123');
      console.log('User created:', userCredential.user);
      alert('Auth: User signed up successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert(`Auth Error: ${error.message}`);
    }
  };

  const testAuthSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, 'test@example.com', 'password123');
      console.log('User signed in:', userCredential.user);
      alert('Auth: User signed in successfully!');
    } catch (error) {
      console.error('Error signing in user:', error);
      alert(`Auth Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Test Firestore" onPress={testFirestore} />
      <Button title="Test Auth Sign-Up" onPress={testAuthSignUp} />
      <Button title="Test Auth Sign-In" onPress={testAuthSignIn} />
      <Text style={styles.note}>
        Note: Check Firestore console for new documents and authentication console for new users.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  note: {
    marginTop: 20,
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
});

export default FirebaseTest;
