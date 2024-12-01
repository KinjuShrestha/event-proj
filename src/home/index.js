import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { auth, firestore } from '../database/firebase';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, doc, updateDoc, onSnapshot,deleteDoc } from 'firebase/firestore';

const HomeScreen = ({ navigation, route }) => {
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const userId = auth.currentUser?.uid;


  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'events'), (eventsSnapshot) => {
      const eventsList = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
     
      setEvents(eventsList);
      setUserEvents(eventsList.filter((event) => event.userId === userId));
    });

    return () => unsubscribe();
  }, []);

  
  const handleLogout = async () => {
    await auth.signOut();
   await navigation.navigate("Auth");
  };

  const handleAddEvent = () => {
    navigation.navigate('Event', { isEdit: false });
  };

  const handleEditEvent = (event) => {
    navigation.navigate('Event', { event, isEdit: true });
  };

  
  const toggleFavorite = async (eventId, isFavorite) => {
    try {
      const eventRef = doc(firestore, 'events', eventId);
      await updateDoc(eventRef, {
        isFavorite: !isFavorite,
      });

    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  
  const renderEvent = ({ item }) => (
    <View style={styles.event}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <TouchableOpacity onPress={() => handleEditEvent(item)}>
          <Ionicons name="pencil" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
      <Text style={styles.eventDate}>{item.date}</Text>
      <View style={styles.eventActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleFavorite(item.id, item.isFavorite)}
        >
          <Ionicons
            name={item.isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color="#FF6347"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            Alert.alert('Delete Event', 'Are you sure?', [
              { text: 'Cancel' },
              { text: 'Delete', onPress: () => handleDeleteEvent(item.id) },
            ])
          }
        >
          <Ionicons name="trash" size={24} color="#FF0000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(firestore, 'events', eventId));

      setEvents(events.filter((event) => event.id !== eventId));
      setUserEvents(userEvents.filter((event) => event.id !== eventId));

      console.log('Deleted event:', eventId);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#fff" />
          <Text style={styles.headerButtonText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={handleAddEvent}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.headerButtonText}>Add Event</Text>
        </TouchableOpacity>
      </View>

     
      <Text style={styles.sectionTitle}>Favorites</Text>
      <FlatList
        data={events.filter(event => event.isFavorite)} 
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No favorite events found</Text>}
      />

      <Text style={styles.sectionTitle}>All Events</Text>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No events found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 20,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  event: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    padding: 5,
  },
});

export default HomeScreen;