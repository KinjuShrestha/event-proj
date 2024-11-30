// Import necessary Firebase modules
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9g8HiFYfuyl7_3B6E-XTM1kMqSUwy6GY",
  authDomain: "videoapp-c3bc5.firebaseapp.com",
  databaseURL: "https://videoapp-c3bc5-default-rtdb.firebaseio.com",
  projectId: "videoapp-c3bc5",
  storageBucket: "videoapp-c3bc5.appspot.com",
  messagingSenderId: "814577713564",
  appId: "1:814577713564:web:54dad8da36af55ad5cc859",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Firebase Authentication with persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Export instances for use in other files
export { app, auth, firestore };
