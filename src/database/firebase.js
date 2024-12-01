
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyC9g8HiFYfuyl7_3B6E-XTM1kMqSUwy6GY",
  authDomain: "videoapp-c3bc5.firebaseapp.com",
  databaseURL: "https://videoapp-c3bc5-default-rtdb.firebaseio.com",
  projectId: "videoapp-c3bc5",
  storageBucket: "videoapp-c3bc5.appspot.com",
  messagingSenderId: "814577713564",
  appId: "1:814577713564:web:54dad8da36af55ad5cc859",
};


const app = initializeApp(firebaseConfig);


const firestore = getFirestore(app);


const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});


export { app, auth, firestore };
